using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Infrastructure;

/// <summary>
/// Module-owned DbContext for Platform. The default schema is "platform"
/// and the migrations history table lives inside that schema, so module storage
/// stays separated from every other module sharing the database.
/// </summary>
public sealed class PlatformDbContext : DbContext
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

    public PlatformDbContext(DbContextOptions<PlatformDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(Schema);
        if (HasEntityConfigurations)
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(PlatformDbContext).Assembly);
    }
}