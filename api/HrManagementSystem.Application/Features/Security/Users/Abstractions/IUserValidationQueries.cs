using HrManagementSystem.Application.Abstractions.Validation;

namespace HrManagementSystem.Application.Features.Security.Users.Abstractions;

public interface IUserValidationQueries : IValidationQuery
{
    Task<bool> UserNameExistsAsync(
        string userName,
        string? excludedUserId,
        CancellationToken cancellationToken);
}
