using HrManagementSystem.Application.Features.GeographicalInformation.Districts.Contracts;
using HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Districts.Entities;
using Mapster;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Districts.Mapping;

public sealed class DistrictMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<DistrictMutation, District>()
            .Map(destination => destination.NameAr, source => source.NameAr.Trim())
            .Map(destination => destination.NameEn, source => source.NameEn.Trim())
            .Map(destination => destination.Code, source => source.Code.Trim().ToUpperInvariant());

        config.NewConfig<District, DistrictListItemResponse>()
            .Map(destination => destination.AddressesCount, source => source.Addresses.Count(address => !address.IsDeleted));

        config.NewConfig<Address, DistrictAddressListItem>();

        config.NewConfig<District, DistrictWithAddressesResponse>()
            .Map(
                destination => destination.Addresses,
                source => source.Addresses
                    .Where(address => !address.IsDeleted)
                    .OrderBy(address => address.Id));
    }
}
