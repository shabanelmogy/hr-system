using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Recruitment.Abstractions;
using HrManagementSystem.Application.Features.Recruitment.Contracts;
using HrManagementSystem.Application.Features.Recruitment.Errors;
using HrManagementSystem.Application.Features.WorkforcePlanning;
using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Employees.Entities;
using HrManagementSystem.Domain.Employees.Enums;
using HrManagementSystem.Domain.Finance.FiscalYears.Enums;
using HrManagementSystem.Domain.Recruitment.Entities;
using HrManagementSystem.Domain.Recruitment.Enums;
using HrManagementSystem.Domain.WorkforcePlanning.Enums;
using HrManagementSystem.Domain.WorkforcePlanning;
using HrManagementSystem.Domain.WorkforcePlanning.Entities;
using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace HrManagementSystem.Infrastructure.Features.Recruitment.Services;

public class RecruitmentService(
    ApplicationDbContext context,
    ICurrentActor currentActor,
    ILogger<RecruitmentService> logger,
    IConfiguration? configuration = null,
    TimeProvider? timeProvider = null) : IRecruitmentService
{
    private readonly ApplicationDbContext _context = context;
    private readonly ICurrentActor _currentActor = currentActor;
    private readonly bool _requireStaffingRequest = configuration?.GetValue<bool>(
        "WorkforcePlanning:RequireStaffingRequestForNewRequisitions") ?? false;
    private readonly TimeProvider _clock = timeProvider ?? TimeProvider.System;
    private readonly ILogger<RecruitmentService> _logger = logger;

    private int ResolveActorEmployeeId()
    {
        if (!string.IsNullOrWhiteSpace(_currentActor.UserId))
        {
            var employee = _context.Employees
                .AsNoTracking()
                .FirstOrDefault(e => e.UserId == _currentActor.UserId);
            if (employee is not null)
                return employee.Id;
        }

        return 1; // Default System/HR Admin Employee ID
    }

    private void SetScope(TenantAuditableEntity entity)
    {
        if (!string.IsNullOrWhiteSpace(_currentActor.TenantId))
            entity.TenantId = _currentActor.TenantId;
        if (entity is CompanyAuditableEntity companyEntity && _currentActor.CompanyId.HasValue)
            companyEntity.CompanyId = _currentActor.CompanyId.Value;
    }

    // ==========================================
    // Dashboard Summary
    // ==========================================
    public async Task<RecruitmentDashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken = default)
    {
        var totalOpenings = await _context.JobOpenings
            .CountAsync(o => o.Status == JobOpeningStatus.Open, cancellationToken);

        var totalActiveCandidates = await _context.Candidates
            .CountAsync(c => c.IsActive, cancellationToken);

        var totalScheduledInterviews = await _context.Interviews
            .CountAsync(i => i.Status == InterviewStatus.Scheduled, cancellationToken);

        var totalPendingOffers = await _context.JobOffers
            .CountAsync(o => o.Status == JobOfferStatus.Issued, cancellationToken);

        var totalHiredCount = await _context.EmploymentApplications
            .CountAsync(a => a.Status == ApplicationStatus.Hired, cancellationToken);

        var stageCountsRaw = await _context.EmploymentApplications
            .GroupBy(a => a.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToListAsync(cancellationToken);

        var stageCounts = stageCountsRaw.ToDictionary(k => k.Status, v => v.Count);

        // Ensure common stages exist in dictionary
        foreach (var status in Enum.GetValues<ApplicationStatus>())
        {
            var key = status.ToString();
            if (!stageCounts.ContainsKey(key))
                stageCounts[key] = 0;
        }

        return new RecruitmentDashboardSummaryDto
        {
            TotalOpenings = totalOpenings,
            TotalActiveCandidates = totalActiveCandidates,
            TotalScheduledInterviews = totalScheduledInterviews,
            TotalPendingOffers = totalPendingOffers,
            TotalHiredCount = totalHiredCount,
            StageCounts = stageCounts
        };
    }

    // ==========================================
    // Candidates
    // ==========================================
    public async Task<PageResponse<CandidateDto>> GetCandidatesPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Candidates.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(c =>
                c.FirstName.ToLower().Contains(term) ||
                c.LastName.ToLower().Contains(term) ||
                c.Email.ToLower().Contains(term) ||
                (c.PhoneNumber != null && c.PhoneNumber.Contains(term)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await (from c in query
                           join nat in _context.Countries.AsNoTracking() on c.NationalityCountryId equals nat.Id into natJoin
                           from nat in natJoin.DefaultIfEmpty()
                           orderby c.CreatedOn descending
                           select new CandidateDto
                           {
                               Id = c.Id,
                               PublicId = c.PublicId,
                               FirstName = c.FirstName,
                               MiddleName = c.MiddleName,
                               LastName = c.LastName,
                               FullName = c.FirstName + (c.MiddleName != null ? " " + c.MiddleName : "") + " " + c.LastName,
                               Email = c.Email,
                               PhoneNumber = c.PhoneNumber,
                               DateOfBirth = c.DateOfBirth,
                               NationalityCountryId = c.NationalityCountryId,
                               NationalityCountryNameEn = nat != null ? nat.NameEn : null,
                               NationalityCountryNameAr = nat != null ? nat.NameAr : null,
                               CurrentCountryId = c.CurrentCountryId,
                               CurrentStateId = c.CurrentStateId,
                               City = c.City,
                               LinkedInUrl = c.LinkedInUrl,
                               PortfolioUrl = c.PortfolioUrl,
                               ResumeFileId = c.ResumeFileId,
                               IsActive = c.IsActive,
                               CreatedOn = c.CreatedOn
                           })
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var meta = new MetaData
        {
            CurrentPage = pageNumber,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };

        return new PageResponse<CandidateDto>(items, meta);
    }

    public async Task<Result<CandidateDto>> GetCandidateByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await (from c in _context.Candidates.AsNoTracking().Where(c => c.Id == id)
                          join nat in _context.Countries.AsNoTracking() on c.NationalityCountryId equals nat.Id into natJoin
                          from nat in natJoin.DefaultIfEmpty()
                          select new CandidateDto
                          {
                              Id = c.Id,
                              PublicId = c.PublicId,
                              FirstName = c.FirstName,
                              MiddleName = c.MiddleName,
                              LastName = c.LastName,
                              FullName = c.FirstName + (c.MiddleName != null ? " " + c.MiddleName : "") + " " + c.LastName,
                              Email = c.Email,
                              PhoneNumber = c.PhoneNumber,
                              DateOfBirth = c.DateOfBirth,
                              NationalityCountryId = c.NationalityCountryId,
                              NationalityCountryNameEn = nat != null ? nat.NameEn : null,
                              NationalityCountryNameAr = nat != null ? nat.NameAr : null,
                              CurrentCountryId = c.CurrentCountryId,
                              CurrentStateId = c.CurrentStateId,
                              City = c.City,
                              LinkedInUrl = c.LinkedInUrl,
                              PortfolioUrl = c.PortfolioUrl,
                              ResumeFileId = c.ResumeFileId,
                              IsActive = c.IsActive,
                              CreatedOn = c.CreatedOn
                          }).FirstOrDefaultAsync(cancellationToken);

        return item is not null
            ? Result.Success(item)
            : Result.Failure<CandidateDto>(RecruitmentErrors.CandidateNotFound);
    }

    public async Task<Result<CandidateDto>> CreateCandidateAsync(CandidateMutation mutation, CancellationToken cancellationToken = default)
    {
        var emailNormalized = mutation.Email.Trim().ToLowerInvariant();
        var exists = await _context.Candidates.AnyAsync(c => c.Email == emailNormalized, cancellationToken);
        if (exists)
            return Result.Failure<CandidateDto>(RecruitmentErrors.CandidateEmailAlreadyExists);

        var candidate = new Candidate(mutation.FirstName, mutation.LastName, mutation.Email, mutation.PhoneNumber);
        candidate.UpdateIdentity(mutation.FirstName, mutation.MiddleName, mutation.LastName, mutation.DateOfBirth, mutation.NationalityCountryId);
        candidate.UpdateLocation(mutation.CurrentCountryId, mutation.CurrentStateId, mutation.City);
        candidate.UpdateProfessionalProfile(mutation.LinkedInUrl, mutation.PortfolioUrl, mutation.ResumeFileId);

        SetScope(candidate);
        _context.Candidates.Add(candidate);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetCandidateByIdAsync(candidate.Id, cancellationToken);
    }

    public async Task<Result<CandidateDto>> UpdateCandidateAsync(int id, CandidateMutation mutation, CancellationToken cancellationToken = default)
    {
        var candidate = await _context.Candidates.FindAsync([id], cancellationToken);
        if (candidate is null)
            return Result.Failure<CandidateDto>(RecruitmentErrors.CandidateNotFound);

        var emailNormalized = mutation.Email.Trim().ToLowerInvariant();
        if (candidate.Email != emailNormalized)
        {
            var exists = await _context.Candidates.AnyAsync(c => c.Email == emailNormalized && c.Id != id, cancellationToken);
            if (exists)
                return Result.Failure<CandidateDto>(RecruitmentErrors.CandidateEmailAlreadyExists);
        }

        candidate.UpdateIdentity(mutation.FirstName, mutation.MiddleName, mutation.LastName, mutation.DateOfBirth, mutation.NationalityCountryId);
        candidate.UpdateContact(mutation.Email, mutation.PhoneNumber);
        candidate.UpdateLocation(mutation.CurrentCountryId, mutation.CurrentStateId, mutation.City);
        candidate.UpdateProfessionalProfile(mutation.LinkedInUrl, mutation.PortfolioUrl, mutation.ResumeFileId);

        await _context.SaveChangesAsync(cancellationToken);
        return await GetCandidateByIdAsync(candidate.Id, cancellationToken);
    }

    // ==========================================
    // Job Requisitions
    // ==========================================
    public async Task<PageResponse<JobRequisitionDto>> GetJobRequisitionsPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        JobRequisitionStatus? status,
        CancellationToken cancellationToken = default)
    {
        var query = _context.JobRequisitions.AsNoTracking();

        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(r => r.RequisitionNumber.ToLower().Contains(term) || r.BusinessReason.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await (from r in query
                           join p in _context.Positions.AsNoTracking() on r.PositionId equals p.Id into pJoin
                           from p in pJoin.DefaultIfEmpty()
                           join jt in _context.JobTitles.AsNoTracking() on p.JobTitleId equals jt.Id into jtJoin
                           from jt in jtJoin.DefaultIfEmpty()
                           join b in _context.Branches.AsNoTracking() on r.BranchId equals b.Id into bJoin
                           from b in bJoin.DefaultIfEmpty()
                           join d in _context.Departments.AsNoTracking() on r.DepartmentId equals d.Id into dJoin
                           from d in dJoin.DefaultIfEmpty()
                           join div in _context.Divisions.AsNoTracking() on r.DivisionId equals div.Id into divJoin
                           from div in divJoin.DefaultIfEmpty()
                           join repEmp in _context.Employees.AsNoTracking() on r.ReplacementEmployeeId equals repEmp.Id into repEmpJoin
                           from repEmp in repEmpJoin.DefaultIfEmpty()
                           orderby r.CreatedOn descending
                           select new JobRequisitionDto
                           {
                               Id = r.Id,
                               RequisitionNumber = r.RequisitionNumber,
                               PositionId = r.PositionId,
                               PositionTitleEn = jt != null ? jt.TitleEn : p.PositionCode,
                               PositionTitleAr = jt != null ? jt.TitleAr : p.PositionCode,
                               BranchId = r.BranchId,
                               BranchNameEn = b != null ? b.NameEn : string.Empty,
                               BranchNameAr = b != null ? b.NameAr : string.Empty,
                               DepartmentId = r.DepartmentId,
                               DepartmentNameEn = d != null ? d.NameEn : string.Empty,
                               DepartmentNameAr = d != null ? d.NameAr : string.Empty,
                               DivisionId = r.DivisionId,
                               DivisionNameEn = div != null ? div.NameEn : null,
                               DivisionNameAr = div != null ? div.NameAr : null,
                               RequestedByEmployeeId = r.RequestedByEmployeeId,
                               RequestedPositions = r.RequestedPositions,
                               StaffingRequestId = r.StaffingRequestId,
                               PlanningSource = r.PlanningSource,
                               HiredPositions = r.HiredPositions,
                               RemainingPositions = r.RequestedPositions - r.HiredPositions,
                               BusinessReason = r.BusinessReason,
                               EmploymentType = r.EmploymentType,
                               WorkArrangement = r.WorkArrangement,
                               TargetHireDate = r.TargetHireDate,
                               Type = r.Type,
                               ReplacementEmployeeId = r.ReplacementEmployeeId,
                               ReplacementEmployeeName = repEmp != null ? $"{repEmp.FirstName} {repEmp.LastName}".Trim() : null,
                               IsBudgeted = r.IsBudgeted,
                               BudgetJustification = r.BudgetJustification,
                               Status = r.Status,
                               SubmittedOn = r.SubmittedOn,
                               ReviewedByEmployeeId = r.ReviewedByEmployeeId,
                               ReviewedOn = r.ReviewedOn,
                               DecisionReason = r.DecisionReason,
                               CreatedOn = r.CreatedOn
                           })
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var meta = new MetaData
        {
            CurrentPage = pageNumber,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };

        return new PageResponse<JobRequisitionDto>(items, meta);
    }

    public async Task<Result<JobRequisitionDto>> GetJobRequisitionByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await (from r in _context.JobRequisitions.AsNoTracking().Where(r => r.Id == id)
                          join p in _context.Positions.AsNoTracking() on r.PositionId equals p.Id into pJoin
                          from p in pJoin.DefaultIfEmpty()
                          join jt in _context.JobTitles.AsNoTracking() on p.JobTitleId equals jt.Id into jtJoin
                          from jt in jtJoin.DefaultIfEmpty()
                          join b in _context.Branches.AsNoTracking() on r.BranchId equals b.Id into bJoin
                          from b in bJoin.DefaultIfEmpty()
                          join d in _context.Departments.AsNoTracking() on r.DepartmentId equals d.Id into dJoin
                          from d in dJoin.DefaultIfEmpty()
                          join div in _context.Divisions.AsNoTracking() on r.DivisionId equals div.Id into divJoin
                          from div in divJoin.DefaultIfEmpty()
                          join repEmp in _context.Employees.AsNoTracking() on r.ReplacementEmployeeId equals repEmp.Id into repEmpJoin
                          from repEmp in repEmpJoin.DefaultIfEmpty()
                          select new JobRequisitionDto
                          {
                              Id = r.Id,
                              RequisitionNumber = r.RequisitionNumber,
                              PositionId = r.PositionId,
                              PositionTitleEn = jt != null ? jt.TitleEn : p.PositionCode,
                              PositionTitleAr = jt != null ? jt.TitleAr : p.PositionCode,
                              BranchId = r.BranchId,
                              BranchNameEn = b != null ? b.NameEn : string.Empty,
                              BranchNameAr = b != null ? b.NameAr : string.Empty,
                              DepartmentId = r.DepartmentId,
                              DepartmentNameEn = d != null ? d.NameEn : string.Empty,
                              DepartmentNameAr = d != null ? d.NameAr : string.Empty,
                              DivisionId = r.DivisionId,
                              DivisionNameEn = div != null ? div.NameEn : null,
                              DivisionNameAr = div != null ? div.NameAr : null,
                              RequestedByEmployeeId = r.RequestedByEmployeeId,
                              RequestedPositions = r.RequestedPositions,
                              StaffingRequestId = r.StaffingRequestId,
                              PlanningSource = r.PlanningSource,
                              HiredPositions = r.HiredPositions,
                              RemainingPositions = r.RequestedPositions - r.HiredPositions,
                              BusinessReason = r.BusinessReason,
                              EmploymentType = r.EmploymentType,
                              WorkArrangement = r.WorkArrangement,
                              TargetHireDate = r.TargetHireDate,
                              Type = r.Type,
                              ReplacementEmployeeId = r.ReplacementEmployeeId,
                              ReplacementEmployeeName = repEmp != null ? $"{repEmp.FirstName} {repEmp.LastName}".Trim() : null,
                              IsBudgeted = r.IsBudgeted,
                              BudgetJustification = r.BudgetJustification,
                              Status = r.Status,
                              SubmittedOn = r.SubmittedOn,
                              ReviewedByEmployeeId = r.ReviewedByEmployeeId,
                              ReviewedOn = r.ReviewedOn,
                              DecisionReason = r.DecisionReason,
                              CreatedOn = r.CreatedOn
                          }).FirstOrDefaultAsync(cancellationToken);

        return item is not null
            ? Result.Success(item)
            : Result.Failure<JobRequisitionDto>(RecruitmentErrors.JobRequisitionNotFound);
    }

    public async Task<Result<PositionHeadcountSummaryDto>> GetPositionHeadcountSummaryAsync(int positionId, CancellationToken cancellationToken = default)
    {
        var position = await (from p in _context.Positions.AsNoTracking().Where(p => p.Id == positionId)
                              join jt in _context.JobTitles.AsNoTracking() on p.JobTitleId equals jt.Id into jtJoin
                              from jt in jtJoin.DefaultIfEmpty()
                              select new
                              {
                                  p.Id,
                                  p.PositionCode,
                                  p.TargetHeadcount,
                                  JobTitleEn = jt != null ? jt.TitleEn : p.PositionCode,
                                  JobTitleAr = jt != null ? jt.TitleAr : p.PositionCode
                              }).FirstOrDefaultAsync(cancellationToken);

        if (position is null)
            return Result.Failure<PositionHeadcountSummaryDto>(RecruitmentErrors.PositionNotFound);

        var today = DateOnly.FromDateTime(_clock.GetUtcNow().UtcDateTime);
        var activeHeadcount = await _context.EmployeeAssignments.AsNoTracking()
            .CountAsync(a => a.PositionId == positionId && a.IsPrimary && (a.EffectiveTo == null || a.EffectiveTo >= today), cancellationToken);

        var capacity = await (from envelope in _context.PositionEnvelopes.AsNoTracking()
                              join budget in _context.WorkforceBudgets.AsNoTracking()
                                  on envelope.WorkforceBudgetId equals budget.Id
                              join fiscalYear in _context.FiscalYears.AsNoTracking()
                                  on envelope.FiscalYearId equals fiscalYear.Id
                              where envelope.PositionId == positionId
                                    && budget.Status == WorkforceBudgetStatus.Approved
                                    && budget.ActivatedOn.HasValue
                                    && !budget.SupersededOn.HasValue
                                    && fiscalYear.Status == FiscalYearStatus.Open
                              select envelope)
            .GroupBy(_ => 1)
            .Select(group => new
            {
                Authorized = group.Sum(envelope => envelope.AuthorizedHeadcount),
                Reserved = group.Sum(envelope => envelope.ReservedHeadcount),
                Hired = group.Sum(envelope => envelope.HiredHeadcount)
            })
            .FirstOrDefaultAsync(cancellationToken);

        var targetHeadcount = capacity?.Authorized ?? position.TargetHeadcount;
        var pendingRequisitionsCount = capacity?.Reserved ?? 0;
        var availableHeadcount = capacity is null
            ? position.TargetHeadcount - activeHeadcount
            : capacity.Authorized - capacity.Reserved - capacity.Hired;
        if (availableHeadcount < 0)
            return Result.Failure<PositionHeadcountSummaryDto>(RecruitmentErrors.InvalidOperation);

        var summary = new PositionHeadcountSummaryDto(
            PositionId: position.Id,
            PositionCode: position.PositionCode,
            JobTitleEn: position.JobTitleEn,
            JobTitleAr: position.JobTitleAr,
            TargetHeadcount: targetHeadcount,
            ActiveHeadcount: activeHeadcount,
            PendingRequisitionsCount: pendingRequisitionsCount,
            AvailableHeadcount: availableHeadcount,
            ExceedsHeadcount: availableHeadcount == 0);

        return Result.Success(summary);
    }

    public async Task<IReadOnlyList<ApprovedStaffingRequestOptionDto>> GetApprovedStaffingRequestOptionsAsync(
        CancellationToken cancellationToken = default) =>
         await (from request in _context.StaffingRequests.AsNoTracking()
               join envelope in _context.PositionEnvelopes.AsNoTracking()
                   on request.EnvelopeId equals envelope.Id
               join budget in _context.WorkforceBudgets.AsNoTracking()
                   on envelope.WorkforceBudgetId equals budget.Id
               join fiscalYear in _context.FiscalYears.AsNoTracking()
                   on envelope.FiscalYearId equals fiscalYear.Id
               where request.Status == StaffingRequestStatus.Approved &&
                     budget.Status == WorkforceBudgetStatus.Approved &&
                     budget.ActivatedOn.HasValue &&
                     !budget.SupersededOn.HasValue &&
                     fiscalYear.Status == FiscalYearStatus.Open &&
                      request.RequestedHeadcount > request.AllocatedRequisitionPositions
               orderby request.TargetStartDate, envelope.EnvelopeCode
               select new ApprovedStaffingRequestOptionDto(
                   request.Id,
                   envelope.EnvelopeCode,
                   envelope.PositionId,
                   envelope.BranchId,
                   envelope.DepartmentId,
                   envelope.DivisionId,
                   request.RequestedHeadcount - request.AllocatedRequisitionPositions,
                   request.RequestedHeadcount - request.HiredPositions,
                   request.EstimatedFiscalYearCostPerSlot,
                   request.CurrencyCode,
                   request.TargetStartDate))
            .Take(200)
            .ToListAsync(cancellationToken);

    public async Task<Result<JobRequisitionDto>> CreateJobRequisitionAsync(JobRequisitionMutation mutation, CancellationToken cancellationToken = default)
    {
        if (mutation.StaffingRequestId.HasValue)
            return await CreatePlannedJobRequisitionAsync(mutation, cancellationToken);

        if (_requireStaffingRequest)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.StaffingRequestRequired);

        var position = await _context.Positions.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == mutation.PositionId, cancellationToken);

        if (position is null)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.PositionNotFound);

        var today = DateOnly.FromDateTime(_clock.GetUtcNow().UtcDateTime);

        // Headcount governance calculation
        var activeHeadcount = await _context.EmployeeAssignments.AsNoTracking()
            .CountAsync(a => a.PositionId == mutation.PositionId && a.IsPrimary && (a.EffectiveTo == null || a.EffectiveTo >= today), cancellationToken);

        var pendingRequisitionsCount = await _context.JobRequisitions.AsNoTracking()
            .Where(r => r.PositionId == mutation.PositionId &&
                        (r.Status == JobRequisitionStatus.Draft ||
                         r.Status == JobRequisitionStatus.PendingApproval ||
                         r.Status == JobRequisitionStatus.Approved))
            .SumAsync(r => (int?)r.RequestedPositions, cancellationToken) ?? 0;

        var availableHeadcount = Math.Max(0, position.TargetHeadcount - (activeHeadcount + pendingRequisitionsCount));

        bool isBudgeted;
        if (mutation.Type == RequisitionType.Replacement)
        {
            if (!mutation.ReplacementEmployeeId.HasValue)
                return Result.Failure<JobRequisitionDto>(RecruitmentErrors.ReplacementEmployeeRequired);

            var replacementEmp = await _context.Employees.AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == mutation.ReplacementEmployeeId.Value, cancellationToken);
            if (replacementEmp is null)
                return Result.Failure<JobRequisitionDto>(RecruitmentErrors.ReplacementEmployeeRequired);

            isBudgeted = mutation.IsBudgeted ?? true;
        }
        else
        {
            // New Position: if requested count exceeds available headcount, flag unbudgeted and require justification
            if (mutation.RequestedPositions > availableHeadcount)
            {
                isBudgeted = false;
                if (string.IsNullOrWhiteSpace(mutation.BudgetJustification))
                {
                    return Result.Failure<JobRequisitionDto>(RecruitmentErrors.BudgetJustificationRequired);
                }
            }
            else
            {
                isBudgeted = mutation.IsBudgeted ?? true;
            }
        }

        var reqNumber = $"REQ-{_clock.GetUtcNow():yyyyMM}-{Guid.NewGuid().ToString()[..4].ToUpper()}";
        var requestedByEmployeeId = ResolveActorEmployeeId();

        var requisition = new JobRequisition(
            reqNumber,
            mutation.PositionId,
            mutation.BranchId,
            mutation.DepartmentId,
            requestedByEmployeeId,
            mutation.RequestedPositions);

        requisition.UpdateDetails(
            mutation.BusinessReason,
            mutation.EmploymentType,
            mutation.WorkArrangement,
            mutation.TargetHireDate,
            mutation.DivisionId);

        requisition.SetBudgetAndType(
            mutation.Type,
            mutation.ReplacementEmployeeId,
            isBudgeted,
            mutation.BudgetJustification);

        SetScope(requisition);
        _context.JobRequisitions.Add(requisition);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobRequisitionByIdAsync(requisition.Id, cancellationToken);
    }

    private async Task<Result<JobRequisitionDto>> CreatePlannedJobRequisitionAsync(
        JobRequisitionMutation mutation,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_currentActor.TenantId) || _currentActor.CompanyId is not > 0)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.CompanyContextRequired);

        var staffingRequestId = mutation.StaffingRequestId!.Value;
        var tenantId = _currentActor.TenantId;
        var companyId = _currentActor.CompanyId.Value;
        var staffingRequestLock = $"WorkforcePlanning:StaffingRequests:{tenantId}:{companyId}:{staffingRequestId}";
        var createResult = await _context.ExecuteAtomicallyAsync(
            [
                $"Recruitment:Requisitions:{tenantId}:{companyId}",
                staffingRequestLock,
                WorkforcePlanLocks.Company(tenantId, companyId)
            ],
            async token =>
            {
                var staffingRequest = await _context.StaffingRequests
                    .FirstOrDefaultAsync(request => request.Id == staffingRequestId, token);
                if (staffingRequest is null ||
                    staffingRequest.Status != StaffingRequestStatus.Approved ||
                    staffingRequest.RemainingAllocatable < mutation.RequestedPositions)
                {
                    return Result.Failure<int>(RecruitmentErrors.StaffingRequestNotApproved);
                }

                var envelope = await _context.PositionEnvelopes
                    .FirstOrDefaultAsync(item => item.Id == staffingRequest.EnvelopeId, token);
                if (envelope is null)
                    return Result.Failure<int>(RecruitmentErrors.StaffingRequestNotApproved);
                var budgetIsEffective = await _context.WorkforceBudgets.AsNoTracking()
                    .AnyAsync(budget => budget.Id == envelope.WorkforceBudgetId
                        && budget.Status == WorkforceBudgetStatus.Approved
                        && budget.ActivatedOn.HasValue
                        && !budget.SupersededOn.HasValue, token);
                var fiscalYearIsOpen = await _context.FiscalYears.AsNoTracking()
                    .AnyAsync(year => year.Id == envelope.FiscalYearId && year.Status == FiscalYearStatus.Open, token);
                if (!budgetIsEffective || !fiscalYearIsOpen)
                    return Result.Failure<int>(RecruitmentErrors.StaffingRequestNotApproved);
                if (!envelope.BranchId.HasValue)
                    return Result.Failure<int>(RecruitmentErrors.StaffingRequestRequiresBranch);

                if (mutation.Type == RequisitionType.Replacement)
                {
                    if (!mutation.ReplacementEmployeeId.HasValue ||
                        !await _context.Employees.AsNoTracking().AnyAsync(
                            employee => employee.Id == mutation.ReplacementEmployeeId.Value,
                            token))
                    {
                        return Result.Failure<int>(RecruitmentErrors.ReplacementEmployeeRequired);
                    }
                }

                var now = _clock.GetUtcNow().UtcDateTime;
                var requisition = new JobRequisition(
                    $"REQ-{now:yyyyMM}-{Guid.NewGuid().ToString()[..4].ToUpperInvariant()}",
                    envelope.PositionId,
                    envelope.BranchId.Value,
                    envelope.DepartmentId,
                    ResolveActorEmployeeId(),
                    mutation.RequestedPositions);
                requisition.UpdateDetails(
                    mutation.BusinessReason,
                    mutation.EmploymentType,
                    mutation.WorkArrangement,
                    mutation.TargetHireDate,
                    envelope.DivisionId);
                requisition.SetBudgetAndType(
                    mutation.Type,
                    mutation.ReplacementEmployeeId,
                    true,
                    null);
                requisition.LinkToStaffingRequest(staffingRequest.Id);
                SetScope(requisition);

                staffingRequest.RegisterAllocation(mutation.RequestedPositions);
                _context.JobRequisitions.Add(requisition);
                await _context.SaveChangesAsync(token);
                return Result.Success(requisition.Id);
            },
            cancellationToken);

        if (createResult.IsFailure)
            return Result.Failure<JobRequisitionDto>(createResult.Error);
        return await GetJobRequisitionByIdAsync(createResult.Value, cancellationToken);
    }

    public async Task<Result<JobRequisitionDto>> SubmitJobRequisitionAsync(int id, CancellationToken cancellationToken = default)
    {
        var requisition = await _context.JobRequisitions.FindAsync([id], cancellationToken);
        if (requisition is null)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.JobRequisitionNotFound);

        requisition.Submit(_clock.GetUtcNow());
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobRequisitionByIdAsync(requisition.Id, cancellationToken);
    }

    public async Task<Result<JobRequisitionDto>> ApproveJobRequisitionAsync(int id, CancellationToken cancellationToken = default)
    {
        var requisition = await _context.JobRequisitions.FindAsync([id], cancellationToken);
        if (requisition is null)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.JobRequisitionNotFound);

        requisition.Approve(ResolveActorEmployeeId(), _clock.GetUtcNow());
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobRequisitionByIdAsync(requisition.Id, cancellationToken);
    }

    public async Task<Result<JobRequisitionDto>> RejectJobRequisitionAsync(int id, string reason, CancellationToken cancellationToken = default)
    {
        var requisition = await _context.JobRequisitions.FindAsync([id], cancellationToken);
        if (requisition is null)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.JobRequisitionNotFound);

        requisition.Reject(ResolveActorEmployeeId(), reason, _clock.GetUtcNow());
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobRequisitionByIdAsync(requisition.Id, cancellationToken);
    }

    public async Task<Result<JobRequisitionDto>> CancelJobRequisitionAsync(
        int id,
        string reason,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_currentActor.TenantId) || _currentActor.CompanyId is not > 0)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.CompanyContextRequired);
        var normalizedReason = reason?.Trim() ?? string.Empty;
        if (normalizedReason.Length == 0 || normalizedReason.Length > 1000)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.InvalidOperation);

        var tenantId = _currentActor.TenantId;
        var companyId = _currentActor.CompanyId.Value;
        var preRequisition = await _context.JobRequisitions.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (preRequisition is null)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.JobRequisitionNotFound);

        var lockResources = new List<string> { $"Recruitment:Requisitions:{tenantId}:{companyId}:{id}" };
        if (preRequisition.PlanningSource == PlanningSource.Planned && preRequisition.StaffingRequestId is > 0)
        {
            var preStaffing = await _context.StaffingRequests.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == preRequisition.StaffingRequestId.Value, cancellationToken);
            if (preStaffing is not null)
            {
                lockResources.Add($"WorkforcePlanning:StaffingRequests:{tenantId}:{companyId}:{preStaffing.Id}");
                lockResources.Add($"WorkforcePlanning:Envelopes:{tenantId}:{companyId}:{preStaffing.EnvelopeId}");
            }
        }

        Result<int> cancelResult;
        try
        {
            cancelResult = await _context.ExecuteAtomicallyAsync(
                lockResources,
                async token =>
                {
                    var requisition = await _context.JobRequisitions
                        .FirstOrDefaultAsync(item => item.Id == id, token);
                    if (requisition is null)
                        return Result.Failure<int>(RecruitmentErrors.JobRequisitionNotFound);

                    var hasActiveOpening = await _context.JobOpenings.AsNoTracking().AnyAsync(
                        opening => opening.JobRequisitionId == id &&
                            (opening.Status == JobOpeningStatus.Draft ||
                             opening.Status == JobOpeningStatus.Open ||
                             opening.Status == JobOpeningStatus.Paused),
                        token);
                    if (hasActiveOpening)
                        return Result.Failure<int>(RecruitmentErrors.RequisitionHasActiveOpenings);
                    if (requisition.Status is not (JobRequisitionStatus.Draft or JobRequisitionStatus.PendingApproval or JobRequisitionStatus.Approved or JobRequisitionStatus.Rejected))
                        return Result.Failure<int>(RecruitmentErrors.InvalidOperation);

                    StaffingRequest? staffingRequest = null;
                    if (requisition.PlanningSource == PlanningSource.Planned && requisition.StaffingRequestId.HasValue)
                    {
                        staffingRequest = await _context.StaffingRequests
                            .FirstOrDefaultAsync(request => request.Id == requisition.StaffingRequestId.Value, token);
                        if (staffingRequest is null || staffingRequest.Status != StaffingRequestStatus.Approved)
                            return Result.Failure<int>(RecruitmentErrors.StaffingRequestNotApproved);
                    }

                    // Let the transaction roll back if a domain invariant is
                    // violated after a tracked staffing mutation.
                    var releasablePositions = requisition.ReleasablePositions;
                    if (staffingRequest is not null && releasablePositions > 0)
                        staffingRequest.ReleaseAllocation(releasablePositions);
                    requisition.Cancel(normalizedReason);
                    await _context.SaveChangesAsync(token);
                    return Result.Success(requisition.Id);
                },
                cancellationToken);
        }
        catch (DomainRuleException)
        {
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.InvalidOperation);
        }

        if (cancelResult.IsFailure)
            return Result.Failure<JobRequisitionDto>(cancelResult.Error);
        return await GetJobRequisitionByIdAsync(cancelResult.Value, cancellationToken);
    }

    // ==========================================
    // Job Openings
    // ==========================================
    public async Task<PageResponse<JobOpeningDto>> GetJobOpeningsPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        JobOpeningStatus? status,
        int? departmentId,
        CancellationToken cancellationToken = default)
    {
        var query = _context.JobOpenings.AsNoTracking();

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        if (departmentId.HasValue)
            query = query.Where(o => o.DepartmentId == departmentId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(o => o.OpeningNumber.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await (from o in query
                           join p in _context.Positions.AsNoTracking() on o.PositionId equals p.Id into pJoin
                           from p in pJoin.DefaultIfEmpty()
                           join jt in _context.JobTitles.AsNoTracking() on p.JobTitleId equals jt.Id into jtJoin
                           from jt in jtJoin.DefaultIfEmpty()
                           join b in _context.Branches.AsNoTracking() on o.BranchId equals b.Id into bJoin
                           from b in bJoin.DefaultIfEmpty()
                           join d in _context.Departments.AsNoTracking() on o.DepartmentId equals d.Id into dJoin
                           from d in dJoin.DefaultIfEmpty()
                           join div in _context.Divisions.AsNoTracking() on o.DivisionId equals div.Id into divJoin
                           from div in divJoin.DefaultIfEmpty()
                           orderby o.CreatedOn descending
                           select new JobOpeningDto
                           {
                               Id = o.Id,
                               PublicId = o.PublicId,
                               OpeningNumber = o.OpeningNumber,
                               JobRequisitionId = o.JobRequisitionId,
                               PositionId = o.PositionId,
                               PositionTitleEn = jt != null ? jt.TitleEn : p.PositionCode,
                               PositionTitleAr = jt != null ? jt.TitleAr : p.PositionCode,
                               BranchId = o.BranchId,
                               BranchNameEn = b != null ? b.NameEn : string.Empty,
                               BranchNameAr = b != null ? b.NameAr : string.Empty,
                               DepartmentId = o.DepartmentId,
                               DepartmentNameEn = d != null ? d.NameEn : string.Empty,
                               DepartmentNameAr = d != null ? d.NameAr : string.Empty,
                               DivisionId = o.DivisionId,
                               DivisionNameEn = div != null ? div.NameEn : null,
                               DivisionNameAr = div != null ? div.NameAr : null,
                               PositionCount = o.PositionCount,
                               HiredCount = o.HiredCount,
                               AvailablePositions = o.PositionCount - o.HiredCount,
                               EmploymentType = o.EmploymentType,
                               WorkArrangement = o.WorkArrangement,
                               Status = o.Status,
                               OpenedOn = o.OpenedOn,
                               ClosedOn = o.ClosedOn,
                               ClosureReason = o.ClosureReason,
                               CreatedOn = o.CreatedOn,
                               ActiveApplicationsCount = _context.EmploymentApplications.Count(a =>
                                   a.JobOpeningId == o.Id &&
                                   a.Status != ApplicationStatus.Rejected &&
                                   a.Status != ApplicationStatus.Withdrawn &&
                                   a.Status != ApplicationStatus.Hired)
                           })
            .Skip((pageNumber - 1) * pageSize)
             .Take(pageSize)
             .ToListAsync(cancellationToken);

        var meta = new MetaData
        {
            CurrentPage = pageNumber,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };

        return new PageResponse<JobOpeningDto>(items, meta);
    }

    public async Task<Result<JobOpeningDto>> GetJobOpeningByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await (from o in _context.JobOpenings.AsNoTracking().Where(o => o.Id == id)
                          join p in _context.Positions.AsNoTracking() on o.PositionId equals p.Id into pJoin
                          from p in pJoin.DefaultIfEmpty()
                          join jt in _context.JobTitles.AsNoTracking() on p.JobTitleId equals jt.Id into jtJoin
                          from jt in jtJoin.DefaultIfEmpty()
                          join b in _context.Branches.AsNoTracking() on o.BranchId equals b.Id into bJoin
                          from b in bJoin.DefaultIfEmpty()
                          join d in _context.Departments.AsNoTracking() on o.DepartmentId equals d.Id into dJoin
                          from d in dJoin.DefaultIfEmpty()
                          join div in _context.Divisions.AsNoTracking() on o.DivisionId equals div.Id into divJoin
                          from div in divJoin.DefaultIfEmpty()
                          select new JobOpeningDto
                          {
                              Id = o.Id,
                              PublicId = o.PublicId,
                              OpeningNumber = o.OpeningNumber,
                              JobRequisitionId = o.JobRequisitionId,
                              PositionId = o.PositionId,
                              PositionTitleEn = jt != null ? jt.TitleEn : p.PositionCode,
                              PositionTitleAr = jt != null ? jt.TitleAr : p.PositionCode,
                              BranchId = o.BranchId,
                              BranchNameEn = b != null ? b.NameEn : string.Empty,
                              BranchNameAr = b != null ? b.NameAr : string.Empty,
                              DepartmentId = o.DepartmentId,
                              DepartmentNameEn = d != null ? d.NameEn : string.Empty,
                              DepartmentNameAr = d != null ? d.NameAr : string.Empty,
                              DivisionId = o.DivisionId,
                              DivisionNameEn = div != null ? div.NameEn : null,
                              DivisionNameAr = div != null ? div.NameAr : null,
                              PositionCount = o.PositionCount,
                              HiredCount = o.HiredCount,
                              AvailablePositions = o.PositionCount - o.HiredCount,
                              EmploymentType = o.EmploymentType,
                              WorkArrangement = o.WorkArrangement,
                              Status = o.Status,
                              OpenedOn = o.OpenedOn,
                              ClosedOn = o.ClosedOn,
                              ClosureReason = o.ClosureReason,
                              CreatedOn = o.CreatedOn,
                              ActiveApplicationsCount = _context.EmploymentApplications.Count(a =>
                                  a.JobOpeningId == o.Id &&
                                  a.Status != ApplicationStatus.Rejected &&
                                  a.Status != ApplicationStatus.Withdrawn &&
                                  a.Status != ApplicationStatus.Hired)
                          }).FirstOrDefaultAsync(cancellationToken);

        if (item is null)
            return Result.Failure<JobOpeningDto>(RecruitmentErrors.JobOpeningNotFound);

        var jobDesc = await _context.JobDescriptions
            .AsNoTracking()
            .Where(jd => jd.PositionId == item.PositionId && jd.Status == HrManagementSystem.Domain.OrganizationalStructure.Enums.JobDescriptionStatus.Approved)
            .OrderByDescending(jd => jd.Version)
            .FirstOrDefaultAsync(cancellationToken);

        if (jobDesc is not null)
        {
            var defaultWeight = jobDesc.Skills.Count > 0 ? 100 / jobDesc.Skills.Count : 0;
            item = item with
            {
                JobDescriptionId = jobDesc.Id,
                Skills = jobDesc.Skills.Select(s => new JobSkillDto(s.SkillName, s.ProficiencyLevel, s.IsMandatory, defaultWeight)).ToList()
            };
        }

        return Result.Success(item);
    }

    public async Task<Result<JobOpeningDto>> CreateJobOpeningAsync(JobOpeningMutation mutation, CancellationToken cancellationToken = default)
    {
        var openingNumber = $"JOB-{_clock.GetUtcNow():yyyyMM}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

        int reqId = mutation.JobRequisitionId;
        var existingReq = reqId > 0
            ? await _context.JobRequisitions.FirstOrDefaultAsync(r => r.Id == reqId, cancellationToken)
            : null;

        if (existingReq is null)
        {
            return Result.Failure<JobOpeningDto>(RecruitmentErrors.JobRequisitionNotFound);
        }

        if (existingReq.Status != JobRequisitionStatus.Approved)
        {
            return Result.Failure<JobOpeningDto>(RecruitmentErrors.JobRequisitionNotApproved);
        }

        var opening = new JobOpening(
            openingNumber,
            reqId,
            mutation.PositionId,
            mutation.BranchId,
            mutation.DepartmentId,
            mutation.PositionCount,
            mutation.EmploymentType,
            mutation.WorkArrangement,
            mutation.DivisionId);

        SetScope(opening);
        _context.JobOpenings.Add(opening);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobOpeningByIdAsync(opening.Id, cancellationToken);
    }

    public async Task<Result<JobOpeningDto>> OpenJobOpeningAsync(int id, CancellationToken cancellationToken = default)
    {
        var opening = await _context.JobOpenings.FindAsync([id], cancellationToken);
        if (opening is null)
            return Result.Failure<JobOpeningDto>(RecruitmentErrors.JobOpeningNotFound);

        opening.Open(_clock.GetUtcNow());
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobOpeningByIdAsync(opening.Id, cancellationToken);
    }

    public async Task<Result<JobOpeningDto>> PauseJobOpeningAsync(int id, string reason, CancellationToken cancellationToken = default)
    {
        var opening = await _context.JobOpenings.FindAsync([id], cancellationToken);
        if (opening is null)
            return Result.Failure<JobOpeningDto>(RecruitmentErrors.JobOpeningNotFound);

        opening.Pause(reason);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobOpeningByIdAsync(opening.Id, cancellationToken);
    }

    public async Task<Result<JobOpeningDto>> CloseJobOpeningAsync(int id, string reason, CancellationToken cancellationToken = default)
    {
        var opening = await _context.JobOpenings.FindAsync([id], cancellationToken);
        if (opening is null)
            return Result.Failure<JobOpeningDto>(RecruitmentErrors.JobOpeningNotFound);

        opening.Close(reason, _clock.GetUtcNow());
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobOpeningByIdAsync(opening.Id, cancellationToken);
    }

    // ==========================================
    // Job Postings
    // ==========================================
    public async Task<PageResponse<JobPostingDto>> GetJobPostingsPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        JobPostingStatus? status,
        CancellationToken cancellationToken = default)
    {
        var query = _context.JobPostings.AsNoTracking();

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(p => p.TitleEn.ToLower().Contains(term) || p.TitleAr.ToLower().Contains(term) || p.Slug.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await (from jp in query
                           join o in _context.JobOpenings.AsNoTracking() on jp.JobOpeningId equals o.Id
                           join p in _context.Positions.AsNoTracking() on o.PositionId equals p.Id into pJoin
                           from p in pJoin.DefaultIfEmpty()
                           join jt in _context.JobTitles.AsNoTracking() on p.JobTitleId equals jt.Id into jtJoin
                           from jt in jtJoin.DefaultIfEmpty()
                           orderby jp.CreatedOn descending
                           select new JobPostingDto
                           {
                               Id = jp.Id,
                               PublicId = jp.PublicId,
                               JobOpeningId = jp.JobOpeningId,
                               OpeningNumber = o.OpeningNumber,
                               PositionTitleEn = jt != null ? jt.TitleEn : p.PositionCode,
                               PositionTitleAr = jt != null ? jt.TitleAr : p.PositionCode,
                               Slug = jp.Slug,
                               Audience = jp.Audience,
                               TitleEn = jp.TitleEn,
                               TitleAr = jp.TitleAr,
                               DescriptionEn = jp.DescriptionEn,
                               DescriptionAr = jp.DescriptionAr,
                               ResponsibilitiesEn = jp.ResponsibilitiesEn,
                               ResponsibilitiesAr = jp.ResponsibilitiesAr,
                               RequirementsEn = jp.RequirementsEn,
                               RequirementsAr = jp.RequirementsAr,
                               LocationTextEn = jp.LocationTextEn,
                               LocationTextAr = jp.LocationTextAr,
                               Status = jp.Status,
                               ScheduledPublishOn = jp.ScheduledPublishOn,
                               PublishedOn = jp.PublishedOn,
                               ClosesOn = jp.ClosesOn,
                               ClosedOn = jp.ClosedOn,
                               CreatedOn = jp.CreatedOn
                           })
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var meta = new MetaData
        {
            CurrentPage = pageNumber,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };

        return new PageResponse<JobPostingDto>(items, meta);
    }

    public async Task<Result<JobPostingDto>> GetJobPostingByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await (from jp in _context.JobPostings.AsNoTracking().Where(jp => jp.Id == id)
                          join o in _context.JobOpenings.AsNoTracking() on jp.JobOpeningId equals o.Id
                          join p in _context.Positions.AsNoTracking() on o.PositionId equals p.Id into pJoin
                          from p in pJoin.DefaultIfEmpty()
                          join jt in _context.JobTitles.AsNoTracking() on p.JobTitleId equals jt.Id into jtJoin
                          from jt in jtJoin.DefaultIfEmpty()
                          select new JobPostingDto
                          {
                              Id = jp.Id,
                              PublicId = jp.PublicId,
                              JobOpeningId = jp.JobOpeningId,
                              OpeningNumber = o.OpeningNumber,
                              PositionTitleEn = jt != null ? jt.TitleEn : p.PositionCode,
                              PositionTitleAr = jt != null ? jt.TitleAr : p.PositionCode,
                              Slug = jp.Slug,
                              Audience = jp.Audience,
                              TitleEn = jp.TitleEn,
                              TitleAr = jp.TitleAr,
                              DescriptionEn = jp.DescriptionEn,
                              DescriptionAr = jp.DescriptionAr,
                              ResponsibilitiesEn = jp.ResponsibilitiesEn,
                              ResponsibilitiesAr = jp.ResponsibilitiesAr,
                              RequirementsEn = jp.RequirementsEn,
                              RequirementsAr = jp.RequirementsAr,
                              LocationTextEn = jp.LocationTextEn,
                              LocationTextAr = jp.LocationTextAr,
                              Status = jp.Status,
                              ScheduledPublishOn = jp.ScheduledPublishOn,
                              PublishedOn = jp.PublishedOn,
                              ClosesOn = jp.ClosesOn,
                              ClosedOn = jp.ClosedOn,
                              CreatedOn = jp.CreatedOn
                          }).FirstOrDefaultAsync(cancellationToken);

        return item is not null
            ? Result.Success(item)
            : Result.Failure<JobPostingDto>(RecruitmentErrors.JobPostingNotFound);
    }

    public async Task<Result<JobPostingDto>> CreateJobPostingAsync(JobPostingMutation mutation, CancellationToken cancellationToken = default)
    {
        var slugNormalized = mutation.Slug.Trim().ToLowerInvariant();
        var exists = await _context.JobPostings.AnyAsync(p => p.Slug == slugNormalized, cancellationToken);
        if (exists)
            return Result.Failure<JobPostingDto>(RecruitmentErrors.JobPostingSlugAlreadyExists);

        var posting = new JobPosting(
            mutation.JobOpeningId,
            slugNormalized,
            mutation.Audience,
            mutation.TitleEn,
            mutation.TitleAr);

        posting.UpdateContent(
            mutation.TitleEn,
            mutation.TitleAr,
            mutation.DescriptionEn,
            mutation.DescriptionAr,
            mutation.ResponsibilitiesEn,
            mutation.ResponsibilitiesAr,
            mutation.RequirementsEn,
            mutation.RequirementsAr,
            mutation.LocationTextEn,
            mutation.LocationTextAr,
            mutation.Audience);

        if (mutation.ScheduledPublishOn.HasValue)
            posting.Schedule(mutation.ScheduledPublishOn.Value, mutation.ClosesOn);

        SetScope(posting);
        _context.JobPostings.Add(posting);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobPostingByIdAsync(posting.Id, cancellationToken);
    }

    public async Task<Result<JobPostingDto>> UpdateJobPostingAsync(int id, JobPostingMutation mutation, CancellationToken cancellationToken = default)
    {
        var posting = await _context.JobPostings.FindAsync([id], cancellationToken);
        if (posting is null)
            return Result.Failure<JobPostingDto>(RecruitmentErrors.JobPostingNotFound);

        posting.UpdateContent(
            mutation.TitleEn,
            mutation.TitleAr,
            mutation.DescriptionEn,
            mutation.DescriptionAr,
            mutation.ResponsibilitiesEn,
            mutation.ResponsibilitiesAr,
            mutation.RequirementsEn,
            mutation.RequirementsAr,
            mutation.LocationTextEn,
            mutation.LocationTextAr,
            mutation.Audience);

        await _context.SaveChangesAsync(cancellationToken);
        return await GetJobPostingByIdAsync(posting.Id, cancellationToken);
    }

    public async Task<Result<JobPostingDto>> PublishJobPostingAsync(int id, CancellationToken cancellationToken = default)
    {
        var posting = await _context.JobPostings.FindAsync([id], cancellationToken);
        if (posting is null)
            return Result.Failure<JobPostingDto>(RecruitmentErrors.JobPostingNotFound);

        posting.Publish(_clock.GetUtcNow());
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobPostingByIdAsync(posting.Id, cancellationToken);
    }

    public async Task<Result<JobPostingDto>> CloseJobPostingAsync(int id, CancellationToken cancellationToken = default)
    {
        var posting = await _context.JobPostings.FindAsync([id], cancellationToken);
        if (posting is null)
            return Result.Failure<JobPostingDto>(RecruitmentErrors.JobPostingNotFound);

        posting.Close(_clock.GetUtcNow());
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobPostingByIdAsync(posting.Id, cancellationToken);
    }

    // ==========================================
    // Employment Applications
    // ==========================================
    public async Task<PageResponse<EmploymentApplicationDto>> GetApplicationsPageAsync(
        int pageNumber,
        int pageSize,
        string? search,
        int? jobOpeningId,
        ApplicationStatus? status,
        CancellationToken cancellationToken = default)
    {
        var query = _context.EmploymentApplications.AsNoTracking();

        if (jobOpeningId.HasValue)
            query = query.Where(a => a.JobOpeningId == jobOpeningId.Value);

        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(a =>
                _context.Candidates.Any(c => c.Id == a.CandidateId &&
                    (c.FirstName.ToLower().Contains(term) ||
                     c.LastName.ToLower().Contains(term) ||
                     c.Email.ToLower().Contains(term))));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var apps = await (from a in query
                          join c in _context.Candidates.AsNoTracking() on a.CandidateId equals c.Id
                          join o in _context.JobOpenings.AsNoTracking() on a.JobOpeningId equals o.Id
                          join p in _context.Positions.AsNoTracking() on o.PositionId equals p.Id into pJoin
                          from p in pJoin.DefaultIfEmpty()
                          join jt in _context.JobTitles.AsNoTracking() on p.JobTitleId equals jt.Id into jtJoin
                          from jt in jtJoin.DefaultIfEmpty()
                          join d in _context.Departments.AsNoTracking() on o.DepartmentId equals d.Id into dJoin
                          from d in dJoin.DefaultIfEmpty()
                          join b in _context.Branches.AsNoTracking() on o.BranchId equals b.Id into bJoin
                          from b in bJoin.DefaultIfEmpty()
                          orderby a.LastStatusChangedOn descending
                          select new
                          {
                              Application = a,
                              CandidateName = c.FirstName + (c.MiddleName != null ? " " + c.MiddleName : "") + " " + c.LastName,
                              CandidateEmail = c.Email,
                              CandidatePhone = c.PhoneNumber,
                              OpeningNumber = o.OpeningNumber,
                              PositionTitleEn = jt != null ? jt.TitleEn : p.PositionCode,
                              PositionTitleAr = jt != null ? jt.TitleAr : p.PositionCode,
                              DepartmentNameEn = d != null ? d.NameEn : string.Empty,
                              DepartmentNameAr = d != null ? d.NameAr : string.Empty,
                              BranchNameEn = b != null ? b.NameEn : string.Empty,
                              BranchNameAr = b != null ? b.NameAr : string.Empty,
                              InterviewsCount = _context.Interviews.Count(i => i.EmploymentApplicationId == a.Id),
                              AverageEvaluationScore = _context.Interviews
                                  .Where(i => i.EmploymentApplicationId == a.Id)
                                  .SelectMany(i => i.Evaluations)
                                  .Select(e => (decimal?)e.Score)
                                  .Average()
                          })
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var applicationIds = apps.Select(x => x.Application.Id).ToList();
        var histories = await _context.ApplicationStatusHistories
            .AsNoTracking()
            .Where(h => applicationIds.Contains(h.EmploymentApplicationId))
            .OrderBy(h => h.ChangedOn)
            .ToListAsync(cancellationToken);

        var items = apps.Select(x => new EmploymentApplicationDto
        {
            Id = x.Application.Id,
            PublicId = x.Application.PublicId,
            CandidateId = x.Application.CandidateId,
            CandidateName = x.CandidateName,
            CandidateEmail = x.CandidateEmail,
            CandidatePhone = x.CandidatePhone,
            JobOpeningId = x.Application.JobOpeningId,
            OpeningNumber = x.OpeningNumber,
            PositionTitleEn = x.PositionTitleEn,
            PositionTitleAr = x.PositionTitleAr,
            DepartmentNameEn = x.DepartmentNameEn,
            DepartmentNameAr = x.DepartmentNameAr,
            BranchNameEn = x.BranchNameEn,
            BranchNameAr = x.BranchNameAr,
            JobPostingId = x.Application.JobPostingId,
            Source = x.Application.Source,
            Status = x.Application.Status,
            CoverLetter = x.Application.CoverLetter,
            ResumeFileId = x.Application.ResumeFileId,
            ExpectedSalary = x.Application.ExpectedSalary,
            ExpectedSalaryCurrencyCode = x.Application.ExpectedSalaryCurrencyCode,
            AvailableFrom = x.Application.AvailableFrom,
            SubmittedOn = x.Application.SubmittedOn,
            LastStatusChangedOn = x.Application.LastStatusChangedOn,
            EmployeeId = x.Application.EmployeeId,
            InterviewsCount = x.InterviewsCount,
            AverageEvaluationScore = x.AverageEvaluationScore.HasValue ? Math.Round(x.AverageEvaluationScore.Value, 1) : null,
            StatusHistory = histories
                .Where(h => h.EmploymentApplicationId == x.Application.Id)
                .Select(h => new ApplicationStatusHistoryDto
                {
                    Id = h.Id,
                    FromStatus = h.FromStatus,
                    ToStatus = h.ToStatus,
                    ChangedOn = h.ChangedOn,
                    Reason = h.Reason,
                    ChangedByEmployeeId = h.ChangedByEmployeeId
                })
                .ToList()
        }).ToList();

        var meta = new MetaData
        {
            CurrentPage = pageNumber,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };

        return new PageResponse<EmploymentApplicationDto>(items, meta);
    }

    public async Task<Result<EmploymentApplicationDto>> GetApplicationByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var app = await (from a in _context.EmploymentApplications.AsNoTracking().Where(a => a.Id == id)
                         join c in _context.Candidates.AsNoTracking() on a.CandidateId equals c.Id
                         join o in _context.JobOpenings.AsNoTracking() on a.JobOpeningId equals o.Id
                         join p in _context.Positions.AsNoTracking() on o.PositionId equals p.Id into pJoin
                         from p in pJoin.DefaultIfEmpty()
                         join jt in _context.JobTitles.AsNoTracking() on p.JobTitleId equals jt.Id into jtJoin
                         from jt in jtJoin.DefaultIfEmpty()
                         join d in _context.Departments.AsNoTracking() on o.DepartmentId equals d.Id into dJoin
                         from d in dJoin.DefaultIfEmpty()
                         join b in _context.Branches.AsNoTracking() on o.BranchId equals b.Id into bJoin
                         from b in bJoin.DefaultIfEmpty()
                         select new
                         {
                             Application = a,
                             CandidateName = c.FirstName + (c.MiddleName != null ? " " + c.MiddleName : "") + " " + c.LastName,
                             CandidateEmail = c.Email,
                             CandidatePhone = c.PhoneNumber,
                             OpeningNumber = o.OpeningNumber,
                             PositionTitleEn = jt != null ? jt.TitleEn : p.PositionCode,
                             PositionTitleAr = jt != null ? jt.TitleAr : p.PositionCode,
                             DepartmentNameEn = d != null ? d.NameEn : string.Empty,
                             DepartmentNameAr = d != null ? d.NameAr : string.Empty,
                             BranchNameEn = b != null ? b.NameEn : string.Empty,
                             BranchNameAr = b != null ? b.NameAr : string.Empty,
                             InterviewsCount = _context.Interviews.Count(i => i.EmploymentApplicationId == a.Id),
                             AverageEvaluationScore = _context.Interviews
                                 .Where(i => i.EmploymentApplicationId == a.Id)
                                 .SelectMany(i => i.Evaluations)
                                 .Select(e => (decimal?)e.Score)
                                 .Average()
                         }).FirstOrDefaultAsync(cancellationToken);

        if (app is null)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.EmploymentApplicationNotFound);

        var histories = await _context.ApplicationStatusHistories
            .AsNoTracking()
            .Where(h => h.EmploymentApplicationId == id)
            .OrderBy(h => h.ChangedOn)
            .ToListAsync(cancellationToken);

        var dto = new EmploymentApplicationDto
        {
            Id = app.Application.Id,
            PublicId = app.Application.PublicId,
            CandidateId = app.Application.CandidateId,
            CandidateName = app.CandidateName,
            CandidateEmail = app.CandidateEmail,
            CandidatePhone = app.CandidatePhone,
            JobOpeningId = app.Application.JobOpeningId,
            OpeningNumber = app.OpeningNumber,
            PositionTitleEn = app.PositionTitleEn,
            PositionTitleAr = app.PositionTitleAr,
            DepartmentNameEn = app.DepartmentNameEn,
            DepartmentNameAr = app.DepartmentNameAr,
            BranchNameEn = app.BranchNameEn,
            BranchNameAr = app.BranchNameAr,
            JobPostingId = app.Application.JobPostingId,
            Source = app.Application.Source,
            Status = app.Application.Status,
            CoverLetter = app.Application.CoverLetter,
            ResumeFileId = app.Application.ResumeFileId,
            ExpectedSalary = app.Application.ExpectedSalary,
            ExpectedSalaryCurrencyCode = app.Application.ExpectedSalaryCurrencyCode,
            AvailableFrom = app.Application.AvailableFrom,
            SubmittedOn = app.Application.SubmittedOn,
            LastStatusChangedOn = app.Application.LastStatusChangedOn,
            EmployeeId = app.Application.EmployeeId,
            InterviewsCount = app.InterviewsCount,
            AverageEvaluationScore = app.AverageEvaluationScore.HasValue ? Math.Round(app.AverageEvaluationScore.Value, 1) : null,
            StatusHistory = histories.Select(h => new ApplicationStatusHistoryDto
            {
                Id = h.Id,
                FromStatus = h.FromStatus,
                ToStatus = h.ToStatus,
                ChangedOn = h.ChangedOn,
                Reason = h.Reason,
                ChangedByEmployeeId = h.ChangedByEmployeeId
            }).ToList()
        };

        return Result.Success(dto);
    }

    public async Task<Result<EmploymentApplicationDto>> SubmitApplicationAsync(SubmitApplicationMutation mutation, CancellationToken cancellationToken = default)
    {
        var opening = await _context.JobOpenings.FindAsync([mutation.JobOpeningId], cancellationToken);
        if (opening is null)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.JobOpeningNotFound);

        if (opening.Status != JobOpeningStatus.Open)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.JobOpeningNotOpen);

        var candidate = await _context.Candidates.FindAsync([mutation.CandidateId], cancellationToken);
        if (candidate is null)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.CandidateNotFound);

        var now = _clock.GetUtcNow();
        var app = new EmploymentApplication(
            mutation.CandidateId,
            mutation.JobOpeningId,
            mutation.Source,
            now,
            mutation.JobPostingId);

        app.UpdateDraft(
            mutation.CoverLetter,
            mutation.ResumeFileId,
            mutation.ExpectedSalary,
            mutation.ExpectedSalaryCurrencyCode,
            mutation.AvailableFrom);

        app.Submit(now);

        SetScope(app);
        _context.EmploymentApplications.Add(app);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetApplicationByIdAsync(app.Id, cancellationToken);
    }

    public async Task<Result<EmploymentApplicationDto>> MoveApplicationStageAsync(
        int id,
        ApplicationStatus targetStatus,
        string? reason,
        CancellationToken cancellationToken = default)
    {
        var app = await _context.EmploymentApplications
            .Include(a => a.StatusHistory)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (app is null)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.EmploymentApplicationNotFound);

        var now = _clock.GetUtcNow();
        var actorId = ResolveActorEmployeeId();

        switch (targetStatus)
        {
            case ApplicationStatus.UnderReview:
                app.BeginReview(now, actorId);
                break;
            case ApplicationStatus.Shortlisted:
                app.Shortlist(now, actorId, reason);
                break;
            case ApplicationStatus.InterviewScheduled:
                app.ScheduleInterview(now, actorId);
                break;
            case ApplicationStatus.Interviewed:
                app.RecordInterviewCompleted(now, actorId);
                break;
            case ApplicationStatus.OfferIssued:
                app.RecordOfferIssued(now, actorId);
                break;
            case ApplicationStatus.OfferAccepted:
                app.RecordOfferAccepted(now);
                break;
            case ApplicationStatus.OfferDeclined:
                app.RecordOfferDeclined(reason ?? "Declined", now);
                break;
            case ApplicationStatus.Rejected:
                app.Reject(reason ?? "Rejected", now, actorId);
                break;
            case ApplicationStatus.Withdrawn:
                app.Withdraw(reason ?? "Withdrawn", now);
                break;
            default:
                return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.InvalidOperation);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return await GetApplicationByIdAsync(app.Id, cancellationToken);
    }

    public async Task<Result<EmploymentApplicationDto>> RejectApplicationAsync(int id, string reason, CancellationToken cancellationToken = default)
    {
        return await MoveApplicationStageAsync(id, ApplicationStatus.Rejected, reason, cancellationToken);
    }

    public async Task<Result<EmploymentApplicationDto>> WithdrawApplicationAsync(int id, string reason, CancellationToken cancellationToken = default)
    {
        return await MoveApplicationStageAsync(id, ApplicationStatus.Withdrawn, reason, cancellationToken);
    }

    public async Task<Result<EmploymentApplicationDto>> HireApplicationAsync(int id, HireCandidateMutation mutation, CancellationToken cancellationToken = default)
    {
        var tenantId = _currentActor.TenantId ?? string.Empty;
        var companyId = _currentActor.CompanyId ?? 0;
        if (string.IsNullOrWhiteSpace(tenantId) || companyId <= 0)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.CompanyContextRequired);
        var idempotencyHint = mutation.IdempotencyKey?.Trim();
        if (idempotencyHint?.Length > 128)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.InvalidOperation);
        var employeeNumberHint = !string.IsNullOrWhiteSpace(mutation.EmployeeNumber)
            ? mutation.EmployeeNumber.Trim().ToUpperInvariant()
            : string.Empty;
        var lockResources = new List<string>
        {
            $"Recruitment:Hires:{tenantId}:{companyId}",
            WorkforcePlanLocks.Company(tenantId, companyId),
            $"Recruitment:Applications:{tenantId}:{companyId}:{id}",
            $"Recruitment:Idempotency:{tenantId}:{companyId}:{idempotencyHint ?? "none"}",
            $"Recruitment:Employees:Number:{tenantId}:{companyId}:{employeeNumberHint}",
        };
        // Resolve the full hire lineage before opening the transaction so all
        // competing mutations (offer, opening, requisition, staffing request,
        // and envelope) use the same deterministic lock ordering. The
        // operation re-reads every row after acquiring these locks.
        var preApplication = await _context.EmploymentApplications.AsNoTracking()
            .FirstOrDefaultAsync(application => application.Id == id, cancellationToken);
        if (preApplication is not null)
        {
            var preOffer = await _context.JobOffers.AsNoTracking()
                .FirstOrDefaultAsync(offer => offer.EmploymentApplicationId == id && offer.Status == JobOfferStatus.Accepted, cancellationToken);
            var preOpening = await _context.JobOpenings.AsNoTracking()
                .FirstOrDefaultAsync(opening => opening.Id == preApplication.JobOpeningId, cancellationToken);
            var preRequisition = preOpening is null
                ? null
                : await _context.JobRequisitions.AsNoTracking()
                    .FirstOrDefaultAsync(requisition => requisition.Id == preOpening.JobRequisitionId, cancellationToken);
            var preStaffing = preRequisition?.StaffingRequestId is > 0
                ? await _context.StaffingRequests.AsNoTracking()
                    .FirstOrDefaultAsync(request => request.Id == preRequisition.StaffingRequestId.Value, cancellationToken)
                : null;
            var preEnvelope = preStaffing is null
                ? null
                : await _context.PositionEnvelopes.AsNoTracking()
                    .FirstOrDefaultAsync(envelope => envelope.Id == preStaffing.EnvelopeId, cancellationToken);
            if (preOffer is not null)
                lockResources.Add($"Recruitment:Offers:{tenantId}:{companyId}:{preOffer.Id}");
            if (preOpening is not null)
                lockResources.Add($"Recruitment:Openings:{tenantId}:{companyId}:{preOpening.Id}");
            if (preRequisition is not null)
                lockResources.Add($"Recruitment:Requisitions:{tenantId}:{companyId}:{preRequisition.Id}");
            if (preStaffing is not null)
                lockResources.Add($"WorkforcePlanning:StaffingRequests:{tenantId}:{companyId}:{preStaffing.Id}");
            if (preEnvelope is not null)
                lockResources.Add($"WorkforcePlanning:Envelopes:{tenantId}:{companyId}:{preEnvelope.Id}");
        }
        var now = _clock.GetUtcNow();
        var actorId = ResolveActorEmployeeId();

        var result = await _context.ExecuteAtomicallyAsync(
            lockResources,
            async token =>
            {
                if (!string.IsNullOrWhiteSpace(idempotencyHint))
                {
                    var replay = await _context.EmploymentApplications
                        .AsNoTracking()
                        .FirstOrDefaultAsync(a => a.HireIdempotencyKey == idempotencyHint, token);
                    if (replay is not null)
                    {
                        if (replay.Id != id)
                            return Result.Failure<int>(RecruitmentErrors.InvalidOperation);
                        if (replay.EmployeeId is > 0)
                            return Result.Success(replay.Id);
                    }
                }

                var app = await _context.EmploymentApplications
                    .Include(a => a.StatusHistory)
                    .FirstOrDefaultAsync(a => a.Id == id, token);
                if (app is null)
                    return Result.Failure<int>(RecruitmentErrors.EmploymentApplicationNotFound);

                // Idempotent retry: an already-hired application returns its employee.
                if (app.Status == ApplicationStatus.Hired)
                    return Result.Success(app.Id);

                if (app.Status != ApplicationStatus.OfferAccepted)
                    return Result.Failure<int>(RecruitmentErrors.AcceptedOfferRequired);

                var acceptedOffer = await _context.JobOffers
                    .FirstOrDefaultAsync(o => o.EmploymentApplicationId == app.Id &&
                        o.Status == JobOfferStatus.Accepted, token);
                if (acceptedOffer is null)
                    return Result.Failure<int>(RecruitmentErrors.AcceptedOfferRequired);

                var candidate = await _context.Candidates.FindAsync([app.CandidateId], token);
                if (candidate is null)
                    return Result.Failure<int>(RecruitmentErrors.CandidateNotFound);

                var opening = await _context.JobOpenings.FirstOrDefaultAsync(o => o.Id == app.JobOpeningId, token);
                if (opening is null)
                    return Result.Failure<int>(RecruitmentErrors.JobOpeningNotFound);
                if (opening.Status is not (JobOpeningStatus.Open or JobOpeningStatus.Paused) || opening.AvailablePositions <= 0)
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);

                var requisition = await _context.JobRequisitions.FirstOrDefaultAsync(r => r.Id == opening.JobRequisitionId, token);
                if (requisition is null)
                    return Result.Failure<int>(RecruitmentErrors.JobRequisitionNotFound);
                if (requisition.Status != JobRequisitionStatus.Approved || requisition.ReleasablePositions <= 0)
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);

                StaffingRequest? staffingRequest = null;
                PositionEnvelope? envelope = null;
                if (requisition.PlanningSource == PlanningSource.Planned && requisition.StaffingRequestId.HasValue)
                {
                    staffingRequest = await _context.StaffingRequests.FirstOrDefaultAsync(request => request.Id == requisition.StaffingRequestId.Value, token);
                    if (staffingRequest is null)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    if (!string.Equals(staffingRequest.CurrencyCode, acceptedOffer.CurrencyCode, StringComparison.OrdinalIgnoreCase))
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    envelope = await _context.PositionEnvelopes.FirstOrDefaultAsync(item => item.Id == staffingRequest.EnvelopeId, token);
                    if (envelope is null)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                }

                var hireDate = mutation.HireDate != default
                    ? mutation.HireDate
                    : acceptedOffer.ProposedStartDate;
                var employeeNumber = employeeNumberHint.Length > 0
                    ? employeeNumberHint
                    : $"EMP-{hireDate.Year}{hireDate.Month:D2}-{candidate.Id:D4}";

                var existingEmployee = await _context.Employees
                    .AsNoTracking()
                    .FirstOrDefaultAsync(e => e.EmployeeNumber == employeeNumber, token);
                if (existingEmployee is not null && existingEmployee.Id != app.EmployeeId)
                    return Result.Failure<int>(RecruitmentErrors.EmployeeNumberAlreadyExists);

                // Capacity is validated before any mutation so a failure leaves no tracked side effects.
                var fiscalCost = acceptedOffer.FiscalYearCostSnapshot;
                if (envelope is not null)
                {
                    if (envelope.ReservedHeadcount < 1 || envelope.ReservedSalaryBudget < fiscalCost)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    if (staffingRequest is not null && staffingRequest.RemainingToHire < 1)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                }

                // Attach the employee graph before the single SaveChanges call.
                // EF orders the identity insert first and fixes the dependent
                // foreign keys through these navigations.
                var employee = new Employee(employeeNumber, candidate.FirstName, candidate.LastName, hireDate, candidate.Id);
                SetScope(employee);
                employee.Activate(hireDate);
                var assignment = EmployeeAssignment.ForPendingEmployee(
                    opening.PositionId,
                    opening.BranchId,
                    opening.DepartmentId,
                    hireDate,
                    true,
                    opening.DivisionId);
                SetScope(assignment);
                var contractType = acceptedOffer.EmploymentType == EmploymentType.PartTime
                    ? EmployeeContractType.Temporary
                    : EmployeeContractType.Permanent;
                var contract = EmployeeContract.ForPendingEmployee(
                    $"CON-{employeeNumber}",
                    contractType,
                    hireDate,
                    null);
                SetScope(contract);
                contract.Activate(hireDate);
                employee.Assignments.Add(assignment);
                employee.Contracts.Add(contract);
                _context.Employees.Add(employee);

                try
                {
                    if (envelope is not null)
                    {
                        envelope.ConsumeReserved(1, fiscalCost);
                        // A lower-than-estimate offer did not release its negative
                        // delta at approval. Release that unused salary slice only
                        // after the reserved slot has been consumed.
                        if (acceptedOffer.ReservationDelta < 0)
                            envelope.AdjustReservedSalary(acceptedOffer.ReservationDelta);
                    }
                    staffingRequest?.RegisterHire(1);
                    requisition.RegisterHire();
                    opening.RegisterHire(now);
                    app.MarkHiredForPendingEmployee(employee, now, actorId, idempotencyHint);
                }
                catch (DomainRuleException)
                {
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);
                }

                await _context.SaveChangesAsync(token);
                return Result.Success(app.Id);
            },
            cancellationToken);
        if (result.IsFailure)
            return Result.Failure<EmploymentApplicationDto>(result.Error);
        return await GetApplicationByIdAsync(result.Value, cancellationToken);
    }

    // ==========================================
    // Interviews
    // ==========================================
    public async Task<PageResponse<InterviewDto>> GetInterviewsPageAsync(
        int pageNumber,
        int pageSize,
        int? applicationId,
        InterviewStatus? status,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Interviews
            .Include(i => i.Participants)
            .Include(i => i.Evaluations)
            .AsNoTracking();

        if (applicationId.HasValue)
            query = query.Where(i => i.EmploymentApplicationId == applicationId.Value);

        if (status.HasValue)
            query = query.Where(i => i.Status == status.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await (from i in query
                           join a in _context.EmploymentApplications.AsNoTracking() on i.EmploymentApplicationId equals a.Id
                           join c in _context.Candidates.AsNoTracking() on a.CandidateId equals c.Id
                           join o in _context.JobOpenings.AsNoTracking() on a.JobOpeningId equals o.Id
                           join p in _context.Positions.AsNoTracking() on o.PositionId equals p.Id into pJoin
                           from p in pJoin.DefaultIfEmpty()
                           join jt in _context.JobTitles.AsNoTracking() on p.JobTitleId equals jt.Id into jtJoin
                           from jt in jtJoin.DefaultIfEmpty()
                           orderby i.StartsOn descending
                           select new InterviewDto
                           {
                               Id = i.Id,
                               EmploymentApplicationId = i.EmploymentApplicationId,
                               CandidateName = c.FirstName + (c.MiddleName != null ? " " + c.MiddleName : "") + " " + c.LastName,
                               OpeningNumber = o.OpeningNumber,
                               PositionTitleEn = jt != null ? jt.TitleEn : p.PositionCode,
                               PositionTitleAr = jt != null ? jt.TitleAr : p.PositionCode,
                               Type = i.Type,
                               Status = i.Status,
                               StartsOn = i.StartsOn,
                               EndsOn = i.EndsOn,
                               CompletedOn = i.CompletedOn,
                               LocationOrMeetingUrl = i.LocationOrMeetingUrl,
                               CancellationReason = i.CancellationReason,
                               Participants = i.Participants.Select(part => new InterviewParticipantDto
                               {
                                   Id = part.Id,
                                   EmployeeId = part.EmployeeId,
                                   EmployeeName = $"Interviewer #{part.EmployeeId}",
                                   IsLead = part.IsLead
                               }).ToList(),
                               Evaluations = i.Evaluations.Select(eval => new InterviewEvaluationDto
                               {
                                   Id = eval.Id,
                                   InterviewerEmployeeId = eval.InterviewerEmployeeId,
                                   InterviewerName = $"Interviewer #{eval.InterviewerEmployeeId}",
                                   Score = eval.Score,
                                   Recommendation = eval.Recommendation,
                                   Comments = eval.Comments,
                                   SubmittedOn = eval.SubmittedOn
                               }).ToList()
                           })
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var meta = new MetaData
        {
            CurrentPage = pageNumber,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };

        return new PageResponse<InterviewDto>(items, meta);
    }

    public async Task<Result<InterviewDto>> GetInterviewByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await (from i in _context.Interviews.Include(x => x.Participants).Include(x => x.Evaluations).AsNoTracking().Where(i => i.Id == id)
                          join a in _context.EmploymentApplications.AsNoTracking() on i.EmploymentApplicationId equals a.Id
                          join c in _context.Candidates.AsNoTracking() on a.CandidateId equals c.Id
                          join o in _context.JobOpenings.AsNoTracking() on a.JobOpeningId equals o.Id
                          join p in _context.Positions.AsNoTracking() on o.PositionId equals p.Id into pJoin
                          from p in pJoin.DefaultIfEmpty()
                          join jt in _context.JobTitles.AsNoTracking() on p.JobTitleId equals jt.Id into jtJoin
                          from jt in jtJoin.DefaultIfEmpty()
                          select new InterviewDto
                          {
                              Id = i.Id,
                              EmploymentApplicationId = i.EmploymentApplicationId,
                              CandidateName = c.FirstName + (c.MiddleName != null ? " " + c.MiddleName : "") + " " + c.LastName,
                              OpeningNumber = o.OpeningNumber,
                              PositionTitleEn = jt != null ? jt.TitleEn : p.PositionCode,
                              PositionTitleAr = jt != null ? jt.TitleAr : p.PositionCode,
                              Type = i.Type,
                              Status = i.Status,
                              StartsOn = i.StartsOn,
                              EndsOn = i.EndsOn,
                              CompletedOn = i.CompletedOn,
                              LocationOrMeetingUrl = i.LocationOrMeetingUrl,
                              CancellationReason = i.CancellationReason,
                              Participants = i.Participants.Select(part => new InterviewParticipantDto
                              {
                                  Id = part.Id,
                                  EmployeeId = part.EmployeeId,
                                  EmployeeName = $"Interviewer #{part.EmployeeId}",
                                  IsLead = part.IsLead
                              }).ToList(),
                              Evaluations = i.Evaluations.Select(eval => new InterviewEvaluationDto
                              {
                                  Id = eval.Id,
                                  InterviewerEmployeeId = eval.InterviewerEmployeeId,
                                  InterviewerName = $"Interviewer #{eval.InterviewerEmployeeId}",
                                  Score = eval.Score,
                                  Recommendation = eval.Recommendation,
                                  Comments = eval.Comments,
                                  SubmittedOn = eval.SubmittedOn,
                                  SkillEvaluationsJson = eval.SkillEvaluationsJson
                              }).ToList()
                          }).FirstOrDefaultAsync(cancellationToken);

        if (item is null)
            return Result.Failure<InterviewDto>(RecruitmentErrors.InterviewNotFound);

        if (item.Evaluations.Count > 0)
        {
            var evalsWithSkills = item.Evaluations.Select(e =>
            {
                if (string.IsNullOrEmpty(e.SkillEvaluationsJson))
                    return e;

                try
                {
                    var skills = System.Text.Json.JsonSerializer.Deserialize<List<InterviewSkillEvaluationDto>>(e.SkillEvaluationsJson) ?? [];
                    return e with { SkillEvaluations = skills };
                }
                catch
                {
                    return e;
                }
            }).ToList();

            item = item with { Evaluations = evalsWithSkills };
        }

        return Result.Success(item);
    }

    public async Task<Result<InterviewDto>> ScheduleInterviewAsync(ScheduleInterviewMutation mutation, CancellationToken cancellationToken = default)
    {
        var application = await _context.EmploymentApplications
            .Include(a => a.StatusHistory)
            .FirstOrDefaultAsync(a => a.Id == mutation.EmploymentApplicationId, cancellationToken);

        if (application is null)
            return Result.Failure<InterviewDto>(RecruitmentErrors.EmploymentApplicationNotFound);

        var interview = new Interview(
            mutation.EmploymentApplicationId,
            mutation.Type,
            mutation.StartsOn,
            mutation.EndsOn,
            mutation.LocationOrMeetingUrl);

        var leadId = mutation.LeadEmployeeId ?? ResolveActorEmployeeId();
        interview.AddInterviewer(leadId, isLead: true);

        if (mutation.ParticipantEmployeeIds is not null)
        {
            foreach (var participantId in mutation.ParticipantEmployeeIds)
            {
                if (participantId != leadId)
                    interview.AddInterviewer(participantId, isLead: false);
            }
        }

        // Advance application to InterviewScheduled if it was Shortlisted
        if (application.Status == ApplicationStatus.Shortlisted)
        {
            application.ScheduleInterview(_clock.GetUtcNow(), ResolveActorEmployeeId());
        }

        SetScope(interview);
        _context.Interviews.Add(interview);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetInterviewByIdAsync(interview.Id, cancellationToken);
    }

    public async Task<Result<InterviewDto>> CancelInterviewAsync(int id, string reason, CancellationToken cancellationToken = default)
    {
        var interview = await _context.Interviews.FindAsync([id], cancellationToken);
        if (interview is null)
            return Result.Failure<InterviewDto>(RecruitmentErrors.InterviewNotFound);

        interview.Cancel(reason);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetInterviewByIdAsync(interview.Id, cancellationToken);
    }

    public async Task<Result<InterviewDto>> CompleteInterviewAsync(int id, CancellationToken cancellationToken = default)
    {
        var interview = await _context.Interviews
            .Include(i => i.Participants)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        if (interview is null)
            return Result.Failure<InterviewDto>(RecruitmentErrors.InterviewNotFound);

        interview.Complete(_clock.GetUtcNow());

        // Update application to Interviewed if in InterviewScheduled
        var app = await _context.EmploymentApplications
            .Include(a => a.StatusHistory)
            .FirstOrDefaultAsync(a => a.Id == interview.EmploymentApplicationId, cancellationToken);

        if (app is not null && app.Status == ApplicationStatus.InterviewScheduled)
        {
            app.RecordInterviewCompleted(_clock.GetUtcNow(), ResolveActorEmployeeId());
        }

        await _context.SaveChangesAsync(cancellationToken);
        return await GetInterviewByIdAsync(interview.Id, cancellationToken);
    }

    public async Task<Result<InterviewDto>> SubmitInterviewEvaluationAsync(int interviewId, SubmitInterviewEvaluationMutation mutation, CancellationToken cancellationToken = default)
    {
        var interview = await _context.Interviews
            .Include(i => i.Participants)
            .Include(i => i.Evaluations)
            .FirstOrDefaultAsync(i => i.Id == interviewId, cancellationToken);

        if (interview is null)
            return Result.Failure<InterviewDto>(RecruitmentErrors.InterviewNotFound);

        var evaluatorId = ResolveActorEmployeeId();

        // If evaluator isn't in participants, ensure they are registered as participant first
        if (interview.Participants.All(p => p.EmployeeId != evaluatorId))
        {
            if (interview.Participants.Count > 0)
                evaluatorId = interview.Participants.First().EmployeeId;
        }

        string? skillJson = null;
        decimal finalScore = mutation.Score;

        if (mutation.SkillEvaluations is not null && mutation.SkillEvaluations.Any())
        {
            var skillList = mutation.SkillEvaluations.ToList();
            skillJson = System.Text.Json.JsonSerializer.Serialize(skillList);

            if (finalScore <= 0 && skillList.Count > 0)
            {
                var totalWeight = skillList.Sum(s => s.WeightPercentage ?? 1);
                if (totalWeight > 0)
                {
                    var weightedSum = skillList.Sum(s => (decimal)s.Score * (s.WeightPercentage ?? 1));
                    finalScore = Math.Round(weightedSum / totalWeight, 2);
                }
            }
        }

        interview.SubmitEvaluation(
            evaluatorId,
            finalScore,
            mutation.Recommendation,
            mutation.Comments,
            _clock.GetUtcNow(),
            skillJson);

        await _context.SaveChangesAsync(cancellationToken);
        return await GetInterviewByIdAsync(interview.Id, cancellationToken);
    }

    public async Task<Result<InterviewScorecardTemplateDto>> GetInterviewScorecardTemplateAsync(int interviewId, CancellationToken cancellationToken = default)
    {
        var interviewData = await (from i in _context.Interviews.AsNoTracking().Where(i => i.Id == interviewId)
                                   join a in _context.EmploymentApplications.AsNoTracking() on i.EmploymentApplicationId equals a.Id
                                   join c in _context.Candidates.AsNoTracking() on a.CandidateId equals c.Id
                                   join o in _context.JobOpenings.AsNoTracking() on a.JobOpeningId equals o.Id
                                   join p in _context.Positions.AsNoTracking() on o.PositionId equals p.Id into pJoin
                                   from p in pJoin.DefaultIfEmpty()
                                   join jt in _context.JobTitles.AsNoTracking() on p.JobTitleId equals jt.Id into jtJoin
                                   from jt in jtJoin.DefaultIfEmpty()
                                   select new
                                   {
                                       InterviewId = i.Id,
                                       ApplicationId = a.Id,
                                       PositionId = o.PositionId,
                                       CandidateName = c.FirstName + (c.MiddleName != null ? " " + c.MiddleName : "") + " " + c.LastName,
                                       PositionTitleEn = jt != null ? jt.TitleEn : (p != null ? p.PositionCode : string.Empty),
                                       PositionTitleAr = jt != null ? jt.TitleAr : (p != null ? p.PositionCode : string.Empty)
                                   }).FirstOrDefaultAsync(cancellationToken);

        if (interviewData is null)
            return Result.Failure<InterviewScorecardTemplateDto>(RecruitmentErrors.InterviewNotFound);

        var jobDesc = await _context.JobDescriptions
            .AsNoTracking()
            .Where(jd => jd.PositionId == interviewData.PositionId && jd.Status == HrManagementSystem.Domain.OrganizationalStructure.Enums.JobDescriptionStatus.Approved)
            .OrderByDescending(jd => jd.Version)
            .FirstOrDefaultAsync(cancellationToken);

        var skills = new List<JobSkillDto>();

        if (jobDesc is not null && jobDesc.Skills.Count > 0)
        {
            var defaultWeight = Math.Max(1, 100 / jobDesc.Skills.Count);
            skills = jobDesc.Skills.Select(s => new JobSkillDto(
                s.SkillName,
                s.ProficiencyLevel,
                s.IsMandatory,
                defaultWeight)).ToList();
        }
        else
        {
            skills =
            [
                new("الكفاءة الفنية والمهنية / Technical Competency", "Advanced", true, 30),
                new("حل المشكلات والتفكير التحليلي / Problem Solving", "Advanced", true, 25),
                new("التواصل والعمل الجماعي / Communication & Teamwork", "Intermediate", false, 25),
                new("التوافق المؤسسي وقيم العمل / Culture & Value Fit", "Intermediate", false, 20)
            ];
        }

        var template = new InterviewScorecardTemplateDto(
            interviewData.InterviewId,
            interviewData.ApplicationId,
            interviewData.CandidateName,
            interviewData.PositionTitleEn,
            interviewData.PositionTitleAr,
            jobDesc?.Id,
            skills);

        return Result.Success(template);
    }

    // ==========================================
    // Job Offers
    // ==========================================
    public async Task<PageResponse<JobOfferDto>> GetJobOffersPageAsync(
        int pageNumber,
        int pageSize,
        int? applicationId,
        JobOfferStatus? status,
        CancellationToken cancellationToken = default)
    {
        var query = _context.JobOffers.AsNoTracking();

        if (applicationId.HasValue)
            query = query.Where(o => o.EmploymentApplicationId == applicationId.Value);

        if (status.HasValue)
            query = query.Where(o => o.Status == status.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await (from o in query
                           join a in _context.EmploymentApplications.AsNoTracking() on o.EmploymentApplicationId equals a.Id
                           join c in _context.Candidates.AsNoTracking() on a.CandidateId equals c.Id
                           join p in _context.Positions.AsNoTracking() on o.PositionId equals p.Id into pJoin
                           from p in pJoin.DefaultIfEmpty()
                           join jt in _context.JobTitles.AsNoTracking() on p.JobTitleId equals jt.Id into jtJoin
                           from jt in jtJoin.DefaultIfEmpty()
                           join b in _context.Branches.AsNoTracking() on o.BranchId equals b.Id into bJoin
                           from b in bJoin.DefaultIfEmpty()
                           join d in _context.Departments.AsNoTracking() on o.DepartmentId equals d.Id into dJoin
                           from d in dJoin.DefaultIfEmpty()
                           orderby o.CreatedOn descending
                           select new JobOfferDto
                           {
                               Id = o.Id,
                               PublicId = o.PublicId,
                               OfferNumber = o.OfferNumber,
                               EmploymentApplicationId = o.EmploymentApplicationId,
                               CandidateName = c.FirstName + (c.MiddleName != null ? " " + c.MiddleName : "") + " " + c.LastName,
                               PositionId = o.PositionId,
                               PositionTitleEn = jt != null ? jt.TitleEn : p.PositionCode,
                               PositionTitleAr = jt != null ? jt.TitleAr : p.PositionCode,
                               BranchId = o.BranchId,
                               BranchNameEn = b != null ? b.NameEn : string.Empty,
                               BranchNameAr = b != null ? b.NameAr : string.Empty,
                               DepartmentId = o.DepartmentId,
                               DepartmentNameEn = d != null ? d.NameEn : string.Empty,
                               DepartmentNameAr = d != null ? d.NameAr : string.Empty,
                               DivisionId = o.DivisionId,
                               BaseSalary = o.BaseSalary,
                               CurrencyCode = o.CurrencyCode,
                               PayFrequency = o.PayFrequency,
                               EmploymentType = o.EmploymentType,
                               WorkArrangement = o.WorkArrangement,
                               ProposedStartDate = o.ProposedStartDate,
                               TermsAndConditions = o.TermsAndConditions,
                               Status = o.Status,
                               IssuedOn = o.IssuedOn,
                               ExpiresOn = o.ExpiresOn,
                               RespondedOn = o.RespondedOn,
                                ResponseReason = o.ResponseReason,
                                AnnualSalarySnapshot = o.AnnualSalarySnapshot,
                                FiscalYearCostSnapshot = o.FiscalYearCostSnapshot,
                                ReservationDelta = o.ReservationDelta,
                                CalculationPolicyVersion = o.CalculationPolicyVersion,
                                ApprovalSubmittedOn = o.ApprovalSubmittedOn,
                                ApprovalSubmittedById = o.ApprovalSubmittedById,
                                ApprovedOn = o.ApprovedOn,
                                ApprovedById = o.ApprovedById,
                              ApprovalDecisionReason = o.ApprovalDecisionReason,
                              CreatedOn = o.CreatedOn
                          })
             .Skip((pageNumber - 1) * pageSize)
             .Take(pageSize)
             .ToListAsync(cancellationToken);

        // Approval history is append-only and loaded in one bounded batch so
        // offer management pages never issue an N+1 query per card.
        var offerIds = items.Select(item => item.Id).ToArray();
        if (offerIds.Length > 0)
        {
            var histories = await _context.JobOfferApprovalHistory.AsNoTracking()
                .Where(entry => offerIds.Contains(entry.JobOfferId))
                .OrderBy(entry => entry.OccurredOn)
                .Select(entry => new
                {
                    entry.JobOfferId,
                    History = new JobOfferApprovalHistoryDto(
                        entry.Id,
                        entry.Action,
                        entry.ActorUserId,
                        entry.OccurredOn,
                        entry.FromStatus,
                        entry.ToStatus,
                        entry.Reason)
                })
                .ToListAsync(cancellationToken);
            var historyByOffer = histories.GroupBy(entry => entry.JobOfferId)
                .ToDictionary(group => group.Key, group => (IReadOnlyList<JobOfferApprovalHistoryDto>)group.Select(entry => entry.History).ToList());
            items = items.Select(item => item with
            {
                ApprovalHistory = historyByOffer.TryGetValue(item.Id, out var history) ? history : []
            }).ToList();
        }

        var meta = new MetaData
        {
            CurrentPage = pageNumber,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };

        return new PageResponse<JobOfferDto>(items, meta);
    }

    public async Task<Result<JobOfferDto>> GetJobOfferByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var item = await (from o in _context.JobOffers.AsNoTracking().Where(o => o.Id == id)
                          join a in _context.EmploymentApplications.AsNoTracking() on o.EmploymentApplicationId equals a.Id
                          join c in _context.Candidates.AsNoTracking() on a.CandidateId equals c.Id
                          join p in _context.Positions.AsNoTracking() on o.PositionId equals p.Id into pJoin
                          from p in pJoin.DefaultIfEmpty()
                          join jt in _context.JobTitles.AsNoTracking() on p.JobTitleId equals jt.Id into jtJoin
                          from jt in jtJoin.DefaultIfEmpty()
                          join b in _context.Branches.AsNoTracking() on o.BranchId equals b.Id into bJoin
                          from b in bJoin.DefaultIfEmpty()
                          join d in _context.Departments.AsNoTracking() on o.DepartmentId equals d.Id into dJoin
                          from d in dJoin.DefaultIfEmpty()
                          select new JobOfferDto
                          {
                              Id = o.Id,
                              PublicId = o.PublicId,
                              OfferNumber = o.OfferNumber,
                              EmploymentApplicationId = o.EmploymentApplicationId,
                              CandidateName = c.FirstName + (c.MiddleName != null ? " " + c.MiddleName : "") + " " + c.LastName,
                              PositionId = o.PositionId,
                              PositionTitleEn = jt != null ? jt.TitleEn : p.PositionCode,
                              PositionTitleAr = jt != null ? jt.TitleAr : p.PositionCode,
                              BranchId = o.BranchId,
                              BranchNameEn = b != null ? b.NameEn : string.Empty,
                              BranchNameAr = b != null ? b.NameAr : string.Empty,
                              DepartmentId = o.DepartmentId,
                              DepartmentNameEn = d != null ? d.NameEn : string.Empty,
                              DepartmentNameAr = d != null ? d.NameAr : string.Empty,
                              DivisionId = o.DivisionId,
                              BaseSalary = o.BaseSalary,
                              CurrencyCode = o.CurrencyCode,
                              PayFrequency = o.PayFrequency,
                              EmploymentType = o.EmploymentType,
                              WorkArrangement = o.WorkArrangement,
                              ProposedStartDate = o.ProposedStartDate,
                              TermsAndConditions = o.TermsAndConditions,
                              Status = o.Status,
                              IssuedOn = o.IssuedOn,
                              ExpiresOn = o.ExpiresOn,
                              RespondedOn = o.RespondedOn,
                              ResponseReason = o.ResponseReason,
                              AnnualSalarySnapshot = o.AnnualSalarySnapshot,
                              FiscalYearCostSnapshot = o.FiscalYearCostSnapshot,
                              ReservationDelta = o.ReservationDelta,
                              CalculationPolicyVersion = o.CalculationPolicyVersion,
                              ApprovalSubmittedOn = o.ApprovalSubmittedOn,
                              ApprovalSubmittedById = o.ApprovalSubmittedById,
                              ApprovedOn = o.ApprovedOn,
                              ApprovedById = o.ApprovedById,
                              ApprovalDecisionReason = o.ApprovalDecisionReason,
                              CreatedOn = o.CreatedOn
                          }).FirstOrDefaultAsync(cancellationToken);

        if (item is null)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.JobOfferNotFound);

        var history = await _context.JobOfferApprovalHistory.AsNoTracking()
            .Where(entry => entry.JobOfferId == id)
            .OrderBy(entry => entry.OccurredOn)
            .Select(entry => new JobOfferApprovalHistoryDto(
                entry.Id,
                entry.Action,
                entry.ActorUserId,
                entry.OccurredOn,
                entry.FromStatus,
                entry.ToStatus,
                entry.Reason))
            .ToListAsync(cancellationToken);
        return Result.Success(item with { ApprovalHistory = history });
    }

    public async Task<Result<JobOfferDto>> CreateJobOfferAsync(JobOfferMutation mutation, CancellationToken cancellationToken = default)
    {
        var application = await _context.EmploymentApplications.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == mutation.EmploymentApplicationId, cancellationToken);
        if (application is null)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.EmploymentApplicationNotFound);
        if (application.Status != ApplicationStatus.Interviewed)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.InvalidOperation);
        var opening = await _context.JobOpenings.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == application.JobOpeningId, cancellationToken);
        if (opening is null)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.JobOpeningNotFound);

        var offerNumber = $"OFF-{_clock.GetUtcNow():yyyyMM}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

        var offer = new JobOffer(
            offerNumber,
            mutation.EmploymentApplicationId,
            opening.PositionId,
            opening.BranchId,
            opening.DepartmentId,
            mutation.BaseSalary,
            mutation.CurrencyCode,
            mutation.PayFrequency,
            mutation.EmploymentType,
            mutation.WorkArrangement,
            mutation.ProposedStartDate,
            opening.DivisionId);

        if (!string.IsNullOrWhiteSpace(mutation.TermsAndConditions))
        {
            offer.UpdateTerms(
                mutation.BaseSalary,
                mutation.CurrencyCode,
                mutation.PayFrequency,
                mutation.EmploymentType,
                mutation.WorkArrangement,
                mutation.ProposedStartDate,
                mutation.TermsAndConditions);
        }

        SetScope(offer);
        _context.JobOffers.Add(offer);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobOfferByIdAsync(offer.Id, cancellationToken);
    }

    public async Task<Result<JobOfferDto>> SubmitJobOfferAsync(int id, CancellationToken cancellationToken = default)
    {
        var actorUserId = _currentActor.UserId ?? string.Empty;
        if (actorUserId.Length == 0 || string.IsNullOrWhiteSpace(_currentActor.TenantId) || _currentActor.CompanyId is not > 0)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.CompanyContextRequired);

        var approvalLocks = new List<string>
        {
            $"Recruitment:Offers:{_currentActor.TenantId}:{_currentActor.CompanyId}:{id}",
            WorkforcePlanLocks.Company(_currentActor.TenantId!, _currentActor.CompanyId!.Value),
        };
        var preApprovalOffer = await _context.JobOffers.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (preApprovalOffer is not null)
        {
            var preApprovalApplication = await _context.EmploymentApplications.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == preApprovalOffer.EmploymentApplicationId, cancellationToken);
            var preApprovalOpening = preApprovalApplication is null
                ? null
                : await _context.JobOpenings.AsNoTracking()
                    .FirstOrDefaultAsync(item => item.Id == preApprovalApplication.JobOpeningId, cancellationToken);
            var preApprovalRequisition = preApprovalOpening is null
                ? null
                : await _context.JobRequisitions.AsNoTracking()
                    .FirstOrDefaultAsync(item => item.Id == preApprovalOpening.JobRequisitionId, cancellationToken);
            var preApprovalStaffing = preApprovalRequisition?.StaffingRequestId is > 0
                ? await _context.StaffingRequests.AsNoTracking()
                    .FirstOrDefaultAsync(item => item.Id == preApprovalRequisition.StaffingRequestId.Value, cancellationToken)
                : null;
            if (preApprovalStaffing is not null)
                approvalLocks.Add($"WorkforcePlanning:StaffingRequests:{_currentActor.TenantId}:{_currentActor.CompanyId}:{preApprovalStaffing.Id}");
            if (preApprovalStaffing is not null)
                approvalLocks.Add($"WorkforcePlanning:Envelopes:{_currentActor.TenantId}:{_currentActor.CompanyId}:{preApprovalStaffing.EnvelopeId}");
        }

        var result = await _context.ExecuteAtomicallyAsync(
            approvalLocks,
            async token =>
            {
                var offer = await _context.JobOffers.FirstOrDefaultAsync(item => item.Id == id, token);
                if (offer is null)
                    return Result.Failure<int>(RecruitmentErrors.JobOfferNotFound);
                var application = await _context.EmploymentApplications.AsNoTracking().FirstOrDefaultAsync(item => item.Id == offer.EmploymentApplicationId, token);
                var opening = application is null ? null : await _context.JobOpenings.AsNoTracking().FirstOrDefaultAsync(item => item.Id == application.JobOpeningId, token);
                var requisition = opening is null ? null : await _context.JobRequisitions.AsNoTracking().FirstOrDefaultAsync(item => item.Id == opening.JobRequisitionId, token);
                if (requisition is null)
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);

                var annualSalary = AnnualizeOfferSalary(offer.BaseSalary, offer.PayFrequency);
                var fiscalCost = annualSalary;
                var delta = 0m;
                if (requisition.PlanningSource == PlanningSource.Planned && requisition.StaffingRequestId.HasValue)
                {
                    var staffingRequest = await _context.StaffingRequests.AsNoTracking().FirstOrDefaultAsync(request => request.Id == requisition.StaffingRequestId.Value, token);
                    if (staffingRequest is null || !string.Equals(staffingRequest.CurrencyCode, offer.CurrencyCode, StringComparison.OrdinalIgnoreCase))
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    var envelope = await _context.PositionEnvelopes.AsNoTracking().FirstOrDefaultAsync(item => item.Id == staffingRequest.EnvelopeId, token);
                    var fiscalYear = envelope is null ? null : await _context.FiscalYears.AsNoTracking().FirstOrDefaultAsync(item => item.Id == envelope.FiscalYearId, token);
                    if (fiscalYear is null)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    fiscalCost = WorkforceCostPolicy.ComputeFiscalCostPerSlot(annualSalary, offer.ProposedStartDate, fiscalYear.StartDate, fiscalYear.EndDate);
                    delta = fiscalCost - staffingRequest.EstimatedFiscalYearCostPerSlot;
                }

                offer.SubmitForApproval(_clock.GetUtcNow(), actorUserId, annualSalary, fiscalCost, delta, WorkforceCostPolicy.PolicyVersion);
                AddOfferHistory(offer, "Submitted", actorUserId, JobOfferStatus.Draft, JobOfferStatus.PendingApproval, null);
                await _context.SaveChangesAsync(token);
                return Result.Success(offer.Id);
            }, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<JobOfferDto>(result.Error);
        return await GetJobOfferByIdAsync(result.Value, cancellationToken);
    }

    public async Task<Result<JobOfferDto>> ApproveJobOfferAsync(int id, CancellationToken cancellationToken = default)
    {
        var actorUserId = _currentActor.UserId ?? string.Empty;
        if (actorUserId.Length == 0 || string.IsNullOrWhiteSpace(_currentActor.TenantId) || _currentActor.CompanyId is not > 0)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.CompanyContextRequired);
        var tenantId = _currentActor.TenantId!;
        var companyId = _currentActor.CompanyId!.Value;
        var approvalLocks = new List<string>
        {
            $"Recruitment:Offers:{tenantId}:{companyId}:{id}",
            WorkforcePlanLocks.Company(tenantId, companyId),
        };
        var preOffer = await _context.JobOffers.AsNoTracking().FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (preOffer is not null)
        {
            approvalLocks.Add($"Recruitment:Applications:{tenantId}:{companyId}:{preOffer.EmploymentApplicationId}");
            var preApplication = await _context.EmploymentApplications.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == preOffer.EmploymentApplicationId, cancellationToken);
            var preOpening = preApplication is null ? null : await _context.JobOpenings.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == preApplication.JobOpeningId, cancellationToken);
            var preRequisition = preOpening is null ? null : await _context.JobRequisitions.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == preOpening.JobRequisitionId, cancellationToken);
            var preStaffing = preRequisition?.StaffingRequestId is > 0
                ? await _context.StaffingRequests.AsNoTracking().FirstOrDefaultAsync(item => item.Id == preRequisition.StaffingRequestId.Value, cancellationToken)
                : null;
            if (preOpening is not null) approvalLocks.Add($"Recruitment:Openings:{tenantId}:{companyId}:{preOpening.Id}");
            if (preRequisition is not null) approvalLocks.Add($"Recruitment:Requisitions:{tenantId}:{companyId}:{preRequisition.Id}");
            if (preStaffing is not null)
            {
                approvalLocks.Add($"WorkforcePlanning:StaffingRequests:{tenantId}:{companyId}:{preStaffing.Id}");
                approvalLocks.Add($"WorkforcePlanning:Envelopes:{tenantId}:{companyId}:{preStaffing.EnvelopeId}");
            }
        }

        var result = await _context.ExecuteAtomicallyAsync(
            approvalLocks,
            async token =>
            {
                var offer = await _context.JobOffers.FirstOrDefaultAsync(item => item.Id == id, token);
                if (offer is null)
                    return Result.Failure<int>(RecruitmentErrors.JobOfferNotFound);
                if (offer.Status != JobOfferStatus.PendingApproval)
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);
                if (string.Equals(actorUserId, offer.ApprovalSubmittedById, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(actorUserId, offer.CreatedById, StringComparison.OrdinalIgnoreCase))
                    return Result.Failure<int>(RecruitmentErrors.JobOfferSelfApproval);

                var application = await _context.EmploymentApplications.AsNoTracking().FirstOrDefaultAsync(item => item.Id == offer.EmploymentApplicationId, token);
                if (application is null)
                    return Result.Failure<int>(RecruitmentErrors.EmploymentApplicationNotFound);
                var opening = await _context.JobOpenings.AsNoTracking().FirstOrDefaultAsync(item => item.Id == application.JobOpeningId, token);
                if (opening is null)
                    return Result.Failure<int>(RecruitmentErrors.JobOpeningNotFound);
                var requisition = await _context.JobRequisitions.AsNoTracking().FirstOrDefaultAsync(item => item.Id == opening.JobRequisitionId, token);
                if (requisition is null)
                    return Result.Failure<int>(RecruitmentErrors.JobRequisitionNotFound);
                PositionEnvelope? envelope = null;
                if (requisition.PlanningSource == PlanningSource.Planned && requisition.StaffingRequestId.HasValue)
                {
                    var staffingRequest = await _context.StaffingRequests.AsNoTracking().FirstOrDefaultAsync(request => request.Id == requisition.StaffingRequestId.Value, token);
                    if (staffingRequest is null)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    if (!string.Equals(staffingRequest.CurrencyCode, offer.CurrencyCode, StringComparison.OrdinalIgnoreCase))
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    envelope = await _context.PositionEnvelopes.FirstOrDefaultAsync(item => item.Id == staffingRequest.EnvelopeId, token);
                    if (envelope is null)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    if (offer.ReservationDelta > 0 && envelope.AvailableSalaryBudget < offer.ReservationDelta)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    if (offer.ReservationDelta < 0 && envelope.ReservedSalaryBudget < -offer.ReservationDelta)
                        return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                }
                try { offer.Approve(_clock.GetUtcNow(), actorUserId); }
                catch (DomainRuleException exception) when (exception.Code == "Recruitment.JobOffer.SelfApproval")
                { return Result.Failure<int>(RecruitmentErrors.JobOfferSelfApproval); }
                catch (DomainRuleException)
                { return Result.Failure<int>(RecruitmentErrors.InvalidOperation); }
                if (envelope is not null)
                {
                    try
                    {
                        // Positive deltas reserve additional salary. Negative
                        // deltas intentionally remain in the original staffing
                        // reservation and are released at hire, after the slot
                        // is consumed, so another offer cannot race the refund.
                        if (offer.ReservationDelta > 0)
                            envelope.AdjustReservedSalary(offer.ReservationDelta);
                    }
                    catch (DomainRuleException) { return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity); }
                }
                AddOfferHistory(offer, "Approved", actorUserId, JobOfferStatus.PendingApproval, JobOfferStatus.Approved, null);
                await _context.SaveChangesAsync(token);
                return Result.Success(offer.Id);
            }, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<JobOfferDto>(result.Error);
        return await GetJobOfferByIdAsync(result.Value, cancellationToken);
    }

    public async Task<Result<JobOfferDto>> RejectJobOfferAsync(int id, string reason, CancellationToken cancellationToken = default)
    {
        var actorUserId = _currentActor.UserId ?? string.Empty;
        if (actorUserId.Length == 0 || string.IsNullOrWhiteSpace(_currentActor.TenantId) || _currentActor.CompanyId is not > 0)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.CompanyContextRequired);
        var normalizedReason = reason?.Trim() ?? string.Empty;
        if (normalizedReason.Length == 0 || normalizedReason.Length > 1000)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.InvalidOperation);

        var result = await _context.ExecuteAtomicallyAsync(
            [$"Recruitment:Offers:{_currentActor.TenantId}:{_currentActor.CompanyId}:{id}"],
            async token =>
            {
                var offer = await _context.JobOffers.FirstOrDefaultAsync(item => item.Id == id, token);
                if (offer is null)
                    return Result.Failure<int>(RecruitmentErrors.JobOfferNotFound);
                var previousStatus = offer.Status;
                try
                {
                    offer.RejectApproval(_clock.GetUtcNow(), actorUserId, normalizedReason);
                }
                catch (DomainRuleException)
                {
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);
                }
                AddOfferHistory(offer, "Rejected", actorUserId, previousStatus, JobOfferStatus.Draft, normalizedReason);
                await _context.SaveChangesAsync(token);
                return Result.Success(offer.Id);
            },
            cancellationToken);
        if (result.IsFailure)
            return Result.Failure<JobOfferDto>(result.Error);
        return await GetJobOfferByIdAsync(result.Value, cancellationToken);
    }

    public async Task<Result<JobOfferDto>> IssueJobOfferAsync(int id, CancellationToken cancellationToken = default)
    {
        var offer = await _context.JobOffers.FindAsync([id], cancellationToken);
        if (offer is null)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.JobOfferNotFound);

        var now = _clock.GetUtcNow();
        offer.Issue(now, now.AddDays(14));

        // Advance application to OfferIssued
        var app = await _context.EmploymentApplications
            .Include(a => a.StatusHistory)
            .FirstOrDefaultAsync(a => a.Id == offer.EmploymentApplicationId, cancellationToken);

        if (app is not null && app.Status == ApplicationStatus.Interviewed)
        {
            app.RecordOfferIssued(now, ResolveActorEmployeeId());
        }

        await _context.SaveChangesAsync(cancellationToken);
        return await GetJobOfferByIdAsync(offer.Id, cancellationToken);
    }

    private static decimal AnnualizeOfferSalary(decimal salary, PayFrequency frequency) =>
        WorkforceCostPolicy.NormalizeAnnualSalary(frequency switch
        {
            PayFrequency.Hourly => salary * 2080m,
            PayFrequency.Daily => salary * 260m,
            PayFrequency.Weekly => salary * 52m,
            PayFrequency.Monthly => salary * 12m,
            PayFrequency.Annual => salary,
            _ => throw new ArgumentOutOfRangeException(nameof(frequency))
        });

    private void AddOfferHistory(
        JobOffer offer,
        string action,
        string actorUserId,
        JobOfferStatus fromStatus,
        JobOfferStatus toStatus,
        string? reason)
    {
        var history = new JobOfferApprovalHistory(offer.Id, action, actorUserId, _clock.GetUtcNow(), fromStatus, toStatus, reason);
        SetScope(history);
        _context.JobOfferApprovalHistory.Add(history);
    }

    public async Task<Result<JobOfferDto>> AcceptJobOfferAsync(int id, CancellationToken cancellationToken = default)
    {
        var offer = await _context.JobOffers.FindAsync([id], cancellationToken);
        if (offer is null)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.JobOfferNotFound);

        var now = _clock.GetUtcNow();
        offer.Accept(now);

        var app = await _context.EmploymentApplications
            .Include(a => a.StatusHistory)
            .FirstOrDefaultAsync(a => a.Id == offer.EmploymentApplicationId, cancellationToken);

        if (app is not null && app.Status == ApplicationStatus.OfferIssued)
        {
            app.RecordOfferAccepted(now);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return await GetJobOfferByIdAsync(offer.Id, cancellationToken);
    }

    public async Task<Result<JobOfferDto>> DeclineJobOfferAsync(int id, string reason, CancellationToken cancellationToken = default)
    {
        var actorUserId = _currentActor.UserId ?? string.Empty;
        if (actorUserId.Length == 0 || string.IsNullOrWhiteSpace(_currentActor.TenantId) || _currentActor.CompanyId is not > 0)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.CompanyContextRequired);
        var normalizedReason = reason?.Trim() ?? string.Empty;
        if (normalizedReason.Length == 0 || normalizedReason.Length > 1000)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.InvalidOperation);

        var tenantId = _currentActor.TenantId!;
        var companyId = _currentActor.CompanyId!.Value;
        var declineLocks = new List<string>
        {
            $"Recruitment:Offers:{tenantId}:{companyId}:{id}",
            WorkforcePlanLocks.Company(tenantId, companyId),
        };
        var preOffer = await _context.JobOffers.AsNoTracking().FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (preOffer is not null)
        {
            declineLocks.Add($"Recruitment:Applications:{tenantId}:{companyId}:{preOffer.EmploymentApplicationId}");
            var preApplication = await _context.EmploymentApplications.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == preOffer.EmploymentApplicationId, cancellationToken);
            var preOpening = preApplication is null ? null : await _context.JobOpenings.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == preApplication.JobOpeningId, cancellationToken);
            var preRequisition = preOpening is null ? null : await _context.JobRequisitions.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == preOpening.JobRequisitionId, cancellationToken);
            var preStaffing = preRequisition?.StaffingRequestId is > 0
                ? await _context.StaffingRequests.AsNoTracking().FirstOrDefaultAsync(item => item.Id == preRequisition.StaffingRequestId.Value, cancellationToken)
                : null;
            if (preOpening is not null) declineLocks.Add($"Recruitment:Openings:{tenantId}:{companyId}:{preOpening.Id}");
            if (preRequisition is not null) declineLocks.Add($"Recruitment:Requisitions:{tenantId}:{companyId}:{preRequisition.Id}");
            if (preStaffing is not null)
            {
                declineLocks.Add($"WorkforcePlanning:StaffingRequests:{tenantId}:{companyId}:{preStaffing.Id}");
                declineLocks.Add($"WorkforcePlanning:Envelopes:{tenantId}:{companyId}:{preStaffing.EnvelopeId}");
            }
        }

        var result = await _context.ExecuteAtomicallyAsync(
            declineLocks,
            async token =>
            {
                var offer = await _context.JobOffers.FirstOrDefaultAsync(item => item.Id == id, token);
                if (offer is null)
                    return Result.Failure<int>(RecruitmentErrors.JobOfferNotFound);
                var now = _clock.GetUtcNow();
                var app = await _context.EmploymentApplications
                    .Include(application => application.StatusHistory)
                    .FirstOrDefaultAsync(application => application.Id == offer.EmploymentApplicationId, token);
                PositionEnvelope? envelope = null;
                if (app is not null)
                {
                    var opening = await _context.JobOpenings.AsNoTracking().FirstOrDefaultAsync(item => item.Id == app.JobOpeningId, token);
                    var requisition = opening is null ? null : await _context.JobRequisitions.AsNoTracking()
                        .FirstOrDefaultAsync(item => item.Id == opening.JobRequisitionId, token);
                    if (requisition?.PlanningSource == PlanningSource.Planned && requisition.StaffingRequestId.HasValue)
                    {
                        var staffing = await _context.StaffingRequests.AsNoTracking()
                            .FirstOrDefaultAsync(item => item.Id == requisition.StaffingRequestId.Value, token);
                        if (staffing is null)
                            return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                        envelope = await _context.PositionEnvelopes.FirstOrDefaultAsync(item => item.Id == staffing.EnvelopeId, token);
                        if (envelope is null)
                            return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                        if (offer.ReservationDelta > 0 && envelope.ReservedSalaryBudget < offer.ReservationDelta)
                            return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                    }
                }

                try
                {
                    offer.Decline(normalizedReason, now);
                    if (app is not null && app.Status == ApplicationStatus.OfferIssued)
                        app.RecordOfferDeclined(normalizedReason, now);
                    if (envelope is not null && offer.ReservationDelta > 0)
                        envelope.AdjustReservedSalary(-offer.ReservationDelta);
                }
                catch (DomainRuleException exception) when (exception.Code is "PositionEnvelope.OverRelease" or "PositionEnvelope.InsufficientBudget")
                {
                    return Result.Failure<int>(RecruitmentErrors.JobOfferPlanningCapacity);
                }
                catch (DomainRuleException)
                {
                    return Result.Failure<int>(RecruitmentErrors.InvalidOperation);
                }

                AddOfferHistory(offer, "Declined", actorUserId, JobOfferStatus.Issued, JobOfferStatus.Declined, normalizedReason);
                await _context.SaveChangesAsync(token);
                return Result.Success(offer.Id);
            },
            cancellationToken);
        if (result.IsFailure)
            return Result.Failure<JobOfferDto>(result.Error);
        return await GetJobOfferByIdAsync(result.Value, cancellationToken);
    }

    // ==========================================
    // RECRUITMENT SETTINGS PERSISTENCE
    // ==========================================

    private async Task EnsureSettingsSeededAsync(CancellationToken cancellationToken)
    {
        if (await _context.RecruitmentStages.AnyAsync(cancellationToken))
            return;

        // Default Stages
        var stages = new List<RecruitmentStage>
        {
            new("stage_applied", "تم التقديم", "Applied", 10, "#1976d2", false, true, true, 2, "شكراً لتقديمك على وظيفتنا، سيتم فحص طلبك والتواصل معك قريباً."),
            new("stage_screening", "قيد الفرز الأولي", "Screening", 20, "#ed6c02", false, false, false, 3),
            new("stage_shortlist", "القائمة المختصرة", "Shortlisted", 30, "#9c27b0", false, false, true, 4, "يسعدنا إبلاغك بتأهلك للقائمة المختصرة وسيتم التنسيق للمقابلة قريباً."),
            new("stage_tech_interview", "المقابلة الفنية", "Technical Interview", 40, "#0288d1", false, false, true, 5),
            new("stage_hr_interview", "مقابلة الإدارة والموارد البشرية", "HR & Culture Fit", 50, "#5c6bc0", false, false, true, 6),
            new("stage_offer_issued", "تم إرسال العرض الوظيفي", "Offer Issued", 60, "#ff9800", false, false, true, 7),
            new("stage_offer_accepted", "تم قبول العرض", "Offer Accepted", 70, "#009688", false, false, false, 8),
            new("stage_hired", "تم التعيين الرسمي", "Hired", 80, "#2e7d32", true, false, true, 12)
        };
        foreach (var s in stages)
        {
            SetScope(s);
            _context.RecruitmentStages.Add(s);
        }

        // Default Rejection Reasons
        var reasons = new List<RejectionReason>
        {
            new("rr_salary", "الراتب المتوقع أعلى من الميزانية المحددة للوظيفة", "Expected salary exceeds budgeted compensation range", "salary", true, "تحديث بخصوص طلب التوظيف", "Update regarding your application", "نشكرك على اهتمامك ووقتك، ونظراً لأن الراتب المطلوب يتجاوز الموازنة المحددة للشاغر حالياً، نتمنى لك التوفيق في فرص قادمة.", "Thank you for your interest and time. As expected salary exceeds our budget, we wish you the best."),
            new("rr_tech_fail", "عدم اجتياز التقييم الفني أو العملي", "Did not pass technical assessment or practical evaluation", "qualifications", true, "نتيجة التقييم الفني", "Technical Assessment Feedback", "نقدر مجهودك في الاختبار الفني، ولكن تم اختيار مرشحين ذوي توافق أعلى مع متطلبات المشروع الحالية.", "We appreciate your effort; however, we are proceeding with other candidates."),
            new("rr_insufficient_exp", "عدم تطابق سنوات الخبرة أو المؤهلات التخصصية المطلوبة", "Insufficient years of relevant experience or required qualifications", "qualifications", true, "تحديث بخصوص طلب التوظيف", "Application Update", "شكراً لتقديمك، تم حفظ سيرتك الذاتية في قاعدة بياناتنا للتواصل معك في شواغر مستقبلية أكثر توافقاً.", "Thank you for applying. We have retained your profile for future matching opportunities."),
            new("rr_no_show", "عدم حضور المقابلة المحددة بدون اعتذار مسبق", "Candidate did not attend scheduled interview without prior notice", "other", false),
            new("rr_withdrew", "اعتذار المرشح لظروف شخصية أو قبوله عرضاً آخر", "Candidate withdrew application or accepted another offer", "candidate_withdrew", false),
            new("rr_culture_fit", "عدم التوافق مع قيم وثقافة بيئة العمل", "Culture and behavioral alignment mismatch", "behavioral", true, "تحديث بخصوص طلب التوظيف", "Update on your application", "نشكرك على لقائنا ومشاركتنا خبراتك ونتمنى لك خالص التوفيق والنجاح المهني.", "Thank you for meeting with us. We wish you every success in your future endeavors.")
        };
        foreach (var r in reasons)
        {
            SetScope(r);
            _context.RecruitmentRejectionReasons.Add(r);
        }

        // Default Sources
        var sources = new List<RecruitmentSource>
        {
            new("src_linkedin", "لينكد إن", "LinkedIn", "social", true, 54, 7),
            new("src_portal", "بوابة التوظيف الرسمية", "Company Careers Portal", "portal", true, 96, 15),
            new("src_referral", "ترشيح من موظف داخلي", "Employee Referral", "referral", true, 22, 6),
            new("src_wuzzuf", "منصات التوظيف (Wuzzuf / Bayt)", "Recruitment Platforms (Wuzzuf / Bayt)", "portal", true, 68, 9),
            new("src_agency", "وكالات ومكاتب التوظيف الخارجية", "Recruitment Agencies & Headhunters", "agency", true, 14, 4),
            new("src_fairs", "معارض التوظيف والجامعات", "Job Fairs & Universities", "fair", false, 28, 2)
        };
        foreach (var src in sources)
        {
            SetScope(src);
            _context.RecruitmentSources.Add(src);
        }

        // Default Criteria
        var criteria = new List<EvaluationCriterion>
        {
            new("crit_tech", "الكفاءة والخبرة الفنية التخصصية", "Technical Competence & Core Expertise", "technical", 5, 30, true, "عمق المعرفة بالأدوات والتقنيات والمشروعات السابقة وجودة الكود/المخرجات", "Depth of knowledge in tools, technologies, and work deliverables"),
            new("crit_comm", "مهارات التواصل والعرض والتعبير", "Communication & Presentation Skills", "communication", 5, 20, true, "القدرة على إيصال الأفكار المعقدة بسلاسة والإنصات والتعبير الواضح", "Ability to articulate complex ideas, active listening, and clarity"),
            new("crit_problem_solving", "حل المشكلات والتفكير التحليلي", "Problem Solving & Analytical Thinking", "problem_solving", 5, 25, true, "كيفية التعامل مع التحديات غير المتوقعة والابتكار والبحث عن حلول جذرية", "Handling unexpected bottlenecks, structured root-cause analysis, and innovation"),
            new("crit_culture", "التوافق مع ثقافة وقيم الشركة", "Culture & Values Alignment", "culture", 5, 15, true, "النزاهة، الشغف، الرغبة في التطور المستمر، والتكيف مع بيئة العمل", "Integrity, adaptability, passion for learning, and collaborative mindset"),
            new("crit_leadership", "العمل الجماعي والروح القيادية", "Teamwork & Leadership Qualities", "leadership", 5, 10, false, "المبادرة، دعم الزملاء، وتوجيه الكفاءات الشابة", "Initiative, mentoring peers, and driving collective team success")
        };
        foreach (var c in criteria)
        {
            SetScope(c);
            _context.RecruitmentEvaluationCriteria.Add(c);
        }

        // Default Policy
        var policy = new RecruitmentPolicy("EGP", 7, true, true, 3, true, "careers@company.com");
        SetScope(policy);
        _context.RecruitmentPolicies.Add(policy);

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<RecruitmentSettingsDto> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        await EnsureSettingsSeededAsync(cancellationToken);

        var stages = await _context.RecruitmentStages
            .OrderBy(s => s.Sequence)
            .Select(s => new RecruitmentStageDto(
                s.Code,
                s.NameAr,
                s.NameEn,
                s.Sequence,
                s.Color,
                s.FoldedInKanban,
                s.IsDefault,
                s.SendEmailNotification,
                s.MappedStatus,
                s.EmailTemplate))
            .ToListAsync(cancellationToken);

        var reasons = await _context.RecruitmentRejectionReasons
            .Select(r => new RejectionReasonDto(
                r.Code,
                r.ReasonAr,
                r.ReasonEn,
                r.Category,
                r.SendAutoEmail,
                r.EmailSubjectAr,
                r.EmailSubjectEn,
                r.EmailBodyAr,
                r.EmailBodyEn))
            .ToListAsync(cancellationToken);

        var sources = await _context.RecruitmentSources
            .Select(src => new RecruitmentSourceDto(
                src.Code,
                src.NameAr,
                src.NameEn,
                src.Type,
                src.IsActive,
                src.ApplicationsCount,
                src.HiredCount))
            .ToListAsync(cancellationToken);

        var criteria = await _context.RecruitmentEvaluationCriteria
            .Select(c => new EvaluationCriterionDto(
                c.Code,
                c.TitleAr,
                c.TitleEn,
                c.Category,
                c.MaxScore,
                c.Weight,
                c.IsMandatory,
                c.DescriptionAr,
                c.DescriptionEn))
            .ToListAsync(cancellationToken);

        var policy = await _context.RecruitmentPolicies.FirstOrDefaultAsync(cancellationToken);

        return new RecruitmentSettingsDto
        {
            Stages = stages,
            RejectionReasons = reasons,
            Sources = sources,
            EvaluationCriteria = criteria,
            General = policy is not null
                ? new RecruitmentGeneralSettingsDto
                {
                    DefaultCurrency = policy.DefaultCurrency,
                    OfferExpiryDays = policy.OfferExpiryDays,
                    AutoPublishOpening = policy.AutoPublishOpening,
                    EnforceHeadcountCapacity = policy.EnforceHeadcountCapacity,
                    DefaultProbationMonths = policy.DefaultProbationMonths,
                    EnablePublicPortal = policy.EnablePublicPortal,
                    InboundEmailAlias = policy.InboundEmailAlias
                }
                : new RecruitmentGeneralSettingsDto()
        };
    }

    public async Task<RecruitmentSettingsDto> UpdateSettingsAsync(RecruitmentSettingsDto settings, CancellationToken cancellationToken = default)
    {
        await EnsureSettingsSeededAsync(cancellationToken);

        // Update or Add Stages
        if (settings.Stages is not null)
        {
            var existingStages = await _context.RecruitmentStages.ToListAsync(cancellationToken);
            foreach (var dto in settings.Stages)
            {
                var existing = existingStages.FirstOrDefault(s => s.Code == dto.Id);
                if (existing is not null)
                {
                    existing.Update(dto.NameAr, dto.NameEn, dto.Sequence, dto.Color, dto.FoldedInKanban, dto.IsDefault, dto.SendEmailNotification, dto.MappedStatus, dto.EmailTemplate);
                }
                else
                {
                    var newStage = new RecruitmentStage(dto.Id, dto.NameAr, dto.NameEn, dto.Sequence, dto.Color, dto.FoldedInKanban, dto.IsDefault, dto.SendEmailNotification, dto.MappedStatus, dto.EmailTemplate);
                    SetScope(newStage);
                    _context.RecruitmentStages.Add(newStage);
                }
            }
        }

        // Update or Add Rejection Reasons
        if (settings.RejectionReasons is not null)
        {
            var existingReasons = await _context.RecruitmentRejectionReasons.ToListAsync(cancellationToken);
            foreach (var dto in settings.RejectionReasons)
            {
                var existing = existingReasons.FirstOrDefault(r => r.Code == dto.Id);
                if (existing is not null)
                {
                    existing.Update(dto.ReasonAr, dto.ReasonEn, dto.Category, dto.SendAutoEmail, dto.EmailSubjectAr, dto.EmailSubjectEn, dto.EmailBodyAr, dto.EmailBodyEn);
                }
                else
                {
                    var newReason = new RejectionReason(dto.Id, dto.ReasonAr, dto.ReasonEn, dto.Category, dto.SendAutoEmail, dto.EmailSubjectAr, dto.EmailSubjectEn, dto.EmailBodyAr, dto.EmailBodyEn);
                    SetScope(newReason);
                    _context.RecruitmentRejectionReasons.Add(newReason);
                }
            }
        }

        // Update or Add Sources
        if (settings.Sources is not null)
        {
            var existingSources = await _context.RecruitmentSources.ToListAsync(cancellationToken);
            foreach (var dto in settings.Sources)
            {
                var existing = existingSources.FirstOrDefault(s => s.Code == dto.Id);
                if (existing is not null)
                {
                    existing.Update(dto.NameAr, dto.NameEn, dto.Type, dto.IsActive);
                }
                else
                {
                    var newSource = new RecruitmentSource(dto.Id, dto.NameAr, dto.NameEn, dto.Type, dto.IsActive, dto.ApplicationsCount, dto.HiredCount);
                    SetScope(newSource);
                    _context.RecruitmentSources.Add(newSource);
                }
            }
        }

        // Update or Add Criteria
        if (settings.EvaluationCriteria is not null)
        {
            var existingCriteria = await _context.RecruitmentEvaluationCriteria.ToListAsync(cancellationToken);
            foreach (var dto in settings.EvaluationCriteria)
            {
                var existing = existingCriteria.FirstOrDefault(c => c.Code == dto.Id);
                if (existing is not null)
                {
                    existing.Update(dto.TitleAr, dto.TitleEn, dto.Category, dto.MaxScore, dto.Weight, dto.IsMandatory, dto.DescriptionAr, dto.DescriptionEn);
                }
                else
                {
                    var newCrit = new EvaluationCriterion(dto.Id, dto.TitleAr, dto.TitleEn, dto.Category, dto.MaxScore, dto.Weight, dto.IsMandatory, dto.DescriptionAr, dto.DescriptionEn);
                    SetScope(newCrit);
                    _context.RecruitmentEvaluationCriteria.Add(newCrit);
                }
            }
        }

        // Update Policy
        if (settings.General is not null)
        {
            var policy = await _context.RecruitmentPolicies.FirstOrDefaultAsync(cancellationToken);
            if (policy is not null)
            {
                policy.Update(
                    settings.General.DefaultCurrency,
                    settings.General.OfferExpiryDays,
                    settings.General.AutoPublishOpening,
                    settings.General.EnforceHeadcountCapacity,
                    settings.General.DefaultProbationMonths,
                    settings.General.EnablePublicPortal,
                    settings.General.InboundEmailAlias);
            }
            else
            {
                var newPolicy = new RecruitmentPolicy(
                    settings.General.DefaultCurrency,
                    settings.General.OfferExpiryDays,
                    settings.General.AutoPublishOpening,
                    settings.General.EnforceHeadcountCapacity,
                    settings.General.DefaultProbationMonths,
                    settings.General.EnablePublicPortal,
                    settings.General.InboundEmailAlias);
                SetScope(newPolicy);
                _context.RecruitmentPolicies.Add(newPolicy);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return await GetSettingsAsync(cancellationToken);
    }
}
