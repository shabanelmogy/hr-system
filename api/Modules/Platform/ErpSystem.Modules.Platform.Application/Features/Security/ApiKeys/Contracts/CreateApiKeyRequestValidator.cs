namespace ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Contracts;

public sealed class CreateApiKeyRequestValidator : AbstractValidator<CreateApiKeyRequest>
{
    public CreateApiKeyRequestValidator(
        IStringLocalizer<CreateApiKeyRequest> localizer,
        TimeProvider timeProvider)
    {
        RuleFor(request => request.ClientUri)
            .NotEmpty()
            .WithMessage(localizer[ValidationMessageKeys.Required])
            .MaximumLength(100)
            .WithMessage(localizer[ValidationMessageKeys.MaxLengthError])
            .Must(value => Uri.TryCreate(value, UriKind.Absolute, out var uri) &&
                           (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            .WithMessage(localizer["InvalidClientUri"]);

        RuleFor(request => request.Description)
            .NotEmpty()
            .WithMessage(localizer[ValidationMessageKeys.Required])
            .MaximumLength(100)
            .WithMessage(localizer[ValidationMessageKeys.MaxLengthError]);

        RuleFor(request => request.ExpiresAt)
            .Must(expiresAt => !expiresAt.HasValue ||
                               expiresAt.Value > timeProvider.GetUtcNow().UtcDateTime)
            .When(request => request.ExpiresAt.HasValue)
            .WithMessage(localizer["ApiKeyExpiryMustBeFuture"]);
    }
}
