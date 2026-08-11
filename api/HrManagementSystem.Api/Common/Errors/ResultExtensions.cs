namespace HrManagementSystem.Api.Common.Errors;

public static class ResultExtensions
{
    public static ObjectResult ToProblem(this Result result)
    {
        if (result.IsSuccess)
            throw new InvalidOperationException("Cannot convert success result to a problem");

        var statusCode = result.Error.Type.ToStatusCode();

        var errors = new Dictionary<string, List<string>>
        {
            { result.Error.Code, new List<string> { result.Error.Description } }
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = "Request failed",
            Type = $"https://httpstatuses.io/{statusCode}"
        };
        problemDetails.Extensions["errors"] = errors;

        return new ObjectResult(problemDetails) { StatusCode = statusCode };
    }

    private static int ToStatusCode(this ErrorType errorType) => errorType switch
    {
        ErrorType.Validation => StatusCodes.Status400BadRequest,
        ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
        ErrorType.Forbidden => StatusCodes.Status403Forbidden,
        ErrorType.NotFound => StatusCodes.Status404NotFound,
        ErrorType.Conflict => StatusCodes.Status409Conflict,
        ErrorType.Unexpected => StatusCodes.Status500InternalServerError,
        _ => StatusCodes.Status500InternalServerError
    };
}
