using HrManagementSystem.Shared.Contracts;

namespace HrManagementSystem.Features.Platform.Files.Contracts
{
    public class UploadFileRequestValidator : AbstractValidator<UploadFileRequest>
    {
        private readonly IStringLocalizer<IFormFile> _fileSizeLocalizer;

        public UploadFileRequestValidator(IStringLocalizer<IFormFile> fileSizeLocalizer)
        {
            _fileSizeLocalizer = fileSizeLocalizer;

            RuleFor(x => x.File)
                .SetValidator(new FileSizeValidator(_fileSizeLocalizer))
                .SetValidator(new BlockedSignaturesValidator(_fileSizeLocalizer))
                .SetValidator(new FileContentTypeValidator(_fileSizeLocalizer))
                .SetValidator(new FileNameValidator(_fileSizeLocalizer));
        }
    }
}
