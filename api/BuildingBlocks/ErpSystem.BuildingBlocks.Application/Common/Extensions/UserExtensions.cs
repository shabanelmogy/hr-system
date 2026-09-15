using System.Security.Claims;

namespace ErpSystem.BuildingBlocks.Application.Common.Extensions;

public static class UserExtensions
{
    public static string? GetUserId(this ClaimsPrincipal user) =>
        user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
}
