namespace HrManagementSystem.Features.Security.ApiKeys.Contracts
{
    public class ApiKeyRequestValidator : AbstractValidator<ApiKeyRequest>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IStringLocalizer<ApiKeyRequest> _localizer;

        public ApiKeyRequestValidator(ApplicationDbContext dbContext, IStringLocalizer<ApiKeyRequest> localizer)
        {
            _dbContext = dbContext;
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
