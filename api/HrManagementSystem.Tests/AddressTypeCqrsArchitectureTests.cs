using FluentValidation;
using HrManagementSystem.Api.Features.GeographicalInformation.AddressTypes.V1;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Common.Paginations;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Commands;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Mapping;
using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Queries;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.Localization;
using System.Reflection;

namespace HrManagementSystem.Tests;

public sealed class AddressTypeCqrsArchitectureTests
{
    [Fact]
    public void Controller_DependsOnlyOnSender()
    {
        var constructor = Assert.Single(typeof(AddressTypesController).GetConstructors());
        Assert.Equal([typeof(ISender)], constructor.GetParameters().Select(parameter => parameter.ParameterType));
    }

    [Fact]
    public void Controller_ExposesCanonicalRoutesPermissionsAndTransportShapes()
    {
        AssertHttpRoute<HttpGetAttribute>(nameof(AddressTypesController.GetPage), null);
        AssertHttpRoute<HttpGetAttribute>(nameof(AddressTypesController.GetLookup), "lookup");
        AssertHttpRoute<HttpGetAttribute>(nameof(AddressTypesController.GetById), "{id:int}");
        AssertHttpRoute<HttpGetAttribute>(nameof(AddressTypesController.GetWithAddresses), "{id:int}/addresses");
        AssertHttpRoute<HttpPostAttribute>(nameof(AddressTypesController.Create), null);
        AssertHttpRoute<HttpPostAttribute>(nameof(AddressTypesController.CreateBulk), "bulk");
        AssertHttpRoute<HttpPutAttribute>(nameof(AddressTypesController.Update), "{id:int}");
        AssertHttpRoute<HttpDeleteAttribute>(nameof(AddressTypesController.Archive), "{id:int}");
        AssertHttpRoute<HttpPostAttribute>(nameof(AddressTypesController.BulkArchive), "bulk-archive");
        AssertHttpRoute<HttpPostAttribute>(nameof(AddressTypesController.Restore), "{id:int}/restore");

        var bulkCreate = typeof(AddressTypesController).GetMethod(nameof(AddressTypesController.CreateBulk))!;
        var bulkArchive = typeof(AddressTypesController).GetMethod(nameof(AddressTypesController.BulkArchive))!;
        Assert.Equal(Permissions.CreateAddressTypes, bulkCreate.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Equal(Permissions.DeleteAddressTypes, bulkArchive.GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Equal(typeof(UpdateAddressTypeRequest), typeof(AddressTypesController).GetMethod(nameof(AddressTypesController.Update))!.GetParameters()[1].ParameterType);
    }

    [Fact]
    public async Task Contracts_ValidateListControlsMutationsAndBatchLimits()
    {
        var page = await new GetAddressTypesQueryValidator().ValidateAsync(new GetAddressTypesQuery
        {
            PageNumber = 0,
            PageSize = GetAddressTypesQuery.MaxPageSize + 1,
            SearchField = "other",
            SearchOperator = "other",
            Status = "removed",
            SortBy = "other",
            SortDirection = "sideways"
        });
        var archive = await new BulkArchiveAddressTypesCommandValidator(new EchoLocalizer<AddressTypeRequest>())
            .ValidateAsync(new BulkArchiveAddressTypesCommand([0, 0]));
        var create = await new CreateAddressTypeCommandValidator(new EchoLocalizer<AddressTypeRequest>())
            .ValidateAsync(new CreateAddressTypeCommand("1", "1"));

        Assert.False(page.IsValid);
        Assert.False(archive.IsValid);
        Assert.False(create.IsValid);
        Assert.IsAssignableFrom<IQuery<PageResponse<AddressTypeListItemResponse>>>(new GetAddressTypesQuery());
        Assert.IsAssignableFrom<ICommand<Result<AddressTypeDetailResponse>>>(new CreateAddressTypeCommand("سكن", "Residence"));
        Assert.IsAssignableFrom<ICommand<Result<CreateAddressTypesResponse>>>(new CreateAddressTypesCommand([new CreateAddressTypeRequest("سكن", "Residence")]));
        Assert.IsAssignableFrom<ICommand<Result<BulkArchiveAddressTypesResponse>>>(new BulkArchiveAddressTypesCommand([1]));
    }

    [Fact]
    public void MappingConfiguration_NormalizesOnlyMutableAddressTypeFields()
    {
        var config = new TypeAdapterConfig();
        new AddressTypeMappingConfig().Register(config);
        var addressType = new CreateAddressTypeCommand("  سكن  ", "  Residence  ")
            .Adapt<HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities.AddressType>(config);

        Assert.Equal("سكن", addressType.NameAr);
        Assert.Equal("Residence", addressType.NameEn);
    }

    private static void AssertHttpRoute<TAttribute>(string actionName, string? expectedTemplate)
        where TAttribute : HttpMethodAttribute
    {
        var method = typeof(AddressTypesController).GetMethod(actionName)!;
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
