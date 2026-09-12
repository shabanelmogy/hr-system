using FluentValidation;
using ErpSystem.BuildingBlocks.Application;
using ErpSystem.Modules.Contacts.Application;
using ErpSystem.Modules.Contacts.Application.Parties;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

public sealed class ContactsApplicationPipelineTests
{
    [Fact]
    public void ContactsApplication_RegistersOwnedValidatorsAndSharedPipeline()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddContactsApplication();

        using var provider = services.BuildServiceProvider();

        Assert.NotNull(provider.GetRequiredService<IValidator<CreatePartyCommand>>());
        Assert.NotNull(provider.GetRequiredService<IValidator<UpdatePartyCommand>>());
        Assert.Equal(
            2,
            provider.GetServices<IPipelineBehavior<CreatePartyCommand, PartyResponse>>().Count());
    }

    [Fact]
    public async Task ContactsValidationBehavior_StopsInvalidCreateBeforeHandler()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddContactsApplication();

        using var provider = services.BuildServiceProvider();
        var behavior = provider
            .GetServices<IPipelineBehavior<CreatePartyCommand, PartyResponse>>()
            .OfType<ValidationBehavior<CreatePartyCommand, PartyResponse>>()
            .Single();
        var handlerWasCalled = false;

        await Assert.ThrowsAsync<ValidationException>(() =>
            behavior.Handle(
                new CreatePartyCommand("", "not-an-email", new string('1', 65)),
                _ =>
                {
                    handlerWasCalled = true;
                    return Task.FromResult(new PartyResponse(
                        Guid.NewGuid(), "unused", null, null, DateTimeOffset.UtcNow, null));
                },
                CancellationToken.None));

        Assert.False(handlerWasCalled);
    }

    [Fact]
    public async Task ContactsValidators_EnforceUpdateIdentityAndOptionalFieldRules()
    {
        var validator = new UpdatePartyCommandValidator();
        var result = await validator.ValidateAsync(new UpdatePartyCommand(
            Guid.Empty,
            "valid name",
            "invalid",
            new string('1', 65)));

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(UpdatePartyCommand.Id));
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(UpdatePartyCommand.Email));
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(UpdatePartyCommand.Phone));
    }

    [Fact]
    public async Task ContactsValidators_ProduceSingleRequiredFailureForWhitespaceDisplayName()
    {
        var createResult = await new CreatePartyCommandValidator().ValidateAsync(
            new CreatePartyCommand("   ", null, null));
        var updateResult = await new UpdatePartyCommandValidator().ValidateAsync(
            new UpdatePartyCommand(Guid.NewGuid(), "   ", null, null));

        Assert.Single(createResult.Errors, error =>
            error.PropertyName == nameof(CreatePartyCommand.DisplayName));
        Assert.Single(updateResult.Errors, error =>
            error.PropertyName == nameof(UpdatePartyCommand.DisplayName));
    }
}
