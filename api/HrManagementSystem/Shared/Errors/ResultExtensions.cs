namespace HrManagementSystem.Shared.Errors
{
    public static class ResultExtensions
    {
        public static ObjectResult ToProblem(this Result result)
        {
            if (result.IsSuccess)
                throw new InvalidOperationException("Cannot convert success result to a problem");

            var problem = Results.Problem(statusCode: result.Error.StatusCode);
            var problemDetails = problem.GetType().GetProperty(nameof(ProblemDetails))!.GetValue(problem) as ProblemDetails;

            var errors = new Dictionary<string, List<string>>
            {
                { result.Error.Code, new List<string> { result.Error.Description } }
            };

            problemDetails!.Extensions = new Dictionary<string, object?>
            {
                {
                    "errors",errors
                }
            };

            return new ObjectResult(problemDetails);
        }
    }
}