using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Districts.Contracts;
using ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Validation;
using ErpSystem.Modules.HR.Domain.GeographicalInformation.Addresses.Entities;
using ErpSystem.Modules.HR.Domain.GeographicalInformation.Districts.Entities;
using Mapster;

namespace ErpSystem.Modules.HR.Application.Features.GeographicalInformation.Districts.Mapping;

public sealed class DistrictMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<DistrictMutation, District>()
            .Map(destination => destination.NameAr, source => GeographicalNameRules.Normalize(source.NameAr))
            .Map(destination => destination.NameEn, source => GeographicalNameRules.Normalize(source.NameEn))
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
