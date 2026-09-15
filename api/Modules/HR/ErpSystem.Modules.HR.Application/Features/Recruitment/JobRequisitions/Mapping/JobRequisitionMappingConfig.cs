using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using Mapster;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobRequisitions.Mapping;

public sealed class JobRequisitionMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<JobRequisition, JobRequisitionDto>()
            .Map(destination => destination.PositionTitleEn, source => source.Position.JobTitle.TitleEn)
            .Map(destination => destination.PositionTitleAr, source => source.Position.JobTitle.TitleAr)
            .Map(
                destination => destination.RemainingPositions,
                source => source.RequestedPositions - source.HiredPositions)
            .Map(
                destination => destination.ReplacementEmployeeName,
                source => source.ReplacementEmployee == null
                    ? null
                    : (source.ReplacementEmployee.FirstName + " " + source.ReplacementEmployee.LastName).Trim());
    }
}
