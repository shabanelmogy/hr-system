using HrManagementSystem.Features.Security.Users.Contracts;
using HrManagementSystem.Features.Security.Users.Services;

namespace HrManagementSystem.Features.Security.Authentication.Controllers.V1;

[Route("AccountInfo/[action]")]
[ApiController]
[Authorize]
public class AccountController(IUserService userService) : ControllerBase
{
    private readonly IUserService _userService = userService;

    [HttpGet]
    public async Task<IActionResult> GetInfo(CancellationToken cancellationToken)
    {
        var result = await _userService.GetProfileAsync(User.GetUserId()!, cancellationToken);

        return Ok(result.Value);
    }

    [HttpGet]
    public async Task<IActionResult> GetUserPhoto(CancellationToken cancellationToken)
    {
        var result = await _userService.GetUserPhotoAsync(User.GetUserId()!, cancellationToken);

        return result.IsSuccess
              ? Ok(result.Value)
              : result.ToProblem();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateInfo([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        await _userService.UpdateProfileAsync(User.GetUserId()!, request, cancellationToken);

        return NoContent();
    }

    [HttpPut]
    public async Task<IActionResult> UpdateUserPicture([FromForm] UpdateProfilePictureRequest request, CancellationToken cancellationToken)
    {
        var result = await _userService.UpdateProfilePictureAsync(User.GetUserId()!, request, cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }

    [HttpPut]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var result = await _userService.ChangePasswordAsync(User.GetUserId()!, request, cancellationToken);

        return result.IsSuccess ? NoContent() : result.ToProblem();
    }
}
