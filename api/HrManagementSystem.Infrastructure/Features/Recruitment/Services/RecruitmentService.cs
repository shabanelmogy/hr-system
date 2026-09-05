using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.Recruitment.Abstractions;
using HrManagementSystem.Application.Features.Recruitment.Contracts;
using HrManagementSystem.Application.Features.Recruitment.Errors;
using HrManagementSystem.Domain.Common.Entities;
using HrManagementSystem.Domain.Employees.Entities;
using HrManagementSystem.Domain.Employees.Enums;
using HrManagementSystem.Domain.Recruitment.Entities;
using HrManagementSystem.Domain.Recruitment.Enums;
using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HrManagementSystem.Infrastructure.Features.Recruitment.Services;

public class RecruitmentService(
    ApplicationDbContext context,
    ICurrentActor currentActor,
    ILogger<RecruitmentService> logger) : IRecruitmentService
{
    private readonly ApplicationDbContext _context = context;
    private readonly ICurrentActor _currentActor = currentActor;
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

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Active employees with primary assignment in this position
        var activeHeadcount = await _context.EmployeeAssignments.AsNoTracking()
            .CountAsync(a => a.PositionId == positionId && a.IsPrimary && (a.EffectiveTo == null || a.EffectiveTo >= today), cancellationToken);

        // Positions requested in pending/approved/open requisitions
        var pendingRequisitionsCount = await _context.JobRequisitions.AsNoTracking()
            .Where(r => r.PositionId == positionId &&
                        (r.Status == JobRequisitionStatus.Draft ||
                         r.Status == JobRequisitionStatus.PendingApproval ||
                         r.Status == JobRequisitionStatus.Approved))
            .SumAsync(r => (int?)r.RequestedPositions, cancellationToken) ?? 0;

        var availableHeadcount = Math.Max(0, position.TargetHeadcount - (activeHeadcount + pendingRequisitionsCount));

        var summary = new PositionHeadcountSummaryDto(
            PositionId: position.Id,
            PositionCode: position.PositionCode,
            JobTitleEn: position.JobTitleEn,
            JobTitleAr: position.JobTitleAr,
            TargetHeadcount: position.TargetHeadcount,
            ActiveHeadcount: activeHeadcount,
            PendingRequisitionsCount: pendingRequisitionsCount,
            AvailableHeadcount: availableHeadcount,
            ExceedsHeadcount: (activeHeadcount + pendingRequisitionsCount) >= position.TargetHeadcount);

        return Result.Success(summary);
    }

    public async Task<Result<JobRequisitionDto>> CreateJobRequisitionAsync(JobRequisitionMutation mutation, CancellationToken cancellationToken = default)
    {
        var position = await _context.Positions.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == mutation.PositionId, cancellationToken);

        if (position is null)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.PositionNotFound);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

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

        var reqNumber = $"REQ-{DateTime.UtcNow:yyyyMM}-{Guid.NewGuid().ToString()[..4].ToUpper()}";
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

    public async Task<Result<JobRequisitionDto>> SubmitJobRequisitionAsync(int id, CancellationToken cancellationToken = default)
    {
        var requisition = await _context.JobRequisitions.FindAsync([id], cancellationToken);
        if (requisition is null)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.JobRequisitionNotFound);

        requisition.Submit(DateTimeOffset.UtcNow);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobRequisitionByIdAsync(requisition.Id, cancellationToken);
    }

    public async Task<Result<JobRequisitionDto>> ApproveJobRequisitionAsync(int id, CancellationToken cancellationToken = default)
    {
        var requisition = await _context.JobRequisitions.FindAsync([id], cancellationToken);
        if (requisition is null)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.JobRequisitionNotFound);

        requisition.Approve(ResolveActorEmployeeId(), DateTimeOffset.UtcNow);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobRequisitionByIdAsync(requisition.Id, cancellationToken);
    }

    public async Task<Result<JobRequisitionDto>> RejectJobRequisitionAsync(int id, string reason, CancellationToken cancellationToken = default)
    {
        var requisition = await _context.JobRequisitions.FindAsync([id], cancellationToken);
        if (requisition is null)
            return Result.Failure<JobRequisitionDto>(RecruitmentErrors.JobRequisitionNotFound);

        requisition.Reject(ResolveActorEmployeeId(), reason, DateTimeOffset.UtcNow);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobRequisitionByIdAsync(requisition.Id, cancellationToken);
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
        var openingNumber = $"JOB-{DateTime.UtcNow:yyyyMM}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

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

        opening.Open(DateTimeOffset.UtcNow);
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

        opening.Close(reason, DateTimeOffset.UtcNow);
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

        posting.Publish(DateTimeOffset.UtcNow);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetJobPostingByIdAsync(posting.Id, cancellationToken);
    }

    public async Task<Result<JobPostingDto>> CloseJobPostingAsync(int id, CancellationToken cancellationToken = default)
    {
        var posting = await _context.JobPostings.FindAsync([id], cancellationToken);
        if (posting is null)
            return Result.Failure<JobPostingDto>(RecruitmentErrors.JobPostingNotFound);

        posting.Close(DateTimeOffset.UtcNow);
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

        var now = DateTimeOffset.UtcNow;
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

        var now = DateTimeOffset.UtcNow;
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
        var app = await _context.EmploymentApplications
            .Include(a => a.StatusHistory)
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (app is null)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.EmploymentApplicationNotFound);

        var opening = await _context.JobOpenings.FindAsync([app.JobOpeningId], cancellationToken);
        if (opening is null)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.JobOpeningNotFound);

        var now = DateTimeOffset.UtcNow;
        var actorId = ResolveActorEmployeeId();

        // Advance to OfferAccepted if in previous valid pipeline stages
        if (app.Status == ApplicationStatus.Interviewed)
        {
            app.RecordOfferIssued(now, actorId);
            app.RecordOfferAccepted(now);
        }
        else if (app.Status == ApplicationStatus.OfferIssued)
        {
            app.RecordOfferAccepted(now);
        }

        // Fetch candidate details
        var candidate = await _context.Candidates.FindAsync([app.CandidateId], cancellationToken);
        if (candidate is null)
            return Result.Failure<EmploymentApplicationDto>(RecruitmentErrors.CandidateNotFound);

        // Fetch accepted offer for terms and proposed date
        var acceptedOffer = await _context.JobOffers
            .FirstOrDefaultAsync(o => o.EmploymentApplicationId == app.Id &&
                (o.Status == JobOfferStatus.Accepted || o.Status == JobOfferStatus.Issued), cancellationToken);

        var hireDate = mutation.HireDate != default
            ? mutation.HireDate
            : (acceptedOffer?.ProposedStartDate ?? DateOnly.FromDateTime(DateTime.UtcNow));
        var employeeNumber = !string.IsNullOrWhiteSpace(mutation.EmployeeNumber)
            ? mutation.EmployeeNumber.Trim().ToUpperInvariant()
            : $"EMP-{hireDate.Year}{hireDate.Month:D2}-{candidate.Id:D4}";

        // 1. Create real Employee in Employees table
        var employee = new Employee(employeeNumber, candidate.FirstName, candidate.LastName, hireDate, candidate.Id);
        SetScope(employee);
        employee.Activate(hireDate);
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync(cancellationToken);

        // 2. Create primary EmployeeAssignment in EmployeeAssignments table
        var assignment = new EmployeeAssignment(
            employee.Id,
            opening.PositionId,
            opening.BranchId,
            opening.DepartmentId,
            hireDate,
            isPrimary: true,
            divisionId: opening.DivisionId);
        SetScope(assignment);
        _context.EmployeeAssignments.Add(assignment);

        // 3. Create EmployeeContract in EmployeeContracts table
        var contractType = acceptedOffer?.EmploymentType == EmploymentType.PartTime
            ? EmployeeContractType.Temporary
            : EmployeeContractType.Permanent;
        var contract = new EmployeeContract(
            employee.Id,
            $"CON-{employee.EmployeeNumber}",
            contractType,
            hireDate,
            endDate: null);
        SetScope(contract);
        contract.Activate(hireDate);
        _context.EmployeeContracts.Add(contract);

        // 4. Update Application & Opening
        app.MarkHired(employee.Id, now, actorId);
        opening.RegisterHire(now);

        await _context.SaveChangesAsync(cancellationToken);
        return await GetApplicationByIdAsync(app.Id, cancellationToken);
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
            application.ScheduleInterview(DateTimeOffset.UtcNow, ResolveActorEmployeeId());
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

        interview.Complete(DateTimeOffset.UtcNow);

        // Update application to Interviewed if in InterviewScheduled
        var app = await _context.EmploymentApplications
            .Include(a => a.StatusHistory)
            .FirstOrDefaultAsync(a => a.Id == interview.EmploymentApplicationId, cancellationToken);

        if (app is not null && app.Status == ApplicationStatus.InterviewScheduled)
        {
            app.RecordInterviewCompleted(DateTimeOffset.UtcNow, ResolveActorEmployeeId());
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
            DateTimeOffset.UtcNow,
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
                               CreatedOn = o.CreatedOn
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
                              CreatedOn = o.CreatedOn
                          }).FirstOrDefaultAsync(cancellationToken);

        return item is not null
            ? Result.Success(item)
            : Result.Failure<JobOfferDto>(RecruitmentErrors.JobOfferNotFound);
    }

    public async Task<Result<JobOfferDto>> CreateJobOfferAsync(JobOfferMutation mutation, CancellationToken cancellationToken = default)
    {
        var offerNumber = $"OFF-{DateTime.UtcNow:yyyyMM}-{Guid.NewGuid().ToString()[..4].ToUpper()}";

        var offer = new JobOffer(
            offerNumber,
            mutation.EmploymentApplicationId,
            mutation.PositionId,
            mutation.BranchId,
            mutation.DepartmentId,
            mutation.BaseSalary,
            mutation.CurrencyCode,
            mutation.PayFrequency,
            mutation.EmploymentType,
            mutation.WorkArrangement,
            mutation.ProposedStartDate,
            mutation.DivisionId);

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

    public async Task<Result<JobOfferDto>> IssueJobOfferAsync(int id, CancellationToken cancellationToken = default)
    {
        var offer = await _context.JobOffers.FindAsync([id], cancellationToken);
        if (offer is null)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.JobOfferNotFound);

        var now = DateTimeOffset.UtcNow;
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

    public async Task<Result<JobOfferDto>> AcceptJobOfferAsync(int id, CancellationToken cancellationToken = default)
    {
        var offer = await _context.JobOffers.FindAsync([id], cancellationToken);
        if (offer is null)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.JobOfferNotFound);

        var now = DateTimeOffset.UtcNow;
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
        var offer = await _context.JobOffers.FindAsync([id], cancellationToken);
        if (offer is null)
            return Result.Failure<JobOfferDto>(RecruitmentErrors.JobOfferNotFound);

        var now = DateTimeOffset.UtcNow;
        offer.Decline(reason, now);

        var app = await _context.EmploymentApplications
            .Include(a => a.StatusHistory)
            .FirstOrDefaultAsync(a => a.Id == offer.EmploymentApplicationId, cancellationToken);

        if (app is not null && app.Status == ApplicationStatus.OfferIssued)
        {
            app.RecordOfferDeclined(reason, now);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return await GetJobOfferByIdAsync(offer.Id, cancellationToken);
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
