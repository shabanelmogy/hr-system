using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using Mapster;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobOpenings.Mapping;

public sealed class JobOpeningMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<JobOpening, JobOpeningDto>()
            .Map(destination => destination.PositionTitleEn, source => source.Position.JobTitle.TitleEn)
            .Map(destination => destination.PositionTitleAr, source => source.Position.JobTitle.TitleAr)
            .Map(
                destination => destination.ActiveApplicationsCount,
                source => source.Applications.Count(application =>
                    application.Status != ApplicationStatus.Rejected &&
                    application.Status != ApplicationStatus.Withdrawn &&
                    application.Status != ApplicationStatus.Hired));
    }
}
