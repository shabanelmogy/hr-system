using Microsoft.EntityFrameworkCore;
using ErpSystem.Modules.Accounting.Infrastructure.Messaging;
using ErpSystem.Modules.Accounting.Infrastructure.Parties;

namespace ErpSystem.Modules.Accounting.Infrastructure;

/// <summary>
/// Module-owned DbContext for Accounting. Default schema is "acc" and the
/// migrations history table lives inside that schema, so module storage stays
/// separated from the HR module context even though both share one database.
/// </summary>
public sealed class AccountingDbContext : DbContext
{
    public const string Schema = "acc";

    private static readonly bool HasEntityConfigurations =
        typeof(AccountingDbContext).Assembly.GetTypes().Any(type =>
            !type.IsAbstract &&
            !type.IsGenericTypeDefinition &&
            type.GetInterfaces().Any(interfaceType =>
                interfaceType.IsGenericType &&
                interfaceType.GetGenericTypeDefinition() == typeof(IEntityTypeConfiguration<>)));

    public AccountingDbContext(DbContextOptions<AccountingDbContext> options)
        : base(options)
    {
    }

    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    public DbSet<InboxMessage> InboxMessages => Set<InboxMessage>();

    public DbSet<AccountingPartyReference> PartyReferences => Set<AccountingPartyReference>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(Schema);
        if (HasEntityConfigurations)
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AccountingDbContext).Assembly);
    }
}
