using ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Errors;
using ErpSystem.Modules.HR.Infrastructure.Dependencies;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Tests;

public sealed class WorkforcePlanningDependencyRegistrationTests
{
    [Fact]
    public void AddErrorsService_RegistersAllWorkforcePlanningErrorCatalogs()
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddLocalization();
        services.AddErrorsService();

        using var provider = services.BuildServiceProvider(new ServiceProviderOptions
        {
            ValidateOnBuild = true,
            ValidateScopes = true
        });
        using var scope = provider.CreateScope();

        Assert.NotNull(scope.ServiceProvider.GetRequiredService<WorkforcePlanErrors>());
        Assert.NotNull(scope.ServiceProvider.GetRequiredService<WorkforceBudgetErrors>());
    }
}
