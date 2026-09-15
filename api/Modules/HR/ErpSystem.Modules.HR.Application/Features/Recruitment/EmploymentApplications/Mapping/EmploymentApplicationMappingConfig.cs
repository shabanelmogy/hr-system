using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using Mapster;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.EmploymentApplications.Mapping;

public sealed class EmploymentApplicationMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<EmploymentApplication, EmploymentApplicationDto>()
            .Map(
                destination => destination.CandidateName,
                source => source.Candidate.FirstName +
                    (source.Candidate.MiddleName != null ? " " + source.Candidate.MiddleName : string.Empty) +
                    " " + source.Candidate.LastName)
            .Map(destination => destination.CandidatePhone, source => source.Candidate.PhoneNumber)
            .Map(destination => destination.OpeningNumber, source => source.JobOpening.OpeningNumber)
            .Map(destination => destination.PositionTitleEn, source => source.JobOpening.Position.JobTitle.TitleEn)
            .Map(destination => destination.PositionTitleAr, source => source.JobOpening.Position.JobTitle.TitleAr)
            .Map(destination => destination.DepartmentNameEn, source => source.JobOpening.Department.NameEn)
            .Map(destination => destination.DepartmentNameAr, source => source.JobOpening.Department.NameAr)
            .Map(destination => destination.BranchNameEn, source => source.JobOpening.Branch.NameEn)
            .Map(destination => destination.BranchNameAr, source => source.JobOpening.Branch.NameAr)
            .Map(
                destination => destination.AverageEvaluationScore,
                source => source.Interviews
                    .SelectMany(interview => interview.Evaluations)
                    .Select(evaluation => (decimal?)evaluation.Score)
                    .Average())
            .Map(
                destination => destination.StatusHistory,
                source => source.StatusHistory.OrderBy(history => history.ChangedOn));
    }
}
