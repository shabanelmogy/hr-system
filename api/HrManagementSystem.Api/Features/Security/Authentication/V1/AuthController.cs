using HrManagementSystem.Application.Features.Security.Authentication.Contracts;
using HrManagementSystem.Application.Features.Security.Authentication.Services;
using HrManagementSystem.Application.Features.Tenancy.Services;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

namespace HrManagementSystem.Api.Features.Security.Authentication.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
public class AuthController(
    IAuthLoginService loginService,
    IAuthSessionService sessionService,
    IAuthAccountService accountService,
    IJwtProvider jwtProvider,
    ITenantAccessService tenantAccessService,
    AuthCompanyAccessService companyAccessService) : ControllerBase
{
    private readonly IAuthLoginService _loginService = loginService;
    private readonly IAuthSessionService _sessionService = sessionService;
    private readonly IAuthAccountService _accountService = accountService;
    private readonly IJwtProvider _jwtProvider = jwtProvider;
    private readonly ITenantAccessService _tenantAccessService = tenantAccessService;
    private readonly AuthCompanyAccessService _companyAccessService = companyAccessService;

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
        var tenantId = User.FindFirstValue(JwtClaimNames.TenantId) ?? string.Empty;
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var companyId = int.TryParse(User.FindFirstValue(JwtClaimNames.CompanyId), out var parsedCompanyId)
            ? parsedCompanyId
            : 0;
        var tenantAccess = await _tenantAccessService.GetAsync(tenantId, cancellationToken);
        var companies = await _companyAccessService.GetAvailableCompaniesAsync(
            userId,
            tenantId,
            cancellationToken);
        var company = companies.SingleOrDefault(candidate => candidate.Id == companyId);

        if (tenantAccess is null || company is null)
            return Unauthorized();

        var response = new SessionResponse(
            userId,
            tenantId,
            tenantAccess.TenantName,
            tenantAccess.PlanName,
            companyId,
            company.CompanyCode,
            company.NameAr,
            company.NameEn,
            companies,
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
