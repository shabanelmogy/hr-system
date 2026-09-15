using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.BuildingBlocks.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Errors;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Interviews.Abstractions;

namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Interviews.Queries;

public sealed record GetInterviewsPageQuery(
    int PageNumber = 1,
    int PageSize = 10,
    int? ApplicationId = null,
    InterviewStatusFilter? Status = null) : IQuery<PageResponse<InterviewDto>>;

public sealed record GetInterviewByIdQuery(int Id) : IQuery<Result<InterviewDto>>;
public sealed record GetInterviewScorecardTemplateQuery(int InterviewId)
    : IQuery<Result<InterviewScorecardTemplateDto>>;

public sealed class GetInterviewsPageQueryHandler(IInterviewReadStore readStore)
    : IQueryHandler<GetInterviewsPageQuery, PageResponse<InterviewDto>>
{
    public Task<PageResponse<InterviewDto>> Handle(
        GetInterviewsPageQuery query,
        CancellationToken cancellationToken) =>
        readStore.GetPageAsync(
            query.PageNumber,
            query.PageSize,
            query.ApplicationId,
            query.Status,
            cancellationToken);
}

public sealed class GetInterviewByIdQueryHandler(IInterviewReadStore readStore)
    : IQueryHandler<GetInterviewByIdQuery, Result<InterviewDto>>
{
    public async Task<Result<InterviewDto>> Handle(
        GetInterviewByIdQuery query,
        CancellationToken cancellationToken)
    {
        var interview = await readStore.GetByIdAsync(query.Id, cancellationToken);
        return interview is not null
            ? Result.Success(interview)
            : Result.Failure<InterviewDto>(RecruitmentErrors.InterviewNotFound);
    }
}

public sealed class GetInterviewScorecardTemplateQueryHandler(IInterviewReadStore readStore)
    : IQueryHandler<GetInterviewScorecardTemplateQuery, Result<InterviewScorecardTemplateDto>>
{
    private static readonly IReadOnlyList<JobSkillDto> DefaultSkills =
    [
        new("الكفاءة الفنية والمهنية / Technical Competency", "Advanced", true, 30),
        new("حل المشكلات والتفكير التحليلي / Problem Solving", "Advanced", true, 25),
        new("التواصل والعمل الجماعي / Communication & Teamwork", "Intermediate", false, 25),
        new("التوافق المؤسسي وقيم العمل / Culture & Value Fit", "Intermediate", false, 20)
    ];

    public async Task<Result<InterviewScorecardTemplateDto>> Handle(
        GetInterviewScorecardTemplateQuery query,
        CancellationToken cancellationToken)
    {
        var template = await readStore.GetScorecardTemplateAsync(
            query.InterviewId,
            cancellationToken);
        if (template is null)
            return Result.Failure<InterviewScorecardTemplateDto>(RecruitmentErrors.InterviewNotFound);

        return Result.Success(template.Skills.Count > 0
            ? template
            : template with { Skills = DefaultSkills });
    }
}
