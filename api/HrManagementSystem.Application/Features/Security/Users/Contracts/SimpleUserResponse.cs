namespace HrManagementSystem.Application.Features.Security.Users.Contracts
{
    public record SimpleUserResponse(
        string Id,
        string UserName
    );
}
