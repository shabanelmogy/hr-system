using HrManagementSystem.Features.GeographicalInformation.Addresses.Entities;
using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Entities;
using HrManagementSystem.Features.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Features.GeographicalInformation.Districts.Entities;
using HrManagementSystem.Features.Platform.Notifications.Entities;

using HrManagementSystem.Features.Analytics.Reports.Entities;
using HrManagementSystem.Features.Appointments.Entities;
using HrManagementSystem.Features.Catalog.Categories.Entities;
using HrManagementSystem.Features.Catalog.SubCategories.Entities;
using HrManagementSystem.Features.GeographicalInformation.States.Entities;
using HrManagementSystem.Features.Platform.EntityChangeLogs.Entities;
using HrManagementSystem.Features.Platform.Files.Entities;
using HrManagementSystem.Features.Security.ApiKeys.Entities;
using HrManagementSystem.Features.Security.Authentication.Entities;
using HrManagementSystem.Shared.Abstractions;

namespace HrManagementSystem.Infrastructure.Persistance;

public class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    ICurrentActor currentActor) : IdentityDbContext<ApplicationUser, ApplicationRole, string>(options)

{
    private readonly ICurrentActor _currentActor = currentActor;

    public DbSet<UserLogin> LoginAudits { get; set; }
    public DbSet<EntityChangeLog> EntityChangeLogs { get; set; }
    public DbSet<UploadedFile> Files { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<SubCategory> SubCategories { get; set; }
    public DbSet<CategorySubcategory> CategorySubcategories { get; set; }
    public DbSet<ReportCategory> ReportsCategories { get; set; }
    public DbSet<ReportMaster> ReportsMasters { get; set; }
    public DbSet<ReportDetail> ReportsDetails { get; set; }
    public DbSet<ApiKey> ApiKeys { get; set; }
    public DbSet<Country> Countries { get; set; }
    public DbSet<State> States { get; set; }
    public DbSet<District> Districts { get; set; }
    public DbSet<Address> Addresses { get; set; }
    public DbSet<AddressType> AddressTypes { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        RestrictCascadeDelete(modelBuilder);
        base.OnModelCreating(modelBuilder);
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

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var currentUserId = _currentActor.UserId;
        var currentMachineName = Environment.MachineName;
        var currentTime = DateTime.UtcNow;

        foreach (var entityEntry in ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entityEntry.State)
            {
                case EntityState.Added:
                    SetCreatedValues(entityEntry, currentUserId, currentMachineName);
                    break;
                case EntityState.Modified:
                    SetUpdatedValues(entityEntry, currentUserId, currentMachineName, currentTime);
                    break;
                case EntityState.Deleted:
                    SetDeletedValues(entityEntry, currentUserId, currentMachineName, currentTime);
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    private static void SetCreatedValues(
        EntityEntry<AuditableEntity> entityEntry,
        string? userId,
        string machineName)
    {
        if (!string.IsNullOrWhiteSpace(userId))
            entityEntry.Property(x => x.CreatedById).CurrentValue = userId;

        entityEntry.Property(x => x.CreatedByPc).CurrentValue = machineName;
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
        if (!string.IsNullOrWhiteSpace(userId))
            entityEntry.Property(x => x.DeletedById).CurrentValue = userId;

        entityEntry.Property(x => x.DeletedByPc).CurrentValue = machineName;
        entityEntry.Property(x => x.DeletedOn).CurrentValue = currentTime;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder
            .ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
    }

}


