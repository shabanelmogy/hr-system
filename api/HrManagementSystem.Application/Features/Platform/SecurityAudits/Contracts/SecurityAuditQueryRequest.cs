using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Domain.Platform.SecurityAudits.Enums;

namespace HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;

public sealed record SecurityAuditQueryRequest : PaginationRequest
{
    public string? TenantId { get; init; }
    public int? CompanyId { get; init; }
    public string? ActorUserId { get; init; }
    public string? Action { get; init; }
    public string? TargetType { get; init; }
    public SecurityAuditOutcome? Outcome { get; init; }
    public DateTime? FromUtc { get; init; }
    public DateTime? ToUtc { get; init; }
}

public sealed class SecurityAuditQueryRequestValidator : AbstractValidator<SecurityAuditQueryRequest>
{
    public SecurityAuditQueryRequestValidator()
    {
        RuleFor(request => request.PageNumber).GreaterThan(0);
        RuleFor(request => request.PageSize)
            .InclusiveBetween(1, PaginationRequest.MaxPageSize);
        RuleFor(request => request.TenantId).MaximumLength(32);
        RuleFor(request => request.ActorUserId).MaximumLength(450);
        RuleFor(request => request.Action).MaximumLength(100);
        RuleFor(request => request.TargetType).MaximumLength(100);
        RuleFor(request => request.CompanyId).GreaterThan(0).When(request => request.CompanyId.HasValue);
        RuleFor(request => request.ToUtc)
            .GreaterThanOrEqualTo(request => request.FromUtc)
            .When(request => request.FromUtc.HasValue && request.ToUtc.HasValue);
    }
}
