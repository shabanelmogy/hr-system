using System.Reflection;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Domain.Abstractions;
using ErpSystem.BuildingBlocks.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using ErpSystem.Modules.Accounting.Application.Abstractions.Persistence;
using ErpSystem.Modules.Accounting.Infrastructure.Messaging;
using ErpSystem.Modules.Accounting.Infrastructure.Parties;
using ErpSystem.Modules.Accounting.Domain.Finance.FiscalYears.Entities;

namespace ErpSystem.Modules.Accounting.Infrastructure;

/// <summary>
/// Module-owned DbContext for Accounting. Default schema is "acc" and the
/// migrations history table lives inside that schema, so module storage stays
/// separated from the HR module context even though both share one database.
/// </summary>
public sealed class AccountingDbContext : DbContext, IAccountingUnitOfWork
{
    public const string Schema = "acc";

    private static readonly bool HasEntityConfigurations =
        typeof(AccountingDbContext).Assembly.GetTypes().Any(type =>
            !type.IsAbstract &&
            !type.IsGenericTypeDefinition &&
            type.GetInterfaces().Any(interfaceType =>
                interfaceType.IsGenericType &&
                interfaceType.GetGenericTypeDefinition() == typeof(IEntityTypeConfiguration<>)));

    private readonly ICurrentActor _currentActor;
    private readonly TimeProvider _timeProvider;

    public AccountingDbContext(
        DbContextOptions<AccountingDbContext> options,
        ICurrentActor? currentActor = null,
        TimeProvider? timeProvider = null)
        : base(options)
    {
        _currentActor = currentActor ?? EmptyActor.Instance;
        _timeProvider = timeProvider ?? TimeProvider.System;
    }

    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public DbSet<InboxMessage> InboxMessages => Set<InboxMessage>();

    public DbSet<AccountingPartyReference> PartyReferences => Set<AccountingPartyReference>();

    public DbSet<FiscalYear> FiscalYears => Set<FiscalYear>();

