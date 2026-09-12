using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.AddressTypes.Contracts;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Validation;
using ErpSystem.Modules.HR.Domain.GeographicalInformation.Addresses.Entities;
using ErpSystem.Modules.HR.Domain.GeographicalInformation.AddressTypes.Entities;
using Mapster;

namespace ErpSystem.Modules.HR.Application.Features.GeographicalInformation.AddressTypes.Mapping;

public sealed class AddressTypeMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<AddressTypeMutation, AddressType>()
            .Map(destination => destination.NameAr, source => GeographicalNameRules.Normalize(source.NameAr))
            .Map(destination => destination.NameEn, source => GeographicalNameRules.Normalize(source.NameEn));
        config.NewConfig<AddressType, AddressTypeListItemResponse>().Map(destination => destination.AddressesCount, source => source.Addresses.Count(address => !address.IsDeleted));
        config.NewConfig<Address, AddressTypeAddressListItem>();
        config.NewConfig<AddressType, AddressTypeWithAddressesResponse>().Map(destination => destination.Addresses, source => source.Addresses.Where(address => !address.IsDeleted).OrderBy(address => address.Id));
    }
}
