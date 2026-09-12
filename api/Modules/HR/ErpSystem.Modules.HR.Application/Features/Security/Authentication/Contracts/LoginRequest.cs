namespace ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts
{
    public record LoginRequest(
        string UserName,
        string Password
        );
}