using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using Mapster;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobPostings.Mapping;

public sealed class JobPostingMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<JobPosting, JobPostingDto>()
            .Map(destination => destination.OpeningNumber, source => source.JobOpening.OpeningNumber)
            .Map(destination => destination.PositionTitleEn, source => source.JobOpening.Position.JobTitle.TitleEn)
            .Map(destination => destination.PositionTitleAr, source => source.JobOpening.Position.JobTitle.TitleAr);
    }
}
