namespace HrManagementSystem.Shared.Contracts
{
    public class BlockedSignaturesValidator : AbstractValidator<IFormFile>
    {
        private readonly IStringLocalizer<IFormFile> _iformLocalizer;

        public BlockedSignaturesValidator(IStringLocalizer<IFormFile> iformLocalizer)
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
                .WithMessage(_iformLocalizer[Strings.NotAllowedFileContent])
                .When(x => x is not null);
        }
    }
}
