namespace HrManagementSystem.Application.Features.Security.Users.Contracts;

public sealed record ArchiveUserRequest(string Reason);

public sealed class ArchiveUserRequestValidator : AbstractValidator<ArchiveUserRequest>
{
    public ArchiveUserRequestValidator()
    {
        RuleFor(request => request.Reason).NotEmpty().MaximumLength(1000);
    }
}
