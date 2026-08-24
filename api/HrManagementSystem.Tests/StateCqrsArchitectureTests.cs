using FluentValidation;
using HrManagementSystem.Api.Features.GeographicalInformation.States.V1;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Mapping;
using HrManagementSystem.Application.Features.GeographicalInformation.States.Queries;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.Localization;
using System.Reflection;

namespace HrManagementSystem.Tests;

public sealed class StateCqrsArchitectureTests
{
    [Fact]
    public void Controller_DependsOnlyOnSender()
    {
        var constructor = Assert.Single(typeof(StatesController).GetConstructors());

        Assert.Equal([typeof(ISender)], constructor.GetParameters().Select(parameter => parameter.ParameterType));
    }

    [Fact]
    public void Controller_ExposesCanonicalRoutesPermissionsAndTransportShapes()
    {
        AssertHttpRoute<HttpGetAttribute>(nameof(StatesController.GetPage), null);
        AssertHttpRoute<HttpGetAttribute>(nameof(StatesController.GetLookup), "lookup");
        AssertHttpRoute<HttpGetAttribute>(nameof(StatesController.GetByCountry), "by-country/{countryId:int}");
        AssertHttpRoute<HttpGetAttribute>(nameof(StatesController.GetById), "{id:int}");
        AssertHttpRoute<HttpGetAttribute>(nameof(StatesController.GetWithDistricts), "{id:int}/districts");
        AssertHttpRoute<HttpPostAttribute>(nameof(StatesController.Create), null);
        AssertHttpRoute<HttpPostAttribute>(nameof(StatesController.CreateBulk), "bulk");
        AssertHttpRoute<HttpPutAttribute>(nameof(StatesController.Update), "{id:int}");
        AssertHttpRoute<HttpDeleteAttribute>(nameof(StatesController.Archive), "{id:int}");
        AssertHttpRoute<HttpPostAttribute>(nameof(StatesController.BulkArchive), "bulk-archive");
        AssertHttpRoute<HttpPostAttribute>(nameof(StatesController.Restore), "{id:int}/restore");

        var bulkCreate = typeof(StatesController).GetMethod(nameof(StatesController.CreateBulk))!;
        Assert.Equal(Permissions.CreateStates, bulkCreate.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Contains(
            bulkCreate.GetCustomAttributes<ProducesResponseTypeAttribute>(),
            attribute => attribute.StatusCode == StatusCodes.Status201Created && attribute.Type == typeof(CreateStatesResponse));
        Assert.Equal(
            typeof(CreateStatesRequest),
            bulkCreate.GetParameters()[0].ParameterType);

        var bulkArchive = typeof(StatesController).GetMethod(nameof(StatesController.BulkArchive))!;
        Assert.Equal(Permissions.DeleteStates, bulkArchive.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Contains(
            bulkArchive.GetCustomAttributes<ProducesResponseTypeAttribute>(),
            attribute => attribute.StatusCode == StatusCodes.Status200OK && attribute.Type == typeof(BulkArchiveStatesResponse));
        Assert.Equal(
            typeof(UpdateStateRequest),
            typeof(StatesController).GetMethod(nameof(StatesController.Update))!.GetParameters()[1].ParameterType);
    }

    [Fact]
    public void QueriesContractsAndHandlers_AreFeatureOwned()
    {
        var properties = typeof(GetStatesQuery).GetProperties().Select(property => property.Name).ToArray();
        Assert.Contains("Search", properties);
        Assert.Contains("SearchField", properties);
        Assert.Contains("SearchOperator", properties);
        Assert.Contains("Status", properties);
        Assert.Contains("CountryId", properties);
        Assert.Contains("HasDistricts", properties);
        Assert.Contains("SortBy", properties);
        Assert.DoesNotContain("Operation", properties);
        Assert.Contains(typeof(StateListItemResponse).GetProperties(), property => property.Name == "DistrictsCount");
        Assert.DoesNotContain(typeof(CreateStateCommand).GetProperties(), property => property.Name == "Id");
        Assert.DoesNotContain(typeof(UpdateStateRequest).GetProperties(), property => property.Name == "Id");

        Assert.IsAssignableFrom<IQuery<PageResponse<StateListItemResponse>>>(new GetStatesQuery());
        Assert.IsAssignableFrom<IQuery<Result<StateDetailResponse>>>(new GetStateByIdQuery(1));
        Assert.IsAssignableFrom<IQuery<Result<StateWithDistrictsResponse>>>(new GetStateWithDistrictsQuery(1));
        Assert.IsAssignableFrom<IQuery<IReadOnlyList<StateLookupResponse>>>(new GetStateLookupQuery(1));
        Assert.IsAssignableFrom<ICommand<Result<StateDetailResponse>>>(new CreateStateCommand("القاهرة", "Cairo", "CAI", 1));
        Assert.IsAssignableFrom<ICommand<Result<StateDetailResponse>>>(new UpdateStateCommand(1, "القاهرة", "Cairo", "CAI", 1));
        Assert.IsAssignableFrom<ICommand<Result>>(new ArchiveStateCommand(1));
        Assert.IsAssignableFrom<ICommand<Result<BulkArchiveStatesResponse>>>(new BulkArchiveStatesCommand([1]));
        Assert.IsAssignableFrom<ICommand<Result<CreateStatesResponse>>>(new CreateStatesCommand([new CreateStateRequest("القاهرة", "Cairo", "CAI", 1)]));
        Assert.IsAssignableFrom<ICommand<Result>>(new RestoreStateCommand(1));

        AssertHandlerDependency<GetStatesQueryHandler, IStateReadStore>();
        AssertHandlerDependency<GetStateByIdQueryHandler, IStateReadStore>();
        AssertHandlerDependency<GetStateWithDistrictsQueryHandler, IStateReadStore>();
        AssertHandlerDependency<GetStateLookupQueryHandler, IStateReadStore>();
        AssertHandlerDependency<CreateStateCommandHandler, IStateWriteStore>();
        AssertHandlerDependency<CreateStateCommandHandler, IStateReadStore>();
        AssertHandlerDependency<CreateStateCommandHandler, IStateChangeScheduler>();
        AssertHandlerDependency<CreateStatesCommandHandler, IStateWriteStore>();
        AssertHandlerDependency<CreateStatesCommandHandler, IStateChangeScheduler>();
        AssertHandlerDependency<UpdateStateCommandHandler, IStateAuditTrail>();
        AssertHandlerDependency<ArchiveStateCommandHandler, IStateWriteStore>();
        AssertHandlerDependency<BulkArchiveStatesCommandHandler, IStateWriteStore>();
        AssertHandlerDependency<RestoreStateCommandHandler, IStateWriteStore>();
    }

    [Fact]
    public async Task Validators_RejectInvalidListControlsAndBatchIds()
    {
        var page = await new GetStatesQueryValidator().ValidateAsync(new GetStatesQuery
        {
            PageNumber = 0,
            PageSize = GetStatesQuery.MaxPageSize + 1,
            SearchField = "unknown",
            SearchOperator = "unknown",
            Status = "removed",
            SortBy = "other",
            SortDirection = "sideways"
        });
        var batch = await new BulkArchiveStatesCommandValidator(new EchoLocalizer<CreateStateRequest>())
            .ValidateAsync(new BulkArchiveStatesCommand([0, 0]));
        var bulkCreate = await new CreateStatesCommandValidator(new EchoLocalizer<CreateStateRequest>())
            .ValidateAsync(new CreateStatesCommand([new CreateStateRequest("1", "1", "!!", -3)]));

        Assert.False(page.IsValid);
        Assert.False(batch.IsValid);
        Assert.False(bulkCreate.IsValid);
    }

    [Fact]
    public async Task BulkCreateValidator_EnforcesBatchBounds()
    {
        var empty = await new CreateStatesCommandValidator(new EchoLocalizer<CreateStateRequest>())
            .ValidateAsync(new CreateStatesCommand([]));
        var oversized = await new CreateStatesCommandValidator(new EchoLocalizer<CreateStateRequest>())
            .ValidateAsync(new CreateStatesCommand(Enumerable
                .Range(0, CreateStatesCommandValidator.MaximumBatchSize + 1)
                .Select(index => new CreateStateRequest($"دولة {index}", $"State {index}", $"S{index:00}", 1))
                .ToList()));

        Assert.False(empty.IsValid);
        Assert.False(oversized.IsValid);
    }

    [Fact]
    public async Task PageValidator_AcceptsAdaptiveClientPageLimit()
    {
        var result = await new GetStatesQueryValidator().ValidateAsync(new GetStatesQuery
        {
            PageSize = GetStatesQuery.MaxPageSize
        });

        Assert.True(result.IsValid);
    }

    [Fact]
    public void MappingConfiguration_NormalizesOnlyMutableStateFields()
    {
        var config = new TypeAdapterConfig();
        new StateMappingConfig().Register(config);
        var state = new CreateStateCommand("  القاهرة  ", "  Cairo  ", " cai ", 7)
            .Adapt<HrManagementSystem.Domain.GeographicalInformation.States.Entities.State>(config);

        Assert.Equal("القاهرة", state.NameAr);
        Assert.Equal("Cairo", state.NameEn);
        Assert.Equal("CAI", state.Code);
        Assert.Equal(7, state.CountryId);
    }

    private static void AssertHandlerDependency<THandler, TDependency>()
    {
        var parameters = Assert.Single(typeof(THandler).GetConstructors()).GetParameters();
        Assert.Contains(parameters, parameter => parameter.ParameterType == typeof(TDependency));
    }

    private static void AssertHttpRoute<TAttribute>(string actionName, string? expectedTemplate)
        where TAttribute : HttpMethodAttribute
    {
        var method = typeof(StatesController).GetMethod(actionName)!;
        var attribute = Assert.Single(method.GetCustomAttributes(typeof(TAttribute), false).Cast<TAttribute>());
        Assert.Equal(expectedTemplate, attribute.Template);
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
