namespace HrManagementSystem.Features.GeographicalInformation.Districts.Contracts;

public class DistrictRequestValidator : AbstractValidator<DistrictRequest>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IStringLocalizer<DistrictRequest> _localizer;

    public DistrictRequestValidator(ApplicationDbContext dbContext, IStringLocalizer<DistrictRequest> localizer)
    {
        _dbContext = dbContext;
        _localizer = localizer;

        RuleFor(d => d.NameEn)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.NameEn)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(d => d.NameAr)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.NameAr)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 100)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(d => d.Code)
            .Trimmed()
            .NotEmpty()
            .WithName(Strings.Code)
            .WithMessage(_localizer[Strings.Required])
            .Length(2, 10)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(d => d.StateId)
            .GreaterThan(0)
            .WithName(Strings.State)
            .WithMessage(_localizer[Strings.Required]);

        RuleFor(d => d)
           .MustAsync(IsDistrictNameEnUniqueAsync)
           .WithName(Strings.NameEn)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(d => d)
           .MustAsync(IsDistrictNameArUniqueAsync)
           .WithName(Strings.NameAr)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(d => d)
           .MustAsync(IsCodeUniqueAsync)
           .WithName(Strings.Code)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(d => d)
           .MustAsync(IsStateValidAsync)
           .WithName(Strings.State)
           .WithMessage(_localizer[Strings.StateNotFound]);
    }

    private async Task<bool> IsDistrictNameEnUniqueAsync(DistrictRequest district, CancellationToken cancellationToken) =>
        !await _dbContext.Districts.AnyAsync(
            candidate => candidate.NameEn == district.NameEn && candidate.StateId == district.StateId && candidate.Id != district.Id,
            cancellationToken);

    private async Task<bool> IsDistrictNameArUniqueAsync(DistrictRequest district, CancellationToken cancellationToken) =>
        !await _dbContext.Districts.AnyAsync(
            candidate => candidate.NameAr == district.NameAr && candidate.StateId == district.StateId && candidate.Id != district.Id,
            cancellationToken);

    private async Task<bool> IsCodeUniqueAsync(DistrictRequest district, CancellationToken cancellationToken) =>
        !await _dbContext.Districts.AnyAsync(
            candidate => candidate.Code == district.Code && candidate.StateId == district.StateId && candidate.Id != district.Id,
            cancellationToken);

    private Task<bool> IsStateValidAsync(DistrictRequest district, CancellationToken cancellationToken) =>
        _dbContext.States.AnyAsync(state => state.Id == district.StateId && !state.IsDeleted, cancellationToken);
}
