namespace HrManagementSystem.Application.Features.Analytics.Reports.Contracts
{
    public class ReportDetailRequestValidator : AbstractValidator<ReportDetailRequest>
    {
        private readonly IReportValidationQueries _queries;
        private readonly IStringLocalizer<ReportDetailRequest> _localizer;

        public ReportDetailRequestValidator(IReportValidationQueries queries, IStringLocalizer<ReportDetailRequest> localizer)
        {
            _queries = queries;
            _localizer = localizer;

            RuleFor(x => x.PropertyName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(2, 50)
                .WithMessage(_localizer[Strings.MaxLengthError])
                .Must(x => char.IsUpper(x[0]))
                .WithMessage(_localizer[Strings.MustStartWithCapitalLetter])
                .Matches(@"^[A-Za-z\s]+$")
                .WithMessage(_localizer[Strings.EnglishLetterOnly]);

            RuleFor(x => x.ColumnName)
                  .Trimmed()
                  .NotEmpty()
                  .WithMessage(_localizer[Strings.Required])
                  .Length(2, 50)
                  .WithMessage(_localizer[Strings.MaxLengthError])
                  .Must(x => char.IsUpper(x[0]))
                  .WithMessage(_localizer[Strings.MustStartWithCapitalLetter])
                  .Matches(@"^[A-Za-z\s]+$")
                  .WithMessage(_localizer[Strings.EnglishLetterOnly]);

            RuleFor(cu => cu.ReportMasterId)
                 .GreaterThan(0)
                 .WithMessage(_localizer[Strings.GreaterThanZero]);

            RuleFor(x => x)
                .MustAsync(IsPropertyNameUniqueAsync)
                .WithMessage(_localizer[Strings.DuplicatedValue]);

            RuleFor(x => x)
                .MustAsync(IsColumnNameUniqueAsync)
                .WithMessage(_localizer[Strings.DuplicatedValue]);
        }
        private async Task<bool> IsPropertyNameUniqueAsync(ReportDetailRequest request, CancellationToken cancellationToken) =>
            !await _queries.ReportDetailPropertyNameExistsAsync(
                request.PropertyName,
                request.ReportMasterId,
                request.Id,
                cancellationToken);

        private async Task<bool> IsColumnNameUniqueAsync(ReportDetailRequest request, CancellationToken cancellationToken) =>
            !await _queries.ReportDetailColumnNameExistsAsync(
                request.ColumnName,
                request.ReportMasterId,
                request.Id,
                cancellationToken);
    }
}
