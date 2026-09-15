using ErpSystem.Modules.Platform.Infrastructure.Identity;
using ErpSystem.Modules.Platform.Domain.Companies.Entities;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Domain.Abstractions;
using ErpSystem.BuildingBlocks.Domain.Entities;
using ErpSystem.Modules.Platform.Domain.Platform.EntityChangeLogs.Entities;
using ErpSystem.Modules.Platform.Domain.Platform.Files.Entities;
using ErpSystem.Modules.Platform.Domain.Platform.SecurityAudits.Entities;
using ErpSystem.Modules.Platform.Domain.Security.ApiKeys.Entities;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.Notifications.Entities;
using ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authentication.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Infrastructure;

/// <summary>
/// Module-owned DbContext for Platform. The default schema is "platform"
/// and the migrations history table lives inside that schema, so module storage
/// stays separated from every other module sharing the database.
/// </summary>
public sealed class PlatformDbContext : IdentityDbContext<PlatformApplicationUser, PlatformApplicationRole, string>, IUnitOfWork
{
    public const string Schema = "platform";

    // A fresh scaffold has no IEntityTypeConfiguration implementations yet.
    // This cached detection mirrors AccountingDbContext: scanning an empty
    // assembly unconditionally keeps EF model checks noisy for new modules.
    private static readonly bool HasEntityConfigurations =
        typeof(PlatformDbContext).Assembly.GetTypes().Any(type =>
            !type.IsAbstract &&
            !type.IsGenericTypeDefinition &&
            type.GetInterfaces().Any(interfaceType =>
                interfaceType.IsGenericType &&
                interfaceType.GetGenericTypeDefinition() == typeof(IEntityTypeConfiguration<>)));

    private readonly ICurrentActor? _currentActor;

    private string? CurrentTenantId => _currentActor?.TenantId;
    private int? CurrentCompanyId => _currentActor?.CompanyId;

    public PlatformDbContext(
        DbContextOptions<PlatformDbContext> options,
        ICurrentActor? currentActor = null)
        : base(options)
    {
        _currentActor = currentActor;
    }

