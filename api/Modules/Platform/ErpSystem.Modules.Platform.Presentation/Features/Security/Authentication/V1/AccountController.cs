using ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Profile;
using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using ErpSystem.Modules.Platform.Presentation.Authentication;
using ErpSystem.Modules.Platform.Presentation.Common.Files;
using MediatR;

namespace ErpSystem.Modules.Platform.Presentation.Features.Security.Authentication.V1;

[Route("AccountInfo/[action]")]
[ApiController]
[Authorize]
public class AccountController(
    ISender sender) : ControllerBase
{
    private readonly ISender _sender = sender;

    [HttpGet]
    public async Task<IActionResult> GetInfo(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new GetUserProfileQuery(User.GetUserId()!),
            cancellationToken);

        return Ok(result.Value);
    }

    [HttpGet]
    public async Task<IActionResult> GetUserPhoto(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new GetUserPhotoQuery(User.GetUserId()!),
            cancellationToken);

        return result.IsSuccess
              ? Ok(result.Value)
              : result.ToProblem();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateInfo([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        await _sender.Send(
            new UpdateUserProfileCommand(User.GetUserId()!, request),
            cancellationToken);

        return NoContent();
    }

    [HttpPut]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateUserPicture(
        [FromForm] ProfilePictureUploadForm form,
        CancellationToken cancellationToken)
    {
        var request = new UpdateProfilePictureRequest(
            form.ProfilePicture?.ToFileUpload(),
            form.Remove);
        var result = await _sender.Send(
            new UpdateUserProfilePictureCommand(User.GetUserId()!, request),
            cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPut]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new ChangeAuthenticationPasswordCommand(
                User.GetUserId()!,
                new AuthenticationChangePasswordRequest(request.CurrentPassword, request.NewPassword)),
            cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
