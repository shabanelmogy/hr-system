namespace ErpSystem.Modules.HR.Application.Features.Security.Users.Contracts
{
    public record UpdateProfilePictureRequest(FileUpload? ProfilePicture, bool Remove = false);
}
