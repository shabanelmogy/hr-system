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
                .Must(x => !IsPropertyNameDuplicated(x))
                .WithMessage(_localizer[Strings.DuplicatedValue]);

            RuleFor(x => x)
                .Must(x => !IsColumnNameDuplicated(x))
                .WithMessage(_localizer[Strings.DuplicatedValue]);
        }
        private bool IsPropertyNameDuplicated(ReportDetailRequest request)
        {
            var newPropertyName = _dbContext.ReportsDetails.Any(c => c.PropertyName == request.PropertyName && c.ReportMasterId != request.ReportMasterId);
            return newPropertyName;
        }
        private bool IsColumnNameDuplicated(ReportDetailRequest request)
        {
            var newColumnName = _dbContext.ReportsDetails.Any(c => c.ColumnName == request.ColumnName && c.ReportMasterId != request.ReportMasterId);
            return newColumnName;
        }
    }
}
