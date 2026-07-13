namespace HrManagementSystem.Shared.Errors
{
    public static class ResultExtensions
    {
        public static ObjectResult ToProblem(this Result result)
        {
            if (result.IsSuccess)
                throw new InvalidOperationException("Cannot convert success result to a problem");

            var errors = new Dictionary<string, List<string>>
            {
                { result.Error.Code, new List<string> { result.Error.Description } }
            };

            var problemDetails = new ProblemDetails
            {
                Status = result.Error.StatusCode,
                Title = "Request failed",
                Type = $"https://httpstatuses.io/{result.Error.StatusCode}"
            };
            problemDetails.Extensions["errors"] = errors;

            return new ObjectResult(problemDetails) { StatusCode = result.Error.StatusCode };
        }
    }
}
