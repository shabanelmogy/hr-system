using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using Mapster;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.JobOffers.Mapping;

public sealed class JobOfferMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<JobOffer, JobOfferDto>()
            .Map(
                destination => destination.CandidateName,
                source => source.EmploymentApplication.Candidate.FirstName +
                    (source.EmploymentApplication.Candidate.MiddleName != null
                        ? " " + source.EmploymentApplication.Candidate.MiddleName
                        : string.Empty) +
                    " " + source.EmploymentApplication.Candidate.LastName)
            .Map(destination => destination.PositionTitleEn, source => source.Position.JobTitle.TitleEn)
            .Map(destination => destination.PositionTitleAr, source => source.Position.JobTitle.TitleAr);
    }
}
