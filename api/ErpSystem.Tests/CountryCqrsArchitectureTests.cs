using ErpSystem.Modules.HR.Presentation.Features.GeographicalInformation.Countries.V1;
using ErpSystem.Modules.HR.Application.Abstractions.Messaging;
using ErpSystem.Modules.HR.Application.Common.Errors;
using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Common.Consts;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Abstractions;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Commands.ArchiveCountry;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Commands.BulkArchiveCountries;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Commands.CreateCountry;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Commands.CreateCountries;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Commands.RestoreCountry;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Commands.UpdateCountry;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Contracts;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Mapping;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Queries.GetCountries;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Queries.GetCountryById;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Queries.GetCountryLookup;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Queries.GetCountryWithStates;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Queries.GetCountryReportData;
using ErpSystem.Modules.HR.Infrastructure.Features.GeographicalInformation.Countries.Persistence;
using Mapster;
using MapsterMapper;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Http;
using ErpSystem.Modules.HR.Presentation.Security.Authorization.Filters;
using System.Reflection;

namespace ErpSystem.Tests;

public sealed class CountryCqrsArchitectureTests
{
    [Fact]
    public void Controller_DependsOnlyOnSender()
    {
        var constructor = Assert.Single(typeof(CountriesController).GetConstructors());

        Assert.Equal([typeof(ISender)], constructor.GetParameters().Select(parameter => parameter.ParameterType));
    }

