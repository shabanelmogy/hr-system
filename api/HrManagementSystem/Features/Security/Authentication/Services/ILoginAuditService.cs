namespace HrManagementSystem.Features.Security.Authentication.Services;

public interface ILoginAuditService
{
    Task RecordLoginAsync(string userId, int companyId, CancellationToken cancellationToken);
    Task RecordLogoutAsync(string userId, int companyId, CancellationToken cancellationToken);
}
