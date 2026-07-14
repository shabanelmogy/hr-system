using HrManagementSystem.Shared.Contracts;

namespace HrManagementSystem.Features.Security.Users.Contracts
{
    public class UpdateProfilePictureRequestValidator : AbstractValidator<UpdateProfilePictureRequest>
    {
        private readonly IStringLocalizer<IFormFile> _fileLocalizer;

        public UpdateProfilePictureRequestValidator(IStringLocalizer<IFormFile> fileLocalizer)
        {
            _fileLocalizer = fileLocalizer;

            RuleFor(x => x)
                .Must(request => request.Remove || request.ProfilePicture is not null)
                .WithMessage(_fileLocalizer[Strings.Required]);

            RuleFor(x => x.ProfilePicture!)
                .SetValidator(new FileSizeValidator(_fileLocalizer))
                .SetValidator(new BlockedSignaturesValidator(_fileLocalizer))
                .SetValidator(new FileNameValidator(_fileLocalizer))
                .Must(file => FileSettings.AllowedImagesExtensions.Contains(
                    Path.GetExtension(file!.FileName).ToLowerInvariant()))
                .WithMessage(_fileLocalizer[Strings.ExtensionFileNotAllowed])
                .When(x => !x.Remove && x.ProfilePicture is not null);
        }
    }
}
