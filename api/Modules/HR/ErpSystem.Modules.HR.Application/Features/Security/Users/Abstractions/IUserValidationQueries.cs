using ErpSystem.Modules.HR.Application.Abstractions.Validation;

namespace ErpSystem.Modules.HR.Application.Features.Security.Users.Abstractions;

public interface IUserValidationQueries : IValidationQuery
{
    Task<bool> UserNameExistsAsync(
        string userName,
        string? excludedUserId,
        CancellationToken cancellationToken);
}
