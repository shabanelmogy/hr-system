using HrManagementSystem.Application.Features.Analytics.Reports.Abstractions;

namespace HrManagementSystem.Application.Features.Analytics.Reports.Contracts
{
    public class ReportCategoryRequestValidator : AbstractValidator<ReportCategoryRequest>
    {
        private readonly IReportValidationQueries _queries;
        private readonly IStringLocalizer<ReportCategoryRequest> _localizer;

        public ReportCategoryRequestValidator(IReportValidationQueries queries, IStringLocalizer<ReportCategoryRequest> localizer)
        {
            _queries = queries;
            _localizer = localizer;

            RuleFor(x => x.Name)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(3, 50)
                .WithMessage(_localizer[Strings.MaxLengthError])
                .Matches(@"^[A-Za-z\s]+$")
                .WithMessage(_localizer[Strings.EnglishLetterOnly]);

            RuleFor(x => x.Name)
                .Must(x => char.IsUpper(x[0]))
                .WithMessage(_localizer[Strings.MustStartWithCapitalLetter])
                .When(x => !string.IsNullOrEmpty(x.Name));

            RuleFor(x => x)
                .MustAsync(IsNameUniqueAsync)
                .WithMessage(_localizer[Strings.DuplicatedValue]);
        }
        private async Task<bool> IsNameUniqueAsync(ReportCategoryRequest request, CancellationToken cancellationToken) =>
            !await _queries.ReportCategoryNameExistsAsync(request.Name, request.Id, cancellationToken);
    }
}
