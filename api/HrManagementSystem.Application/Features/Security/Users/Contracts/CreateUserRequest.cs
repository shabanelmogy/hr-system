namespace HrManagementSystem.Application.Features.Security.Users.Contracts
{
    public record CreateUserRequest(
        string FirstName,
        string LastName,
        string UserName,
        string Email,
        string Password,
        IList<string> Roles,
        IReadOnlyCollection<int>? CompanyIds = null
    );
}
