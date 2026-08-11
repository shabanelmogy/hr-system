using HrManagementSystem.Application.Features.Security.Users.Contracts;
using HrManagementSystem.Application.Features.Security.Users.Services;

namespace HrManagementSystem.Api.Features.Security.Authentication.V1;

[Route("AccountInfo/[action]")]
[ApiController]
[Authorize]
public class AccountController(
    IUserService userService,
    IValidator<UpdateProfilePictureRequest> profilePictureValidator) : ControllerBase
{
    private readonly IUserService _userService = userService;
    private readonly IValidator<UpdateProfilePictureRequest> _profilePictureValidator = profilePictureValidator;

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
    public async Task<IActionResult> UpdateUserPicture(
        [FromForm(Name = "ProfilePicture")] IFormFile? profilePicture,
        [FromForm(Name = "Remove")] bool remove,
        CancellationToken cancellationToken)
    {
        var request = new UpdateProfilePictureRequest(profilePicture?.ToFileUpload(), remove);
        await _profilePictureValidator.ValidateAndThrowAsync(request, cancellationToken);
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
