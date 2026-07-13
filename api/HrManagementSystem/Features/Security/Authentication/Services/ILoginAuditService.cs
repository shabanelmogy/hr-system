namespace HrManagementSystem.Features.Security.Authentication.Services;

public interface ILoginAuditService
{
    Task RecordLoginAsync(string userId, CancellationToken cancellationToken);
    Task RecordLogoutAsync(string userId, CancellationToken cancellationToken);
}
