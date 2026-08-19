using FluentValidation;
using HrManagementSystem.Application.Features.GeographicalInformation.Countries.Commands.CreateCountry;
using HrManagementSystem.Infrastructure.Validation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;

namespace HrManagementSystem.Tests;

public sealed class AsyncValidationFilterTests
{
    [Fact]
    public async Task MediatRRequests_AreLeftForTheMediatRPipeline()
    {
        var services = new ServiceCollection();
        services.AddSingleton<IValidator<CreateCountryCommand>, UnexpectedValidator>();
        using var provider = services.BuildServiceProvider();
        var filter = new AsyncValidationFilter(provider);
        var actionContext = new ActionContext(
            new DefaultHttpContext(),
            new RouteData(),
            new ActionDescriptor(),
            new ModelStateDictionary());
        var filters = new List<IFilterMetadata>();
        var controller = new object();
        var context = new ActionExecutingContext(
            actionContext,
            filters,
            new Dictionary<string, object?>
            {
                ["command"] = new CreateCountryCommand(
                    "مصر",
                    "Egypt",
                    "EG",
                    "EGY",
                    "+20",
                    "EGP")
            },
            controller);
        var nextWasCalled = false;

        await filter.OnActionExecutionAsync(
            context,
            () =>
            {
                nextWasCalled = true;
                return Task.FromResult(new ActionExecutedContext(actionContext, filters, controller));
            });

        Assert.True(nextWasCalled);
    }

    private sealed class UnexpectedValidator : AbstractValidator<CreateCountryCommand>
    {
        public UnexpectedValidator()
        {
            RuleFor(command => command.NameEn)
                .Must(_ => throw new InvalidOperationException("MVC validation should not run."));
        }
    }
}
