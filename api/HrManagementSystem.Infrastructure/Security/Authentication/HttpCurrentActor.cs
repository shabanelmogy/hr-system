using HrManagementSystem.Application.Abstractions.Authentication;

namespace HrManagementSystem.Infrastructure.Security.Authentication;

public sealed class HttpCurrentActor(IHttpContextAccessor httpContextAccessor) : ICurrentActor
{
    public string? UserId => httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
    public string? TenantId => httpContextAccessor.HttpContext?.User.FindFirstValue(JwtClaimNames.TenantId);
    public int? CompanyId => int.TryParse(
        httpContextAccessor.HttpContext?.User.FindFirstValue(JwtClaimNames.CompanyId),
        out var companyId)
        ? companyId
        : null;
}
