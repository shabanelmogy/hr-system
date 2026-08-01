using HrManagementSystem.Features.GeographicalInformation.Addresses.Entities;
using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Entities;
using HrManagementSystem.Features.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Features.GeographicalInformation.Districts.Entities;
using HrManagementSystem.Features.OrganizationalStructure.Entities;
using HrManagementSystem.Features.Platform.Notifications.Entities;
using HrManagementSystem.Features.Platform.Tenancy.Entities;

using HrManagementSystem.Features.Analytics.Reports.Entities;
using HrManagementSystem.Features.Appointments.Entities;
using HrManagementSystem.Features.Catalog.Categories.Entities;
using HrManagementSystem.Features.Catalog.SubCategories.Entities;
using HrManagementSystem.Features.Employees.Entities;
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
    public DbSet<UserCompanyAccess> UserCompanyAccesses { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        IgnoreUnpersistedOrganizationalEntities(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(modelBuilder);
        ConfigureTenantIsolation(modelBuilder);
        RestrictCascadeDelete(modelBuilder);
    }

    private static void IgnoreUnpersistedOrganizationalEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Ignore<Branch>();
        modelBuilder.Ignore<Department>();
        modelBuilder.Ignore<Divsion>();
        modelBuilder.Ignore<Job>();
        modelBuilder.Ignore<JobDescription>();
        modelBuilder.Ignore<JobLevel>();
        modelBuilder.Ignore<Employee>();
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
        builder.HasOne<Tenant>()
            .WithMany()
            .HasForeignKey(entity => entity.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

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
        PrepareChanges();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        PrepareChanges();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private void PrepareChanges()
    {
        ApplyTenantIsolation();

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

    }

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
            var companyProperty = entityEntry.Property(entity => entity.CompanyId);
            var entityCompanyId = companyProperty.CurrentValue;
            var currentCompanyId = CurrentCompanyId;

            if (entityEntry.State == EntityState.Added && entityCompanyId <= 0)
            {
                if (!currentCompanyId.HasValue)
                    throw new InvalidOperationException("A company is required to create company-owned data.");

                companyProperty.CurrentValue = currentCompanyId.Value;
                entityCompanyId = currentCompanyId.Value;
            }

            if (entityCompanyId <= 0)
                throw new InvalidOperationException("Company-owned data must have a company identifier.");

            if (currentCompanyId.HasValue && entityCompanyId != currentCompanyId.Value)
                throw new InvalidOperationException("Cross-company data changes are not allowed.");

            if (entityEntry.State == EntityState.Modified && companyProperty.IsModified &&
                !Equals(companyProperty.OriginalValue, companyProperty.CurrentValue))
            {
                throw new InvalidOperationException("Changing an entity company is not allowed.");
            }
        }
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


