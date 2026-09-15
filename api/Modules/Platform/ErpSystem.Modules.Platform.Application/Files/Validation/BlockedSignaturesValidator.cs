using ErpSystem.Modules.Platform.Application.Files.Settings;

namespace ErpSystem.Modules.Platform.Application.Files.Validation
{
    public class BlockedSignaturesValidator : AbstractValidator<FileUpload>
    {
        private readonly IStringLocalizer<FileUpload> _iformLocalizer;

        public BlockedSignaturesValidator(IStringLocalizer<FileUpload> iformLocalizer)
        {
            _iformLocalizer = iformLocalizer;

            RuleFor(x => x)
                .Must((request, context) =>
                {
                    using BinaryReader binary = new(request.OpenReadStream());
                    var bytes = binary.ReadBytes(2);

                    var fileSequenceHex = BitConverter.ToString(bytes);

                    foreach (var signature in FileSettings.BlockedSignatures)
                        if (signature.Equals(fileSequenceHex, StringComparison.OrdinalIgnoreCase))
                            return false;

                    return true;
                })
                .WithMessage(_iformLocalizer[ValidationMessageKeys.NotAllowedFileContent])
                .When(x => x is not null);
        }
    }
}
