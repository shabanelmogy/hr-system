using HrManagementSystem.Application.Features.Security.Users.Abstractions;

namespace HrManagementSystem.Infrastructure.Features.Security.Users.Persistence;

public sealed class UserValidationQueries(ApplicationDbContext context)
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
