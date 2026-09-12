using System.Reflection;
using ErpSystem.Modules.HR.Presentation.Common.Errors;
using ErpSystem.Modules.HR.Presentation.Features.Analytics.Views.V1;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Addresses.Services;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.AddressTypes.Services;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Districts.Services;
using ErpSystem.Modules.HR.Presentation.Features.Platform.Files.V1;
using ErpSystem.Modules.HR.Infrastructure.Hubs.GeneralHub;
using ErpSystem.Modules.HR.Presentation.Security.Authorization.Filters;
using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Application.Common.Errors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Newtonsoft.Json;

namespace ErpSystem.Tests;

public sealed class ApiHardeningTests
{
    [Fact]
    public void GeneralHub_DoesNotExposeClientInvokableBroadcastMethods()
    {
        var methods = typeof(GeneralHub)
            .GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(method =>
                !method.IsSpecialName &&
                method.GetBaseDefinition().DeclaringType == typeof(GeneralHub))
            .ToArray();

        Assert.Empty(methods);
    }

    [Fact]
    public void FilesController_UsesFileOperationsRateLimit()
    {
        var attribute = typeof(FilesController).GetCustomAttribute<EnableRateLimitingAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal("fileOperations", attribute.PolicyName);
    }

    [Fact]
    public void ViewsController_RequiresDatabaseViewPermission()
    {
        var attribute = typeof(ViewsController).GetCustomAttribute<HasPermissionAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal(Permissions.ManageDatabaseViews, attribute.Policy);
    }

    [Fact]
    public void ResultProblem_MapsApplicationErrorTypeToHttpStatusCode()
    {
        var result = Result.Failure(new Error("Test.NotFound", "Not found", ErrorType.NotFound));

        var response = result.ToProblem();

        Assert.Equal(404, response.StatusCode);
        var details = Assert.IsType<ProblemDetails>(response.Value);
        Assert.Equal(404, details.Status);
    }

    [Fact]
    public void ResultProblem_MapsServiceUnavailableToHttp503()
    {
        var result = Result.Failure(new Error(
            "Test.ServiceUnavailable",
            "Service unavailable",
            ErrorType.ServiceUnavailable));

        var response = result.ToProblem();

        Assert.Equal(503, response.StatusCode);
        var details = Assert.IsType<ProblemDetails>(response.Value);
        Assert.Equal(503, details.Status);
    }

    [Theory]
    [InlineData(typeof(IAddressService), nameof(IAddressService.GetAsync))]
    [InlineData(typeof(IAddressTypeService), nameof(IAddressTypeService.GetAsync))]
    [InlineData(typeof(IDistrictService), nameof(IDistrictService.GetAsync))]
    public void ResultServiceMethods_ReturnNonNullableTask(Type serviceType, string methodName)
    {
        var method = serviceType.GetMethod(methodName)
            ?? throw new InvalidOperationException($"Method {methodName} was not found.");

        Assert.Equal(NullabilityState.NotNull, new NullabilityInfoContext().Create(method.ReturnParameter).ReadState);
    }

    [Theory]
    [InlineData("en-US.json")]
    [InlineData("ar-EG.json")]
    public void LocalizationResources_ParseWithApplicationJsonReader(string fileName)
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null &&
               !Directory.Exists(Path.Combine(
                   directory.FullName,
                   "Modules",
                   "HR",
                   "ErpSystem.Modules.HR.Infrastructure")))
        {
            directory = directory.Parent;
        }

        Assert.NotNull(directory);
        var path = Path.Combine(
            directory!.FullName,
            "Modules",
            "HR",
            "ErpSystem.Modules.HR.Infrastructure",
            "Localization",
            "Resources",
            fileName);

        using var stream = File.OpenRead(path);
        using var textReader = new StreamReader(stream);
        using var jsonReader = new JsonTextReader(textReader);
        while (jsonReader.Read())
        {
        }
    }
}
