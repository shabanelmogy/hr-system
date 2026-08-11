namespace HrManagementSystem.Application.Features.Security.ApiKeys.Contracts;

public sealed class UpdateApiKeyRequestValidator : AbstractValidator<UpdateApiKeyRequest>
{
    public UpdateApiKeyRequestValidator(
        IStringLocalizer<UpdateApiKeyRequest> localizer,
        TimeProvider timeProvider)
    {
        RuleFor(request => request.Id)
            .GreaterThan(0)
            .WithMessage(localizer[Strings.GreaterThanZero]);

        RuleFor(request => request.ClientUri)
            .NotEmpty()
            .WithMessage(localizer[Strings.Required])
            .MaximumLength(100)
            .WithMessage(localizer[Strings.MaxLengthError])
            .Must(value => Uri.TryCreate(value, UriKind.Absolute, out var uri) &&
                           (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            .WithMessage(localizer["InvalidClientUri"]);

        RuleFor(request => request.Description)
            .NotEmpty()
            .WithMessage(localizer[Strings.Required])
            .MaximumLength(100)
            .WithMessage(localizer[Strings.MaxLengthError]);

        RuleFor(request => request.ExpiresAt)
            .Must(expiresAt => !expiresAt.HasValue ||
                               expiresAt.Value > timeProvider.GetUtcNow().UtcDateTime)
            .When(request => request.ExpiresAt.HasValue)
            .WithMessage(localizer["ApiKeyExpiryMustBeFuture"]);
    }
}
