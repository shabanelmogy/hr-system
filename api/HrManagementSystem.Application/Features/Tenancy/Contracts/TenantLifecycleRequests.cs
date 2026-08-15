namespace HrManagementSystem.Application.Features.Tenancy.Contracts;

public sealed record ArchiveTenantRequest(
    string Reason,
    DateTime? PurgeScheduledOn,
    string RowVersion);

public sealed class ArchiveTenantRequestValidator : AbstractValidator<ArchiveTenantRequest>
{
    public ArchiveTenantRequestValidator()
    {
        RuleFor(request => request.Reason).NotEmpty().MaximumLength(1000);
        RuleFor(request => request.PurgeScheduledOn)
            .GreaterThan(DateTime.UtcNow)
            .When(request => request.PurgeScheduledOn.HasValue);
        RuleFor(request => request.RowVersion)
            .NotEmpty()
            .MaximumLength(64)
            .Must(IsBase64)
            .WithMessage("Row version is invalid.");
    }

    private static bool IsBase64(string value)
    {
        Span<byte> buffer = stackalloc byte[value.Length];
        return Convert.TryFromBase64String(value, buffer, out _);
    }
}

public sealed record RestoreTenantRequest(string RowVersion);

public sealed class RestoreTenantRequestValidator : AbstractValidator<RestoreTenantRequest>
{
    public RestoreTenantRequestValidator()
    {
        RuleFor(request => request.RowVersion)
            .NotEmpty()
            .MaximumLength(64)
            .Must(IsBase64)
            .WithMessage("Row version is invalid.");
    }

    private static bool IsBase64(string value)
    {
        Span<byte> buffer = stackalloc byte[value.Length];
        return Convert.TryFromBase64String(value, buffer, out _);
    }
}
