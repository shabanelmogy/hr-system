using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Persistence;
using HrManagementSystem.Domain.Common.Abstractions;
using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Employees.Entities;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Domain.Tenancy.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;
using HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Districts.Entities;
using HrManagementSystem.Infrastructure.Features.Platform.Notifications.Entities;

using HrManagementSystem.Domain.Analytics.Reports.Entities;
using HrManagementSystem.Domain.Appointments.Entities;
using HrManagementSystem.Domain.Catalog.Categories.Entities;
using HrManagementSystem.Domain.Catalog.SubCategories.Entities;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;
using HrManagementSystem.Domain.Platform.EntityChangeLogs.Entities;
using HrManagementSystem.Domain.Platform.Files.Entities;
using HrManagementSystem.Domain.Security.ApiKeys.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Persistence;

public class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    ICurrentActor currentActor,
    TimeProvider timeProvider) : IdentityDbContext<ApplicationUser, ApplicationRole, string>(options),
    IUnitOfWork
{
    private readonly ICurrentActor _currentActor = currentActor;
    private readonly TimeProvider _timeProvider = timeProvider;
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
        modelBuilder.ApplyConfigurationsFromAssembly(
            HrManagementSystem.Infrastructure.AssemblyReference.Assembly);
        base.OnModelCreating(modelBuilder);
        ConfigureAuditRelationships(modelBuilder);
        ConfigureTenantIsolation(modelBuilder);
        RestrictCascadeDelete(modelBuilder);
    }

    private static void IgnoreUnpersistedOrganizationalEntities(ModelBuilder modelBuilder)
    {
        modelBuilder.Ignore<Branch>();
        modelBuilder.Ignore<Department>();
        modelBuilder.Ignore<Division>();
        modelBuilder.Ignore<JobTitle>();
        modelBuilder.Ignore<Position>();
        modelBuilder.Ignore<JobDescription>();
        modelBuilder.Ignore<JobLevel>();
        modelBuilder.Ignore<Employee>();
        modelBuilder.Ignore<EmployeeAssignment>();
        modelBuilder.Ignore<EmployeeContract>();
    }

    private static void ConfigureAuditRelationships(ModelBuilder modelBuilder)
    {
        var auditableEntityTypes = modelBuilder.Model
            .GetEntityTypes()
            .Where(entityType =>
                !entityType.IsOwned() &&
                typeof(AuditableEntity).IsAssignableFrom(entityType.ClrType))
            .Select(entityType => entityType.ClrType)
            .Distinct()
            .ToList();

        var configureMethod = typeof(ApplicationDbContext)
            .GetMethod(nameof(ConfigureAuditableEntity), BindingFlags.Static | BindingFlags.NonPublic)!;

        foreach (var entityType in auditableEntityTypes)
            configureMethod.MakeGenericMethod(entityType).Invoke(null, [modelBuilder]);
    }

    private static void ConfigureAuditableEntity<TEntity>(ModelBuilder modelBuilder)
        where TEntity : AuditableEntity
    {
        var builder = modelBuilder.Entity<TEntity>();
        builder.Property(entity => entity.RowVersion).IsRowVersion();

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(entity => entity.CreatedById)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(entity => entity.UpdatedById);

        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(entity => entity.DeletedById);
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
        var currentTime = _timeProvider.GetUtcNow().UtcDateTime;

        foreach (var entityEntry in ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entityEntry.State)
            {
                case EntityState.Added:
                    SetCreatedValues(entityEntry, currentUserId, currentMachineName, currentTime);
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
        string machineName,
        DateTime currentTime)
    {
        if (!string.IsNullOrWhiteSpace(userId))
            entityEntry.Property(x => x.CreatedById).CurrentValue = userId;

        if (string.IsNullOrWhiteSpace(entityEntry.Property(x => x.CreatedById).CurrentValue))
        {
            throw new InvalidOperationException(
                "An actor user is required to create auditable data. " +
                "Background operations must establish an ICurrentActorScope.");
        }

        entityEntry.Property(x => x.CreatedByPc).CurrentValue = machineName;
        entityEntry.Property(x => x.CreatedOn).CurrentValue = currentTime;
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
        entityEntry.State = EntityState.Modified;

        if (!string.IsNullOrWhiteSpace(userId))
            entityEntry.Property(x => x.DeletedById).CurrentValue = userId;

        if (string.IsNullOrWhiteSpace(entityEntry.Property(x => x.DeletedById).CurrentValue))
        {
            throw new InvalidOperationException(
                "An actor user is required to delete auditable data. " +
                "Background operations must establish an ICurrentActorScope.");
        }

        entityEntry.Property(x => x.IsDeleted).CurrentValue = true;
        entityEntry.Property(x => x.DeletedByPc).CurrentValue = machineName;
        entityEntry.Property(x => x.DeletedOn).CurrentValue = currentTime;
        entityEntry.Property(x => x.UpdatedById).CurrentValue = userId;
        entityEntry.Property(x => x.UpdatedByPc).CurrentValue = machineName;
        entityEntry.Property(x => x.UpdatedOn).CurrentValue = currentTime;
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder
            .ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
    }

}


