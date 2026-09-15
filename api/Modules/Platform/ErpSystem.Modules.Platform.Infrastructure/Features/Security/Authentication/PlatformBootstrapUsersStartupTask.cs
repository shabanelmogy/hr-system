using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.Platform.Application.Entitlements;
using ErpSystem.Modules.Platform.Application.Modules;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication;

/// <summary>
/// Creates the opt-in preview tenant, company, and demo identities after the
/// Platform schema and system roles are ready.
/// </summary>
public sealed class PlatformBootstrapUsersStartupTask(
    IConfiguration configuration,
    PlatformDbContext db,
    UserManager<PlatformApplicationUser> users,
    RoleManager<PlatformApplicationRole> roles,
    IModuleCatalogPolicy moduleCatalog,
    PlatformContractSource entitlements,
    TimeProvider timeProvider) : IHostRuntimeStartupTask
{
    private const string SectionName = "BootstrapUsers";
    private const string TenantId = "demo";
    private const string TenantIdentifier = "demo";
    private const string CompanyCode = "DEMO";

    private static readonly BootstrapUserDefinition[] Definitions =
    [
        new("Viewer", PlatformRoleNames.User),
        new("Admin", PlatformRoleNames.Admin),
        new("SuperAdmin", PlatformRoleNames.SuperAdmin)
    ];

    public async Task ExecuteAsync(CancellationToken cancellationToken = default)
    {
        var section = configuration.GetSection(SectionName);
        if (!section.GetValue<bool>("Enabled"))
            return;

        var configuredUsers = Definitions
            .Select(definition => ReadSettings(section, definition))
            .ToArray();
        ValidateSettings(configuredUsers);

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var now = timeProvider.GetUtcNow().UtcDateTime;
            var company = await EnsureDemoScopeAsync(now, cancellationToken);

            var existingEntitlements = await entitlements.GetAsync(TenantId, cancellationToken);
            var mergedEntitlements = MergeEntitlements(
                existingEntitlements,
                moduleCatalog.GetDefaultEntitlements());
            await entitlements.ApplyAsync(TenantId, mergedEntitlements, cancellationToken);

            foreach (var settings in configuredUsers)
                await EnsureDemoUserAsync(settings, company.Id, now, cancellationToken);

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    /// <summary>
    /// Adds catalog defaults to the preview tenant without removing grants that
    /// were explicitly assigned during development. Codes are normalized so the
    /// result is deterministic and safe for the case-insensitive database keys.
    /// </summary>
    internal static IReadOnlyList<TenantModuleEntitlementRequest> MergeEntitlements(
        IReadOnlyCollection<TenantModuleEntitlementResponse> existing,
        IReadOnlyCollection<TenantModuleEntitlementRequest> defaults)
    {
        var merged = new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase);

        foreach (var entitlement in existing)
        {
            AddEntitlement(merged, entitlement.ModuleCode, entitlement.SubmoduleCodes);
        }

        foreach (var entitlement in defaults)
        {
            AddEntitlement(merged, entitlement.ModuleCode, entitlement.SubmoduleCodes ?? []);
        }

        return merged
            .OrderBy(pair => pair.Key, StringComparer.OrdinalIgnoreCase)
            .Select(pair => new TenantModuleEntitlementRequest(
                pair.Key.ToLowerInvariant(),
                pair.Value
                    .Select(code => code.ToLowerInvariant())
                    .OrderBy(code => code, StringComparer.Ordinal)
                    .ToArray()))
            .ToArray();

        static void AddEntitlement(
            Dictionary<string, HashSet<string>> target,
            string moduleCode,
            IEnumerable<string>? submoduleCodes)
        {
            if (string.IsNullOrWhiteSpace(moduleCode))
                return;

            var normalizedModuleCode = moduleCode.Trim();
            if (!target.TryGetValue(normalizedModuleCode, out var submodules))
            {
                submodules = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                target[normalizedModuleCode] = submodules;
            }

            foreach (var submoduleCode in submoduleCodes ?? [])
            {
                if (!string.IsNullOrWhiteSpace(submoduleCode))
                    submodules.Add(submoduleCode.Trim());
            }
        }
    }

    private async Task<PlatformCompany> EnsureDemoScopeAsync(
        DateTime now,
        CancellationToken cancellationToken)
    {
        var tenant = await db.Tenants
            .SingleOrDefaultAsync(candidate => candidate.Id == TenantId, cancellationToken);
        var identifierOwner = await db.Tenants
            .SingleOrDefaultAsync(candidate => candidate.Identifier == TenantIdentifier, cancellationToken);

        if (tenant is null && identifierOwner is not null)
            throw new InvalidOperationException(
                $"{SectionName} cannot use tenant identifier '{TenantIdentifier}' because it belongs to another tenant.");

        if (tenant is null)
        {
            tenant = new PlatformTenant(TenantId, TenantIdentifier, "ERP Demo", now);
            db.Tenants.Add(tenant);
        }
        else if (!string.Equals(tenant.Identifier, TenantIdentifier, StringComparison.Ordinal) ||
                 !tenant.IsActive ||
                 tenant.LifecycleStatus != (int)PlatformTenantLifecycleStatus.Active)
        {
            throw new InvalidOperationException(
                $"{SectionName} requires the '{TenantId}' tenant to be the active demo tenant.");
        }

        var company = await db.Companies
            .IgnoreQueryFilters()
            .SingleOrDefaultAsync(
                candidate => candidate.TenantId == TenantId && candidate.CompanyCode == CompanyCode,
                cancellationToken);
        if (company is null)
        {
            company = new PlatformCompany(
                TenantId,
                CompanyCode,
                "ERP Demo Company",
                "شركة ERP التجريبية",
                "EGP",
                "Africa/Cairo",
                now);
            db.Companies.Add(company);
        }
        else if (!company.IsActive || company.DeletedOn is not null)
        {
            throw new InvalidOperationException(
                $"{SectionName} requires the '{CompanyCode}' company to be active.");
        }

        await db.SaveChangesAsync(cancellationToken);
        return company;
    }

    private async Task EnsureDemoUserAsync(
        BootstrapUserSettings settings,
        int companyId,
        DateTime now,
        CancellationToken cancellationToken)
    {
        var normalizedUserName = users.NormalizeName(settings.UserName);
        var normalizedEmail = users.NormalizeEmail(settings.Email);
        var matches = await users.Users
            .Where(candidate =>
                candidate.NormalizedUserName == normalizedUserName ||
                candidate.NormalizedEmail == normalizedEmail)
            .ToArrayAsync(cancellationToken);

        if (matches.Length > 1)
            throw ExistingIdentityConflict(settings.Key);

        var user = matches.SingleOrDefault();
        if (user is null)
        {
            user = new PlatformApplicationUser
            {
                UserName = settings.UserName,
                Email = settings.Email,
                FirstName = settings.FirstName,
                LastName = settings.LastName,
                EmailConfirmed = true,
                IsDisabled = false,
                LifecycleStatus = (int)PlatformUserLifecycleStatus.Active
            };

            EnsureSuccess(
                await users.CreateAsync(user, settings.Password),
                $"Unable to create the {settings.Key} bootstrap user.");
        }
        else
        {
            var isExpectedIdentity =
                string.Equals(user.NormalizedUserName, normalizedUserName, StringComparison.Ordinal) &&
                string.Equals(user.NormalizedEmail, normalizedEmail, StringComparison.Ordinal) &&
                string.Equals(user.FirstName, settings.FirstName, StringComparison.Ordinal) &&
                string.Equals(user.LastName, settings.LastName, StringComparison.Ordinal);
            if (!isExpectedIdentity)
                throw ExistingIdentityConflict(settings.Key);
            if (user.IsDisabled ||
                user.LifecycleStatus != (int)PlatformUserLifecycleStatus.Active ||
                !user.EmailConfirmed)
            {
                throw new InvalidOperationException(
                    $"{SectionName}:{settings.Key} already exists but is not an active confirmed demo identity.");
            }
        }

        await EnsureRoleAsync(user, settings, cancellationToken);
        await EnsureScopeAccessAsync(user.Id, companyId, now, cancellationToken);
    }

    private async Task EnsureRoleAsync(
        PlatformApplicationUser user,
        BootstrapUserSettings settings,
        CancellationToken cancellationToken)
    {
        var role = await roles.FindByNameAsync(settings.RoleName)
            ?? throw new InvalidOperationException(
                $"The required system role '{settings.RoleName}' was not created.");
        if (!role.IsSystem)
            throw new InvalidOperationException(
                $"The role '{settings.RoleName}' must be a Platform system role.");

        var assignedRoles = await users.GetRolesAsync(user);
        var otherSystemRole = assignedRoles.FirstOrDefault(assigned =>
            Definitions.Any(definition =>
                string.Equals(definition.RoleName, assigned, StringComparison.OrdinalIgnoreCase)) &&
            !string.Equals(settings.RoleName, assigned, StringComparison.OrdinalIgnoreCase));
        if (otherSystemRole is not null)
            throw new InvalidOperationException(
                $"{SectionName}:{settings.Key} already has the unexpected system role '{otherSystemRole}'.");

        if (!assignedRoles.Contains(settings.RoleName, StringComparer.OrdinalIgnoreCase))
        {
            EnsureSuccess(
                await users.AddToRoleAsync(user, settings.RoleName),
                $"Unable to assign the {settings.RoleName} role to {settings.Key}.");
        }

        cancellationToken.ThrowIfCancellationRequested();
    }

    private async Task EnsureScopeAccessAsync(
        string userId,
        int companyId,
        DateTime now,
        CancellationToken cancellationToken)
    {
        var tenantAccesses = await db.UserTenantAccesses
            .IgnoreQueryFilters()
            .Where(access => access.UserId == userId)
            .ToArrayAsync(cancellationToken);
        if (tenantAccesses.Any(access => access.TenantId != TenantId))
            throw new InvalidOperationException(
                $"{SectionName} will not modify a user that already belongs to another tenant.");

        var tenantAccess = tenantAccesses.SingleOrDefault();
        if (tenantAccess is null)
        {
            db.UserTenantAccesses.Add(new PlatformUserTenantAccess
            {
                UserId = userId,
                TenantId = TenantId,
                IsDefault = true,
                CreatedOn = now
            });
        }
        else
        {
            tenantAccess.IsDefault = true;
        }

        var companyAccesses = await db.UserCompanyAccesses
            .IgnoreQueryFilters()
            .Where(access => access.UserId == userId)
            .ToArrayAsync(cancellationToken);
        if (companyAccesses.Any(access =>
                access.TenantId != TenantId || access.CompanyId != companyId))
        {
            throw new InvalidOperationException(
                $"{SectionName} will not modify a user that already belongs to another company.");
        }

        var companyAccess = companyAccesses.SingleOrDefault();
        if (companyAccess is null)
        {
            db.UserCompanyAccesses.Add(new PlatformUserCompanyAccess
            {
                UserId = userId,
                TenantId = TenantId,
                CompanyId = companyId,
                IsDefault = true,
                CreatedOn = now
            });
        }
        else
        {
            companyAccess.IsDefault = true;
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static BootstrapUserSettings ReadSettings(
        IConfigurationSection section,
        BootstrapUserDefinition definition)
    {
        var userSection = section.GetSection(definition.Key);
        return new BootstrapUserSettings(
            definition.Key,
            definition.RoleName,
            userSection["UserName"]?.Trim() ?? string.Empty,
            userSection["Email"]?.Trim() ?? string.Empty,
            userSection["Password"] ?? string.Empty,
            userSection["FirstName"]?.Trim() ?? string.Empty,
            userSection["LastName"]?.Trim() ?? string.Empty);
    }

    private static void ValidateSettings(IEnumerable<BootstrapUserSettings> settings)
    {
        var configured = settings.ToArray();
        foreach (var item in configured)
        {
            var missing = new List<string>();
            if (string.IsNullOrWhiteSpace(item.UserName)) missing.Add("UserName");
            if (string.IsNullOrWhiteSpace(item.Email)) missing.Add("Email");
            if (string.IsNullOrWhiteSpace(item.Password)) missing.Add("Password");
            if (string.IsNullOrWhiteSpace(item.FirstName)) missing.Add("FirstName");
            if (string.IsNullOrWhiteSpace(item.LastName)) missing.Add("LastName");
            if (missing.Count > 0)
            {
                throw new InvalidOperationException(
                    $"{SectionName}:{item.Key} requires: {string.Join(", ", missing)}.");
            }
        }

        if (configured.Select(item => item.UserName).Distinct(StringComparer.OrdinalIgnoreCase).Count() != configured.Length ||
            configured.Select(item => item.Email).Distinct(StringComparer.OrdinalIgnoreCase).Count() != configured.Length)
        {
            throw new InvalidOperationException(
                $"{SectionName} user names and email addresses must be unique.");
        }
    }

    private static InvalidOperationException ExistingIdentityConflict(string key) =>
        new($"{SectionName}:{key} conflicts with an existing identity and was not modified.");

    private static void EnsureSuccess(IdentityResult result, string message)
    {
        if (result.Succeeded)
            return;

        throw new InvalidOperationException(
            $"{message} {string.Join(", ", result.Errors.Select(error => error.Description))}");
    }

    private sealed record BootstrapUserDefinition(string Key, string RoleName);

    private sealed record BootstrapUserSettings(
        string Key,
        string RoleName,
        string UserName,
        string Email,
        string Password,
        string FirstName,
        string LastName);
}
