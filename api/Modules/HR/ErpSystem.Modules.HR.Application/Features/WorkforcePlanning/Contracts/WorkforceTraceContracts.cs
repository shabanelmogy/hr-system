namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Contracts;

public sealed record TraceNodeDto(
    string Key,
    string Kind,
    string Title,
    string? Status,
    DateTimeOffset? OccurredOn,
    decimal? FiscalCost,
    string? CurrencyCode);

public sealed record TraceEdgeDto(
    string FromKey,
    string ToKey,
    string Relation);

public sealed record HiringTraceResponse(
    IReadOnlyList<TraceNodeDto> Nodes,
    IReadOnlyList<TraceEdgeDto> Edges);

public sealed record PlanCommitmentRowResponse(
    int FiscalYearId,
    int PositionEnvelopeId,
    string EnvelopeCode,
    int WorkforceBudgetId,
    string BudgetCode,
    int WorkforcePlanId,
    string PlanCode,
    int PositionId,
    int? BranchId,
    int AuthorizedHeadcount,
    int ReservedHeadcount,
    int HiredHeadcount,
    int AvailableHeadcount,
    decimal? AuthorizedSalaryCost,
    decimal? ReservedSalaryCost,
    decimal? ContractedSalaryCost,
    decimal? AvailableSalaryCost,
    string? CurrencyCode,
    int StaffingRequests,
    int Requisitions,
    int Openings,
    int Offers,
    int Hires);
