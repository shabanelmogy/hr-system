namespace HrManagementSystem.Application.Features.Security.ApiKeys.Contracts
{
    public class ApiKeyRequestValidator : AbstractValidator<ApiKeyRequest>
    {
        private readonly IStringLocalizer<ApiKeyRequest> _localizer;

        public ApiKeyRequestValidator(IStringLocalizer<ApiKeyRequest> localizer)
        {
            _localizer = localizer;

            RuleFor(c => c.Key)
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(5, 100)
                .WithMessage(_localizer[Strings.MaxLengthError]);

            RuleFor(c => c.ClientUri)
                .NotEmpty()
                .WithMessage(_localizer[Strings.Required])
                .Length(5, 100)
                .WithMessage(_localizer[Strings.MaxLengthError]);

            RuleFor(c => c.Description)
                .NotEmpty()
                .Length(5, 100)
                .WithMessage(_localizer[Strings.Required]);
        }
    }
}
