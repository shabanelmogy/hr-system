using Microsoft.AspNetCore.Mvc.Filters;

namespace HrManagementSystem.Infrastructure.Validation;

public sealed class AsyncValidationFilter(IServiceProvider serviceProvider) : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(
        ActionExecutingContext context,
        ActionExecutionDelegate next)
    {
        var failures = new List<FluentValidation.Results.ValidationFailure>();

        foreach (var argument in context.ActionArguments.Values.Where(value => value is not null))
        {
            var argumentType = argument!.GetType();
            var validatorType = typeof(IValidator<>).MakeGenericType(argumentType);
            if (serviceProvider.GetService(validatorType) is not IValidator validator)
                continue;

            var validationContextType = typeof(ValidationContext<>).MakeGenericType(argumentType);
            var validationContext = (FluentValidation.IValidationContext)Activator.CreateInstance(validationContextType, argument)!;
            var result = await validator.ValidateAsync(validationContext, context.HttpContext.RequestAborted);
            failures.AddRange(result.Errors.Where(error => !string.IsNullOrWhiteSpace(error.ErrorMessage)));
        }

        if (failures.Count == 0)
        {
            await next();
            return;
        }

        Dictionary<string, string[]> errors = failures
            .GroupBy(error => error.PropertyName)
            .ToDictionary(
                group => group.Key,
                group => group.Select(error => error.ErrorMessage).Distinct().ToArray());

        context.Result = new BadRequestObjectResult(new ValidationProblemDetails(errors)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "One or more validation errors occurred.",
            Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1",
            Extensions = { ["traceId"] = context.HttpContext.TraceIdentifier }
        });
    }
}
