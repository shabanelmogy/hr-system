using HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Contracts;
using HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;
using HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities;
using Mapster;

namespace HrManagementSystem.Application.Features.GeographicalInformation.AddressTypes.Mapping;

public sealed class AddressTypeMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<AddressTypeMutation, AddressType>().Map(destination => destination.NameAr, source => source.NameAr.Trim()).Map(destination => destination.NameEn, source => source.NameEn.Trim());
        config.NewConfig<AddressType, AddressTypeListItemResponse>().Map(destination => destination.AddressesCount, source => source.Addresses.Count(address => !address.IsDeleted));
        config.NewConfig<Address, AddressTypeAddressListItem>();
        config.NewConfig<AddressType, AddressTypeWithAddressesResponse>().Map(destination => destination.Addresses, source => source.Addresses.Where(address => !address.IsDeleted).OrderBy(address => address.Id));
    }
}
