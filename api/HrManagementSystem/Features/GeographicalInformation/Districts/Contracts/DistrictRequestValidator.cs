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
           .Must(d => !IsDistrictNameEnDuplicated(d))
           .WithName(Strings.NameEn)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(d => d)
           .Must(d => !IsDistrictNameArDuplicated(d))
           .WithName(Strings.NameAr)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(d => d)
           .Must(d => !IsCodeDuplicated(d))
           .WithName(Strings.Code)
           .WithMessage(_localizer[Strings.DuplicatedValue]);

        RuleFor(d => d)
           .Must(d => IsStateExists(d.StateId))
           .WithName(Strings.State)
           .WithMessage(_localizer[Strings.StateNotFound]);
    }

    private bool IsDistrictNameEnDuplicated(DistrictRequest district)
    {
        return _dbContext.Districts.Any(d => d.NameEn == district.NameEn && d.StateId == district.StateId && d.Id != district.Id);
    }

    private bool IsDistrictNameArDuplicated(DistrictRequest district)
    {
        return _dbContext.Districts.Any(d => d.NameAr == district.NameAr && d.StateId == district.StateId && d.Id != district.Id);
    }

    private bool IsCodeDuplicated(DistrictRequest district)
    {
        return _dbContext.Districts.Any(d => d.Code == district.Code && d.StateId == district.StateId && d.Id != district.Id);
    }

    private bool IsStateExists(int stateId)
    {
        return _dbContext.States.Any(s => s.Id == stateId && !s.IsDeleted);
    }
}