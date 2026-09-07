using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.WorkforcePlanning.Abstractions;
using HrManagementSystem.Application.Features.WorkforcePlanning.Contracts;
using HrManagementSystem.Application.Features.WorkforcePlanning.Queries;
using HrManagementSystem.Domain.Finance.FiscalYears.Entities;
using HrManagementSystem.Domain.Finance.FiscalYears.Enums;
using HrManagementSystem.Domain.WorkforcePlanning.Enums;
using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrManagementSystem.Infrastructure.Features.WorkforcePlanning.Persistence;

public sealed class WorkforceTraceReadStore(ApplicationDbContext context) : IWorkforceTraceReadStore
{
    public async Task<HiringTraceResponse?> GetTraceByApplicationAsync(int applicationId, bool includeFinancials, CancellationToken cancellationToken)
    {
        var application = await context.EmploymentApplications.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == applicationId, cancellationToken);
        if (application is null)
            return null;
        return await BuildTraceAsync(application.Id, null, null, includeFinancials, cancellationToken);
    }

    public async Task<HiringTraceResponse?> GetTraceByOfferAsync(int offerId, bool includeFinancials, CancellationToken cancellationToken)
    {
        var offer = await context.JobOffers.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == offerId, cancellationToken);
        if (offer is null)
            return null;
        return await BuildTraceAsync(offer.EmploymentApplicationId, offerId, null, includeFinancials, cancellationToken);
    }

    public async Task<HiringTraceResponse?> GetTraceByEmployeeAsync(int employeeId, bool includeFinancials, CancellationToken cancellationToken)
    {
        var employee = await context.Employees.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == employeeId, cancellationToken);
        if (employee is null)
            return null;
        var application = await context.EmploymentApplications.AsNoTracking()
            .FirstOrDefaultAsync(item => item.EmployeeId == employeeId, cancellationToken);
        if (application is null)
            return null;
        return await BuildTraceAsync(application.Id, null, employeeId, includeFinancials, cancellationToken);
    }

    public async Task<PageResponse<PlanCommitmentRowResponse>> GetPlanCommitmentAsync(GetPlanCommitmentSummaryQuery request, bool includeFinancials, CancellationToken cancellationToken)
    {
        var query = context.PositionEnvelopes.AsNoTracking()
            .Where(envelope => !envelope.IsDeleted && envelope.FiscalYearId == request.FiscalYearId
                && context.WorkforceBudgets.Any(budget => budget.Id == envelope.WorkforceBudgetId
                    && !budget.IsDeleted
                    && budget.Status == WorkforceBudgetStatus.Approved
                    && budget.ActivatedOn.HasValue
                    && !budget.SupersededOn.HasValue)
                && context.FiscalYears.Any(year => year.Id == envelope.FiscalYearId
                    && !year.IsDeleted
                    && year.Status == FiscalYearStatus.Open));
        if (request.PositionId.HasValue)
            query = query.Where(envelope => envelope.PositionId == request.PositionId.Value);
        if (request.BranchId.HasValue)
            query = query.Where(envelope => envelope.BranchId == request.BranchId.Value);

        query = query.OrderBy(envelope => envelope.EnvelopeCode).ThenBy(envelope => envelope.Id);
        var total = await query.CountAsync(cancellationToken);
        var envelopes = await query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var envelopeIds = envelopes.Select(envelope => envelope.Id).ToList();
        var staffingRequests = await context.StaffingRequests.AsNoTracking()
            .Where(item => envelopeIds.Contains(item.EnvelopeId))
            .ToListAsync(cancellationToken);
        var staffingIds = staffingRequests.Select(item => item.Id).ToList();
        var requisitions = staffingIds.Count == 0
            ? []
            : await context.JobRequisitions.AsNoTracking()
                .Where(item => item.StaffingRequestId.HasValue && staffingIds.Contains(item.StaffingRequestId.Value))
                .ToListAsync(cancellationToken);
        var requisitionIds = requisitions.Select(item => item.Id).ToList();
        var openings = requisitionIds.Count == 0
            ? []
            : await context.JobOpenings.AsNoTracking()
                .Where(item => requisitionIds.Contains(item.JobRequisitionId))
                .ToListAsync(cancellationToken);
        var openingIds = openings.Select(item => item.Id).ToList();
        var applications = openingIds.Count == 0
            ? []
            : await context.EmploymentApplications.AsNoTracking()
                .Where(item => openingIds.Contains(item.JobOpeningId))
                .ToListAsync(cancellationToken);
        var applicationIds = applications.Select(item => item.Id).ToList();
        var offers = applicationIds.Count == 0
            ? []
            : await context.JobOffers.AsNoTracking()
                .Where(item => applicationIds.Contains(item.EmploymentApplicationId))
                .ToListAsync(cancellationToken);

        var budgetIds = envelopes.Select(envelope => envelope.WorkforceBudgetId).Distinct().ToList();
        var budgets = await context.WorkforceBudgets.AsNoTracking()
            .Where(item => budgetIds.Contains(item.Id))
            .ToDictionaryAsync(item => item.Id, cancellationToken);
        var planIds = envelopes.Select(envelope => envelope.WorkforcePlanId).Distinct().ToList();
        var plans = await context.WorkforcePlans.AsNoTracking()
            .Where(item => planIds.Contains(item.Id))
            .ToDictionaryAsync(item => item.Id, cancellationToken);

        var rows = envelopes.Select(envelope =>
        {
            budgets.TryGetValue(envelope.WorkforceBudgetId, out var budget);
            plans.TryGetValue(envelope.WorkforcePlanId, out var plan);
            var envelopeStaffing = staffingRequests.Where(item => item.EnvelopeId == envelope.Id).ToList();
            var envelopeStaffingIds = envelopeStaffing.Select(item => item.Id).ToHashSet();
            var envelopeRequisitions = requisitions.Where(item => item.StaffingRequestId.HasValue && envelopeStaffingIds.Contains(item.StaffingRequestId.Value)).ToList();
            var envelopeRequisitionIds = envelopeRequisitions.Select(item => item.Id).ToHashSet();
            var envelopeOpenings = openings.Where(item => envelopeRequisitionIds.Contains(item.JobRequisitionId)).ToList();
            var envelopeOpeningIds = envelopeOpenings.Select(item => item.Id).ToHashSet();
            var envelopeApplications = applications.Where(item => envelopeOpeningIds.Contains(item.JobOpeningId)).ToList();
            var envelopeApplicationIds = envelopeApplications.Select(item => item.Id).ToHashSet();
            var envelopeOffers = offers.Where(item => envelopeApplicationIds.Contains(item.EmploymentApplicationId)).ToList();
            return new PlanCommitmentRowResponse(
                envelope.FiscalYearId,
                envelope.Id,
                envelope.EnvelopeCode,
                envelope.WorkforceBudgetId,
                budget?.BudgetCode ?? string.Empty,
                envelope.WorkforcePlanId,
                plan?.PlanCode ?? string.Empty,
                envelope.PositionId,
                envelope.BranchId,
                envelope.AuthorizedHeadcount,
                envelope.ReservedHeadcount,
                envelope.HiredHeadcount,
                envelope.AuthorizedHeadcount - envelope.ReservedHeadcount - envelope.HiredHeadcount,
                includeFinancials ? envelope.AuthorizedSalaryBudget : null,
                includeFinancials ? envelope.ReservedSalaryBudget : null,
                includeFinancials ? envelope.ContractedSalaryBudget : null,
                includeFinancials ? envelope.AuthorizedSalaryBudget - envelope.ReservedSalaryBudget - envelope.ContractedSalaryBudget : null,
                includeFinancials ? envelope.CurrencyCode : null,
                envelopeStaffing.Count,
                envelopeRequisitions.Count,
                envelopeOpenings.Count,
                envelopeOffers.Count,
                envelopeApplications.Count(item => item.Status == HrManagementSystem.Domain.Recruitment.Enums.ApplicationStatus.Hired));
        }).ToList();

        var page = new PagedList<PlanCommitmentRowResponse>(rows, total, request.PageNumber, request.PageSize, PaginationRequest.MaxClientPageSize);
        return new PageResponse<PlanCommitmentRowResponse>(page, page.MetaData);
    }

    private async Task<HiringTraceResponse?> BuildTraceAsync(
        int applicationId,
        int? focusOfferId,
        int? focusEmployeeId,
        bool includeFinancials,
        CancellationToken cancellationToken)
    {
        var application = await context.EmploymentApplications.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == applicationId, cancellationToken);
        if (application is null)
            return null;

        var opening = await context.JobOpenings.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == application.JobOpeningId, cancellationToken);
        var requisition = opening is null
            ? null
            : await context.JobRequisitions.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == opening.JobRequisitionId, cancellationToken);
        var staffingRequest = requisition?.StaffingRequestId.HasValue == true
            ? await context.StaffingRequests.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == requisition.StaffingRequestId.Value, cancellationToken)
            : null;
        var envelope = staffingRequest is null
            ? null
            : await context.PositionEnvelopes.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == staffingRequest.EnvelopeId, cancellationToken);
        var budget = envelope is null
            ? null
            : await context.WorkforceBudgets.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == envelope.WorkforceBudgetId, cancellationToken);
        var plan = envelope is null
            ? null
            : await context.WorkforcePlans.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == envelope.WorkforcePlanId, cancellationToken);
        var fiscalYear = envelope is null
            ? null
            : await context.FiscalYears.AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == envelope.FiscalYearId, cancellationToken);
        var offers = await context.JobOffers.AsNoTracking()
            .Where(item => item.EmploymentApplicationId == application.Id)
            .OrderBy(item => item.Id)
            .ToListAsync(cancellationToken);
        var employee = focusEmployeeId.HasValue
            ? await context.Employees.AsNoTracking().FirstOrDefaultAsync(item => item.Id == focusEmployeeId.Value, cancellationToken)
            : application.EmployeeId.HasValue
                ? await context.Employees.AsNoTracking().FirstOrDefaultAsync(item => item.Id == application.EmployeeId.Value, cancellationToken)
                : null;

        var nodes = new List<TraceNodeDto>();
        var edges = new List<TraceEdgeDto>();
        string? previousKey = null;
        void Append(string key, string kind, string title, string? status, DateTimeOffset? occurredOn, decimal? fiscalCost, string? currencyCode)
        {
            nodes.Add(new TraceNodeDto(key, kind, title, status, occurredOn, includeFinancials ? fiscalCost : null, includeFinancials ? currencyCode : null));
            if (previousKey is not null)
                edges.Add(new TraceEdgeDto(previousKey, key, "flows-to"));
            previousKey = key;
        }

        if (fiscalYear is not null)
            Append($"fiscal-year-{fiscalYear.Id}", "FiscalYear", fiscalYear.Code, fiscalYear.Status.ToString(), null, null, null);
        if (plan is not null)
            Append($"plan-{plan.Id}", "WorkforcePlan", plan.PlanCode, plan.Status.ToString(), plan.ApprovedOn ?? plan.SubmittedOn, null, null);
        if (budget is not null)
            Append($"budget-{budget.Id}", "WorkforceBudget", budget.BudgetCode, budget.Status.ToString(), budget.ApprovedOn ?? budget.SubmittedOn, null, includeFinancials ? budget.CurrencyCode : null);
        if (envelope is not null)
            Append($"envelope-{envelope.Id}", "PositionEnvelope", envelope.EnvelopeCode, null, null, envelope.ContractedSalaryBudget, envelope.CurrencyCode);
        if (staffingRequest is not null)
            Append($"staffing-{staffingRequest.Id}", "StaffingRequest", $"SR-{staffingRequest.Id}", staffingRequest.Status.ToString(), staffingRequest.ApprovedOn ?? staffingRequest.SubmittedOn, staffingRequest.TotalReservedCost, staffingRequest.CurrencyCode);
        if (requisition is not null)
            Append($"requisition-{requisition.Id}", "JobRequisition", requisition.RequisitionNumber, requisition.Status.ToString(), null, null, null);
        if (opening is not null)
            Append($"opening-{opening.Id}", "JobOpening", opening.OpeningNumber, opening.Status.ToString(), opening.OpenedOn, null, null);
        Append($"application-{application.Id}", "EmploymentApplication", $"APP-{application.Id}", application.Status.ToString(), application.LastStatusChangedOn, null, null);
        var traceOffers = focusOfferId.HasValue
            ? offers.Where(offer => offer.Id == focusOfferId.Value).ToList()
            : offers;
        foreach (var offer in traceOffers)
        {
            nodes.Add(new TraceNodeDto(
                $"offer-{offer.Id}",
                "JobOffer",
                offer.OfferNumber,
                offer.Status.ToString(),
                offer.IssuedOn ?? offer.ApprovalSubmittedOn,
                includeFinancials ? offer.FiscalYearCostSnapshot : null,
                includeFinancials ? offer.CurrencyCode : null));
            if (previousKey is not null)
                edges.Add(new TraceEdgeDto(previousKey, $"offer-{offer.Id}", "flows-to"));
        }
        if (employee is not null)
        {
            nodes.Add(new TraceNodeDto(
                $"employee-{employee.Id}",
                "Employee",
                $"Employee #{employee.Id}",
                employee.Status.ToString(),
                null,
                null,
                null));
            var lastOfferKey = traceOffers.Count > 0 ? $"offer-{traceOffers[^1].Id}" : previousKey;
            if (lastOfferKey is not null)
                edges.Add(new TraceEdgeDto(lastOfferKey, $"employee-{employee.Id}", "hired-as"));
        }

        return new HiringTraceResponse(nodes, edges);
    }
}
