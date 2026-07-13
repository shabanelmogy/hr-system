namespace HrManagementSystem.Features.Security.Authentication.Contracts
{
    public record AuthResponse(
        string Id,
        string UserName,
        string FirstName,
        string LastName,
        string Token,
        DateTime TokenExpiration,
        string RefreshToken,
        DateTime RefreshTokenExpiration
        );
}
