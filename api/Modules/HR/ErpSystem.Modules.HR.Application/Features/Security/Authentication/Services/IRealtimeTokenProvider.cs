using System.Security.Claims;

namespace ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;

public interface IRealtimeTokenProvider
{
    string GenerateRealtimeToken(ClaimsPrincipal principal);
}
