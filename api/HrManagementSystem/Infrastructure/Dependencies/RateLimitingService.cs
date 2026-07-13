namespace HrManagementSystem.Infrastructure.Dependencies;

public static class RateLimitingService
{
    public static IServiceCollection AddRateLimitingService(this IServiceCollection services)
    {
        services.AddRateLimiter(rateLimiterOptions =>
        {
            rateLimiterOptions.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            //Number Of Request Can Send in Same Time
            //rateLimiterOptions.AddConcurrencyLimiter("concurrency", options =>
            //{
            //    options.PermitLimit = 2;
            //    options.QueueLimit = 1;
            //    options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            //});

            //Number Of Requests can send in period and increase to token limit
            //rateLimiterOptions.AddTokenBucketLimiter("bucket", options =>
            //{
            //    options.TokenLimit = 2;
            //    options.QueueLimit = 1;
            //    options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            //    options.ReplenishmentPeriod = TimeSpan.FromSeconds(60);
            //    options.TokensPerPeriod = 2;
            //    options.AutoReplenishment = true;
            //});

            //Number Of Requests Can Send In Period And When Full Period End Get New Requests like Cinema 
            //And Queue Waiting For Time End
            //rateLimiterOptions.AddFixedWindowLimiter("fixed", options =>
            //{
            //    options.PermitLimit = 2;
            //    options.QueueLimit = 1;
            //    options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            //    options.Window = TimeSpan.FromSeconds(30);
            //});

            //Divide Window In Segments And When Segment End Number Of His Requests Go To Another Segment
            //rateLimiterOptions.AddSlidingWindowLimiter("rateLimiter", options =>
            //{
            //    options.PermitLimit = 2;
            //    options.QueueLimit = 1;
            //    options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            //    options.Window = TimeSpan.FromSeconds(30);
            //    options.SegmentsPerWindow = 2;
            //});

            //Limit Request Sends From Specific Ip
            //rateLimiterOptions.AddPolicy("ipLimiter", httpContext =>
            //RateLimitPartition.GetFixedWindowLimiter(
            //    partitionKey: httpContext.Connection.RemoteIpAddress?.ToString(),
            //    factory: _ => new FixedWindowRateLimiterOptions
            //    {
            //        PermitLimit = 2,
            //        Window = TimeSpan.FromSeconds(20)
            //    }
            //));
            //

            rateLimiterOptions.AddPolicy("userLimiter", httpContext =>
             RateLimitPartition.GetFixedWindowLimiter(
             partitionKey: httpContext.User.GetUserId(),
             factory: _ => new FixedWindowRateLimiterOptions
             {
                 PermitLimit = 2,
                 Window = TimeSpan.FromSeconds(20)
             }
         )
        );
        });

        return services;
    }
}
