using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Abstractions;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Contracts;
using HrManagementSystem.Application.Features.OrganizationalStructure.Management.Queries;
using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Domain.OrganizationalStructure.Enums;
using System.Linq.Expressions;

namespace HrManagementSystem.Infrastructure.Features.OrganizationalStructure.Management;

public sealed class OrganizationalStructureManagement(
    ApplicationDbContext context,
    ICurrentActor currentActor,
    TimeProvider timeProvider,
    IOrganizationalStructureChangeScheduler changeScheduler)
    : IOrganizationalStructureManagement
{
    private static readonly Error NotFound = new(
        "OrganizationalStructure.NotFound",
        "The organizational structure item was not found.",
        ErrorType.NotFound);
    private static readonly Error Duplicate = new(
        "OrganizationalStructure.Duplicate",
        "An item with the same code already exists in the current company.",
        ErrorType.Conflict);
    private static readonly Error ParentNotFound = new(
        "OrganizationalStructure.ParentNotFound",
        "The selected parent does not exist or is archived in the current company.",
        ErrorType.Validation);
    private static readonly Error InUse = new(
        "OrganizationalStructure.InUse",
        "The item cannot be archived while it has active dependent records.",
        ErrorType.Validation);
    private static readonly Error InvalidHierarchy = new(
        "OrganizationalStructure.InvalidHierarchy",
        "The requested change would create an invalid or recursive hierarchy.",
        ErrorType.Validation);

    public async Task<PageResponse<OrganizationalStructureItem>> GetPageAsync(
        GetOrganizationalStructureQuery request,
        CancellationToken cancellationToken)
    {
        var query = BuildPageQuery(request);
        var count = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);
        var page = new PagedList<OrganizationalStructureItem>(
            items, count, request.PageNumber, request.PageSize, GetOrganizationalStructureQuery.MaxPageSize);
        return new PageResponse<OrganizationalStructureItem>(page, page.MetaData);
    }

    private IQueryable<OrganizationalStructureItem> BuildPageQuery(GetOrganizationalStructureQuery request)
    {
        var normalizedResource = OrganizationalResources.Normalize(request.Resource);
        var query = BuildQuery(normalizedResource);
        query = ApplyStatusFilter(query, normalizedResource, request.Status);

        if (request.ParentId.HasValue)
            query = ApplyParentFilter(query, normalizedResource, request.ParentId.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToUpperInvariant();
            query = ApplySearch(query, normalizedResource, request.SearchField, request.SearchOperator, search);
        }

        query = ApplyOrdering(query, normalizedResource, request.SortBy, request.SortDirection);
        return query;
    }

    public Task<OrganizationalStructureItem?> GetAsync(string resource, int id, CancellationToken cancellationToken) =>
        BuildQuery(OrganizationalResources.Normalize(resource))
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task<IReadOnlyList<OrganizationalStructureLookup>> GetLookupAsync(
        string resource,
        int? parentId,
        CancellationToken cancellationToken)
    {
        var normalized = OrganizationalResources.Normalize(resource);
        var query = BuildQuery(normalized).Where(x => !x.IsDeleted);
        if (parentId.HasValue)
            query = ApplyParentFilter(query, normalized, parentId.Value);

        return ReadLookupAsync(query, cancellationToken);
    }

    public async Task<Result<OrganizationalStructureItem>> CreateAsync(
        string resource,
        OrganizationalStructureMutation request,
        CancellationToken cancellationToken)
    {
        var normalized = OrganizationalResources.Normalize(resource);
        if (await IdentityExistsAsync(normalized, request, null, cancellationToken))
            return Result.Failure<OrganizationalStructureItem>(Duplicate);
        if (!await ParentsAreValidAsync(normalized, request, null, cancellationToken))
            return Result.Failure<OrganizationalStructureItem>(ParentNotFound);
        if (normalized == OrganizationalResources.Branches && request.IsHeadquarters &&
            await context.Branches.AnyAsync(x => !x.IsDeleted && x.IsHeadquarters, cancellationToken))
        {
            return Result.Failure<OrganizationalStructureItem>(new Error(
                "OrganizationalStructure.HeadquartersExists",
                "Only one active headquarters branch is allowed per company.",
                ErrorType.Conflict));
        }

        try
        {
            var entity = AddEntity(normalized, request);
            await context.SaveChangesAsync(cancellationToken);
            var item = await GetAsync(normalized, EntityId(entity), cancellationToken)
                ?? throw new InvalidOperationException("The created organizational item could not be read.");
            Schedule(item, "Add");
            return Result.Success(item);
        }
        catch (Exception exception) when (IsDomainValidation(exception))
        {
            return Result.Failure<OrganizationalStructureItem>(Validation(exception));
        }
    }

    public async Task<Result<OrganizationalStructureBulkCreateResponse>> CreateBulkAsync(
        string resource,
        IReadOnlyList<OrganizationalStructureMutation> requests,
        CancellationToken cancellationToken)
    {
        var normalized = OrganizationalResources.Normalize(resource);
        if (requests is null || requests.Count == 0)
            return Result.Failure<OrganizationalStructureBulkCreateResponse>(new Error(
                "OrganizationalStructure.EmptyImport", "At least one item is required.", ErrorType.Validation));

        try
        {
            var result = await context.ExecuteAtomicallyAsync(
                ["organizational-structure:" + normalized],
                async token =>
                {
                    var identityKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                    var headquartersRequested = false;
                    foreach (var request in requests)
                    {
                        var scopeKey = normalized + "|" + (
                            normalized is OrganizationalResources.Departments ? request.BranchId :
                            normalized is OrganizationalResources.Divisions ? request.DepartmentId :
                            normalized is OrganizationalResources.JobDescriptions ? request.PositionId : null);
                        var hasInFileConflict = !identityKeys.Add(scopeKey + "|code|" + NormalizedCode(normalized, request)) ||
                            !identityKeys.Add(scopeKey + "|name-en|" + request.NameEn.Trim().ToUpperInvariant()) ||
                            !identityKeys.Add(scopeKey + "|name-ar|" + request.NameAr.Trim().ToUpperInvariant()) ||
                            (normalized == OrganizationalResources.JobLevels && request.LevelOrder.HasValue &&
                             !identityKeys.Add(scopeKey + "|level-order|" + request.LevelOrder.Value));
                        if (hasInFileConflict || await IdentityExistsAsync(normalized, request, null, token))
                            throw new BulkCreateFailureException(Duplicate);
                        if (!await ParentsAreValidAsync(normalized, request, null, token))
                            throw new BulkCreateFailureException(ParentNotFound);
                        if (normalized == OrganizationalResources.Branches && request.IsHeadquarters)
                        {
                            if (headquartersRequested || await context.Branches.AnyAsync(x => !x.IsDeleted && x.IsHeadquarters, token))
                                throw new BulkCreateFailureException(new Error(
                                    "OrganizationalStructure.HeadquartersExists",
                                    "Only one active headquarters branch is allowed per company.",
                                    ErrorType.Conflict));
                            headquartersRequested = true;
                        }
                        try
                        {
                            AddEntity(normalized, request);
                        }
                        catch (Exception exception) when (IsDomainValidation(exception))
                        {
                            throw new BulkCreateFailureException(Validation(exception));
                        }
                    }
                    try
                    {
                        await context.SaveChangesAsync(token);
                    }
                    catch (Exception exception) when (IsDomainValidation(exception))
                    {
                        throw new BulkCreateFailureException(Validation(exception));
                    }
                    return Result.Success(new OrganizationalStructureBulkCreateResponse(requests.Count));
                },
                cancellationToken);
            if (result.IsSuccess)
                Schedule(new OrganizationalStructureItem { Resource = normalized }, "BulkAdd");
            return result;
        }
        catch (DbUpdateException)
        {
            return Result.Failure<OrganizationalStructureBulkCreateResponse>(Duplicate);
        }
        catch (BulkCreateFailureException exception)
        {
            return Result.Failure<OrganizationalStructureBulkCreateResponse>(exception.Error);
        }
    }

    public async Task<Result<OrganizationalStructureItem>> UpdateAsync(
        string resource,
        int id,
        OrganizationalStructureMutation request,
        CancellationToken cancellationToken)
    {
        var normalized = OrganizationalResources.Normalize(resource);
        var entity = await GetEntityAsync(normalized, id, cancellationToken);
        if (entity is null || ((AuditableEntity)entity).IsDeleted)
            return Result.Failure<OrganizationalStructureItem>(NotFound);

        if (await IdentityExistsAsync(normalized, request, id, cancellationToken))
            return Result.Failure<OrganizationalStructureItem>(Duplicate);
        if (!await ParentsAreValidAsync(normalized, request, id, cancellationToken))
            return Result.Failure<OrganizationalStructureItem>(ParentNotFound);
        if (normalized == OrganizationalResources.Departments &&
            !await DepartmentHierarchyIsValidAsync(id, request.ParentDepartmentId, cancellationToken))
            return Result.Failure<OrganizationalStructureItem>(InvalidHierarchy);
        if (normalized == OrganizationalResources.Branches && request.IsHeadquarters &&
            await context.Branches.AnyAsync(x => x.Id != id && !x.IsDeleted && x.IsHeadquarters, cancellationToken))
        {
            return Result.Failure<OrganizationalStructureItem>(new Error(
                "OrganizationalStructure.HeadquartersExists",
                "Only one active headquarters branch is allowed per company.",
                ErrorType.Conflict));
        }

        try
        {
            UpdateEntity(normalized, entity, request);
            await context.SaveChangesAsync(cancellationToken);
            var item = await GetAsync(normalized, id, cancellationToken)
                ?? throw new InvalidOperationException("The updated organizational item could not be read.");
            Schedule(item, "Update");
            return Result.Success(item);
        }
        catch (Exception exception) when (IsDomainValidation(exception))
        {
            return Result.Failure<OrganizationalStructureItem>(Validation(exception));
        }
    }

    public async Task<Result> ArchiveAsync(string resource, int id, CancellationToken cancellationToken)
    {
        var normalized = OrganizationalResources.Normalize(resource);
        var entity = await GetEntityAsync(normalized, id, cancellationToken);
        if (entity is null)
            return Result.Failure(NotFound);
        var auditable = (AuditableEntity)entity;
        if (auditable.IsDeleted)
            return Result.Success();
        if (await HasActiveDependentsAsync(normalized, id, cancellationToken))
            return Result.Failure(InUse);

        auditable.IsDeleted = true;
        auditable.DeletedById = currentActor.UserId;
        auditable.DeletedByPc = Environment.MachineName;
        auditable.DeletedOn = timeProvider.GetUtcNow().UtcDateTime;
        await context.SaveChangesAsync(cancellationToken);
        Schedule(await GetAsync(normalized, id, cancellationToken), "Archive");
        return Result.Success();
    }

    public async Task<Result> RestoreAsync(string resource, int id, CancellationToken cancellationToken)
    {
        var normalized = OrganizationalResources.Normalize(resource);
        var entity = await GetEntityAsync(normalized, id, cancellationToken);
        if (entity is null)
            return Result.Failure(NotFound);
        var auditable = (AuditableEntity)entity;
        if (!auditable.IsDeleted)
            return Result.Success();

        var mutation = ToMutation(normalized, entity);
        if (!await ParentsAreValidAsync(normalized, mutation, id, cancellationToken))
            return Result.Failure(ParentNotFound);

        auditable.IsDeleted = false;
        auditable.DeletedById = null;
        auditable.DeletedByPc = null;
        auditable.DeletedOn = null;
        await context.SaveChangesAsync(cancellationToken);
        Schedule(await GetAsync(normalized, id, cancellationToken), "Restore");
        return Result.Success();
    }

    public async Task<Result<OrganizationalStructureItem>> ApproveJobDescriptionAsync(
        int id,
        DateOnly effectiveDate,
        DateOnly? expiryDate,
        CancellationToken cancellationToken)
    {
        var description = await context.JobDescriptions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (description is null || description.IsDeleted)
            return Result.Failure<OrganizationalStructureItem>(NotFound);

        var overlaps = await context.JobDescriptions.AnyAsync(x =>
            x.Id != id && !x.IsDeleted && x.PositionId == description.PositionId &&
            x.Status == JobDescriptionStatus.Approved &&
            (!x.ExpiryDate.HasValue || x.ExpiryDate.Value >= effectiveDate) &&
            (!expiryDate.HasValue || !x.EffectiveDate.HasValue || x.EffectiveDate.Value <= expiryDate.Value), cancellationToken);
        if (overlaps)
        {
            return Result.Failure<OrganizationalStructureItem>(new Error(
                "OrganizationalStructure.JobDescriptionOverlap",
                "The effective period overlaps another approved description for this position.",
                ErrorType.Conflict));
        }

        try
        {
            description.Approve(
                currentActor.UserId ?? throw new InvalidOperationException("An authenticated actor is required."),
                effectiveDate,
                expiryDate,
                timeProvider.GetUtcNow());
            await context.SaveChangesAsync(cancellationToken);
            var item = await GetAsync(OrganizationalResources.JobDescriptions, id, cancellationToken)
                ?? throw new InvalidOperationException("The approved job description could not be read.");
            Schedule(item, "Approve");
            return Result.Success(item);
        }
        catch (Exception exception) when (IsDomainValidation(exception))
        {
            return Result.Failure<OrganizationalStructureItem>(Validation(exception));
        }
    }

    public async Task<Result<OrganizationalStructureItem>> RejectJobDescriptionAsync(
        int id,
        string reason,
        CancellationToken cancellationToken)
    {
        var description = await context.JobDescriptions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (description is null || description.IsDeleted)
            return Result.Failure<OrganizationalStructureItem>(NotFound);

        try
        {
            description.Reject(reason, timeProvider.GetUtcNow());
            await context.SaveChangesAsync(cancellationToken);
            var item = await GetAsync(OrganizationalResources.JobDescriptions, id, cancellationToken)
                ?? throw new InvalidOperationException("The rejected job description could not be read.");
            Schedule(item, "Reject");
            return Result.Success(item);
        }
        catch (Exception exception) when (IsDomainValidation(exception))
        {
            return Result.Failure<OrganizationalStructureItem>(Validation(exception));
        }
    }

    private IQueryable<OrganizationalStructureItem> BuildQuery(string resource) => resource switch
    {
        OrganizationalResources.Branches => context.Branches.AsNoTracking().Select(x => new OrganizationalStructureItem
        {
            Id = x.Id, Resource = resource, Code = x.BranchCode, NameEn = x.NameEn,
            NameAr = x.NameAr, IsDeleted = x.IsDeleted, CreatedOn = x.CreatedOn, UpdatedOn = x.UpdatedOn,
            TimeZoneId = x.TimeZoneId, OpenedOn = x.OpenedOn, ClosedOn = x.ClosedOn,
            Email = x.Email, Phone = x.Phone, ManagerId = x.ManagerId,
            IsHeadquarters = x.IsHeadquarters, IsOperationallyActive = x.IsActive
        }),
        OrganizationalResources.Departments => context.Departments.AsNoTracking().Select(x => new OrganizationalStructureItem
        {
            Id = x.Id, Resource = resource, Code = x.DepartmentCode, NameEn = x.NameEn,
            NameAr = x.NameAr, IsDeleted = x.IsDeleted, CreatedOn = x.CreatedOn, UpdatedOn = x.UpdatedOn,
            DescriptionEn = x.DescriptionEn, DescriptionAr = x.DescriptionAr,
            BranchId = x.BranchId, BranchNameEn = x.Branch.NameEn, BranchNameAr = x.Branch.NameAr,
            ParentDepartmentId = x.ParentDepartmentId,
            ParentNameEn = x.ParentDepartment == null ? null : x.ParentDepartment.NameEn,
            ParentNameAr = x.ParentDepartment == null ? null : x.ParentDepartment.NameAr,
            ManagerId = x.ManagerId, CostCenterCode = x.CostCenterCode
        }),
        OrganizationalResources.Divisions => context.Divisions.AsNoTracking().Select(x => new OrganizationalStructureItem
        {
            Id = x.Id, Resource = resource, Code = x.DivisionCode, NameEn = x.NameEn,
            NameAr = x.NameAr, IsDeleted = x.IsDeleted, CreatedOn = x.CreatedOn, UpdatedOn = x.UpdatedOn,
            DescriptionEn = x.DescriptionEn, DescriptionAr = x.DescriptionAr,
            DepartmentId = x.DepartmentId, DepartmentNameEn = x.Department.NameEn, DepartmentNameAr = x.Department.NameAr,
            BranchId = x.Department.BranchId, BranchNameEn = x.Department.Branch.NameEn, BranchNameAr = x.Department.Branch.NameAr,
            ManagerId = x.ManagerId, CostCenterCode = x.CostCenterCode
        }),
        OrganizationalResources.JobTitles => context.JobTitles.AsNoTracking().Select(x => new OrganizationalStructureItem
        {
            Id = x.Id, Resource = resource, Code = x.JobTitleCode, NameEn = x.TitleEn,
            NameAr = x.TitleAr, IsDeleted = x.IsDeleted, CreatedOn = x.CreatedOn, UpdatedOn = x.UpdatedOn
        }),
        OrganizationalResources.JobLevels => context.JobLevels.AsNoTracking().Select(x => new OrganizationalStructureItem
        {
            Id = x.Id, Resource = resource, Code = x.LevelCode, NameEn = x.NameEn,
            NameAr = x.NameAr, IsDeleted = x.IsDeleted, CreatedOn = x.CreatedOn, UpdatedOn = x.UpdatedOn,
            DescriptionEn = x.DescriptionEn, DescriptionAr = x.DescriptionAr,
            LevelOrder = x.LevelOrder, MinSalary = x.MinSalary, MaxSalary = x.MaxSalary,
            CurrencyCode = x.CurrencyCode, CanManageOthers = x.CanManageOthers,
            IsManagementLevel = x.IsManagementLevel
        }),
        OrganizationalResources.Positions => context.Positions.AsNoTracking().Select(x => new OrganizationalStructureItem
        {
            Id = x.Id, Resource = resource, Code = x.PositionCode, NameEn = x.JobTitle.TitleEn,
            NameAr = x.JobTitle.TitleAr, IsDeleted = x.IsDeleted, CreatedOn = x.CreatedOn, UpdatedOn = x.UpdatedOn,
            DivisionId = x.DivisionId, DivisionNameEn = x.Division.NameEn, DivisionNameAr = x.Division.NameAr,
            DepartmentId = x.Division.DepartmentId, DepartmentNameEn = x.Division.Department.NameEn, DepartmentNameAr = x.Division.Department.NameAr,
            BranchId = x.Division.Department.BranchId, BranchNameEn = x.Division.Department.Branch.NameEn, BranchNameAr = x.Division.Department.Branch.NameAr,
            JobTitleId = x.JobTitleId, JobTitleNameEn = x.JobTitle.TitleEn, JobTitleNameAr = x.JobTitle.TitleAr,
            JobLevelId = x.JobLevelId, JobLevelNameEn = x.JobLevel.NameEn, JobLevelNameAr = x.JobLevel.NameAr,
            TargetHeadcount = x.TargetHeadcount
        }),
        OrganizationalResources.JobDescriptions => context.JobDescriptions.AsNoTracking().Select(x => new OrganizationalStructureItem
        {
            Id = x.Id, Resource = resource, Code = x.Version, NameEn = x.TitleEn,
            NameAr = x.TitleAr, IsDeleted = x.IsDeleted, CreatedOn = x.CreatedOn, UpdatedOn = x.UpdatedOn,
            PositionId = x.PositionId, PositionCode = x.Position.PositionCode,
            DivisionId = x.Position.DivisionId, DivisionNameEn = x.Position.Division.NameEn, DivisionNameAr = x.Position.Division.NameAr,
            JobTitleId = x.Position.JobTitleId, JobTitleNameEn = x.Position.JobTitle.TitleEn, JobTitleNameAr = x.Position.JobTitle.TitleAr,
            JobLevelId = x.Position.JobLevelId, JobLevelNameEn = x.Position.JobLevel.NameEn, JobLevelNameAr = x.Position.JobLevel.NameAr,
            Version = x.Version, PurposeEn = x.PurposeEn, PurposeAr = x.PurposeAr,
            ResponsibilitiesEn = x.ResponsibilitiesEn, ResponsibilitiesAr = x.ResponsibilitiesAr,
            RequirementsEn = x.RequirementsEn, RequirementsAr = x.RequirementsAr,
            PreferredQualificationsEn = x.PreferredQualificationsEn,
            PreferredQualificationsAr = x.PreferredQualificationsAr,
            RequiredSkills = x.RequiredSkills, RequiredEducation = x.RequiredEducation,
            MinExperienceYears = x.MinExperienceYears, RevisionNotes = x.RevisionNotes,
            JobDescriptionStatus = x.Status, EffectiveDate = x.EffectiveDate, ExpiryDate = x.ExpiryDate,
            ApprovedByUserId = x.ApprovedByUserId, DecisionOn = x.DecisionOn, DecisionReason = x.DecisionReason
        }),
        _ => throw new ArgumentOutOfRangeException(nameof(resource))
    };

    private object AddEntity(string resource, OrganizationalStructureMutation request)
    {
        object entity = resource switch
        {
            OrganizationalResources.Branches => CreateBranch(request),
            OrganizationalResources.Departments => CreateDepartment(request),
            OrganizationalResources.Divisions => CreateDivision(request),
            OrganizationalResources.JobTitles => new JobTitle(request.Code, request.NameEn, request.NameAr),
            OrganizationalResources.JobLevels => CreateJobLevel(request),
            OrganizationalResources.Positions => new Position(
                request.Code, RequiredId(request.JobTitleId, nameof(request.JobTitleId)),
                RequiredId(request.DivisionId, nameof(request.DivisionId)),
                RequiredId(request.JobLevelId, nameof(request.JobLevelId)), request.TargetHeadcount ?? 0),
            OrganizationalResources.JobDescriptions => CreateJobDescription(request),
            _ => throw new ArgumentOutOfRangeException(nameof(resource))
        };

        context.Add(entity);
        return entity;
    }

    private static Branch CreateBranch(OrganizationalStructureMutation request)
    {
        var branch = new Branch(
            request.Code, request.NameEn, request.NameAr,
            request.TimeZoneId ?? "UTC", request.OpenedOn ?? DateOnly.FromDateTime(DateTime.UtcNow));
        branch.UpdateContact(request.Email, request.Phone);
        branch.AssignManager(request.ManagerId);
        branch.SetHeadquarters(request.IsHeadquarters);
        return branch;
    }

    private static Department CreateDepartment(OrganizationalStructureMutation request)
    {
        var department = new Department(
            RequiredId(request.BranchId, nameof(request.BranchId)),
            request.Code, request.NameEn, request.NameAr, request.ParentDepartmentId);
        department.UpdateDetails(request.DescriptionEn, request.DescriptionAr, request.CostCenterCode, request.ManagerId);
        return department;
    }

    private static Division CreateDivision(OrganizationalStructureMutation request)
    {
        var division = new Division(
            RequiredId(request.DepartmentId, nameof(request.DepartmentId)),
            request.Code, request.NameEn, request.NameAr);
        division.UpdateDetails(request.DescriptionEn, request.DescriptionAr, request.CostCenterCode, request.ManagerId);
        return division;
    }

    private static JobLevel CreateJobLevel(OrganizationalStructureMutation request)
    {
        var level = new JobLevel(request.Code, request.NameEn, request.NameAr, request.LevelOrder ?? 0);
        level.UpdateDetails(request.DescriptionEn, request.DescriptionAr, request.LevelOrder ?? 0,
            request.CanManageOthers, request.IsManagementLevel);
        level.SetSalaryRange(request.MinSalary, request.MaxSalary, request.CurrencyCode);
        return level;
    }

    private static JobDescription CreateJobDescription(OrganizationalStructureMutation request)
    {
        var description = new JobDescription(
            RequiredId(request.PositionId, nameof(request.PositionId)),
            request.NameEn, request.NameAr, request.Version ?? request.Code);
        ApplyJobDescriptionContent(description, request);
        return description;
    }

    private static void UpdateEntity(string resource, object entity, OrganizationalStructureMutation request)
    {
        switch (resource)
        {
            case OrganizationalResources.Branches:
                var branch = (Branch)entity;
                branch.UpdateIdentity(request.Code, request.NameEn, request.NameAr,
                    request.TimeZoneId ?? "UTC", request.OpenedOn ?? branch.OpenedOn);
                branch.UpdateContact(request.Email, request.Phone);
                branch.AssignManager(request.ManagerId);
                branch.SetHeadquarters(request.IsHeadquarters);
                break;
            case OrganizationalResources.Departments:
                var department = (Department)entity;
                department.UpdateIdentity(request.Code, request.NameEn, request.NameAr);
                department.MoveToBranch(RequiredId(request.BranchId, nameof(request.BranchId)));
                department.ChangeParent(request.ParentDepartmentId);
                department.UpdateDetails(request.DescriptionEn, request.DescriptionAr, request.CostCenterCode, request.ManagerId);
                break;
            case OrganizationalResources.Divisions:
                var division = (Division)entity;
                division.UpdateIdentity(request.Code, request.NameEn, request.NameAr);
                division.MoveToDepartment(RequiredId(request.DepartmentId, nameof(request.DepartmentId)));
                division.UpdateDetails(request.DescriptionEn, request.DescriptionAr, request.CostCenterCode, request.ManagerId);
                break;
            case OrganizationalResources.JobTitles:
                ((JobTitle)entity).UpdateIdentity(request.Code, request.NameEn, request.NameAr);
                break;
            case OrganizationalResources.JobLevels:
                var level = (JobLevel)entity;
                level.UpdateIdentity(request.Code, request.NameEn, request.NameAr);
                level.UpdateDetails(request.DescriptionEn, request.DescriptionAr, request.LevelOrder ?? 0,
                    request.CanManageOthers, request.IsManagementLevel);
                level.SetSalaryRange(request.MinSalary, request.MaxSalary, request.CurrencyCode);
                break;
            case OrganizationalResources.Positions:
                var position = (Position)entity;
                position.UpdateIdentity(request.Code);
                position.UpdateStructure(
                    RequiredId(request.JobTitleId, nameof(request.JobTitleId)),
                    RequiredId(request.DivisionId, nameof(request.DivisionId)),
                    RequiredId(request.JobLevelId, nameof(request.JobLevelId)));
                position.SetTargetHeadcount(request.TargetHeadcount ?? 0);
                break;
            case OrganizationalResources.JobDescriptions:
                var description = (JobDescription)entity;
                description.UpdateIdentity(
                    RequiredId(request.PositionId, nameof(request.PositionId)),
                    request.NameEn, request.NameAr, request.Version ?? request.Code);
                ApplyJobDescriptionContent(description, request);
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(resource));
        }
    }

    private static void ApplyJobDescriptionContent(JobDescription description, OrganizationalStructureMutation request)
    {
        description.UpdateContent(
            request.PurposeEn, request.PurposeAr,
            request.ResponsibilitiesEn, request.ResponsibilitiesAr,
            request.RequirementsEn, request.RequirementsAr,
            request.RequiredSkills, request.RequiredEducation, request.MinExperienceYears);
        description.UpdatePreferredQualifications(
            request.PreferredQualificationsEn, request.PreferredQualificationsAr, request.RevisionNotes);
    }

    private Task<object?> GetEntityAsync(string resource, int id, CancellationToken cancellationToken) => resource switch
    {
        OrganizationalResources.Branches => FirstAsObjectAsync(context.Branches.Where(x => x.Id == id), cancellationToken),
        OrganizationalResources.Departments => FirstAsObjectAsync(context.Departments.Where(x => x.Id == id), cancellationToken),
        OrganizationalResources.Divisions => FirstAsObjectAsync(context.Divisions.Where(x => x.Id == id), cancellationToken),
        OrganizationalResources.JobTitles => FirstAsObjectAsync(context.JobTitles.Where(x => x.Id == id), cancellationToken),
        OrganizationalResources.JobLevels => FirstAsObjectAsync(context.JobLevels.Where(x => x.Id == id), cancellationToken),
        OrganizationalResources.Positions => FirstAsObjectAsync(context.Positions.Where(x => x.Id == id), cancellationToken),
        OrganizationalResources.JobDescriptions => FirstAsObjectAsync(context.JobDescriptions.Where(x => x.Id == id), cancellationToken),
        _ => throw new ArgumentOutOfRangeException(nameof(resource))
    };

    private static async Task<object?> FirstAsObjectAsync<TEntity>(IQueryable<TEntity> query, CancellationToken cancellationToken)
        where TEntity : class => await query.FirstOrDefaultAsync(cancellationToken);

    private async Task<bool> ParentsAreValidAsync(
        string resource,
        OrganizationalStructureMutation request,
        int? currentId,
        CancellationToken cancellationToken) => resource switch
    {
        OrganizationalResources.Branches or OrganizationalResources.JobTitles or OrganizationalResources.JobLevels => true,
        OrganizationalResources.Departments =>
            request.BranchId.HasValue && await context.Branches.AnyAsync(x => x.Id == request.BranchId && !x.IsDeleted && x.IsActive, cancellationToken) &&
            (!request.ParentDepartmentId.HasValue || await context.Departments.AnyAsync(x =>
                x.Id == request.ParentDepartmentId && x.Id != currentId && x.BranchId == request.BranchId && !x.IsDeleted, cancellationToken)),
        OrganizationalResources.Divisions =>
            request.DepartmentId.HasValue && await context.Departments.AnyAsync(x => x.Id == request.DepartmentId && !x.IsDeleted, cancellationToken),
        OrganizationalResources.Positions =>
            request.DivisionId.HasValue && request.JobTitleId.HasValue && request.JobLevelId.HasValue &&
            await context.Divisions.AnyAsync(x => x.Id == request.DivisionId && !x.IsDeleted, cancellationToken) &&
            await context.JobTitles.AnyAsync(x => x.Id == request.JobTitleId && !x.IsDeleted, cancellationToken) &&
            await context.JobLevels.AnyAsync(x => x.Id == request.JobLevelId && !x.IsDeleted, cancellationToken),
        OrganizationalResources.JobDescriptions =>
            request.PositionId.HasValue && await context.Positions.AnyAsync(x => x.Id == request.PositionId && !x.IsDeleted, cancellationToken),
        _ => false
    };

    private async Task<bool> DepartmentHierarchyIsValidAsync(int departmentId, int? parentId, CancellationToken cancellationToken)
    {
        var visited = new HashSet<int> { departmentId };
        var current = parentId;
        while (current.HasValue)
        {
            if (!visited.Add(current.Value))
                return false;
            current = await context.Departments.AsNoTracking()
                .Where(x => x.Id == current.Value)
                .Select(x => x.ParentDepartmentId)
                .FirstOrDefaultAsync(cancellationToken);
        }
        return true;
    }

    private async Task<bool> HasActiveDependentsAsync(string resource, int id, CancellationToken cancellationToken) => resource switch
    {
        OrganizationalResources.Branches => await context.Departments.AnyAsync(x => x.BranchId == id && !x.IsDeleted, cancellationToken),
        OrganizationalResources.Departments =>
            await context.Departments.AnyAsync(x => x.ParentDepartmentId == id && !x.IsDeleted, cancellationToken) ||
            await context.Divisions.AnyAsync(x => x.DepartmentId == id && !x.IsDeleted, cancellationToken),
        OrganizationalResources.Divisions => await context.Positions.AnyAsync(x => x.DivisionId == id && !x.IsDeleted, cancellationToken),
        OrganizationalResources.JobTitles => await context.Positions.AnyAsync(x => x.JobTitleId == id && !x.IsDeleted, cancellationToken),
        OrganizationalResources.JobLevels => await context.Positions.AnyAsync(x => x.JobLevelId == id && !x.IsDeleted, cancellationToken),
        OrganizationalResources.Positions => await context.JobDescriptions.AnyAsync(x => x.PositionId == id && !x.IsDeleted, cancellationToken),
        OrganizationalResources.JobDescriptions => false,
        _ => true
    };

    private Task<bool> IdentityExistsAsync(
        string resource,
        OrganizationalStructureMutation request,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        var code = NormalizedCode(resource, request);
        var nameEn = request.NameEn.Trim().ToUpperInvariant();
        var nameAr = request.NameAr.Trim().ToUpperInvariant();
        var query = BuildQuery(resource).Where(x => !excludedId.HasValue || x.Id != excludedId);
        if (resource == OrganizationalResources.Departments && request.BranchId.HasValue)
            query = query.Where(x => x.BranchId == request.BranchId);
        else if (resource == OrganizationalResources.Divisions && request.DepartmentId.HasValue)
            query = query.Where(x => x.DepartmentId == request.DepartmentId);
        else if (resource == OrganizationalResources.JobDescriptions && request.PositionId.HasValue)
            query = query.Where(x => x.PositionId == request.PositionId);
        return query.AnyAsync(x => x.Code == code || x.NameEn.ToUpper() == nameEn || x.NameAr.ToUpper() == nameAr, cancellationToken);
    }

    private static IQueryable<OrganizationalStructureItem> ApplyParentFilter(
        IQueryable<OrganizationalStructureItem> query, string resource, int parentId) => resource switch
    {
        OrganizationalResources.Departments => query.Where(x => x.BranchId == parentId),
        OrganizationalResources.Divisions => query.Where(x => x.DepartmentId == parentId),
        OrganizationalResources.Positions => query.Where(x => x.DivisionId == parentId),
        OrganizationalResources.JobDescriptions => query.Where(x => x.PositionId == parentId),
        _ => query
    };

    private static IQueryable<OrganizationalStructureItem> ApplyStatusFilter(
        IQueryable<OrganizationalStructureItem> query,
        string resource,
        string status)
    {
        if (resource == OrganizationalResources.JobDescriptions &&
            Enum.TryParse<JobDescriptionStatus>(status, true, out var descriptionStatus))
        {
            return query.Where(x => !x.IsDeleted && x.JobDescriptionStatus == descriptionStatus);
        }

        return status.ToUpperInvariant() switch
        {
            "ARCHIVED" => query.Where(x => x.IsDeleted),
            "ALL" => query,
            _ => query.Where(x => !x.IsDeleted)
        };
    }

    private static IQueryable<OrganizationalStructureItem> ApplyOrdering(
        IQueryable<OrganizationalStructureItem> query,
        string resource,
        string sortBy,
        string sortDirection)
    {
        var descending = sortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase);
        return (sortBy.ToUpperInvariant(), descending) switch
        {
            ("NAMEAR", true) => query.OrderByDescending(x => x.NameAr).ThenByDescending(x => x.Id),
            ("NAMEAR", false) => query.OrderBy(x => x.NameAr).ThenBy(x => x.Id),
            ("CODE", true) => query.OrderByDescending(x => x.Code).ThenByDescending(x => x.Id),
            ("CODE", false) => query.OrderBy(x => x.Code).ThenBy(x => x.Id),
            ("CREATEDON", true) => query.OrderByDescending(x => x.CreatedOn).ThenByDescending(x => x.Id),
            ("CREATEDON", false) => query.OrderBy(x => x.CreatedOn).ThenBy(x => x.Id),
            ("PARENT", true) => ApplyParentOrdering(query, resource, true),
            ("PARENT", false) => ApplyParentOrdering(query, resource, false),
            ("NAMEEN", true) => query.OrderByDescending(x => x.NameEn).ThenByDescending(x => x.Id),
            _ => query.OrderBy(x => x.NameEn).ThenBy(x => x.Id)
        };
    }

    private static IOrderedQueryable<OrganizationalStructureItem> ApplyParentOrdering(
        IQueryable<OrganizationalStructureItem> query,
        string resource,
        bool descending) => (resource, descending) switch
    {
        (OrganizationalResources.Departments, true) => query
            .OrderByDescending(x => x.ParentNameEn ?? x.BranchNameEn ?? string.Empty)
            .ThenByDescending(x => x.Id),
        (OrganizationalResources.Departments, false) => query
            .OrderBy(x => x.ParentNameEn ?? x.BranchNameEn ?? string.Empty)
            .ThenBy(x => x.Id),
        (OrganizationalResources.Divisions, true) => query
            .OrderByDescending(x => x.DepartmentNameEn ?? string.Empty)
            .ThenByDescending(x => x.Id),
        (OrganizationalResources.Divisions, false) => query
            .OrderBy(x => x.DepartmentNameEn ?? string.Empty)
            .ThenBy(x => x.Id),
        (OrganizationalResources.Positions, true) => query
            .OrderByDescending(x => x.DivisionNameEn ?? string.Empty)
            .ThenByDescending(x => x.Id),
        (OrganizationalResources.Positions, false) => query
            .OrderBy(x => x.DivisionNameEn ?? string.Empty)
            .ThenBy(x => x.Id),
        (OrganizationalResources.JobDescriptions, true) => query
            .OrderByDescending(x => x.PositionCode ?? string.Empty)
            .ThenByDescending(x => x.Id),
        (OrganizationalResources.JobDescriptions, false) => query
            .OrderBy(x => x.PositionCode ?? string.Empty)
            .ThenBy(x => x.Id),
        (_, true) => query.OrderByDescending(x => x.Id),
        _ => query.OrderBy(x => x.Id)
    };

    private static IQueryable<OrganizationalStructureItem> ApplySearch(
        IQueryable<OrganizationalStructureItem> query,
        string resource,
        string field,
        string searchOperator,
        string search)
    {
        var normalizedField = field.ToUpperInvariant();
        var normalizedOperator = searchOperator.ToUpperInvariant();
        var properties = normalizedField switch
        {
            "NAMEAR" => [nameof(OrganizationalStructureItem.NameAr)],
            "NAMEEN" => [nameof(OrganizationalStructureItem.NameEn)],
            "CODE" => [nameof(OrganizationalStructureItem.Code)],
            "PARENT" => ParentSearchProperties(resource),
            _ =>
            [
                nameof(OrganizationalStructureItem.Code),
                nameof(OrganizationalStructureItem.NameEn),
                nameof(OrganizationalStructureItem.NameAr),
                .. ParentSearchProperties(resource)
            ]
        };

        var parameter = Expression.Parameter(typeof(OrganizationalStructureItem), "item");
        var searchValue = Expression.Constant(search);
        var negative = normalizedOperator is "DOESNOTCONTAIN" or "DOESNOTEQUAL";
        Expression? predicate = null;

        foreach (var propertyName in properties)
        {
            var property = Expression.Property(parameter, propertyName);
            var value = Expression.Coalesce(property, Expression.Constant(string.Empty));
            var normalizedValue = Expression.Call(value, nameof(string.ToUpper), Type.EmptyTypes);
            Expression comparison = normalizedOperator switch
            {
                "EQUALS" or "DOESNOTEQUAL" => Expression.Equal(normalizedValue, searchValue),
                "STARTSWITH" => Expression.Call(normalizedValue, nameof(string.StartsWith), Type.EmptyTypes, searchValue),
                "ENDSWITH" => Expression.Call(normalizedValue, nameof(string.EndsWith), Type.EmptyTypes, searchValue),
                _ => Expression.Call(normalizedValue, nameof(string.Contains), Type.EmptyTypes, searchValue)
            };
            if (negative)
                comparison = Expression.Not(comparison);

            predicate = predicate is null
                ? comparison
                : negative
                    ? Expression.AndAlso(predicate, comparison)
                    : Expression.OrElse(predicate, comparison);
        }

        predicate ??= Expression.Constant(negative);
        return query.Where(Expression.Lambda<Func<OrganizationalStructureItem, bool>>(predicate, parameter));
    }

    private static string[] ParentSearchProperties(string resource) => resource switch
    {
        OrganizationalResources.Departments =>
        [
            nameof(OrganizationalStructureItem.BranchNameEn),
            nameof(OrganizationalStructureItem.BranchNameAr),
            nameof(OrganizationalStructureItem.ParentNameEn),
            nameof(OrganizationalStructureItem.ParentNameAr)
        ],
        OrganizationalResources.Divisions =>
        [
            nameof(OrganizationalStructureItem.DepartmentNameEn),
            nameof(OrganizationalStructureItem.DepartmentNameAr),
            nameof(OrganizationalStructureItem.BranchNameEn),
            nameof(OrganizationalStructureItem.BranchNameAr)
        ],
        OrganizationalResources.Positions =>
        [
            nameof(OrganizationalStructureItem.DivisionNameEn),
            nameof(OrganizationalStructureItem.DivisionNameAr),
            nameof(OrganizationalStructureItem.DepartmentNameEn),
            nameof(OrganizationalStructureItem.DepartmentNameAr),
            nameof(OrganizationalStructureItem.BranchNameEn),
            nameof(OrganizationalStructureItem.BranchNameAr)
        ],
        OrganizationalResources.JobDescriptions =>
        [
            nameof(OrganizationalStructureItem.PositionCode),
            nameof(OrganizationalStructureItem.JobTitleNameEn),
            nameof(OrganizationalStructureItem.JobTitleNameAr),
            nameof(OrganizationalStructureItem.JobLevelNameEn),
            nameof(OrganizationalStructureItem.JobLevelNameAr),
            nameof(OrganizationalStructureItem.DivisionNameEn),
            nameof(OrganizationalStructureItem.DivisionNameAr)
        ],
        _ => []
    };

    private static async Task<IReadOnlyList<OrganizationalStructureLookup>> ReadLookupAsync(
        IQueryable<OrganizationalStructureItem> query,
        CancellationToken cancellationToken) =>
        await query.OrderBy(x => x.NameEn).ThenBy(x => x.Id)
            .Select(x => new OrganizationalStructureLookup(x.Id, x.Code, x.NameEn, x.NameAr))
            .ToListAsync(cancellationToken);

    private static string NormalizedCode(string resource, OrganizationalStructureMutation request) =>
        (resource == OrganizationalResources.JobDescriptions ? request.Version ?? request.Code : request.Code)
            .Trim().ToUpperInvariant();

    private static int RequiredId(int? value, string name) =>
        value is > 0 ? value.Value : throw new ArgumentOutOfRangeException(name);

    private static int EntityId(object entity) => entity switch
    {
        Branch x => x.Id,
        Department x => x.Id,
        Division x => x.Id,
        JobTitle x => x.Id,
        JobLevel x => x.Id,
        Position x => x.Id,
        JobDescription x => x.Id,
        _ => throw new ArgumentOutOfRangeException(nameof(entity))
    };

    private static OrganizationalStructureMutation ToMutation(string resource, object entity) => entity switch
    {
        Branch x => new(x.BranchCode, x.NameEn, x.NameAr, TimeZoneId: x.TimeZoneId, OpenedOn: x.OpenedOn),
        Department x => new(x.DepartmentCode, x.NameEn, x.NameAr, BranchId: x.BranchId, ParentDepartmentId: x.ParentDepartmentId),
        Division x => new(x.DivisionCode, x.NameEn, x.NameAr, DepartmentId: x.DepartmentId),
        JobTitle x => new(x.JobTitleCode, x.TitleEn, x.TitleAr),
        JobLevel x => new(x.LevelCode, x.NameEn, x.NameAr, LevelOrder: x.LevelOrder),
        Position x => new(x.PositionCode, x.PositionCode, x.PositionCode, DivisionId: x.DivisionId, JobTitleId: x.JobTitleId, JobLevelId: x.JobLevelId),
        JobDescription x => new(x.Version, x.TitleEn, x.TitleAr, PositionId: x.PositionId, Version: x.Version),
        _ => throw new ArgumentOutOfRangeException(nameof(resource))
    };

    private void Schedule(OrganizationalStructureItem? item, string action)
    {
        changeScheduler.Schedule(new OrganizationalStructureChange(
            item?.Resource ?? string.Empty,
            item?.Id,
            action,
            item?.NameEn,
            item?.NameAr,
            currentActor.UserId,
            Guid.NewGuid()));
    }

    private static bool IsDomainValidation(Exception exception) =>
        exception is DomainRuleException or ArgumentException;

    private static Error Validation(Exception exception) => new(
        exception is DomainRuleException domain ? domain.Code : "OrganizationalStructure.InvalidValue",
        exception.Message,
        ErrorType.Validation);

    private sealed class BulkCreateFailureException(Error error) : Exception(error.Description)
    {
        public Error Error { get; } = error;
    }
}
