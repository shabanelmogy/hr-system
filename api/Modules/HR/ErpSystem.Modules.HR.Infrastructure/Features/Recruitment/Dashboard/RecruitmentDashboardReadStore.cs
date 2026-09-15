using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Dashboard;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Dashboard;

public sealed class RecruitmentDashboardReadStore(ApplicationDbContext context)
    : IRecruitmentDashboardReadStore
{
    public async Task<RecruitmentDashboardSummaryDto> GetSummaryAsync(
        CancellationToken cancellationToken)
    {
        var totalOpenings = await context.JobOpenings
            .CountAsync(opening => opening.Status == JobOpeningStatus.Open, cancellationToken);
        var totalActiveCandidates = await context.Candidates
            .CountAsync(candidate => candidate.IsActive, cancellationToken);
        var totalScheduledInterviews = await context.Interviews
            .CountAsync(interview => interview.Status == InterviewStatus.Scheduled, cancellationToken);
        var totalPendingOffers = await context.JobOffers
            .CountAsync(offer => offer.Status == JobOfferStatus.Issued, cancellationToken);
        var totalHiredCount = await context.EmploymentApplications
            .CountAsync(application => application.Status == ApplicationStatus.Hired, cancellationToken);

        var stageCounts = await context.EmploymentApplications
            .GroupBy(application => application.Status)
            .Select(group => new { group.Key, Count = group.Count() })
            .ToDictionaryAsync(item => item.Key.ToString(), item => item.Count, cancellationToken);

        foreach (var status in Enum.GetValues<ApplicationStatus>())
            stageCounts.TryAdd(status.ToString(), 0);

        return new RecruitmentDashboardSummaryDto
        {
            TotalOpenings = totalOpenings,
            TotalActiveCandidates = totalActiveCandidates,
            TotalScheduledInterviews = totalScheduledInterviews,
            TotalPendingOffers = totalPendingOffers,
            TotalHiredCount = totalHiredCount,
            StageCounts = stageCounts
        };
    }
}
