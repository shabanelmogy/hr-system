using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using Mapster;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Interviews.Mapping;

public sealed class InterviewMappingConfig : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<Interview, InterviewDto>()
            .Map(
                destination => destination.CandidateName,
                source => source.EmploymentApplication.Candidate.FirstName +
                    (source.EmploymentApplication.Candidate.MiddleName != null
                        ? " " + source.EmploymentApplication.Candidate.MiddleName
                        : string.Empty) +
                    " " + source.EmploymentApplication.Candidate.LastName)
            .Map(
                destination => destination.OpeningNumber,
                source => source.EmploymentApplication.JobOpening.OpeningNumber)
            .Map(
                destination => destination.PositionTitleEn,
                source => source.EmploymentApplication.JobOpening.Position.JobTitle.TitleEn)
            .Map(
                destination => destination.PositionTitleAr,
                source => source.EmploymentApplication.JobOpening.Position.JobTitle.TitleAr);

        config.NewConfig<InterviewParticipant, InterviewParticipantDto>()
            .Map(
                destination => destination.EmployeeName,
                source => (source.Employee.FirstName + " " + source.Employee.LastName).Trim());

        config.NewConfig<InterviewEvaluation, InterviewEvaluationDto>()
            .Map(
                destination => destination.InterviewerName,
                source => (source.InterviewerEmployee.FirstName + " " + source.InterviewerEmployee.LastName).Trim());
    }
}
