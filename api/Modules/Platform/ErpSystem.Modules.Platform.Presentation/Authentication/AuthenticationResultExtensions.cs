using ErpSystem.Modules.Platform.Application.Authentication.Orchestration;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.Platform.Presentation.Authentication;

internal static class AuthenticationResultExtensions
{
    public static IActionResult ToProblem(this AuthenticationOperationResult result)
    {
        var status = result.Error.Type switch
        {
            AuthenticationErrorType.Validation => StatusCodes.Status400BadRequest,
            AuthenticationErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            AuthenticationErrorType.Forbidden => StatusCodes.Status403Forbidden,
            AuthenticationErrorType.NotFound => StatusCodes.Status404NotFound,
            AuthenticationErrorType.Conflict => StatusCodes.Status409Conflict,
            AuthenticationErrorType.ServiceUnavailable => StatusCodes.Status503ServiceUnavailable,
            _ => StatusCodes.Status500InternalServerError
        };

        return new ObjectResult(new ProblemDetails
        {
            Status = status,
            Title = result.Error.Code,
            Detail = result.Error.Description,
            Type = $"urn:erp:error:{result.Error.Code}"
        })
        {
            StatusCode = status
        };
    }
}
