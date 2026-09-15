using ErpSystem.BuildingBlocks.Application.Abstractions.Validation;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;

public interface IUserValidationQueries : IValidationQuery
{
    Task<bool> UserNameExistsAsync(
        string userName,
        string? excludedUserId,
        CancellationToken cancellationToken);
}
