namespace HrManagementSystem.Features.Security.Authentication.Contracts
{
    public record SimpleAuthResponse(
        string UserName,
        string Password
        );
}
