namespace HrManagementSystem.Features.Analytics.Reports.Contracts
{
    public class ReportDetailRequestValidator : AbstractValidator<ReportDetailRequest>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IStringLocalizer<ReportDetailRequest> _localizer;

        public ReportDetailRequestValidator(ApplicationDbContext dbContext, IStringLocalizer<ReportDetailRequest> localizer)
        {
            _dbContext = dbContext;
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
            !await _dbContext.ReportsDetails.AnyAsync(
                detail => detail.PropertyName == request.PropertyName &&
                          detail.ReportMasterId == request.ReportMasterId &&
                          detail.Id != request.Id,
                cancellationToken);

        private async Task<bool> IsColumnNameUniqueAsync(ReportDetailRequest request, CancellationToken cancellationToken) =>
            !await _dbContext.ReportsDetails.AnyAsync(
                detail => detail.ColumnName == request.ColumnName &&
                          detail.ReportMasterId == request.ReportMasterId &&
                          detail.Id != request.Id,
                cancellationToken);
    }
}
