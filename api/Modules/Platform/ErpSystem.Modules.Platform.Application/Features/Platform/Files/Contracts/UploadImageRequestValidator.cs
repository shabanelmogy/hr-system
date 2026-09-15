using ErpSystem.Modules.Platform.Application.Files.Validation;

namespace ErpSystem.Modules.Platform.Application.Features.Platform.Files.Contracts
{
    public class UploadImageRequestValidator : AbstractValidator<UploadImageRequest>
    {
        private readonly IStringLocalizer<FileUpload> _fileLocalizer;

        public UploadImageRequestValidator(IStringLocalizer<FileUpload> fileLocalizer)
        {
            _fileLocalizer = fileLocalizer;

            RuleFor(x => x.Image)
                .SetValidator(new FileSizeValidator(_fileLocalizer, FileSettings.MaxImageFileSizeInMB))
                .SetValidator(new BlockedSignaturesValidator(_fileLocalizer))
                .SetValidator(new FileContentTypeValidator(_fileLocalizer))
                .SetValidator(new FileNameValidator(_fileLocalizer));

            RuleFor(x => x.Image)
                .Must((request, context) =>
                {
                    var extension = Path.GetExtension(request.Image.FileName).ToLowerInvariant();
                    return FileSettings.AllowedImagesExtensions.Contains(extension);
                })
                .WithMessage(_fileLocalizer[ValidationMessageKeys.ExtensionFileNotAllowed])
                .When(x => x.Image is not null);
        }
    }
}
