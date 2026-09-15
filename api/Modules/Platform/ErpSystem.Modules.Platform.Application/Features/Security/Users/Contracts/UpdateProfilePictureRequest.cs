namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts
{
    public record UpdateProfilePictureRequest(FileUpload? ProfilePicture, bool Remove = false);
}
