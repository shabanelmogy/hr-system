using HrManagementSystem.Shared.Abstractions;

namespace HrManagementSystem.Infrastructure.Security.Authentication;

public sealed class HttpCurrentActor(IHttpContextAccessor httpContextAccessor) : ICurrentActor
{
    public string? UserId => httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
}
