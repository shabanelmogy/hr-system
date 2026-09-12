using ErpSystem.Modules.Platform.Contracts.SecurityAudits;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Platform.SecurityAudits.Services;

public sealed class HttpSecurityAuditRequestContextSource(IHttpContextAccessor httpContextAccessor)
    : ISecurityAuditRequestContextSource
{
    public SecurityAuditRequestContext GetCurrent()
    {
        var httpContext = httpContextAccessor.HttpContext;
        return new SecurityAuditRequestContext(
            httpContext?.Connection.RemoteIpAddress?.ToString(),
            httpContext?.Request.Headers.UserAgent.ToString(),
            httpContext?.TraceIdentifier);
    }
}
