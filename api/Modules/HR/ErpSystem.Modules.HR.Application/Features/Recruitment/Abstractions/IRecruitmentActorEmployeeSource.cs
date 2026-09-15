namespace ErpSystem.Modules.HR.Application.Features.Recruitment.Abstractions;

/// <summary>
/// Resolves the current authenticated actor to the employee aggregate that owns
/// HR workflow decisions in the active tenant/company scope.
/// </summary>
public interface IRecruitmentActorEmployeeSource
{
    Task<int?> GetCurrentEmployeeIdAsync(CancellationToken cancellationToken);
}
