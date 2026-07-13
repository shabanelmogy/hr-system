using HrManagementSystem.Shared.Contracts;

namespace HrManagementSystem.Features.Platform.Files.Contracts
{
    public class UploadManyFilesRequestValidator : AbstractValidator<UploadManyFilesRequest>
    {
        private readonly IStringLocalizer<IFormFile> _fileLocalizer;

        public UploadManyFilesRequestValidator(IStringLocalizer<IFormFile> fileLocalizer)
        {
            _fileLocalizer = fileLocalizer;

            RuleFor(x => x.Files)
                .NotEmpty()
                .Must(files => files.Count <= FileSettings.MaxFilesPerRequest)
                .WithMessage(_fileLocalizer[Strings.TooManyFiles]);

            RuleForEach(x => x.Files)
                .SetValidator(new FileSizeValidator(_fileLocalizer))
                .SetValidator(new BlockedSignaturesValidator(_fileLocalizer))
                .SetValidator(new FileNameValidator(_fileLocalizer));
        }
    }
}
