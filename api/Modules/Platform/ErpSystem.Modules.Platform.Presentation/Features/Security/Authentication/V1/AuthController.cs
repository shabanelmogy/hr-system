using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;
using ErpSystem.Modules.Platform.Presentation.Authentication;

namespace ErpSystem.Modules.Platform.Presentation.Features.Security.Authentication.V1;

[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute)]
[ApiController]
public class AuthController(
    ISender sender) : ControllerBase
{
    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> Login(
        [FromBody] AuthenticationPasswordLoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new PasswordLoginCommand(request), cancellationToken);

        return result.IsSuccess ? Ok(LoginPayload(result.Value)) : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> SelectTenant(
        [FromBody] AuthenticationTenantSelectionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SelectTenantCommand(request), cancellationToken);
        return result.IsSuccess ? Ok(LoginPayload(result.Value)) : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> SelectCompany(
        [FromBody] AuthenticationCompanySelectionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SelectCompanyCommand(request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [Authorize]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> SwitchCompany(
        [FromBody] AuthenticationSwitchCompanyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SwitchCompanyCommand(request.CompanyId), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> Register(
        [FromBody] AuthenticationRegisterRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RegisterAuthenticationAccountCommand(request), cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> LogOut(
        [FromBody] AuthenticationLogoutRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new LogoutAuthenticationSessionCommand(request.RefreshToken), cancellationToken);
        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> RefreshToken(
        [FromBody] AuthenticationRefreshRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RefreshAuthenticationSessionCommand(request), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }

    [HttpPut]
    [HasPermission(PlatformPermissions.EditUsers)]
    public async Task<IActionResult> RevokeRefreshTokenByUserId(
        [FromQuery] string userId,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RevokeAuthenticationSessionsCommand(userId), cancellationToken);
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
        var session = await sender.Send(
            new GetAuthenticationSessionContextQuery(new AuthenticationSessionContextRequest(
                userId,
                tenantId,
                companyId,
                User.FindFirstValue(ClaimTypes.Name) ?? string.Empty,
                User.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
                User.FindFirstValue(AuthenticationTokenClaimNames.FirstName) ?? string.Empty,
                User.FindFirstValue(AuthenticationTokenClaimNames.LastName) ?? string.Empty,
                User.FindAll(ClaimTypes.Role).Select(claim => claim.Value).Distinct().ToArray(),
                User.FindAll(PermissionClaimNames.Permission).Select(claim => claim.Value).Distinct().ToArray(),
                expiresAtSeconds * 1000)),
            cancellationToken);

        if (session is null)
            return Unauthorized();

        return Ok(session);
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> RealtimeToken(CancellationToken cancellationToken)
    {
        var token = await sender.Send(
            new GenerateRealtimeAuthenticationTokenQuery(User.Claims
                .Select(claim => new AccessTokenClaimValue(claim.Type, claim.Value))
                .ToArray()),
            cancellationToken);

        return Ok(new
        {
            token
        });
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> ConfirmEmail(
        [FromBody] AuthenticationConfirmEmailRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ConfirmAuthenticationEmailCommand(request), cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> ResendConfirmationEmail(
        [FromBody] AuthenticationResendConfirmationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ResendAuthenticationConfirmationCommand(request), cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> ForgetPassword(
        [FromBody] AuthenticationResendConfirmationRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SendAuthenticationResetCodeCommand(request.Email), cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    [HttpPost]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] AuthenticationResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new ResetAuthenticationPasswordCommand(request), cancellationToken);
        return result.IsSuccess ? Ok() : result.ToProblem();
    }

    private static object LoginPayload(AuthenticationLoginResult result) => result switch
    {
        AuthenticationAuthenticatedLoginResult authenticated => authenticated.Response,
        AuthenticationTenantSelectionLoginResult tenantSelection => tenantSelection,
        AuthenticationCompanySelectionLoginResult companySelection => companySelection,
        _ => throw new ArgumentOutOfRangeException(nameof(result))
    };
}
