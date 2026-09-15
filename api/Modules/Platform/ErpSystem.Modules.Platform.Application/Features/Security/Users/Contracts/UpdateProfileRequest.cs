namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts
{
    public record UpdateProfileRequest(
        string? Id,
        string UserName,
        string FirstName,
        string LastName
    );
}