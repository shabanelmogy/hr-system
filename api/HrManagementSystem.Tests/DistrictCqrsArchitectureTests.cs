using FluentValidation;
using HrManagementSystem.Api.Features.GeographicalInformation.Districts.V1;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Abstractions;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Mapping;
using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Queries;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.Localization;
using System.Reflection;

namespace HrManagementSystem.Tests;

public sealed class DistrictCqrsArchitectureTests
{
    [Fact]
    public void Controller_DependsOnlyOnSender()
    {
        var constructor = Assert.Single(typeof(DistrictsController).GetConstructors());

        Assert.Equal([typeof(ISender)], constructor.GetParameters().Select(parameter => parameter.ParameterType));
    }

    [Fact]
    public void Controller_ExposesCanonicalRoutesPermissionsAndTransportShapes()
    {
        AssertHttpRoute<HttpGetAttribute>(nameof(DistrictsController.GetPage), null);
        AssertHttpRoute<HttpGetAttribute>(nameof(DistrictsController.GetLookup), "lookup");
        AssertHttpRoute<HttpGetAttribute>(nameof(DistrictsController.GetByState), "by-state/{stateId:int}");
        AssertHttpRoute<HttpGetAttribute>(nameof(DistrictsController.GetById), "{id:int}");
        AssertHttpRoute<HttpGetAttribute>(nameof(DistrictsController.GetWithAddresses), "{id:int}/addresses");
        AssertHttpRoute<HttpPostAttribute>(nameof(DistrictsController.Create), null);
        AssertHttpRoute<HttpPostAttribute>(nameof(DistrictsController.CreateBulk), "bulk");
        AssertHttpRoute<HttpPutAttribute>(nameof(DistrictsController.Update), "{id:int}");
        AssertHttpRoute<HttpDeleteAttribute>(nameof(DistrictsController.Archive), "{id:int}");
        AssertHttpRoute<HttpPostAttribute>(nameof(DistrictsController.BulkArchive), "bulk-archive");
        AssertHttpRoute<HttpPostAttribute>(nameof(DistrictsController.Restore), "{id:int}/restore");

        var bulkArchive = typeof(DistrictsController).GetMethod(nameof(DistrictsController.BulkArchive))!;
        Assert.Equal(Permissions.DeleteDistricts, bulkArchive.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Contains(
            bulkArchive.GetCustomAttributes<ProducesResponseTypeAttribute>(),
            attribute => attribute.StatusCode == StatusCodes.Status200OK && attribute.Type == typeof(BulkArchiveDistrictsResponse));
        var bulkCreate = typeof(DistrictsController).GetMethod(nameof(DistrictsController.CreateBulk))!;
        Assert.Equal(Permissions.CreateDistricts, bulkCreate.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Contains(
            bulkCreate.GetCustomAttributes<ProducesResponseTypeAttribute>(),
            attribute => attribute.StatusCode == StatusCodes.Status201Created && attribute.Type == typeof(CreateDistrictsResponse));
        Assert.Equal(
            typeof(UpdateDistrictRequest),
            typeof(DistrictsController).GetMethod(nameof(DistrictsController.Update))!.GetParameters()[1].ParameterType);
    }

    [Fact]
    public void QueriesContractsAndHandlers_AreFeatureOwned()
    {
        var properties = typeof(GetDistrictsQuery).GetProperties().Select(property => property.Name).ToArray();
        Assert.Contains("Search", properties);
        Assert.Contains("SearchField", properties);
        Assert.Contains("SearchOperator", properties);
        Assert.Contains("Status", properties);
        Assert.Contains("StateId", properties);
        Assert.Contains("HasAddresses", properties);
        Assert.Contains("SortBy", properties);
        Assert.DoesNotContain("Operation", properties);
        Assert.Contains(typeof(DistrictListItemResponse).GetProperties(), property => property.Name == "AddressesCount");
        Assert.DoesNotContain(typeof(CreateDistrictCommand).GetProperties(), property => property.Name == "Id");
        Assert.DoesNotContain(typeof(UpdateDistrictRequest).GetProperties(), property => property.Name == "Id");

        Assert.IsAssignableFrom<IQuery<PageResponse<DistrictListItemResponse>>>(new GetDistrictsQuery());
        Assert.IsAssignableFrom<IQuery<Result<DistrictDetailResponse>>>(new GetDistrictByIdQuery(1));
        Assert.IsAssignableFrom<IQuery<Result<DistrictWithAddressesResponse>>>(new GetDistrictWithAddressesQuery(1));
        Assert.IsAssignableFrom<IQuery<IReadOnlyList<DistrictLookupResponse>>>(new GetDistrictLookupQuery(1));
        Assert.IsAssignableFrom<ICommand<Result<DistrictDetailResponse>>>(new CreateDistrictCommand("القاهرة", "Cairo", "CAI", 1));
        Assert.IsAssignableFrom<ICommand<Result<CreateDistrictsResponse>>>(new CreateDistrictsCommand(
            [new CreateDistrictRequest("القاهرة", "Cairo", "CAI", 1)]));
        Assert.IsAssignableFrom<ICommand<Result<DistrictDetailResponse>>>(new UpdateDistrictCommand(1, "القاهرة", "Cairo", "CAI", 1));
        Assert.IsAssignableFrom<ICommand<Result>>(new ArchiveDistrictCommand(1));
        Assert.IsAssignableFrom<ICommand<Result<BulkArchiveDistrictsResponse>>>(new BulkArchiveDistrictsCommand([1]));
        Assert.IsAssignableFrom<ICommand<Result>>(new RestoreDistrictCommand(1));

        AssertHandlerDependency<GetDistrictsQueryHandler, IDistrictReadStore>();
        AssertHandlerDependency<GetDistrictByIdQueryHandler, IDistrictReadStore>();
        AssertHandlerDependency<GetDistrictWithAddressesQueryHandler, IDistrictReadStore>();
        AssertHandlerDependency<GetDistrictLookupQueryHandler, IDistrictReadStore>();
        AssertHandlerDependency<CreateDistrictCommandHandler, IDistrictWriteStore>();
        AssertHandlerDependency<CreateDistrictCommandHandler, IDistrictChangeScheduler>();
        AssertHandlerDependency<CreateDistrictsCommandHandler, IDistrictWriteStore>();
        AssertHandlerDependency<CreateDistrictsCommandHandler, IDistrictChangeScheduler>();
        AssertHandlerDependency<UpdateDistrictCommandHandler, IDistrictAuditTrail>();
        AssertHandlerDependency<ArchiveDistrictCommandHandler, IDistrictWriteStore>();
        AssertHandlerDependency<BulkArchiveDistrictsCommandHandler, IDistrictWriteStore>();
        AssertHandlerDependency<RestoreDistrictCommandHandler, IDistrictWriteStore>();
    }

    [Fact]
    public async Task Validators_RejectInvalidListControlsAndArchiveIds()
    {
        var page = await new GetDistrictsQueryValidator().ValidateAsync(new GetDistrictsQuery
        {
            PageNumber = 0,
            PageSize = GetDistrictsQuery.MaxPageSize + 1,
            SearchField = "unknown",
            SearchOperator = "unknown",
            Status = "removed",
            SortBy = "other",
            SortDirection = "sideways"
        });
        var batch = await new BulkArchiveDistrictsCommandValidator(new EchoLocalizer<CreateDistrictRequest>())
            .ValidateAsync(new BulkArchiveDistrictsCommand([0, 0]));
        var create = await new CreateDistrictCommandValidator(new EchoLocalizer<CreateDistrictRequest>())
            .ValidateAsync(new CreateDistrictCommand("1", "1", "!!", -3));
        var bulkCreate = await new CreateDistrictsCommandValidator(new EchoLocalizer<CreateDistrictRequest>())
            .ValidateAsync(new CreateDistrictsCommand([]));

        Assert.False(page.IsValid);
        Assert.False(batch.IsValid);
        Assert.False(create.IsValid);
        Assert.False(bulkCreate.IsValid);
    }

    [Fact]
    public void MappingConfiguration_NormalizesOnlyMutableDistrictFields()
    {
        var config = new TypeAdapterConfig();
        new DistrictMappingConfig().Register(config);
        var district = new CreateDistrictCommand("  القاهرة  ", "  Cairo  ", " cai ", 7)
            .Adapt<HrManagementSystem.Domain.GeographicalInformation.Districts.Entities.District>(config);

        Assert.Equal("القاهرة", district.NameAr);
        Assert.Equal("Cairo", district.NameEn);
        Assert.Equal("CAI", district.Code);
        Assert.Equal(7, district.StateId);
    }

    private static void AssertHandlerDependency<THandler, TDependency>()
    {
        var parameters = Assert.Single(typeof(THandler).GetConstructors()).GetParameters();
        Assert.Contains(parameters, parameter => parameter.ParameterType == typeof(TDependency));
    }

    private static void AssertHttpRoute<TAttribute>(string actionName, string? expectedTemplate)
        where TAttribute : HttpMethodAttribute
    {
        var method = typeof(DistrictsController).GetMethod(actionName)!;
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
