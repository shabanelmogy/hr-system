using System.Reflection;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Commands;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Queries;
using ErpSystem.Modules.ReferenceData.Infrastructure.Features.GeographicalInformation.Addresses.Persistence;
using ErpSystem.Modules.ReferenceData.Presentation.Features.GeographicalInformation.Addresses.V1;
using MediatR;

namespace ErpSystem.Modules.ReferenceData.Tests;

public sealed class AddressCqrsArchitectureTests
{
    [Fact]
    public void Controller_DependsOnMediator_NotInfrastructureBusinessService()
    {
        var constructor = Assert.Single(typeof(AddressesController).GetConstructors());
        var parameter = Assert.Single(constructor.GetParameters());

        Assert.Equal(typeof(ISender), parameter.ParameterType);
        Assert.DoesNotContain(
            typeof(AddressesController).GetFields(BindingFlags.Instance | BindingFlags.NonPublic),
            field => field.FieldType.Namespace?.Contains("Infrastructure", StringComparison.Ordinal) == true);
    }

    [Fact]
    public void AddressPersistence_ImplementsApplicationOwnedPorts()
    {
        Assert.Contains(typeof(IAddressReadStore), typeof(AddressReadStore).GetInterfaces());
        Assert.Contains(typeof(IAddressWriteStore), typeof(AddressWriteStore).GetInterfaces());
        Assert.Contains(typeof(IAddressAuditTrail), typeof(AddressAuditTrail).GetInterfaces());
    }

    [Fact]
    public void CommandsAndQueries_AreApplicationOwnedMediatorRequests()
    {
        Assert.Contains(typeof(IRequest<>), typeof(CreateAddressCommand).GetInterfaces().Select(type => type.IsGenericType ? type.GetGenericTypeDefinition() : type));
        Assert.Contains(typeof(IRequest<>), typeof(UpdateAddressCommand).GetInterfaces().Select(type => type.IsGenericType ? type.GetGenericTypeDefinition() : type));
        Assert.Contains(typeof(IRequest<>), typeof(GetAddressByIdQuery).GetInterfaces().Select(type => type.IsGenericType ? type.GetGenericTypeDefinition() : type));
    }
}
