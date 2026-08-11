namespace HrManagementSystem.Application.Features.Security.Authentication.Contracts
{
    public record LoginRequest(
        string UserName,
        string Password
        );
}