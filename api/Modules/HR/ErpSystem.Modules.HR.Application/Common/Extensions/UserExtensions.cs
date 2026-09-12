using System.Security.Claims;

namespace ErpSystem.Modules.HR.Application.Common.Extensions;

public static class UserExtensions
{
    public static string? GetUserId(this ClaimsPrincipal user) =>
        user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
}
