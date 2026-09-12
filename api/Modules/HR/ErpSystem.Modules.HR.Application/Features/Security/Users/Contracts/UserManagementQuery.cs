using ErpSystem.Modules.HR.Application.Common.Paginations;

namespace ErpSystem.Modules.HR.Application.Features.Security.Users.Contracts;

public sealed record UserManagementQuery : PaginationRequest
{
    public bool IncludeArchived { get; init; }
}

public sealed class UserManagementQueryValidator : AbstractValidator<UserManagementQuery>
{
    public UserManagementQueryValidator()
    {
        RuleFor(request => request.PageNumber).GreaterThan(0);
        RuleFor(request => request.PageSize).InclusiveBetween(1, PaginationRequest.MaxPageSize);
        RuleFor(request => request.SearchValue).MaximumLength(256);
    }
}
