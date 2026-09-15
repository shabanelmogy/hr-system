using System.Reflection;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Domain.Abstractions;
using ErpSystem.BuildingBlocks.Domain.Entities;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;
using ErpSystem.Modules.Reporting.Domain.Analytics.Reports.Entities;
using ErpSystem.Modules.Reporting.Domain.Analytics.ReportTemplates.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace ErpSystem.Modules.Reporting.Infrastructure;

/// <summary>
/// Module-owned DbContext for Reporting. The default schema is "rpt" and the
/// migrations history table lives inside that schema. Tenant/company isolation,
/// audit metadata and append-only reporting history are enforced here so they do
/// not depend on another bounded context's persistence pipeline.
/// </summary>
public sealed class ReportingDbContext : DbContext, IUnitOfWork
{
    public const string Schema = "rpt";

    private static readonly bool HasEntityConfigurations =
        typeof(ReportingDbContext).Assembly.GetTypes().Any(type =>
            !type.IsAbstract &&
            !type.IsGenericTypeDefinition &&
            type.GetInterfaces().Any(interfaceType =>
                interfaceType.IsGenericType &&
                interfaceType.GetGenericTypeDefinition() == typeof(IEntityTypeConfiguration<>)));

    private readonly ICurrentActor _currentActor;
    private readonly TimeProvider _timeProvider;

    public ReportingDbContext(
        DbContextOptions<ReportingDbContext> options,
        ICurrentActor? currentActor = null,
        TimeProvider? timeProvider = null)
        : base(options)
    {
        _currentActor = currentActor ?? EmptyActor.Instance;
        _timeProvider = timeProvider ?? TimeProvider.System;
    }

