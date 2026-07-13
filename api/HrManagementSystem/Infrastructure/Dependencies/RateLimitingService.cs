namespace HrManagementSystem.Infrastructure.Dependencies;

public static class RateLimitingService
{
    public static IServiceCollection AddRateLimitingService(this IServiceCollection services)
    {
        services.AddRateLimiter(rateLimiterOptions =>
        {
            rateLimiterOptions.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            rateLimiterOptions.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
                CreateFixedWindowPartition(httpContext, "global", 120, TimeSpan.FromMinutes(1)));

            rateLimiterOptions.AddPolicy("authentication", httpContext =>
                CreateFixedWindowPartition(httpContext, "authentication", 10, TimeSpan.FromMinutes(1)));

            rateLimiterOptions.AddPolicy("fileOperations", httpContext =>
                CreateFixedWindowPartition(httpContext, "files", 30, TimeSpan.FromMinutes(1)));

            rateLimiterOptions.OnRejected = async (context, cancellationToken) =>
            {
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                    context.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();

                await context.HttpContext.Response.WriteAsJsonAsync(new ProblemDetails
                {
                    Status = StatusCodes.Status429TooManyRequests,
                    Title = "Too many requests",
                    Detail = "Please wait before retrying the request."
                }, cancellationToken);
            };
        });

        return services;
    }

    private static RateLimitPartition<string> CreateFixedWindowPartition(
        HttpContext context,
        string policy,
        int permitLimit,
        TimeSpan window)
    {
        var subject = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.Connection.RemoteIpAddress?.ToString()
            ?? "unknown";

        return RateLimitPartition.GetFixedWindowLimiter(
            $"{policy}:{subject}",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permitLimit,
                Window = window,
                QueueLimit = 0,
                AutoReplenishment = true
            });
    }
}