    [Fact]
    public void Controller_ExposesCanonicalRouteAndTransportShapes()
    {
        AssertHttpRoute<HttpGetAttribute>(nameof(CountriesController.GetPage), null);
        AssertHttpRoute<HttpGetAttribute>(nameof(CountriesController.GetLookup), "lookup");
        AssertHttpRoute<HttpGetAttribute>(nameof(CountriesController.GetReportData), "report-data");
        AssertHttpRoute<HttpGetAttribute>(nameof(CountriesController.GetById), "{id:int}");
        AssertHttpRoute<HttpGetAttribute>(nameof(CountriesController.GetWithStates), "{id:int}/states");
        AssertHttpRoute<HttpPostAttribute>(nameof(CountriesController.Create), null);
        AssertHttpRoute<HttpPostAttribute>(nameof(CountriesController.CreateBulk), "bulk");
        AssertHttpRoute<HttpPutAttribute>(nameof(CountriesController.Update), "{id:int}");
        AssertHttpRoute<HttpDeleteAttribute>(nameof(CountriesController.Archive), "{id:int}");
        AssertHttpRoute<HttpPostAttribute>(nameof(CountriesController.BulkArchive), "bulk-archive");
        AssertHttpRoute<HttpPostAttribute>(nameof(CountriesController.Restore), "{id:int}/restore");

        var bulkArchive = typeof(CountriesController).GetMethod(nameof(CountriesController.BulkArchive))!;
        Assert.Equal(
            Permissions.DeleteCountries,
            bulkArchive.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Contains(
            bulkArchive.GetCustomAttributes<ProducesResponseTypeAttribute>(),
            attribute => attribute.StatusCode == StatusCodes.Status200OK &&
                         attribute.Type == typeof(BulkArchiveCountriesResponse));

        Assert.DoesNotContain(
            typeof(CreateCountryCommand).GetProperties(),
            property => property.Name == "Id");
        Assert.DoesNotContain(
            typeof(UpdateCountryRequest).GetProperties(),
            property => property.Name == "Id");
        Assert.Equal(typeof(UpdateCountryRequest),
            typeof(CountriesController).GetMethod(nameof(CountriesController.Update))!.GetParameters()[1].ParameterType);
    }

    [Fact]
    public void PageQueryAndDtos_AreFeatureOwnedAndUnambiguous()
    {
        var properties = typeof(GetCountriesQuery).GetProperties().Select(property => property.Name).ToArray();

        Assert.Contains("Search", properties);
        Assert.Contains("SearchField", properties);
        Assert.Contains("SearchOperator", properties);
        Assert.Contains("Status", properties);
        Assert.Contains("SortBy", properties);
        Assert.DoesNotContain("Operation", properties);
        Assert.DoesNotContain("ColumnName", properties);
        Assert.DoesNotContain("SearchValue", properties);
        Assert.Contains(typeof(CountryListItemResponse).GetProperties(), property => property.Name == "StatesCount");
        Assert.DoesNotContain(typeof(CountryListItemResponse).GetProperties(), property => property.Name == "States");
        Assert.DoesNotContain(typeof(CountryDetailResponse).GetProperties(), property => property.Name == "States");
        Assert.Contains(typeof(CountryResponse).GetProperties(), property => property.Name == "States");
    }

    [Fact]
    public void LegacyCountryServiceAndToggleTypes_AreRemoved()
    {
        var application = typeof(GetCountriesQuery).Assembly;
        var infrastructure = typeof(CountryReadStore).Assembly;

        Assert.Null(application.GetType(
            "ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Countries.Services.ICountryService"));
        Assert.Null(infrastructure.GetType(
            "ErpSystem.Modules.HR.Infrastructure.Features.GeographicalInformation.Countries.Services.CountryService"));
        Assert.DoesNotContain(
            application.GetTypes(),
            type => type.Name.Contains("ToggleCountry", StringComparison.Ordinal));
        Assert.DoesNotContain(
            application.GetTypes(),
            type => type.Name.Contains("GetCountryCount", StringComparison.Ordinal));
    }

    [Theory]
    [InlineData(typeof(GetCountriesQueryHandler), typeof(ICountryReadStore))]
    [InlineData(typeof(GetCountryByIdQueryHandler), typeof(ICountryReadStore))]
    [InlineData(typeof(GetCountryWithStatesQueryHandler), typeof(ICountryReadStore))]
    [InlineData(typeof(GetCountryLookupQueryHandler), typeof(ICountryReadStore))]
    [InlineData(typeof(GetCountryReportDataQueryHandler), typeof(ICountryReadStore))]
    [InlineData(typeof(CreateCountryCommandHandler), typeof(ICountryWriteStore))]
    [InlineData(typeof(CreateCountryCommandHandler), typeof(ICountryChangeScheduler))]
    [InlineData(typeof(CreateCountryCommandHandler), typeof(IMapper))]
    [InlineData(typeof(CreateCountriesCommandHandler), typeof(ICountryWriteStore))]
    [InlineData(typeof(UpdateCountryCommandHandler), typeof(ICountryAuditTrail))]
    [InlineData(typeof(ArchiveCountryCommandHandler), typeof(ICountryWriteStore))]
    [InlineData(typeof(BulkArchiveCountriesCommandHandler), typeof(ICountryWriteStore))]
    [InlineData(typeof(RestoreCountryCommandHandler), typeof(ICountryWriteStore))]
    public void Handlers_UseNarrowPorts(Type handlerType, Type dependencyType)
    {
        var parameters = Assert.Single(handlerType.GetConstructors()).GetParameters();

        Assert.Contains(parameters, parameter => parameter.ParameterType == dependencyType);
    }

    [Fact]
    public void Contracts_UseProjectMessagingAbstractions()
    {
        Assert.IsAssignableFrom<IQuery<PageResponse<CountryListItemResponse>>>(new GetCountriesQuery());
        Assert.IsAssignableFrom<IQuery<Result<CountryDetailResponse>>>(new GetCountryByIdQuery(1));
        Assert.IsAssignableFrom<IQuery<Result<CountryResponse>>>(new GetCountryWithStatesQuery(1));
        Assert.IsAssignableFrom<IQuery<IReadOnlyList<SimpleCountryResponse>>>(new GetCountryLookupQuery());
        Assert.IsAssignableFrom<IQuery<IReadOnlyList<CountryReportDataResponse>>>(new GetCountryReportDataQuery());
        Assert.IsAssignableFrom<ICommand<Result<CountryDetailResponse>>>(
            new CreateCountryCommand("مصر", "Egypt", "EG", "EGY", "+20", "EGP"));
        Assert.IsAssignableFrom<ICommand<Result<CreateCountriesResponse>>>(
            new CreateCountriesCommand([]));
        Assert.IsAssignableFrom<ICommand<Result<CountryDetailResponse>>>(
            new UpdateCountryCommand(1, "مصر", "Egypt", "EG", "EGY", "+20", "EGP"));
        Assert.IsAssignableFrom<ICommand<Result>>(new ArchiveCountryCommand(1));
        Assert.IsAssignableFrom<ICommand<Result<BulkArchiveCountriesResponse>>>(
            new BulkArchiveCountriesCommand([1]));
        Assert.IsAssignableFrom<ICommand<Result>>(new RestoreCountryCommand(1));
    }

    [Fact]
    public void MappingConfiguration_IsFeatureOwnedAndContainsOnlyNonConventionalRules()
    {
        Assert.IsAssignableFrom<IRegister>(new CountryMappingConfig());

        var config = new TypeAdapterConfig();
        new CountryMappingConfig().Register(config);
        Assert.NotNull(config.GetMapFunction<CountryMutation,
            ErpSystem.Modules.HR.Domain.GeographicalInformation.Countries.Entities.Country>());
    }

    private static void AssertHttpRoute<TAttribute>(string actionName, string? expectedTemplate)
        where TAttribute : HttpMethodAttribute
    {
        var method = typeof(CountriesController).GetMethod(actionName)!;
        var attribute = Assert.Single(method.GetCustomAttributes(typeof(TAttribute), false).Cast<TAttribute>());
        Assert.Equal(expectedTemplate, attribute.Template);
    }
}
