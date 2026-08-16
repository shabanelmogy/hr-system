namespace HrManagementSystem.Application.Features.Security.Users.Services;

public interface IUserSeatLimitService
{
    Task<Error?> GetLimitErrorAsync(
        string tenantId,
        IEnumerable<string> roles,
        CancellationToken cancellationToken = default);
}
