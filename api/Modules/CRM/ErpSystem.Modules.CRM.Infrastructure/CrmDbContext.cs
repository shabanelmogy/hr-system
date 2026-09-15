using Microsoft.EntityFrameworkCore;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Domain.Entities;

namespace ErpSystem.Modules.CRM.Infrastructure;

/// <summary>
/// Module-owned DbContext for CRM. The default schema is "crm"
/// and the migrations history table lives inside that schema, so module storage
/// stays separated from every other module sharing the database.
/// </summary>
public sealed class CrmDbContext : DbContext
{
    public const string Schema = "crm";

    private readonly ICurrentActor? _currentActor;
    private readonly TimeProvider _timeProvider;
    private string? CurrentTenantId => _currentActor?.TenantId;
    private int? CurrentCompanyId => _currentActor?.CompanyId;

    // A fresh scaffold has no IEntityTypeConfiguration implementations yet.
    // This cached detection mirrors AccountingDbContext: scanning an empty
    // assembly unconditionally keeps EF model checks noisy for new modules.
    private static readonly bool HasEntityConfigurations =
        typeof(CrmDbContext).Assembly.GetTypes().Any(type =>
            !type.IsAbstract &&
            !type.IsGenericTypeDefinition &&
            type.GetInterfaces().Any(interfaceType =>
                interfaceType.IsGenericType &&
                interfaceType.GetGenericTypeDefinition() == typeof(IEntityTypeConfiguration<>)));

    public CrmDbContext(
        DbContextOptions<CrmDbContext> options,
        ICurrentActor? currentActor = null,
        TimeProvider? timeProvider = null)
        : base(options)
    {
        _currentActor = currentActor;
        _timeProvider = timeProvider ?? TimeProvider.System;
    }

    public DbSet<Appointment> Appointments => Set<Appointment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.Entity<Appointment>().HasQueryFilter(appointment =>
            !appointment.IsDeleted &&
            appointment.TenantId == CurrentTenantId &&
            appointment.CompanyId == CurrentCompanyId);
        if (HasEntityConfigurations)
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(CrmDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        SaveChangesAsync(true, cancellationToken);

    public override async Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        PrepareCompanyScopedChanges();
        return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void PrepareCompanyScopedChanges()
    {
        var entries = ChangeTracker.Entries<CompanyAuditableEntity>()
            .Where(entry => entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .ToList();
        if (entries.Count == 0)
            return;

        var tenantId = _currentActor?.TenantId;
        var companyId = _currentActor?.CompanyId;
        var actorId = _currentActor?.UserId;
        if (string.IsNullOrWhiteSpace(tenantId) || companyId is not > 0 || string.IsNullOrWhiteSpace(actorId))
            throw new InvalidOperationException("A user, tenant, and company are required to change CRM data.");

        var now = _timeProvider.GetUtcNow().UtcDateTime;
        var machineName = Environment.MachineName;
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                if (!string.IsNullOrWhiteSpace(entry.Entity.TenantId) &&
                    !string.Equals(entry.Entity.TenantId, tenantId, StringComparison.Ordinal))
                    throw new InvalidOperationException("CRM writes cannot create data in another tenant.");
                if (entry.Entity.CompanyId > 0 && entry.Entity.CompanyId != companyId.Value)
                    throw new InvalidOperationException("CRM writes cannot create data in another company.");

                entry.Entity.TenantId = tenantId;
                entry.Entity.CompanyId = companyId.Value;
                entry.Entity.CreatedById = actorId;
                entry.Entity.CreatedOn = now;
                entry.Entity.CreatedByPc = machineName;
                continue;
            }

            if (!string.Equals(entry.Entity.TenantId, tenantId, StringComparison.Ordinal) ||
                entry.Entity.CompanyId != companyId.Value)
                throw new InvalidOperationException("CRM writes cannot cross tenant or company boundaries.");

            if (entry.State == EntityState.Deleted)
            {
                entry.State = EntityState.Modified;
                entry.Entity.IsDeleted = true;
                entry.Entity.DeletedById = actorId;
                entry.Entity.DeletedOn = now;
                entry.Entity.DeletedByPc = machineName;
                continue;
            }

            entry.Entity.UpdatedById = actorId;
            entry.Entity.UpdatedOn = now;
            entry.Entity.UpdatedByPc = machineName;
        }
    }
}
