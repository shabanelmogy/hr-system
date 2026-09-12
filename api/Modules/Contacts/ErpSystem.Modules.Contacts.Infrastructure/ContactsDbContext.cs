using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Contacts.Domain;
using ErpSystem.Modules.Contacts.Infrastructure.Messaging;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Contacts.Infrastructure;

/// <summary>
/// Module-owned DbContext for Contacts. The default schema is "contacts"
/// and the migrations history table lives inside that schema, so module storage
/// stays separated from every other module sharing the database.
/// </summary>
public sealed class ContactsDbContext : DbContext
{
    public const string Schema = "contacts";
    private readonly ICurrentExecutionContext _executionContext;

    // A fresh scaffold has no IEntityTypeConfiguration implementations yet.
    // This cached detection mirrors AccountingDbContext: scanning an empty
    // assembly unconditionally keeps EF model checks noisy for new modules.
    private static readonly bool HasEntityConfigurations =
        typeof(ContactsDbContext).Assembly.GetTypes().Any(type =>
            !type.IsAbstract &&
            !type.IsGenericTypeDefinition &&
            type.GetInterfaces().Any(interfaceType =>
                interfaceType.IsGenericType &&
                interfaceType.GetGenericTypeDefinition() == typeof(IEntityTypeConfiguration<>)));

    public ContactsDbContext(
        DbContextOptions<ContactsDbContext> options,
        ICurrentExecutionContext executionContext)
        : base(options)
    {
        _executionContext = executionContext;
    }

    public DbSet<Party> Parties => Set<Party>();

    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(Schema);
        if (HasEntityConfigurations)
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ContactsDbContext).Assembly);

        modelBuilder.Entity<Party>().HasQueryFilter(party =>
            _executionContext.TenantId != null &&
            _executionContext.CompanyId != null &&
            party.TenantId == _executionContext.TenantId &&
            party.CompanyId == _executionContext.CompanyId);
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        EnforcePartyScope();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        EnforcePartyScope();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void EnforcePartyScope()
    {
        var tenantId = _executionContext.TenantId;
        var companyId = _executionContext.CompanyId;

        foreach (var entry in ChangeTracker.Entries<Party>()
                     .Where(entry => entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted))
        {
            if (string.IsNullOrWhiteSpace(tenantId) || companyId is null or <= 0)
                throw new InvalidOperationException("A tenant and company are required for Contacts writes.");

            if (!string.Equals(entry.Entity.TenantId, tenantId, StringComparison.Ordinal) ||
                entry.Entity.CompanyId != companyId.Value)
            {
                throw new InvalidOperationException("Cross-tenant or cross-company Contacts changes are not allowed.");
            }

            if (entry.State == EntityState.Modified &&
                (entry.Property(nameof(Party.TenantId)).IsModified ||
                 entry.Property(nameof(Party.CompanyId)).IsModified))
            {
                throw new InvalidOperationException("Changing a party tenant or company is not allowed.");
            }
        }
    }
}
