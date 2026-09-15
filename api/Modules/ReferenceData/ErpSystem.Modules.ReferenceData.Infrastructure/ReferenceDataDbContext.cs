using Microsoft.EntityFrameworkCore;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Domain.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Addresses.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.AddressTypes.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Countries.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Districts.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.States.Entities;

namespace ErpSystem.Modules.ReferenceData.Infrastructure;

/// <summary>
/// Module-owned DbContext for ReferenceData. The default schema is "ref"
/// and the migrations history table lives inside that schema, so module storage
/// stays separated from every other module sharing the database.
/// </summary>
public sealed class ReferenceDataDbContext : DbContext, IUnitOfWork
{
    public const string Schema = "ref";

    private readonly ICurrentActor? _currentActor;
    private readonly TimeProvider _timeProvider;
    private string? CurrentTenantId => _currentActor?.TenantId;
    private int? CurrentCompanyId => _currentActor?.CompanyId;

    public DbSet<Country> Countries => Set<Country>();
    public DbSet<State> States => Set<State>();
    public DbSet<District> Districts => Set<District>();
    public DbSet<AddressType> AddressTypes => Set<AddressType>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<CompanyAddress> CompanyAddresses => Set<CompanyAddress>();
    public DbSet<BranchAddress> BranchAddresses => Set<BranchAddress>();

    // A fresh scaffold has no IEntityTypeConfiguration implementations yet.
    // This cached detection mirrors AccountingDbContext: scanning an empty
    // assembly unconditionally keeps EF model checks noisy for new modules.
    private static readonly bool HasEntityConfigurations =
        typeof(ReferenceDataDbContext).Assembly.GetTypes().Any(type =>
            !type.IsAbstract &&
            !type.IsGenericTypeDefinition &&
            type.GetInterfaces().Any(interfaceType =>
                interfaceType.IsGenericType &&
                interfaceType.GetGenericTypeDefinition() == typeof(IEntityTypeConfiguration<>)));

    public ReferenceDataDbContext(
        DbContextOptions<ReferenceDataDbContext> options,
        ICurrentActor? currentActor = null,
        TimeProvider? timeProvider = null)
        : base(options)
    {
        _currentActor = currentActor;
        _timeProvider = timeProvider ?? TimeProvider.System;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(Schema);
        ConfigureScopeFilters(modelBuilder);
        if (HasEntityConfigurations)
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ReferenceDataDbContext).Assembly);
    }

    private void ConfigureScopeFilters(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Country>().HasQueryFilter(country => !country.IsDeleted);
        modelBuilder.Entity<State>().HasQueryFilter(state => !state.IsDeleted);
        modelBuilder.Entity<District>().HasQueryFilter(district => !district.IsDeleted);
        modelBuilder.Entity<AddressType>()
            .HasQueryFilter(type => !type.IsDeleted &&
                                    type.TenantId == CurrentTenantId &&
                                    type.CompanyId == CurrentCompanyId);
        modelBuilder.Entity<Address>()
            .HasQueryFilter(address => !address.IsDeleted &&
                                       address.TenantId == CurrentTenantId &&
                                       address.CompanyId == CurrentCompanyId);
        modelBuilder.Entity<CompanyAddress>()
            .HasQueryFilter(address => !address.IsDeleted &&
                                       address.TenantId == CurrentTenantId &&
                                       address.CompanyId == CurrentCompanyId);
        modelBuilder.Entity<BranchAddress>()
            .HasQueryFilter(address => !address.IsDeleted &&
                                       address.TenantId == CurrentTenantId &&
                                       address.CompanyId == CurrentCompanyId);
    }

    public async Task<TResult> ExecuteAtomicallyAsync<TResult>(
        IReadOnlyCollection<string> lockResources,
        Func<CancellationToken, Task<TResult>> operation,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(operation);
        await using var transaction = Database.CurrentTransaction is null
            ? await Database.BeginTransactionAsync(cancellationToken)
            : null;
        try
        {
            foreach (var resource in lockResources.Where(item => !string.IsNullOrWhiteSpace(item)).Distinct(StringComparer.Ordinal))
            {
                if (!string.Equals(Database.ProviderName, "Microsoft.EntityFrameworkCore.SqlServer", StringComparison.Ordinal))
                    throw new NotSupportedException("Reference-data resource locks require SQL Server.");
                await Database.ExecuteSqlInterpolatedAsync($$"""
                    DECLARE @lockResult int;
                    EXEC @lockResult = sys.sp_getapplock @Resource = {{resource}}, @LockMode = 'Exclusive', @LockOwner = 'Transaction', @LockTimeout = 15000;
                    IF @lockResult < 0 THROW 51001, 'Failed to acquire a reference-data resource lock.', 1;
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
                await transaction.RollbackAsync(CancellationToken.None);
            throw;
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        SaveChangesAsync(true, cancellationToken);

    public override async Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        var now = _timeProvider.GetUtcNow().UtcDateTime;
        foreach (var entry in ChangeTracker.Entries<AuditableEntity>().Where(item => item.State is EntityState.Added or EntityState.Modified or EntityState.Deleted))
        {
            if (entry.Entity is CompanyAuditableEntity companyEntity)
            {
                if (string.IsNullOrWhiteSpace(CurrentTenantId) || CurrentCompanyId is not > 0)
                    throw new InvalidOperationException("Tenant and company context are required for company-scoped reference-data writes.");

                if (entry.State == EntityState.Added)
                {
                    companyEntity.TenantId = CurrentTenantId!;
                    companyEntity.CompanyId = CurrentCompanyId.Value;
                }
                else if (!string.Equals(companyEntity.TenantId, CurrentTenantId, StringComparison.Ordinal) ||
                         companyEntity.CompanyId != CurrentCompanyId.Value)
                {
                    throw new InvalidOperationException("Reference-data writes cannot cross tenant or company boundaries.");
                }
            }
            if (entry.State == EntityState.Deleted)
            {
                entry.State = EntityState.Modified;
                entry.Entity.IsDeleted = true;
                entry.Entity.DeletedOn = now;
                entry.Entity.DeletedById = _currentActor?.UserId ?? entry.Entity.DeletedById ?? "system";
                entry.Entity.DeletedByPc = Environment.MachineName;
            }
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedOn = now;
                entry.Entity.CreatedById = _currentActor?.UserId
                    ?? (string.IsNullOrWhiteSpace(entry.Entity.CreatedById) ? "system" : entry.Entity.CreatedById);
                entry.Entity.CreatedByPc = Environment.MachineName;
            }
            else
            {
                entry.Entity.UpdatedById = _currentActor?.UserId;
                entry.Entity.UpdatedOn = now;
                entry.Entity.UpdatedByPc = Environment.MachineName;
            }
        }
        return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }
}
