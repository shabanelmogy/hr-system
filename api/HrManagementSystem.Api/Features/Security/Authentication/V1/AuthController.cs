using HrManagementSystem.Application.Features.Security.Authentication.Contracts;
using HrManagementSystem.Application.Features.Security.Authentication.Services;
using HrManagementSystem.Application.Features.Tenancy.Services;

namespace HrManagementSystem.Api.Features.Security.Authentication.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
public class AuthController(
    IAuthService authService,
    IJwtProvider jwtProvider,
    ITenantAccessService tenantAccessService) : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly IJwtProvider _jwtProvider = jwtProvider;
    private readonly ITenantAccessService _tenantAccessService = tenantAccessService;

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.GetTokenAsync(
            request.UserName,
            request.Password,
            cancellationToken);

        return result.IsSuccess ? Ok(result.Value.Payload) : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> SelectCompany(
        [FromBody] SelectCompanyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.SelectCompanyAsync(request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(request, cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> LogOut(
        [FromBody] LogoutRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.LogOutAsync(request.RefreshToken, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> RefreshToken(
        [FromBody] RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.GetRefreshTokenAsync(request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(Permissions.EditUsers)]
    public async Task<IActionResult> RevokeRefreshTokenByUserId(
        [FromQuery] RevokeUserSessionsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.RevokeRefreshTokenByUserIdAsync(request.UserId, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> Session(CancellationToken cancellationToken)
    {
        var expiration = User.FindFirstValue(JwtRegisteredClaimNames.Exp);
        _ = long.TryParse(expiration, out var expiresAtSeconds);
        var tenantId = User.FindFirstValue(JwtClaimNames.TenantId) ?? string.Empty;
        var tenantAccess = await _tenantAccessService.GetAsync(tenantId, cancellationToken);

        if (tenantAccess is null)
            return Unauthorized();

        var response = new SessionResponse(
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty,
            tenantId,
            tenantAccess.TenantName,
            tenantAccess.PlanName,
            int.TryParse(User.FindFirstValue(JwtClaimNames.CompanyId), out var companyId)
                ? companyId
                : 0,
            User.FindFirstValue(ClaimTypes.Name) ?? string.Empty,
            User.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
            User.FindFirstValue(MyClaims.firstname) ?? string.Empty,
            User.FindFirstValue(MyClaims.lastname) ?? string.Empty,
            User.FindAll(ClaimTypes.Role).Select(claim => claim.Value).Distinct().ToArray(),
            User.FindAll(Permissions.Type).Select(claim => claim.Value).Distinct().ToArray(),
            tenantAccess.SubscriptionStatus,
            tenantAccess.SubscriptionEndsOn,
            tenantAccess.IsReadOnly,
            expiresAtSeconds * 1000);

        return Ok(response);
    }

    [HttpGet]
    [Authorize]
    public IActionResult RealtimeToken() =>
        Ok(new { token = _jwtProvider.GenerateRealtimeToken(User) });

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> ConfirmEmail(
        [FromBody] ConfirmEmailRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.ConfirmEmailAsync(request, cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> ResendConfirmationEmail(
        [FromBody] ResendConfirmationEmailRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.ResendConfirmationEmailAsync(request, cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> ForgetPassword(
        [FromBody] ForgetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.SendResetPasswordCodeAsync(request.Email, cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _authService.ResetPasswordAsync(request, cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }
}
