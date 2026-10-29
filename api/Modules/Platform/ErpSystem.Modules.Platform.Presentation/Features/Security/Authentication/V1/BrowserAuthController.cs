using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Presentation.Authentication;
using Microsoft.Extensions.Logging;

namespace ErpSystem.Modules.Platform.Presentation.Features.Security.Authentication.V1;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/browser-auth")]
[ApiController]
[BrowserAuthenticationEndpoint]
[AllowTenantReadOnly]
public sealed class BrowserAuthController(ISender sender, IBrowserAuthenticationCookies cookies,
    BrowserAntiforgery antiforgery, IAuthenticationTokenValidationParametersFactory validation,
    ILogger<BrowserAuthController> logger) : ControllerBase
{
    private static readonly Action<ILogger, string, Exception?> LogRevocationFailure = LoggerMessage.Define<string>(
        LogLevel.Error, new EventId(23017, "BrowserSessionRevocationFailed"), "Browser session revocation failed; request {TraceIdentifier}.");
    [HttpGet("csrf")]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    [ProducesResponseType<BrowserAntiforgeryResponse>(StatusCodes.Status200OK)]
    public IActionResult Csrf() => Ok(new BrowserAntiforgeryResponse(antiforgery.CreateToken(HttpContext)));

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> Login(AuthenticationPasswordLoginRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new PasswordLoginCommand(request), cancellationToken);
        return result.IsFailure ? result.ToProblem() : await LoginResult(result.Value, cancellationToken);
    }

    [HttpPost("select-tenant")]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> SelectTenant(AuthenticationTenantSelectionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SelectTenantCommand(request), cancellationToken);
        return result.IsFailure ? result.ToProblem() : await LoginResult(result.Value, cancellationToken);
    }

    [HttpPost("select-company")]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> SelectCompany(AuthenticationCompanySelectionRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SelectCompanyCommand(request), cancellationToken);
        return result.IsFailure ? result.ToProblem() : await Complete(result.Value, cancellationToken);
    }

    [HttpGet("session")]
    [Authorize]
    [ProducesResponseType<BrowserAuthenticationSessionResponse>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Session(CancellationToken cancellationToken)
    {
        var context = await sender.Send(new GetAuthenticationSessionContextQuery(
            AuthenticationSessionContextRequestFactory.FromPrincipal(User)), cancellationToken);
        return context is null ? Unauthorized() : Ok(new BrowserAuthenticationSessionResponse(true, context));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        AuthenticationRefreshRequest request;
        try { request = cookies.Read(); }
        catch (FormatException) { return InvalidCookies(); }
        var result = await sender.Send(new RefreshAuthenticationSessionCommand(request), cancellationToken);
        return result.IsFailure ? result.ToProblem() : await Complete(result.Value, cancellationToken);
    }

    [HttpPost("switch-company")]
    [Authorize]
    [EnableRateLimiting("authentication")]
    public async Task<IActionResult> SwitchCompany(AuthenticationSwitchCompanyRequest request, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new SwitchCompanyCommand(request.CompanyId), cancellationToken);
        return result.IsFailure ? result.ToProblem() : await Complete(result.Value, cancellationToken);
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        try
        {
            AuthenticationRefreshRequest request;
            try { request = cookies.Read(); }
            catch (FormatException) { return InvalidCookies(); }
            var result = await sender.Send(new LogoutAuthenticationSessionCommand(request.RefreshToken), cancellationToken);
            return result.IsSuccess ? NoContent() : result.ToProblem();
        }
        catch (Exception) when (!cancellationToken.IsCancellationRequested)
        {
            LogRevocationFailure(logger, HttpContext.TraceIdentifier, null);
            return StatusCode(503, new ProblemDetails { Status = 503, Title = "Authentication.SessionRevocationUnavailable" });
        }
        finally { cookies.Clear(); }
    }

    [HttpGet("realtime-token")]
    [Authorize]
    public async Task<IActionResult> RealtimeToken(CancellationToken cancellationToken) => Ok(new
    {
        token = await sender.Send(new GenerateRealtimeAuthenticationTokenQuery(User.Claims
            .Select(claim => new AccessTokenClaimValue(claim.Type, claim.Value)).ToArray()), cancellationToken)
    });

    private Task<IActionResult> LoginResult(AuthenticationLoginResult result, CancellationToken cancellationToken) => result switch
    {
        AuthenticationAuthenticatedLoginResult authenticated => Complete(authenticated.Response, cancellationToken),
        AuthenticationTenantSelectionLoginResult tenant => Task.FromResult<IActionResult>(Ok(tenant)),
        AuthenticationCompanySelectionLoginResult company => Task.FromResult<IActionResult>(Ok(company)),
        _ => throw new InvalidOperationException("Unsupported authentication result.")
    };

    private async Task<IActionResult> Complete(AuthenticationSessionResponse session, CancellationToken cancellationToken)
    {
        var principal = new JwtSecurityTokenHandler().ValidateToken(session.Token, validation.Create(validation.Audience), out _);
        var context = await sender.Send(new GetAuthenticationSessionContextQuery(
            AuthenticationSessionContextRequestFactory.FromPrincipal(principal)), cancellationToken);
        if (context is null) return StatusCode(503, new ProblemDetails { Status = 503, Title = "Authentication.SessionContextUnavailable" });
        cookies.Write(session);
        return Ok(new BrowserAuthenticationSessionResponse(true, context));
    }

    private BadRequestObjectResult InvalidCookies() => BadRequest(new ProblemDetails
    {
        Status = 400, Title = "Authentication.InvalidBrowserCookies", Type = "urn:erp:error:Authentication.InvalidBrowserCookies"
    });
}
