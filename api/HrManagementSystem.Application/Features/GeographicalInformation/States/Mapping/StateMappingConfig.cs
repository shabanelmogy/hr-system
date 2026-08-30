using HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Validation;
using HrManagementSystem.Domain.GeographicalInformation.Districts.Entities;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;
using Mapster;

namespace HrManagementSystem.Application.Features.GeographicalInformation.States.Mapping;

public sealed class StateMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<StateMutation, State>()
            .Map(destination => destination.NameAr, source => GeographicalNameRules.Normalize(source.NameAr))
            .Map(destination => destination.NameEn, source => GeographicalNameRules.Normalize(source.NameEn))
            .Map(destination => destination.Code, source => source.Code.Trim().ToUpperInvariant());

        config.NewConfig<State, StateListItemResponse>()
            .Map(
                destination => destination.DistrictsCount,
                source => source.Districts.Count(district => !district.IsDeleted));

        config.NewConfig<District, StateDistrictListItem>();

        config.NewConfig<State, StateWithDistrictsResponse>()
            .Map(
                destination => destination.Districts,
                source => source.Districts
                    .Where(district => !district.IsDeleted)
                    .OrderBy(district => district.NameEn)
                    .ThenBy(district => district.Id));
    }
}
