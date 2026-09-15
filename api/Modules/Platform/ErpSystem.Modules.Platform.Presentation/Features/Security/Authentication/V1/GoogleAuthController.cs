using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Presentation.Authentication;

namespace ErpSystem.Modules.Platform.Presentation.Features.Security.Authentication.V1;

[Route("api/account")]
[ApiController]
[AllowAnonymous]
[EnableRateLimiting("authentication")]
public sealed class GoogleAuthController(ISender sender) : ControllerBase
{
    [HttpPost("google-auth")]
    public async Task<IActionResult> GoogleAuth(
        [FromBody] GoogleAuthRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GoogleExternalLoginCommand(request.Credential), cancellationToken);
        if (result is null)
            return Unauthorized();

        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}

public sealed record GoogleAuthRequest(string Credential);
