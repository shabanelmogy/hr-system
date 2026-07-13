using HrManagementSystem.Shared.Contracts;

namespace HrManagementSystem.Features.Platform.Files.Contracts
{
    public class UploadImageRequestValidator : AbstractValidator<UploadImageRequest>
    {
        private readonly IStringLocalizer<IFormFile> _fileLocalizer;

        public UploadImageRequestValidator(IStringLocalizer<IFormFile> fileLocalizer)
        {
            _fileLocalizer = fileLocalizer;

            RuleFor(x => x.Image)
                .SetValidator(new FileSizeValidator(_fileLocalizer))
                //.SetValidator(new BlockedSignaturesValidator(_fileLocalizer))
                .SetValidator(new FileNameValidator(_fileLocalizer));

            RuleFor(x => x.Image)
                .Must((request, context) =>
                {
                    var extension = Path.GetExtension(request.Image.FileName.ToLower());
                    return FileSettings.AllowedImagesExtensions.Contains(extension);
                })
                .WithMessage(_fileLocalizer[Strings.ExtensionFileNotAllowed])
                .When(x => x.Image is not null);
        }
    }
}