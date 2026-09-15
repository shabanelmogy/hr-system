using System.Reflection;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.AddressTypes.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Districts.Abstractions;

namespace ErpSystem.Modules.ReferenceData.Tests;

public sealed class ReferenceDataContractHardeningTests
{
    [Theory]
    [InlineData(typeof(IAddressReadStore), nameof(IAddressReadStore.GetByIdAsync))]
    [InlineData(typeof(IAddressTypeReadStore), nameof(IAddressTypeReadStore.GetByIdAsync))]
    [InlineData(typeof(IDistrictReadStore), nameof(IDistrictReadStore.GetByIdAsync))]
    public void ResultServiceMethods_ReturnNonNullableTask(Type serviceType, string methodName)
    {
        var method = serviceType.GetMethod(methodName)
            ?? throw new InvalidOperationException($"Method {methodName} was not found.");

        Assert.Equal(
            NullabilityState.NotNull,
            new NullabilityInfoContext().Create(method.ReturnParameter).ReadState);
    }
}
