namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.Reports.Contracts
{
    public class ReportMasterRequestValidator : AbstractValidator<ReportMasterRequest>
    {
        private readonly IStringLocalizer<ReportMasterRequest> _localizer;

        public ReportMasterRequestValidator(IStringLocalizer<ReportMasterRequest> localizer)
        {
            _localizer = localizer;

            RuleFor(x => x.ReportName)
                 .Trimmed()
                 .NotEmpty()
                 .WithMessage(_localizer[ValidationMessageKeys.Required])
                 .Length(2, 50)
                 .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError])
                 .Must(x => char.IsUpper(x[0]))
                 .WithMessage(_localizer[ValidationMessageKeys.MustStartWithCapitalLetter])
                 .Matches(@"^[A-Za-z\s]+$")
                 .WithMessage(_localizer[ValidationMessageKeys.EnglishLetterOnly]);

            RuleFor(x => x.ExportedName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[ValidationMessageKeys.Required])
                .Length(2, 50)
                .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError])
                .Must(x => char.IsUpper(x[0]))
                .WithMessage(_localizer[ValidationMessageKeys.MustStartWithCapitalLetter])
                .Matches(@"^[A-Za-z\s]+$")
                .WithMessage(_localizer[ValidationMessageKeys.EnglishLetterOnly]);

            RuleFor(cu => cu.ReportPath)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[ValidationMessageKeys.Required])
                .Length(6, 255)
                .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError])
                .Matches(@"^[A-Za-z\s]+$")
                .WithMessage(_localizer[ValidationMessageKeys.EnglishLetterOnly]);

            RuleFor(x => x.ViewName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[ValidationMessageKeys.Required])
                .Length(3, 50)
                .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError])
                .Must(x => char.IsUpper(x[0]))
                .WithMessage(_localizer[ValidationMessageKeys.MustStartWithCapitalLetter])
                .Matches(@"^[A-Za-z\s]+$")
                .WithMessage(_localizer[ValidationMessageKeys.EnglishLetterOnly]);

            RuleFor(x => x.Logo)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[ValidationMessageKeys.Required])
                .Length(3, 255)
                .WithMessage(_localizer[ValidationMessageKeys.MaxLengthError])
                .Matches(@"^[A-Za-z\s]+$")
                .WithMessage(_localizer[ValidationMessageKeys.EnglishLetterOnly]);
        }
    }
}
