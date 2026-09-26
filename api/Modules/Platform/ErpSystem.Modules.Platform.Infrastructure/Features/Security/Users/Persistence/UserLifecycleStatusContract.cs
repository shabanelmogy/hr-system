using ErpSystem.Modules.Platform.Domain.Security.Users.Enums;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Users.Persistence;

internal static class UserLifecycleStatusContract
{
    public static string FromStoredValue(int lifecycleStatus) => lifecycleStatus switch
    {
        (int)UserLifecycleStatus.Active => "active",
        (int)UserLifecycleStatus.Archived => "archived",
        _ => throw new InvalidOperationException(
            $"Unsupported user lifecycle status value '{lifecycleStatus}'.")
    };
}
