using ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Users.Persistence;

public sealed class UserValidationQueries(PlatformDbContext context)
    : IUserValidationQueries
{
    public Task<bool> UserNameExistsAsync(
        string userName,
        string? excludedUserId,
        CancellationToken cancellationToken) =>
        context.Users.AnyAsync(
            user => user.UserName == userName &&
                    (excludedUserId == null || user.Id != excludedUserId),
            cancellationToken);
}
