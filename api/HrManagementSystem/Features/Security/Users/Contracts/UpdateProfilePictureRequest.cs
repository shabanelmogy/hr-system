namespace HrManagementSystem.Features.Security.Users.Contracts
{
    public record UpdateProfilePictureRequest(IFormFile? ProfilePicture, bool Remove = false);
}