    public DbSet<PlatformTenant> Tenants => Set<PlatformTenant>();
    public DbSet<PlatformCompany> Companies => Set<PlatformCompany>();
    public DbSet<CompanyCountry> CompanyCountries => Set<CompanyCountry>();
    public DbSet<PlatformUserTenantAccess> UserTenantAccesses => Set<PlatformUserTenantAccess>();
    public DbSet<PlatformUserCompanyAccess> UserCompanyAccesses => Set<PlatformUserCompanyAccess>();
    public DbSet<PlatformAuthenticationSelectionChallenge> AuthenticationSelectionChallenges => Set<PlatformAuthenticationSelectionChallenge>();
    public DbSet<PlatformUserInvitation> UserInvitations => Set<PlatformUserInvitation>();
    public DbSet<PlatformTenantModuleEntitlement> TenantModuleEntitlements => Set<PlatformTenantModuleEntitlement>();
    public DbSet<PlatformTenantSubmoduleEntitlement> TenantSubmoduleEntitlements => Set<PlatformTenantSubmoduleEntitlement>();
    public DbSet<UserLogin> LoginAudits => Set<UserLogin>();
    public DbSet<EntityChangeLog> EntityChangeLogs => Set<EntityChangeLog>();
    public DbSet<UploadedFile> Files => Set<UploadedFile>();
    public DbSet<ApiKey> ApiKeys => Set<ApiKey>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SecurityAuditEvent> SecurityAuditEvents => Set<SecurityAuditEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(Schema);
        ConfigureIdentity(modelBuilder);
        ConfigureScopeFilters(modelBuilder);
        if (HasEntityConfigurations)
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(PlatformDbContext).Assembly);
    }

    private void ConfigureScopeFilters(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PlatformCompany>()
            .HasQueryFilter(company => company.TenantId == CurrentTenantId && company.DeletedOn == null);
        modelBuilder.Entity<CompanyCountry>()
            .HasQueryFilter(link => link.TenantId == CurrentTenantId &&
                                    link.CompanyId == CurrentCompanyId &&
                                    !link.IsDeleted);
        modelBuilder.Entity<PlatformUserTenantAccess>()
            .HasQueryFilter(access => access.TenantId == CurrentTenantId);
        modelBuilder.Entity<PlatformUserCompanyAccess>()
            .HasQueryFilter(access => access.TenantId == CurrentTenantId &&
                                      access.CompanyId == CurrentCompanyId);
        modelBuilder.Entity<PlatformAuthenticationSelectionChallenge>()
            .HasQueryFilter(challenge => challenge.TenantId == null ||
                                         challenge.TenantId == CurrentTenantId);
        modelBuilder.Entity<PlatformUserInvitation>()
            .HasQueryFilter(invitation => invitation.TenantId == CurrentTenantId);
        modelBuilder.Entity<PlatformTenantModuleEntitlement>()
            .HasQueryFilter(entitlement => entitlement.TenantId == CurrentTenantId);
        modelBuilder.Entity<PlatformTenantSubmoduleEntitlement>()
            .HasQueryFilter(entitlement => entitlement.TenantId == CurrentTenantId);
        modelBuilder.Entity<UserLogin>()
            .HasQueryFilter(login => login.TenantId == CurrentTenantId &&
                                     login.CompanyId == CurrentCompanyId);
        modelBuilder.Entity<EntityChangeLog>()
            .HasQueryFilter(log => log.TenantId == CurrentTenantId &&
                                   log.CompanyId == CurrentCompanyId);
        modelBuilder.Entity<UploadedFile>()
            .HasQueryFilter(file => file.TenantId == CurrentTenantId &&
                                    file.CompanyId == CurrentCompanyId &&
                                    !file.IsDeleted);
        modelBuilder.Entity<ApiKey>()
            .HasQueryFilter(key => key.TenantId == CurrentTenantId &&
                                   key.CompanyId == CurrentCompanyId);
        modelBuilder.Entity<Notification>()
            .HasQueryFilter(notification => notification.TenantId == CurrentTenantId &&
                                            notification.CompanyId == CurrentCompanyId);
        modelBuilder.Entity<SecurityAuditEvent>()
            .HasQueryFilter(audit => audit.TenantId == null ||
                                     (audit.TenantId == CurrentTenantId &&
                                      (!audit.CompanyId.HasValue || audit.CompanyId == CurrentCompanyId)));
    }

    private static void ConfigureIdentity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<PlatformApplicationUser>(builder =>
        {
            builder.ToTable("AspNetUsers", Schema);
            builder.Property(user => user.FirstName).HasMaxLength(100).IsRequired();
            builder.Property(user => user.LastName).HasMaxLength(100).IsRequired();
            builder.Property(user => user.ArchiveReason).HasMaxLength(1000);
            builder.Property(user => user.ProfilePicture).HasMaxLength(500);
            builder.OwnsMany(user => user.RefreshTokens, token =>
            {
                token.ToTable("PlatformRefreshToken", Schema);
                token.WithOwner().HasForeignKey("ApplicationUserId");
                token.Property<string>("ApplicationUserId").HasMaxLength(450);
                token.Property(value => value.Id).ValueGeneratedOnAdd();
                token.HasKey("ApplicationUserId", nameof(PlatformRefreshToken.Id));
                token.Property(value => value.TokenHash).HasMaxLength(64).IsRequired();
                token.Property(value => value.SessionId).HasMaxLength(32).IsRequired();
                token.Property(value => value.JwtId).HasMaxLength(36).IsRequired();
                token.Property(value => value.RevocationReason).HasMaxLength(100);
                token.Property(value => value.CreatedByIp).HasMaxLength(45);
                token.Property(value => value.CreatedByUserAgent).HasMaxLength(256);
                token.HasIndex(value => value.TokenHash).IsUnique();
            });
        });

        modelBuilder.Entity<PlatformApplicationRole>(builder =>
        {
            builder.ToTable("AspNetRoles", Schema);
            builder.Property(role => role.TenantId).HasMaxLength(32);
            builder.HasIndex(role => new { role.TenantId, role.NormalizedName }).IsUnique();
        });

        modelBuilder.Entity<IdentityUserClaim<string>>().ToTable("AspNetUserClaims", Schema);
        modelBuilder.Entity<IdentityUserLogin<string>>().ToTable("AspNetUserLogins", Schema);
        modelBuilder.Entity<IdentityUserToken<string>>().ToTable("AspNetUserTokens", Schema);
        modelBuilder.Entity<IdentityUserRole<string>>().ToTable("AspNetUserRoles", Schema);
        modelBuilder.Entity<IdentityRoleClaim<string>>().ToTable("AspNetRoleClaims", Schema);

        modelBuilder.Entity<PlatformTenant>(builder =>
        {
            builder.ToTable("Tenants", Schema);
            builder.HasKey(tenant => tenant.Id);
            builder.Property(tenant => tenant.Id).HasMaxLength(32);
            builder.Property(tenant => tenant.Identifier).HasMaxLength(100).IsRequired();
            builder.Property(tenant => tenant.Name).HasMaxLength(200).IsRequired();
            builder.Property(tenant => tenant.PlanName).HasMaxLength(100);
            builder.Property(tenant => tenant.BillingEmail).HasMaxLength(256);
            builder.Property(tenant => tenant.ContactName).HasMaxLength(200);
            builder.Property(tenant => tenant.ContactPhone).HasMaxLength(32);
            builder.Property(tenant => tenant.Notes).HasMaxLength(2000);
            builder.Property(tenant => tenant.RowVersion).IsRowVersion();
            builder.HasIndex(tenant => tenant.Identifier).IsUnique();
        });

        modelBuilder.Entity<PlatformCompany>(builder =>
        {
            builder.ToTable("Companies", Schema);
            builder.HasKey(company => company.Id);
            builder.HasAlternateKey(company => new { company.TenantId, company.Id });
            builder.Property(company => company.TenantId).HasMaxLength(32).IsRequired();
            builder.Property(company => company.CompanyCode).HasMaxLength(50).IsRequired();
            builder.Property(company => company.NameEn).HasMaxLength(200).IsRequired();
            builder.Property(company => company.NameAr).HasMaxLength(200).IsRequired();
            builder.Property(company => company.DefaultCurrencyCode).HasMaxLength(3).IsRequired();
            builder.Property(company => company.TimeZoneId).HasMaxLength(100).IsRequired();
            builder.Property(company => company.RowVersion).IsRowVersion();
            builder.HasIndex(company => new { company.TenantId, company.CompanyCode }).IsUnique();
            builder.HasIndex(company => new { company.TenantId, company.NameEn }).IsUnique();
            builder.HasIndex(company => new { company.TenantId, company.NameAr }).IsUnique();
            builder.HasOne<PlatformTenant>().WithMany()
                .HasForeignKey(company => company.TenantId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CompanyCountry>(builder =>
        {
            builder.ToTable("CompanyCountries", Schema);
            builder.HasKey(item => item.Id);
            builder.Property(item => item.TenantId).HasMaxLength(32).IsRequired();
            builder.Property(item => item.CompanyId).IsRequired();
            builder.Property(item => item.RowVersion).IsRowVersion();
            builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.CountryId }).IsUnique();
            builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.IsDefault })
                .HasFilter("[IsDeleted] = 0 AND [IsDefault] = 1")
                .IsUnique();
            builder.HasOne<PlatformCompany>()
                .WithMany()
                .HasForeignKey(item => new { item.TenantId, item.CompanyId })
                .HasPrincipalKey(company => new { company.TenantId, company.Id })
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PlatformUserTenantAccess>(builder =>
        {
            builder.ToTable("UserTenantAccesses", Schema);
            builder.HasKey(access => new { access.UserId, access.TenantId });
            builder.HasOne(access => access.User).WithMany(user => user.TenantAccesses)
                .HasForeignKey(access => access.UserId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(access => access.Tenant).WithMany()
                .HasForeignKey(access => access.TenantId).OnDelete(DeleteBehavior.Restrict);
            builder.HasIndex(access => new { access.TenantId, access.IsDefault });
        });

        modelBuilder.Entity<PlatformUserCompanyAccess>(builder =>
        {
            builder.ToTable("UserCompanyAccesses", Schema);
            builder.HasKey(access => new { access.UserId, access.CompanyId });
            builder.HasOne(access => access.User).WithMany(user => user.CompanyAccesses)
                .HasForeignKey(access => access.UserId).OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(access => access.Company).WithMany()
                .HasForeignKey(access => new { access.TenantId, access.CompanyId })
                .HasPrincipalKey(company => new { company.TenantId, company.Id })
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PlatformAuthenticationSelectionChallenge>(builder =>
        {
            builder.ToTable("AuthenticationSelectionChallenges", Schema);
            builder.HasKey(challenge => challenge.JwtId);
            builder.Property(challenge => challenge.JwtId).HasMaxLength(450);
            builder.Property(challenge => challenge.UserId).HasMaxLength(450).IsRequired();
            builder.Property(challenge => challenge.Scope).HasMaxLength(64).IsRequired();
            builder.Property(challenge => challenge.TenantId).HasMaxLength(32);
            builder.Property(challenge => challenge.RowVersion).IsRowVersion();
            builder.HasOne(challenge => challenge.User).WithMany()
                .HasForeignKey(challenge => challenge.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlatformUserInvitation>(builder =>
        {
            builder.ToTable("UserInvitations", Schema);
            builder.HasKey(invitation => invitation.Id);
            builder.Property(invitation => invitation.TenantId).HasMaxLength(32).IsRequired();
            builder.Property(invitation => invitation.Email).HasMaxLength(256).IsRequired();
            builder.Property(invitation => invitation.NormalizedEmail).HasMaxLength(256).IsRequired();
            builder.Property(invitation => invitation.UserName).HasMaxLength(50).IsRequired();
            builder.Property(invitation => invitation.NormalizedUserName).HasMaxLength(50).IsRequired();
            builder.Property(invitation => invitation.TokenHash).HasMaxLength(128).IsRequired();
            builder.Property(invitation => invitation.RolesJson).HasMaxLength(2000).IsRequired();
            builder.Property(invitation => invitation.CompanyIdsJson).HasMaxLength(1000).IsRequired();
            builder.Property(invitation => invitation.InvitedByUserId).HasMaxLength(450).IsRequired();
            builder.Property(invitation => invitation.RowVersion).IsRowVersion();
            builder.HasIndex(invitation => new { invitation.TenantId, invitation.NormalizedEmail });
        });

        modelBuilder.Entity<PlatformTenantModuleEntitlement>(builder =>
        {
            builder.ToTable("TenantModuleEntitlements", Schema);
            builder.HasKey(item => new { item.TenantId, item.ModuleCode });
            builder.Property(item => item.TenantId).HasMaxLength(32);
            builder.Property(item => item.ModuleCode).HasMaxLength(100);
            builder.HasOne<PlatformTenant>().WithMany().HasForeignKey(item => item.TenantId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlatformTenantSubmoduleEntitlement>(builder =>
        {
            builder.ToTable("TenantSubmoduleEntitlements", Schema);
            builder.HasKey(item => new { item.TenantId, item.ModuleCode, item.SubmoduleCode });
            builder.Property(item => item.TenantId).HasMaxLength(32);
            builder.Property(item => item.ModuleCode).HasMaxLength(100);
            builder.Property(item => item.SubmoduleCode).HasMaxLength(100);
            builder.HasOne<PlatformTenantModuleEntitlement>().WithMany()
                .HasForeignKey(item => new { item.TenantId, item.ModuleCode })
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        SaveChangesAsync(true, cancellationToken);

    public override int SaveChanges() => SaveChanges(true);

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        ApplyScopeAndAuditRules();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override async Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        ApplyScopeAndAuditRules();
        return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void ApplyScopeAndAuditRules()
    {
        var now = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries().Where(item =>
                     item.State is EntityState.Added or EntityState.Modified or EntityState.Deleted))
        {
            if (entry.Entity is ICompanyScoped companyScoped)
            {
                if (string.IsNullOrWhiteSpace(companyScoped.TenantId) || companyScoped.CompanyId <= 0)
                {
                    if (string.IsNullOrWhiteSpace(CurrentTenantId) || CurrentCompanyId is not > 0)
                        throw new InvalidOperationException(
                            "Tenant and company context are required for platform company-scoped writes.");

                    companyScoped.TenantId = CurrentTenantId!;
                    companyScoped.CompanyId = CurrentCompanyId.Value;
                }
                else if ((!string.IsNullOrWhiteSpace(CurrentTenantId) &&
                          !string.Equals(companyScoped.TenantId, CurrentTenantId, StringComparison.Ordinal)) ||
                         (CurrentCompanyId.HasValue && companyScoped.CompanyId != CurrentCompanyId.Value))
                {
                    throw new InvalidOperationException(
                        "Platform writes cannot cross tenant or company boundaries.");
                }
            }

            if (entry.Entity is not CompanyAuditableEntity auditable)
                continue;

            if (entry.State == EntityState.Deleted)
            {
                entry.State = EntityState.Modified;
                auditable.IsDeleted = true;
                auditable.DeletedOn = now;
                auditable.DeletedById = _currentActor?.UserId ?? auditable.DeletedById;
                auditable.DeletedByPc = Environment.MachineName;
            }

            if (entry.State == EntityState.Added)
            {
                auditable.CreatedOn = now;
                auditable.CreatedById = _currentActor?.UserId ?? auditable.CreatedById ?? "system";
                auditable.CreatedByPc = Environment.MachineName;
            }
            else
            {
                auditable.UpdatedOn = now;
                auditable.UpdatedById = _currentActor?.UserId ?? auditable.UpdatedById;
                auditable.UpdatedByPc = Environment.MachineName;
            }
        }
    }

    public async Task<TResult> ExecuteAtomicallyAsync<TResult>(
        IReadOnlyCollection<string> lockResources,
        Func<CancellationToken, Task<TResult>> operation,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(lockResources);
        ArgumentNullException.ThrowIfNull(operation);

        var resources = lockResources
            .Where(resource => !string.IsNullOrWhiteSpace(resource))
            .Distinct(StringComparer.Ordinal)
            .OrderBy(resource => resource, StringComparer.Ordinal)
            .ToArray();

        if (!Database.IsRelational())
            return await operation(cancellationToken);

        if (!string.Equals(Database.ProviderName, "Microsoft.EntityFrameworkCore.SqlServer", StringComparison.Ordinal))
            throw new NotSupportedException("Platform atomic resource locking requires SQL Server.");

        if (Database.CurrentTransaction is not null)
        {
            await AcquireTransactionLocksAsync(resources, cancellationToken);
            return await operation(cancellationToken);
        }

        await using var transaction = await Database.BeginTransactionAsync(cancellationToken);
        try
        {
            await AcquireTransactionLocksAsync(resources, cancellationToken);
            var result = await operation(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return result;
        }
        catch
        {
            await transaction.RollbackAsync(CancellationToken.None);
            throw;
        }
    }

    private async Task AcquireTransactionLocksAsync(
        IReadOnlyCollection<string> resources,
        CancellationToken cancellationToken)
    {
        foreach (var resource in resources)
        {
            await Database.ExecuteSqlInterpolatedAsync($"""
                DECLARE @lockResult int;
                EXEC @lockResult = sys.sp_getapplock
                    @Resource = {resource},
                    @LockMode = 'Exclusive',
                    @LockOwner = 'Transaction',
                    @LockTimeout = 15000;
                IF @lockResult < 0
                    THROW 51001, 'Failed to acquire a platform transaction resource lock.', 1;
                """, cancellationToken);
        }
    }
}
