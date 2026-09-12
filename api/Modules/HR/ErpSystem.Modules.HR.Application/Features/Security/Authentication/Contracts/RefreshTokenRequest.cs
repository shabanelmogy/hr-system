namespace ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts
{
    public record RefreshTokenRequest(
        string? Token,
        string RefreshToken
        );


}
