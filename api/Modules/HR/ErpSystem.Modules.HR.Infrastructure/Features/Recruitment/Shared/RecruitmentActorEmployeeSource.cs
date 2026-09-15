using ErpSystem.Modules.HR.Application.Features.Recruitment.Abstractions;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Shared;

public sealed class RecruitmentActorEmployeeSource(
    ApplicationDbContext context,
    ICurrentActor currentActor) : IRecruitmentActorEmployeeSource
{
    public async Task<int?> GetCurrentEmployeeIdAsync(CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(currentActor.UserId) ||
            string.IsNullOrWhiteSpace(currentActor.TenantId) ||
            currentActor.CompanyId is not > 0)
            return null;

        var employeeId = await context.Employees.AsNoTracking()
            .Where(employee => employee.UserId == currentActor.UserId &&
                               !employee.IsDeleted)
            .Select(employee => (int?)employee.Id)
            .FirstOrDefaultAsync(cancellationToken);
        return employeeId is > 0 ? employeeId : null;
    }
}
