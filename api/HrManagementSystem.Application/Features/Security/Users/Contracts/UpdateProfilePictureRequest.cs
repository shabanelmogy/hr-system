namespace HrManagementSystem.Application.Features.Security.Users.Contracts
{
    public record UpdateProfilePictureRequest(FileUpload? ProfilePicture, bool Remove = false);
}
