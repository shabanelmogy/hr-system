namespace HrManagementSystem.Features.Security.Authentication.Contracts
{
    public record RefreshTokenRequest(
        string? Token,
        string RefreshToken
        );


}
