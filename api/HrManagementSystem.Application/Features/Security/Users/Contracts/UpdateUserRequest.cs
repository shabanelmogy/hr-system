namespace HrManagementSystem.Application.Features.Security.Users.Contracts
{
    public record UpdateUserRequest(
        string FirstName,
        string LastName,
        string UserName,
        string Email,
        IList<string> Roles,
        IReadOnlyCollection<int>? CompanyIds = null
    );
}
