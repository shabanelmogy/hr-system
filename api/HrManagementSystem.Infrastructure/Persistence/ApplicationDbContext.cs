using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Persistence;
using HrManagementSystem.Domain.Common.Abstractions;
using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Employees.Entities;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Domain.Tenancy.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;
using HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Districts.Entities;
using HrManagementSystem.Infrastructure.Features.Platform.Notifications.Entities;

using HrManagementSystem.Domain.Analytics.Reports.Entities;
using HrManagementSystem.Domain.Analytics.ReportTemplates.Entities;
using HrManagementSystem.Domain.Analytics.CrystalReports.Entities;
using HrManagementSystem.Domain.Appointments.Entities;
using HrManagementSystem.Domain.Catalog.Categories.Entities;
using HrManagementSystem.Domain.Catalog.SubCategories.Entities;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;
using HrManagementSystem.Domain.Platform.EntityChangeLogs.Entities;
using HrManagementSystem.Domain.Platform.Files.Entities;
using HrManagementSystem.Domain.Platform.SecurityAudits.Entities;
using HrManagementSystem.Domain.Security.ApiKeys.Entities;
using HrManagementSystem.Domain.Security.Users.Enums;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Persistence;

public class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    ICurrentActor currentActor,
    TimeProvider timeProvider) : IdentityDbContext<ApplicationUser, ApplicationRole, string>(options),
    IUnitOfWork
{
    private readonly ICurrentActor _currentActor = currentActor;
    private readonly TimeProvider _timeProvider = timeProvider;
    private string? CurrentTenantId => _currentActor.TenantId;
    private int? CurrentCompanyId => _currentActor.CompanyId;

    public DbSet<UserLogin> LoginAudits { get; set; }
    public DbSet<EntityChangeLog> EntityChangeLogs { get; set; }
    public DbSet<UploadedFile> Files { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<SubCategory> SubCategories { get; set; }
    public DbSet<CategorySubcategory> CategorySubcategories { get; set; }
    public DbSet<ReportCategory> ReportsCategories { get; set; }
    public DbSet<ReportMaster> ReportsMasters { get; set; }
    public DbSet<ReportDetail> ReportsDetails { get; set; }
    public DbSet<ReportTemplate> ReportTemplates { get; set; }
    public DbSet<ReportTemplateRevision> ReportTemplateRevisions { get; set; }
    public DbSet<CrystalReport> CrystalReports { get; set; }
    public DbSet<CrystalReportVersion> CrystalReportVersions { get; set; }
    public DbSet<CrystalReportRoleGrant> CrystalReportRoleGrants { get; set; }
    public DbSet<ApiKey> ApiKeys { get; set; }
    public DbSet<Country> Countries { get; set; }
    public DbSet<State> States { get; set; }
    public DbSet<District> Districts { get; set; }
    public DbSet<Address> Addresses { get; set; }
    public DbSet<AddressType> AddressTypes { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<Company> Companies { get; set; }
    public DbSet<UserTenantAccess> UserTenantAccesses { get; set; }
    public DbSet<UserCompanyAccess> UserCompanyAccesses { get; set; }
    public DbSet<UserInvitation> UserInvitations { get; set; }
    public DbSet<SecurityAuditEvent> SecurityAuditEvents { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        IgnoreUnpersistedOrganizationalEntities(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        modelBuilder.ApplyConfigurationsFromAssembly(
            HrManagementSystem.Infrastructure.AssemblyReference.Assembly);
        base.OnModelCreating(modelBuilder);
        // Identity applies its global role-name index in base.OnModelCreating, so role isolation
        // must be the final role mapping applied to the model.
        new Features.Security.Authentication.Persistence.ApplicationRoleConfiguration()
            .Configure(modelBuilder.Entity<ApplicationRole>());
        ConfigureAuditRelationships(modelBuilder);
        ConfigureTenantIsolation(modelBuilder);
        RestrictCascadeDelete(modelBuilder);
    }

    private static void IgnoreUnpersistedOrganizationalEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Ignore<Branch>();
        modelBuilder.Ignore<Department>();
        modelBuilder.Ignore<Division>();
        modelBuilder.Ignore<JobTitle>();
        modelBuilder.Ignore<Position>();
        modelBuilder.Ignore<JobDescription>();
        modelBuilder.Ignore<JobLevel>();
        modelBuilder.Ignore<Employee>();
        modelBuilder.Ignore<EmployeeAssignment>();
        modelBuilder.Ignore<EmployeeContract>();
    }

    private static void ConfigureAuditRelationships(ModelBuilder modelBuilder)
    {
        var auditableEntityTypes = modelBuilder.Model
            .GetEntityTypes()
            .Where(entityType =>
                !entityType.IsOwned() &&
                typeof(AuditableEntity).IsAssignableFrom(entityType.ClrType))
            .Select(entityType => entityType.ClrType)
            .Distinct()
            .ToList();

        var configureMethod = typeof(ApplicationDbContext)
            .GetMethod(nameof(ConfigureAuditableEntity), BindingFlags.Static | BindingFlags.NonPublic)!;

        foreach (var entityType in auditableEntityTypes)
            configureMethod.MakeGenericMethod(entityType).Invoke(null, [modelBuilder]);
    }

    private static void ConfigureAuditableEntity<TEntity>(ModelBuilder modelBuilder)
        where TEntity : AuditableEntity
    {
        var builder = modelBuilder.Entity<TEntity>();
        builder.Property(entity => entity.RowVersion).IsRowVersion();

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(entity => entity.CreatedById)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(entity => entity.UpdatedById);

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(entity => entity.DeletedById);
    }

    private void ConfigureTenantIsolation(ModelBuilder modelBuilder)
    {
        var tenantEntityTypes = modelBuilder.Model
            .GetEntityTypes()
            .Where(entityType =>
                !entityType.IsOwned() &&
                typeof(ITenantScoped).IsAssignableFrom(entityType.ClrType))
            .Select(entityType => entityType.ClrType)
            .Distinct()
            .ToList();

        var configureMethod = typeof(ApplicationDbContext)
            .GetMethod(nameof(ConfigureTenantEntity), BindingFlags.Instance | BindingFlags.NonPublic)!;

        foreach (var entityType in tenantEntityTypes)
            configureMethod.MakeGenericMethod(entityType).Invoke(this, [modelBuilder]);
    }

    private void ConfigureTenantEntity<TEntity>(ModelBuilder modelBuilder)
        where TEntity : class, ITenantScoped
    {
        var builder = modelBuilder.Entity<TEntity>();
        builder.Property(entity => entity.TenantId).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => entity.TenantId);
        if (typeof(TEntity) != typeof(UserTenantAccess))
        {
            builder.HasOne<Tenant>()
                .WithMany()
                .HasForeignKey(entity => entity.TenantId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        // Identity must remain queryable before authentication so login can resolve the user.
        if (typeof(TEntity) != typeof(ApplicationUser))
        {
            builder.HasQueryFilter(
                "TenantFilter",
                entity => CurrentTenantId != null && entity.TenantId == CurrentTenantId);
        }

        if (typeof(ICompanyScoped).IsAssignableFrom(typeof(TEntity)))
        {
            var configureCompanyMethod = typeof(ApplicationDbContext)
                .GetMethod(nameof(ConfigureCompanyEntity), BindingFlags.Instance | BindingFlags.NonPublic)!;
            configureCompanyMethod.MakeGenericMethod(typeof(TEntity)).Invoke(this, [modelBuilder]);
        }
    }

    private void ConfigureCompanyEntity<TEntity>(ModelBuilder modelBuilder)
        where TEntity : class, ICompanyScoped
    {
        var builder = modelBuilder.Entity<TEntity>();
        builder.Property(entity => entity.CompanyId).IsRequired();
        builder.HasIndex(entity => new { entity.TenantId, entity.CompanyId });
        if (typeof(TEntity) != typeof(UserCompanyAccess))
        {
            builder.HasOne<Company>()
                .WithMany()
                .HasForeignKey(entity => new { entity.TenantId, entity.CompanyId })
                .HasPrincipalKey(company => new { company.TenantId, company.Id })
                .OnDelete(DeleteBehavior.Restrict);
        }
        builder.HasQueryFilter(
            "CompanyFilter",
            entity => CurrentCompanyId != null && entity.CompanyId == CurrentCompanyId);
    }

    private static void RestrictCascadeDelete(ModelBuilder modelBuilder)
    {
        var cascadeFKs = modelBuilder.Model
            .GetEntityTypes()
            .SelectMany(t => t.GetForeignKeys())
            .Where(fk =>
                fk.DeleteBehavior == DeleteBehavior.Cascade &&
                !fk.DeclaringEntityType.IsOwned());

        foreach (var fk in cascadeFKs)
        {
            fk.DeleteBehavior = DeleteBehavior.Restrict;
        }
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        GrantNewCompanyAccesses();
        PrepareChanges();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override async Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        await GrantNewCompanyAccessesAsync(cancellationToken);
        PrepareChanges();
        return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    public async Task<TResult> ExecuteAtomicallyAsync<TResult>(
        IReadOnlyCollection<string> lockResources,
        Func<CancellationToken, Task<TResult>> operation,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(lockResources);
        ArgumentNullException.ThrowIfNull(operation);

        var orderedResources = lockResources
            .Where(resource => !string.IsNullOrWhiteSpace(resource))
            .Distinct(StringComparer.Ordinal)
            .OrderBy(resource => resource, StringComparer.Ordinal)
            .ToArray();

        if (!Database.IsRelational())
            return await operation(cancellationToken);

        if (!string.Equals(
                Database.ProviderName,
                "Microsoft.EntityFrameworkCore.SqlServer",
                StringComparison.Ordinal))
        {
            throw new NotSupportedException(
                "Atomic resource locking is configured for the SQL Server provider only.");
        }

        if (Database.CurrentTransaction is not null)
        {
            await AcquireTransactionLocksAsync(orderedResources, cancellationToken);
            return await operation(cancellationToken);
        }

        await using var transaction = await Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await AcquireTransactionLocksAsync(orderedResources, cancellationToken);
            var result = await operation(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return result;
        }
        catch
        {
            try
            {
                await transaction.RollbackAsync(CancellationToken.None);
            }
            catch
            {
                // Preserve the original operation/commit exception.
            }
            throw;
        }
    }

    private async Task AcquireTransactionLocksAsync(
        IReadOnlyCollection<string> lockResources,
        CancellationToken cancellationToken)
    {
        foreach (var resource in lockResources)
        {
            await Database.ExecuteSqlInterpolatedAsync($$"""
                DECLARE @lockResult int;
                EXEC @lockResult = sys.sp_getapplock
                    @Resource = {{resource}},
                    @LockMode = 'Exclusive',
                    @LockOwner = 'Transaction',
                    @LockTimeout = 15000;
                IF @lockResult < 0
                    THROW 51001, 'Failed to acquire a transaction resource lock.', 1;
                """, cancellationToken);
        }
    }

    private void PrepareChanges()
    {
        EnforceAppendOnlySecurityAudit();
        EnforceAppendOnlyReportTemplateRevisions();
        EnforceAppendOnlyCrystalReportVersions();
        ApplyTenantIsolation();

        var currentUserId = _currentActor.UserId;
        var currentMachineName = Environment.MachineName;
        var currentTime = _timeProvider.GetUtcNow().UtcDateTime;

        foreach (var entityEntry in ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entityEntry.State)
            {
                case EntityState.Added:
                    SetCreatedValues(entityEntry, currentUserId, currentMachineName, currentTime);
                    break;
                case EntityState.Modified:
                    SetUpdatedValues(entityEntry, currentUserId, currentMachineName, currentTime);
                    break;
                case EntityState.Deleted:
                    SetDeletedValues(entityEntry, currentUserId, currentMachineName, currentTime);
                    break;
            }
        }

    }

    private void EnforceAppendOnlySecurityAudit()
    {
        var invalidEntry = ChangeTracker.Entries<SecurityAuditEvent>()
            .FirstOrDefault(entry => entry.State is EntityState.Modified or EntityState.Deleted);

        if (invalidEntry is not null)
            throw new InvalidOperationException("Security audit events are append-only.");
    }

    private void EnforceAppendOnlyReportTemplateRevisions()
    {
        var invalidEntry = ChangeTracker.Entries<ReportTemplateRevision>()
            .FirstOrDefault(entry => entry.State is EntityState.Modified or EntityState.Deleted);

        if (invalidEntry is not null)
            throw new InvalidOperationException("Report template revisions are append-only.");
    }

    private void EnforceAppendOnlyCrystalReportVersions()
    {
        var invalidEntry = ChangeTracker.Entries<CrystalReportVersion>()
            .FirstOrDefault(entry => entry.State is EntityState.Modified or EntityState.Deleted);

        if (invalidEntry is not null)
            throw new InvalidOperationException("Crystal report versions are append-only.");
    }

    private void GrantNewCompanyAccesses()
    {
        var addedCompanies = GetAddedCompanies();
        if (addedCompanies.Length == 0)
            return;

        var tenantIds = addedCompanies.Select(company => company.TenantId).Distinct().ToArray();
        var tenantAdmins = GetActiveTenantAdministratorAccesses(tenantIds).ToArray();
        GrantNewCompanyAccesses(addedCompanies, tenantAdmins);
    }

    private async Task GrantNewCompanyAccessesAsync(CancellationToken cancellationToken)
    {
        var addedCompanies = GetAddedCompanies();
        if (addedCompanies.Length == 0)
            return;

        var tenantIds = addedCompanies.Select(company => company.TenantId).Distinct().ToArray();
        var tenantAdmins = await GetActiveTenantAdministratorAccesses(tenantIds)
            .ToArrayAsync(cancellationToken);
        GrantNewCompanyAccesses(addedCompanies, tenantAdmins);
    }

    private Company[] GetAddedCompanies()
    {
        var currentTenantId = CurrentTenantId;
        var companies = ChangeTracker.Entries<Company>()
            .Where(entry => entry.State == EntityState.Added)
            .Select(entry => entry.Entity)
            .ToArray();

        foreach (var company in companies.Where(company => string.IsNullOrWhiteSpace(company.TenantId)))
        {
            if (string.IsNullOrWhiteSpace(currentTenantId))
                throw new InvalidOperationException("A tenant is required to create a company.");

            company.TenantId = currentTenantId;
        }

        return companies;
    }

    private IQueryable<TenantAdministratorAccess> GetActiveTenantAdministratorAccesses(
        IReadOnlyCollection<string> tenantIds) =>
        (from tenantAccess in UserTenantAccesses.IgnoreQueryFilters().AsNoTracking()
         join user in Users.IgnoreQueryFilters().AsNoTracking()
             on tenantAccess.UserId equals user.Id
         join userRole in UserRoles.AsNoTracking()
             on tenantAccess.UserId equals userRole.UserId
         join role in Roles.AsNoTracking()
             on userRole.RoleId equals role.Id
         where tenantIds.Contains(tenantAccess.TenantId) &&
               user.LifecycleStatus == UserLifecycleStatus.Active &&
               role.IsSystem &&
               role.NormalizedName == AppRoles.admin.ToUpper()
         select new TenantAdministratorAccess(tenantAccess.TenantId, tenantAccess.UserId))
        .Distinct();

    private void GrantNewCompanyAccesses(
        IReadOnlyCollection<Company> companies,
        IReadOnlyCollection<TenantAdministratorAccess> tenantAdministrators)
    {
        var currentUserId = _currentActor.UserId;
        var currentTenantId = CurrentTenantId;

        foreach (var company in companies)
        {
            var userIds = tenantAdministrators
                .Where(access => access.TenantId == company.TenantId)
                .Select(access => access.UserId)
                .ToHashSet(StringComparer.Ordinal);

            if (!string.IsNullOrWhiteSpace(currentUserId) &&
                string.Equals(currentTenantId, company.TenantId, StringComparison.Ordinal))
            {
                userIds.Add(currentUserId);
            }

            foreach (var userId in userIds)
            {
                var alreadyTracked = ChangeTracker.Entries<UserCompanyAccess>()
                    .Any(entry =>
                        entry.State != EntityState.Deleted &&
                        entry.Entity.UserId == userId &&
                        (ReferenceEquals(entry.Entity.Company, company) ||
                         (company.Id > 0 && entry.Entity.CompanyId == company.Id)));

                if (alreadyTracked)
                    continue;

                UserCompanyAccesses.Add(new UserCompanyAccess
                {
                    TenantId = company.TenantId,
                    UserId = userId,
                    Company = company,
                    IsDefault = false
                });
            }
        }
    }

    private sealed record TenantAdministratorAccess(string TenantId, string UserId);

    private void ApplyTenantIsolation()
    {
        var currentTenantId = CurrentTenantId;

        foreach (var entityEntry in ChangeTracker.Entries<ITenantScoped>()
                     .Where(entry => entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted))
        {
            var tenantProperty = entityEntry.Property(entity => entity.TenantId);
            var entityTenantId = tenantProperty.CurrentValue;

            if (entityEntry.State == EntityState.Added && string.IsNullOrWhiteSpace(entityTenantId))
            {
                if (string.IsNullOrWhiteSpace(currentTenantId))
                    throw new InvalidOperationException("A tenant is required to create tenant-owned data.");

                tenantProperty.CurrentValue = currentTenantId;
                entityTenantId = currentTenantId;
            }

            if (string.IsNullOrWhiteSpace(entityTenantId))
                throw new InvalidOperationException("Tenant-owned data must have a tenant identifier.");

            if (!string.IsNullOrWhiteSpace(currentTenantId) &&
                !string.Equals(entityTenantId, currentTenantId, StringComparison.Ordinal))
            {
                throw new InvalidOperationException("Cross-tenant data changes are not allowed.");
            }

            if (entityEntry.State == EntityState.Modified && tenantProperty.IsModified &&
                !string.Equals(tenantProperty.OriginalValue, tenantProperty.CurrentValue, StringComparison.Ordinal))
            {
                throw new InvalidOperationException("Changing an entity tenant is not allowed.");
            }
        }

        foreach (var entityEntry in ChangeTracker.Entries<ICompanyScoped>()
                     .Where(entry => entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted))
        {
            var isUserCompanyAccess = entityEntry.Entity is UserCompanyAccess;
            var linksToAddedCompany = entityEntry.Entity is UserCompanyAccess userCompanyAccess &&
                userCompanyAccess.Company is not null &&
                Entry(userCompanyAccess.Company).State == EntityState.Added;
            var companyProperty = entityEntry.Property(entity => entity.CompanyId);
            var entityCompanyId = companyProperty.CurrentValue;
            var currentCompanyId = CurrentCompanyId;

            if (entityEntry.State == EntityState.Added && entityCompanyId <= 0 && !linksToAddedCompany)
            {
                if (!currentCompanyId.HasValue)
                    throw new InvalidOperationException("A company is required to create company-owned data.");

                companyProperty.CurrentValue = currentCompanyId.Value;
                entityCompanyId = currentCompanyId.Value;
            }

            if (entityCompanyId <= 0 && !linksToAddedCompany)
                throw new InvalidOperationException("Company-owned data must have a company identifier.");

            if (!isUserCompanyAccess &&
                currentCompanyId.HasValue &&
                entityCompanyId != currentCompanyId.Value)
            {
                throw new InvalidOperationException("Cross-company data changes are not allowed.");
            }

            if (!isUserCompanyAccess &&
                entityEntry.State == EntityState.Modified && companyProperty.IsModified &&
                !Equals(companyProperty.OriginalValue, companyProperty.CurrentValue))
            {
                throw new InvalidOperationException("Changing an entity company is not allowed.");
            }
        }
    }

    private static void SetCreatedValues(
        EntityEntry<AuditableEntity> entityEntry,
        string? userId,
        string machineName,
        DateTime currentTime)
    {
        if (!string.IsNullOrWhiteSpace(userId))
            entityEntry.Property(x => x.CreatedById).CurrentValue = userId;

        if (string.IsNullOrWhiteSpace(entityEntry.Property(x => x.CreatedById).CurrentValue))
        {
            throw new InvalidOperationException(
                "An actor user is required to create auditable data. " +
                "Background operations must establish an ICurrentActorScope.");
        }

        entityEntry.Property(x => x.CreatedByPc).CurrentValue = machineName;
        entityEntry.Property(x => x.CreatedOn).CurrentValue = currentTime;
    }

    private static void SetUpdatedValues(
        EntityEntry<AuditableEntity> entityEntry,
        string? userId,
        string machineName,
        DateTime currentTime)
    {
        if (!string.IsNullOrWhiteSpace(userId))
            entityEntry.Property(x => x.UpdatedById).CurrentValue = userId;

        entityEntry.Property(x => x.UpdatedByPc).CurrentValue = machineName;
        entityEntry.Property(x => x.UpdatedOn).CurrentValue = currentTime;
    }

    private static void SetDeletedValues(
        EntityEntry<AuditableEntity> entityEntry,
        string? userId,
        string machineName,
        DateTime currentTime)
    {
        entityEntry.State = EntityState.Modified;

        if (!string.IsNullOrWhiteSpace(userId))
            entityEntry.Property(x => x.DeletedById).CurrentValue = userId;

        if (string.IsNullOrWhiteSpace(entityEntry.Property(x => x.DeletedById).CurrentValue))
        {
            throw new InvalidOperationException(
                "An actor user is required to delete auditable data. " +
                "Background operations must establish an ICurrentActorScope.");
        }

        entityEntry.Property(x => x.IsDeleted).CurrentValue = true;
        entityEntry.Property(x => x.DeletedByPc).CurrentValue = machineName;
        entityEntry.Property(x => x.DeletedOn).CurrentValue = currentTime;
        entityEntry.Property(x => x.UpdatedById).CurrentValue = userId;
        entityEntry.Property(x => x.UpdatedByPc).CurrentValue = machineName;
        entityEntry.Property(x => x.UpdatedOn).CurrentValue = currentTime;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder
            .ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
    }

}
