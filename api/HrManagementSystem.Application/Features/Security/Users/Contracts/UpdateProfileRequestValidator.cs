using HrManagementSystem.Application.Features.Security.Users.Abstractions;

namespace HrManagementSystem.Application.Features.Security.Users.Contracts
{
    public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequest>
    {
        private readonly IUserValidationQueries _queries;
        private readonly IStringLocalizer<UpdateProfileRequest> _localizer;

        public UpdateProfileRequestValidator(IUserValidationQueries queries, IStringLocalizer<UpdateProfileRequest> localizer)
        {
            _queries = queries;
            _localizer = localizer;

            RuleFor(x => x.FirstName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(3, 50)
                .WithMessage(_localizer[Strings.MaxLengthError]);

            RuleFor(x => x.LastName)
                .Trimmed()
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(3, 50)
                .WithMessage(_localizer[Strings.MaxLengthError]);

            RuleFor(x => x.UserName)
              .Trimmed()
              .NotEmpty()
              .WithMessage(_localizer[Strings.Required])
              .Length(3, 50)
              .WithMessage(_localizer[Strings.MaxLengthError]);

            RuleFor(c => c)
                .MustAsync(IsUserNameUniqueAsync)
               .WithMessage(_localizer[Strings.DuplicatedValue]);

        }

        private async Task<bool> IsUserNameUniqueAsync(UpdateProfileRequest profile, CancellationToken cancellationToken) =>
            !await _queries.UserNameExistsAsync(profile.UserName, profile.Id, cancellationToken);
    }
}
