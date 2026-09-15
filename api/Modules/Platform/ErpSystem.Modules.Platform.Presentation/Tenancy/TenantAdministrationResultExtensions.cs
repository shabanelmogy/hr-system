using ErpSystem.Modules.Platform.Application.Tenancy.Administration;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Modules.Platform.Presentation.Tenancy;

internal static class TenantAdministrationResultExtensions
{
    public static IActionResult ToProblem(this TenantAdministrationResult result)
    {
        var status = result.Error.Type switch
        {
            TenantAdministrationErrorType.Validation => StatusCodes.Status400BadRequest,
            TenantAdministrationErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            TenantAdministrationErrorType.Forbidden => StatusCodes.Status403Forbidden,
            TenantAdministrationErrorType.NotFound => StatusCodes.Status404NotFound,
            TenantAdministrationErrorType.Conflict => StatusCodes.Status409Conflict,
            TenantAdministrationErrorType.ServiceUnavailable => StatusCodes.Status503ServiceUnavailable,
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
