using HrManagementSystem.Application.Common.Contracts;

namespace HrManagementSystem.Application.Features.Platform.Files.Contracts
{
    public class UploadFileRequestValidator : AbstractValidator<UploadFileRequest>
    {
        private readonly IStringLocalizer<FileUpload> _fileSizeLocalizer;

        public UploadFileRequestValidator(IStringLocalizer<FileUpload> fileSizeLocalizer)
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
