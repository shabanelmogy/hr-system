namespace HrManagementSystem.Features.Security.Authentication.Contracts
{
    public record RegisterRequest
        (
         string FirstName,
         string LastName,
         string UserName,
         string Email,
         string Password,
         byte[]? ProfilePicture
        );
}
