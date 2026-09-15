using FluentValidation;

namespace ErpSystem.Modules.Contacts.Application.Parties;

public sealed class CreatePartyCommandValidator : AbstractValidator<CreatePartyCommand>
{
    public CreatePartyCommandValidator()
    {
        RuleFor(command => command.DisplayName)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("Display name is required.")
            .MaximumLength(256);
        RuleFor(command => command.Email)
            .MaximumLength(320)
            .EmailAddress()
            .When(command => !string.IsNullOrWhiteSpace(command.Email));
        RuleFor(command => command.Phone)
            .MaximumLength(64)
            .When(command => !string.IsNullOrWhiteSpace(command.Phone));
    }
}

public sealed class UpdatePartyCommandValidator : AbstractValidator<UpdatePartyCommand>
{
    public UpdatePartyCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
        RuleFor(command => command.ExpectedRevision).GreaterThan(0);
        RuleFor(command => command.DisplayName)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .Must(value => !string.IsNullOrWhiteSpace(value))
            .WithMessage("Display name is required.")
            .MaximumLength(256);
        RuleFor(command => command.Email)
            .MaximumLength(320)
            .EmailAddress()
            .When(command => !string.IsNullOrWhiteSpace(command.Email));
        RuleFor(command => command.Phone)
            .MaximumLength(64)
            .When(command => !string.IsNullOrWhiteSpace(command.Phone));
    }
}
