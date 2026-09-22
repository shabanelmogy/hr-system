using System.Reflection;
using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Domain.Abstractions;
using ErpSystem.BuildingBlocks.Domain.Entities;
using ErpSystem.Modules.HR.Domain.Attendance.Devices.Entities;
using ErpSystem.Modules.HR.Domain.Employees.Entities;
using ErpSystem.Modules.HR.Domain.OrganizationalStructure.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.WorkforcePlanning.Entities;

namespace ErpSystem.Modules.HR.Infrastructure.Persistence;

public sealed class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    ICurrentActor currentActor,
    TimeProvider timeProvider) : DbContext(options), IUnitOfWork
{
    public const string Schema = "hr";

    private readonly ICurrentActor _currentActor = currentActor;
    private readonly TimeProvider _timeProvider = timeProvider;
    private string? CurrentTenantId => _currentActor.TenantId;
    private int? CurrentCompanyId => _currentActor.CompanyId;

    public DbSet<AttendanceDevice> AttendanceDevices => Set<AttendanceDevice>();
    public DbSet<AttendanceAgent> AttendanceAgents => Set<AttendanceAgent>();
    public DbSet<DeviceCredential> AttendanceDeviceCredentials => Set<DeviceCredential>();
    public DbSet<RawDeviceUser> RawDeviceUsers => Set<RawDeviceUser>();
    public DbSet<RawAttendancePunch> RawAttendancePunches => Set<RawAttendancePunch>();
    public DbSet<DevicePullRun> DevicePullRuns => Set<DevicePullRun>();

    public DbSet<Branch> Branches => Set<Branch>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Division> Divisions => Set<Division>();
    public DbSet<JobTitle> JobTitles => Set<JobTitle>();
    public DbSet<JobLevel> JobLevels => Set<JobLevel>();
    public DbSet<Position> Positions => Set<Position>();
    public DbSet<JobDescription> JobDescriptions => Set<JobDescription>();
    public DbSet<CostCenter> CostCenters => Set<CostCenter>();

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<EmployeeAssignment> EmployeeAssignments => Set<EmployeeAssignment>();
    public DbSet<EmployeeContract> EmployeeContracts => Set<EmployeeContract>();

    public DbSet<Candidate> Candidates => Set<Candidate>();
    public DbSet<JobRequisition> JobRequisitions => Set<JobRequisition>();
    public DbSet<JobOpening> JobOpenings => Set<JobOpening>();
    public DbSet<JobPosting> JobPostings => Set<JobPosting>();
    public DbSet<EmploymentApplication> EmploymentApplications => Set<EmploymentApplication>();
    public DbSet<ApplicationStatusHistory> ApplicationStatusHistories => Set<ApplicationStatusHistory>();
    public DbSet<Interview> Interviews => Set<Interview>();
    public DbSet<InterviewParticipant> InterviewParticipants => Set<InterviewParticipant>();
    public DbSet<InterviewEvaluation> InterviewEvaluations => Set<InterviewEvaluation>();
    public DbSet<JobOffer> JobOffers => Set<JobOffer>();
    public DbSet<JobOfferApprovalHistory> JobOfferApprovalHistory => Set<JobOfferApprovalHistory>();
    public DbSet<RecruitmentStage> RecruitmentStages => Set<RecruitmentStage>();
    public DbSet<RejectionReason> RecruitmentRejectionReasons => Set<RejectionReason>();
    public DbSet<RecruitmentSource> RecruitmentSources => Set<RecruitmentSource>();
    public DbSet<EvaluationCriterion> RecruitmentEvaluationCriteria => Set<EvaluationCriterion>();
    public DbSet<RecruitmentPolicy> RecruitmentPolicies => Set<RecruitmentPolicy>();

    public DbSet<WorkforcePlan> WorkforcePlans => Set<WorkforcePlan>();
    public DbSet<WorkforcePlanLine> WorkforcePlanLines => Set<WorkforcePlanLine>();
    public DbSet<WorkforcePlanLinePeriodTarget> WorkforcePlanLinePeriodTargets => Set<WorkforcePlanLinePeriodTarget>();
    public DbSet<WorkforceBudget> WorkforceBudgets => Set<WorkforceBudget>();
    public DbSet<WorkforceBudgetLine> WorkforceBudgetLines => Set<WorkforceBudgetLine>();
    public DbSet<WorkforceBudgetPeriodAllocation> WorkforceBudgetPeriodAllocations => Set<WorkforceBudgetPeriodAllocation>();
    public DbSet<PositionEnvelope> PositionEnvelopes => Set<PositionEnvelope>();
    public DbSet<EnvelopeAmendment> EnvelopeAmendments => Set<EnvelopeAmendment>();
    public DbSet<StaffingRequest> StaffingRequests => Set<StaffingRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
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
        var tenantTypes = modelBuilder.Model.GetEntityTypes()
            .Where(entity => !entity.IsOwned() && typeof(ITenantScoped).IsAssignableFrom(entity.ClrType))
            .Select(entity => entity.ClrType)
            .Distinct()
            .ToArray();

        var tenantMethod = typeof(ApplicationDbContext)
            .GetMethod(nameof(ConfigureTenantEntity), BindingFlags.Instance | BindingFlags.NonPublic)!;

        foreach (var type in tenantTypes)
            tenantMethod.MakeGenericMethod(type).Invoke(this, [modelBuilder]);
    }

    private void ConfigureTenantEntity<TEntity>(ModelBuilder modelBuilder)
        where TEntity : class, ITenantScoped
    {
        var builder = modelBuilder.Entity<TEntity>();
        builder.Property(entity => entity.TenantId)
            .HasMaxLength(32)
            .IsRequired()
            .IsConcurrencyToken();
        builder.HasIndex(entity => entity.TenantId);
        builder.HasQueryFilter("TenantFilter", entity =>
            CurrentTenantId != null && entity.TenantId == CurrentTenantId);

        if (typeof(ICompanyScoped).IsAssignableFrom(typeof(TEntity)))
        {
            var companyMethod = typeof(ApplicationDbContext)
                .GetMethod(nameof(ConfigureCompanyEntity), BindingFlags.Instance | BindingFlags.NonPublic)!;
            companyMethod.MakeGenericMethod(typeof(TEntity)).Invoke(this, [modelBuilder]);
        }
    }

    private void ConfigureCompanyEntity<TEntity>(ModelBuilder modelBuilder)
        where TEntity : class, ICompanyScoped
    {
        var builder = modelBuilder.Entity<TEntity>();
        builder.Property(entity => entity.CompanyId)
            .IsRequired()
            .IsConcurrencyToken();
        builder.HasIndex(entity => new { entity.TenantId, entity.CompanyId });
        builder.HasQueryFilter("CompanyFilter", entity =>
            CurrentCompanyId != null && entity.CompanyId == CurrentCompanyId);
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

        if (resources.Length > 0 &&
            !string.Equals(Database.ProviderName, "Microsoft.EntityFrameworkCore.SqlServer", StringComparison.Ordinal))
        {
            throw new NotSupportedException(
                "HR atomic operations that require transaction resource locks are supported only by SQL Server.");
        }

        await using var transaction = Database.CurrentTransaction is null
            ? await Database.BeginTransactionAsync(cancellationToken)
            : null;

        try
        {
            if (Database.ProviderName == "Microsoft.EntityFrameworkCore.SqlServer")
            {
                foreach (var resource in resources)
                {
                    await Database.ExecuteSqlInterpolatedAsync($$"""
                        DECLARE @lockResult int;
                        EXEC @lockResult = sys.sp_getapplock
                            @Resource = {{resource}},
                            @LockMode = 'Exclusive',
                            @LockOwner = 'Transaction',
                            @LockTimeout = 15000;
                        IF @lockResult < 0 THROW 51001, 'Failed to acquire a transaction resource lock.', 1;
                        """, cancellationToken);
                }
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
                try
                {
                    await transaction.RollbackAsync(CancellationToken.None);
                }
                catch
                {
                    // Preserve the operation/commit exception as the primary failure.
                }
            }
            throw;
        }
    }

    private void PrepareChanges()
    {
        ApplyTenantIsolation();
        var actorId = _currentActor.UserId;
        var machineName = Environment.MachineName;
        var now = _timeProvider.GetUtcNow().UtcDateTime;

        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            if ((entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted) &&
                string.IsNullOrWhiteSpace(actorId))
            {
                throw new InvalidOperationException("An actor user is required to change HR data.");
            }

            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedById = actorId!;
                    entry.Entity.CreatedByPc = machineName;
                    entry.Entity.CreatedOn = now;
                    break;
                case EntityState.Modified:
                    PreserveCreationMetadata(entry);
                    entry.Entity.UpdatedById = actorId;
                    entry.Entity.UpdatedByPc = machineName;
                    entry.Entity.UpdatedOn = now;
                    break;
                case EntityState.Deleted:
                    entry.State = EntityState.Modified;
                    PreserveCreationMetadata(entry);
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

    private void ApplyTenantIsolation()
    {
        foreach (var entry in ChangeTracker.Entries<ITenantScoped>()
                     .Where(entry => entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted))
        {
            var tenant = entry.Entity.TenantId;
            if (string.IsNullOrWhiteSpace(CurrentTenantId))
                throw new InvalidOperationException("A tenant scope is required to change HR data.");

            if (entry.State == EntityState.Added && string.IsNullOrWhiteSpace(tenant))
            {
                entry.Entity.TenantId = CurrentTenantId!;
                tenant = CurrentTenantId!;
            }

            if (string.IsNullOrWhiteSpace(tenant))
                throw new InvalidOperationException("HR data must have a tenant identifier.");
            if (CurrentTenantId is not null && !string.Equals(tenant, CurrentTenantId, StringComparison.Ordinal))
                throw new InvalidOperationException("Cross-tenant HR data changes are not allowed.");

            if (entry.State is EntityState.Modified or EntityState.Deleted)
            {
                var originalTenant = entry.Property(nameof(ITenantScoped.TenantId)).OriginalValue as string;
                if (!string.Equals(originalTenant, tenant, StringComparison.Ordinal))
                    throw new InvalidOperationException("Tenant scope cannot be changed on existing HR data.");
            }
        }

        foreach (var entry in ChangeTracker.Entries<ICompanyScoped>()
                     .Where(entry => entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted))
        {
            if (!CurrentCompanyId.HasValue || CurrentCompanyId.Value <= 0)
                throw new InvalidOperationException("A company scope is required to change company-owned HR data.");

            if (entry.State == EntityState.Added && entry.Entity.CompanyId <= 0)
            {
                entry.Entity.CompanyId = CurrentCompanyId.Value;
            }

            if (entry.Entity.CompanyId <= 0)
                throw new InvalidOperationException("Company-owned HR data must have a company identifier.");
            if (CurrentCompanyId.HasValue && entry.Entity.CompanyId != CurrentCompanyId.Value)
                throw new InvalidOperationException("Cross-company HR data changes are not allowed.");

            if (entry.State is EntityState.Modified or EntityState.Deleted)
            {
                var originalCompany = entry.Property(nameof(ICompanyScoped.CompanyId)).OriginalValue;
                if (originalCompany is not int originalCompanyId || originalCompanyId != entry.Entity.CompanyId)
                    throw new InvalidOperationException("Company scope cannot be changed on existing HR data.");
            }
        }
    }
}
