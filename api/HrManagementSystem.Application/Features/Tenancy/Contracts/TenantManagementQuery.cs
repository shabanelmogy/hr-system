using HrManagementSystem.Application.Common.Paginations;

namespace HrManagementSystem.Application.Features.Tenancy.Contracts;

public sealed record TenantManagementQuery : PaginationRequest
{
    public bool IncludeArchived { get; init; }
}

public sealed class TenantManagementQueryValidator : AbstractValidator<TenantManagementQuery>
{
    public TenantManagementQueryValidator()
    {
        RuleFor(request => request.PageNumber).GreaterThan(0);
        RuleFor(request => request.PageSize).InclusiveBetween(1, PaginationRequest.MaxPageSize);
        RuleFor(request => request.SearchValue).MaximumLength(200);
        RuleFor(request => request.SortDirection)
            .Must(value => value is null || value.Equals("ASC", StringComparison.OrdinalIgnoreCase) ||
                value.Equals("DESC", StringComparison.OrdinalIgnoreCase));
    }
}
