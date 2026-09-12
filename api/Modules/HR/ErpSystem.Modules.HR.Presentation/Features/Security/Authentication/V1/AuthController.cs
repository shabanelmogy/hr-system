using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Services;
using ErpSystem.Modules.Platform.Contracts.Authentication.Orchestration;

namespace ErpSystem.Modules.HR.Presentation.Features.Security.Authentication.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
public class AuthController(
    IAuthLoginService loginService,
    IAuthSessionService sessionService,
    IAuthAccountService accountService,
    IRealtimeTokenProvider jwtProvider,
    IAuthenticationSessionContextService sessionContext) : ControllerBase
{
    private readonly IAuthLoginService _loginService = loginService;
    private readonly IAuthSessionService _sessionService = sessionService;
    private readonly IAuthAccountService _accountService = accountService;
    private readonly IRealtimeTokenProvider _jwtProvider = jwtProvider;
    private readonly IAuthenticationSessionContextService _sessionContext = sessionContext;

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _loginService.GetTokenAsync(
            request.UserName,
            request.Password,
            cancellationToken);

        return result.IsSuccess ? Ok(result.Value.Payload) : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> SelectTenant(
        [FromBody] SelectTenantRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _loginService.SelectTenantAsync(request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value.Payload) : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> SelectCompany(
        [FromBody] SelectCompanyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _loginService.SelectCompanyAsync(request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [Authorize]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> SwitchCompany(
        [FromBody] SwitchCompanyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _sessionService.SwitchCompanyAsync(
            request.CompanyId,
            cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _accountService.RegisterAsync(request, cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> LogOut(
        [FromBody] LogoutRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _sessionService.LogOutAsync(request.RefreshToken, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> RefreshToken(
        [FromBody] RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _sessionService.GetRefreshTokenAsync(request, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(Permissions.EditUsers)]
    public async Task<IActionResult> RevokeRefreshTokenByUserId(
        [FromQuery] RevokeUserSessionsRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _sessionService.RevokeRefreshTokenByUserIdAsync(request.UserId, cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> Session(CancellationToken cancellationToken)
    {
        var expiration = User.FindFirstValue(JwtRegisteredClaimNames.Exp);
        _ = long.TryParse(expiration, out var expiresAtSeconds);
        var tenantId = User.FindFirstValue(AuthenticationTokenClaimNames.TenantId) ?? string.Empty;
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var companyId = int.TryParse(User.FindFirstValue(AuthenticationTokenClaimNames.CompanyId), out var parsedCompanyId)
            ? parsedCompanyId
            : 0;
        var session = await _sessionContext.GetAsync(
            new AuthenticationSessionContextRequest(
                userId,
                tenantId,
                companyId,
                User.FindFirstValue(ClaimTypes.Name) ?? string.Empty,
                User.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
                User.FindFirstValue(AuthenticationTokenClaimNames.FirstName) ?? string.Empty,
                User.FindFirstValue(AuthenticationTokenClaimNames.LastName) ?? string.Empty,
                User.FindAll(ClaimTypes.Role).Select(claim => claim.Value).Distinct().ToArray(),
                User.FindAll(Permissions.Type).Select(claim => claim.Value).Distinct().ToArray(),
                expiresAtSeconds * 1000),
            cancellationToken);

        if (session is null)
            return Unauthorized();

        var response = new SessionResponse(
            session.UserId,
            session.TenantId,
            session.TenantName,
            session.TenantPlanName,
            session.CompanyId,
            session.CompanyCode,
            session.CompanyNameAr,
            session.CompanyNameEn,
            session.Companies.Select(company => new CompanyOptionResponse(
                company.Id,
                company.CompanyCode,
                company.NameAr,
                company.NameEn)).ToArray(),
            session.UserName,
            session.Email,
            session.FirstName,
            session.LastName,
            session.Roles,
            session.Permissions,
            session.TenantSubscriptionStatus,
            session.TenantSubscriptionEndsOn,
            session.TenantReadOnly,
            session.ExpiresAt);

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
        var result = await _accountService.ConfirmEmailAsync(request, cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> ResendConfirmationEmail(
        [FromBody] ResendConfirmationEmailRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _accountService.ResendConfirmationEmailAsync(request, cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> ForgetPassword(
        [FromBody] ForgetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _accountService.SendResetPasswordCodeAsync(request.Email, cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _accountService.ResetPasswordAsync(request, cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }
}
