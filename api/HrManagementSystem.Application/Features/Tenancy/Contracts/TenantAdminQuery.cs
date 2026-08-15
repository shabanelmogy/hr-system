using HrManagementSystem.Application.Common.Paginations;

namespace HrManagementSystem.Application.Features.Tenancy.Contracts;

public sealed record TenantAdminQuery : PaginationRequest
{
    public bool IncludeArchived { get; init; }
}

public sealed class TenantAdminQueryValidator : AbstractValidator<TenantAdminQuery>
{
    public TenantAdminQueryValidator()
    {
        RuleFor(request => request.PageNumber).GreaterThan(0);
        RuleFor(request => request.PageSize).InclusiveBetween(1, PaginationRequest.MaxPageSize);
        RuleFor(request => request.SearchValue).MaximumLength(256);
    }
}