    public DbSet<CrystalReport> CrystalReports => Set<CrystalReport>();
    public DbSet<CrystalReportVersion> CrystalReportVersions => Set<CrystalReportVersion>();
    public DbSet<CrystalReportRoleGrant> CrystalReportRoleGrants => Set<CrystalReportRoleGrant>();
    public DbSet<ReportCategory> ReportsCategories => Set<ReportCategory>();
    public DbSet<ReportMaster> ReportMasters => Set<ReportMaster>();
    public DbSet<ReportDetail> ReportsDetails => Set<ReportDetail>();
    public DbSet<ReportTemplate> ReportTemplates => Set<ReportTemplate>();
    public DbSet<ReportTemplateRevision> ReportTemplateRevisions => Set<ReportTemplateRevision>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(Schema);
        if (HasEntityConfigurations)
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ReportingDbContext).Assembly);

        ConfigureRowVersion(modelBuilder);
        ConfigureScopeIsolation(modelBuilder);
        RestrictCascadeDelete(modelBuilder);
    }

    private static void ConfigureRowVersion(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes()
                     .Where(entity => !entity.IsOwned() &&
                         typeof(AuditableEntity).IsAssignableFrom(entity.ClrType)))
        {
            modelBuilder.Entity(entityType.ClrType)
                .Property(nameof(AuditableEntity.RowVersion))
                .IsRowVersion()
                .IsConcurrencyToken();
        }
    }

    private void ConfigureScopeIsolation(ModelBuilder modelBuilder)
    {
        var tenantMethod = typeof(ReportingDbContext)
            .GetMethod(nameof(ConfigureTenantEntity), BindingFlags.Instance | BindingFlags.NonPublic)!;
        foreach (var type in modelBuilder.Model.GetEntityTypes()
                     .Where(entity => !entity.IsOwned() && typeof(ITenantScoped).IsAssignableFrom(entity.ClrType))
                     .Select(entity => entity.ClrType)
                     .Distinct())
        {
            tenantMethod.MakeGenericMethod(type).Invoke(this, [modelBuilder]);
        }
    }

    private void ConfigureTenantEntity<TEntity>(ModelBuilder modelBuilder)
        where TEntity : class, ITenantScoped
    {
        var builder = modelBuilder.Entity<TEntity>();
        builder.Property(entity => entity.TenantId).HasMaxLength(32).IsRequired().IsConcurrencyToken();
        builder.HasIndex(entity => entity.TenantId);
        builder.HasQueryFilter(
            "TenantFilter",
            entity => _currentActor.TenantId != null && entity.TenantId == _currentActor.TenantId);

        if (typeof(ICompanyScoped).IsAssignableFrom(typeof(TEntity)))
        {
            var companyMethod = typeof(ReportingDbContext)
                .GetMethod(nameof(ConfigureCompanyEntity), BindingFlags.Instance | BindingFlags.NonPublic)!;
            companyMethod.MakeGenericMethod(typeof(TEntity)).Invoke(this, [modelBuilder]);
        }
    }

    private void ConfigureCompanyEntity<TEntity>(ModelBuilder modelBuilder)
        where TEntity : class, ICompanyScoped
    {
        var builder = modelBuilder.Entity<TEntity>();
        builder.Property(entity => entity.CompanyId).IsRequired().IsConcurrencyToken();
        builder.HasIndex(entity => new { entity.TenantId, entity.CompanyId });
        builder.HasQueryFilter(
            "CompanyFilter",
            entity => _currentActor.CompanyId != null && entity.CompanyId == _currentActor.CompanyId);
    }

    private static void RestrictCascadeDelete(ModelBuilder modelBuilder)
    {
        foreach (var foreignKey in modelBuilder.Model.GetEntityTypes()
                     .SelectMany(type => type.GetForeignKeys())
                     .Where(key => key.DeleteBehavior == DeleteBehavior.Cascade && !key.DeclaringEntityType.IsOwned()))
        {
            foreignKey.DeleteBehavior = DeleteBehavior.Restrict;
        }
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        PrepareChanges();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        SaveChangesAsync(true, cancellationToken);

    public override async Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
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

        var resources = lockResources
            .Where(resource => !string.IsNullOrWhiteSpace(resource))
            .Distinct(StringComparer.Ordinal)
            .OrderBy(resource => resource, StringComparer.Ordinal)
            .ToArray();

        if (!Database.IsRelational())
            return await operation(cancellationToken);
        if (!string.Equals(Database.ProviderName, "Microsoft.EntityFrameworkCore.SqlServer", StringComparison.Ordinal))
            throw new NotSupportedException("Reporting atomic resource locking requires SQL Server.");

        await using var transaction = Database.CurrentTransaction is null
            ? await Database.BeginTransactionAsync(cancellationToken)
            : null;
        try
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
                    IF @lockResult < 0 THROW 51001, 'Failed to acquire a reporting transaction resource lock.', 1;
                    """, cancellationToken);
            }

            var result = await operation(cancellationToken);
            if (transaction is not null)
                await transaction.CommitAsync(cancellationToken);
            return result;
        }
        catch
        {
            if (transaction is not null)
            {
                try { await transaction.RollbackAsync(CancellationToken.None); }
                catch { }
            }
            throw;
        }
    }

    private void PrepareChanges()
    {
        EnforceAppendOnlyHistory();
        ApplyScopeIsolation();

        var actorId = _currentActor.UserId;
        var machineName = Environment.MachineName;
        var now = _timeProvider.GetUtcNow().UtcDateTime;

        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    if (string.IsNullOrWhiteSpace(actorId) && string.IsNullOrWhiteSpace(entry.Entity.CreatedById))
                        throw new InvalidOperationException("An actor user is required to create auditable Reporting data.");
                    entry.Entity.CreatedById = string.IsNullOrWhiteSpace(actorId) ? entry.Entity.CreatedById : actorId;
                    entry.Entity.CreatedByPc = machineName;
                    entry.Entity.CreatedOn = now;
                    break;
                case EntityState.Modified:
                    PreserveCreationMetadata(entry);
                    if (string.IsNullOrWhiteSpace(actorId))
                        throw new InvalidOperationException("An actor user is required to change auditable Reporting data.");
                    entry.Entity.UpdatedById = actorId;
                    entry.Entity.UpdatedByPc = machineName;
                    entry.Entity.UpdatedOn = now;
                    break;
                case EntityState.Deleted:
                    if (entry.Entity is ReportTemplateRevision or CrystalReportVersion)
                        break;
                    PreserveCreationMetadata(entry);
                    if (string.IsNullOrWhiteSpace(actorId))
                        throw new InvalidOperationException("An actor user is required to delete auditable Reporting data.");
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedById = actorId;
                    entry.Entity.DeletedByPc = machineName;
                    entry.Entity.DeletedOn = now;
                    entry.Entity.UpdatedById = actorId;
                    entry.Entity.UpdatedByPc = machineName;
                    entry.Entity.UpdatedOn = now;
                    break;
            }
        }
    }

    private void EnforceAppendOnlyHistory()
    {
        if (ChangeTracker.Entries<ReportTemplateRevision>()
            .Any(entry => entry.State is EntityState.Modified or EntityState.Deleted))
        {
            throw new InvalidOperationException("Report template revisions are append-only.");
        }

        if (ChangeTracker.Entries<CrystalReportVersion>()
            .Any(entry => entry.State is EntityState.Modified or EntityState.Deleted))
        {
            throw new InvalidOperationException("Crystal report versions are append-only.");
        }
    }

    private void ApplyScopeIsolation()
    {
        var tenantId = _currentActor.TenantId;
        foreach (var entry in ChangeTracker.Entries<ITenantScoped>()
                     .Where(item => item.State is EntityState.Added or EntityState.Modified or EntityState.Deleted))
        {
            var tenantProperty = entry.Property(item => item.TenantId);
            var entityTenantId = entry.Entity.TenantId;
            if (entry.State == EntityState.Added && string.IsNullOrWhiteSpace(entityTenantId))
            {
                if (string.IsNullOrWhiteSpace(tenantId))
                    throw new InvalidOperationException("A tenant scope is required to create Reporting data.");
                tenantProperty.CurrentValue = tenantId;
                entityTenantId = tenantId;
            }

            if (string.IsNullOrWhiteSpace(entityTenantId))
                throw new InvalidOperationException("Reporting tenant-owned data must have a tenant identifier.");
            if (!string.IsNullOrWhiteSpace(tenantId) &&
                !string.Equals(entityTenantId, tenantId, StringComparison.Ordinal))
                throw new InvalidOperationException("Cross-tenant Reporting data changes are not allowed.");
            if (entry.State is EntityState.Modified or EntityState.Deleted && tenantProperty.IsModified &&
                !string.Equals(tenantProperty.OriginalValue, tenantProperty.CurrentValue, StringComparison.Ordinal))
                throw new InvalidOperationException("Changing the tenant of Reporting data is not allowed.");
        }

        var companyId = _currentActor.CompanyId;
        foreach (var entry in ChangeTracker.Entries<ICompanyScoped>()
                     .Where(item => item.State is EntityState.Added or EntityState.Modified or EntityState.Deleted))
        {
            var companyProperty = entry.Property(item => item.CompanyId);
            var entityCompanyId = entry.Entity.CompanyId;
            if (entry.State == EntityState.Added && entityCompanyId <= 0)
            {
                if (companyId is not > 0)
                    throw new InvalidOperationException("A company scope is required to create company-owned Reporting data.");
                companyProperty.CurrentValue = companyId.Value;
                entityCompanyId = companyId.Value;
            }

            if (entityCompanyId <= 0)
                throw new InvalidOperationException("Reporting company-owned data must have a company identifier.");
            if (companyId is > 0 && entityCompanyId != companyId.Value)
                throw new InvalidOperationException("Cross-company Reporting data changes are not allowed.");
            if (entry.State is EntityState.Modified or EntityState.Deleted && companyProperty.IsModified &&
                !Equals(companyProperty.OriginalValue, companyProperty.CurrentValue))
                throw new InvalidOperationException("Changing the company of Reporting data is not allowed.");
        }
    }

    private static void PreserveCreationMetadata(EntityEntry<AuditableEntity> entry)
    {
        foreach (var propertyName in new[]
                 {
                     nameof(AuditableEntity.CreatedById),
                     nameof(AuditableEntity.CreatedOn),
                     nameof(AuditableEntity.CreatedByPc)
                 })
        {
            var property = entry.Property(propertyName);
            property.CurrentValue = property.OriginalValue;
            property.IsModified = false;
        }
    }

    private sealed class EmptyActor : ICurrentActor
    {
        public static EmptyActor Instance { get; } = new();
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
    }
}