    public DbSet<FiscalPeriod> FiscalPeriods => Set<FiscalPeriod>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(Schema);
        if (HasEntityConfigurations)
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AccountingDbContext).Assembly);
        ConfigureRowVersion(modelBuilder);
        ConfigureTenantIsolation(modelBuilder);
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

    private void ConfigureTenantIsolation(ModelBuilder modelBuilder)
    {
        var tenantMethod = typeof(AccountingDbContext)
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
        builder.Property(item => item.TenantId).HasMaxLength(32).IsRequired().IsConcurrencyToken();
        builder.HasIndex(item => item.TenantId);
        builder.HasQueryFilter("TenantFilter", item =>
            _currentActor.TenantId != null && item.TenantId == _currentActor.TenantId);

        if (typeof(ICompanyScoped).IsAssignableFrom(typeof(TEntity)))
        {
            var companyMethod = typeof(AccountingDbContext)
                .GetMethod(nameof(ConfigureCompanyEntity), BindingFlags.Instance | BindingFlags.NonPublic)!;
            companyMethod.MakeGenericMethod(typeof(TEntity)).Invoke(this, [modelBuilder]);
        }
    }

    private void ConfigureCompanyEntity<TEntity>(ModelBuilder modelBuilder)
        where TEntity : class, ICompanyScoped
    {
        var builder = modelBuilder.Entity<TEntity>();
        builder.Property(item => item.CompanyId).IsRequired().IsConcurrencyToken();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId });
        builder.HasQueryFilter("CompanyFilter", item =>
            _currentActor.CompanyId != null && item.CompanyId == _currentActor.CompanyId);
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
        var resources = lockResources.Where(item => !string.IsNullOrWhiteSpace(item))
            .Distinct(StringComparer.Ordinal).OrderBy(item => item, StringComparer.Ordinal).ToArray();
        if (!Database.IsRelational())
            return await operation(cancellationToken);
        if (!string.Equals(Database.ProviderName, "Microsoft.EntityFrameworkCore.SqlServer", StringComparison.Ordinal))
            throw new NotSupportedException("Accounting atomic resource locking requires SQL Server.");

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
                    IF @lockResult < 0 THROW 51001, 'Failed to acquire an accounting transaction resource lock.', 1;
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
        var tenantId = _currentActor.TenantId;
        var companyId = _currentActor.CompanyId;
        var actorId = _currentActor.UserId;
        var now = _timeProvider.GetUtcNow().UtcDateTime;

        foreach (var entry in ChangeTracker.Entries<ITenantScoped>()
                     .Where(item => item.State is EntityState.Added or EntityState.Modified or EntityState.Deleted))
        {
            if (string.IsNullOrWhiteSpace(tenantId))
                throw new InvalidOperationException("A tenant scope is required to change Accounting data.");
            if (entry.State == EntityState.Added && string.IsNullOrWhiteSpace(entry.Entity.TenantId))
                entry.Entity.TenantId = tenantId;
            if (!string.Equals(entry.Entity.TenantId, tenantId, StringComparison.Ordinal))
                throw new InvalidOperationException("Cross-tenant Accounting data changes are not allowed.");
            if (entry.State is EntityState.Modified or EntityState.Deleted &&
                !string.Equals(entry.Property(nameof(ITenantScoped.TenantId)).OriginalValue as string, entry.Entity.TenantId, StringComparison.Ordinal))
                throw new InvalidOperationException("Tenant scope cannot be changed on existing Accounting data.");
        }

        foreach (var entry in ChangeTracker.Entries<ICompanyScoped>()
                     .Where(item => item.State is EntityState.Added or EntityState.Modified or EntityState.Deleted))
        {
            if (companyId is not > 0)
                throw new InvalidOperationException("A company scope is required to change company-owned Accounting data.");
            if (entry.State == EntityState.Added && entry.Entity.CompanyId <= 0)
                entry.Entity.CompanyId = companyId.Value;
            if (entry.Entity.CompanyId != companyId)
                throw new InvalidOperationException("Cross-company Accounting data changes are not allowed.");
            if (entry.State is EntityState.Modified or EntityState.Deleted &&
                (entry.Property(nameof(ICompanyScoped.CompanyId)).OriginalValue is not int originalCompanyId || originalCompanyId != entry.Entity.CompanyId))
                throw new InvalidOperationException("Company scope cannot be changed on existing Accounting data.");
        }

        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            if (entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            {
                if (string.IsNullOrWhiteSpace(actorId))
                    throw new InvalidOperationException("An actor user is required to change Accounting data.");
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedById = actorId;
                        entry.Entity.CreatedByPc = Environment.MachineName;
                        entry.Entity.CreatedOn = now;
                        break;
                    case EntityState.Modified:
                        PreserveCreationMetadata(entry);
                        entry.Entity.UpdatedById = actorId;
                        entry.Entity.UpdatedByPc = Environment.MachineName;
                        entry.Entity.UpdatedOn = now;
                        break;
                    case EntityState.Deleted:
                        entry.State = EntityState.Modified;
                        PreserveCreationMetadata(entry);
                        entry.Entity.IsDeleted = true;
                        entry.Entity.DeletedById = actorId;
                        entry.Entity.DeletedByPc = Environment.MachineName;
                        entry.Entity.DeletedOn = now;
                        entry.Entity.UpdatedById = actorId;
                        entry.Entity.UpdatedByPc = Environment.MachineName;
                        entry.Entity.UpdatedOn = now;
                        break;
                }
            }
        }
    }

    private static void PreserveCreationMetadata(EntityEntry<AuditableEntity> entry)
    {
        foreach (var propertyName in new[] { nameof(AuditableEntity.CreatedById), nameof(AuditableEntity.CreatedOn), nameof(AuditableEntity.CreatedByPc) })
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
        public bool IsInRole(string role) => false;
    }
}
