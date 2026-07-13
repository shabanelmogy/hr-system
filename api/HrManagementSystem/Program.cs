
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAllDependencies(builder.Configuration);

builder.Host.UseSerilog((context, configuration) =>
{
    configuration.ReadFrom.Configuration(context.Configuration);
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

#region "serilog"

app.UseSerilogRequestLogging();

app.Use(async (context, next) =>
{
    LogContext.PushProperty("UserId", context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
    LogContext.PushProperty("UserName", context.User.FindFirst(ClaimTypes.Name)?.Value);

    await next();
});

#endregion

app.UseHttpsRedirection();

#region "Cors"

app.UseCors("AllowReactApp");

#endregion

#region "Swagger"

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        var provider = app.Services.GetRequiredService<IApiVersionDescriptionProvider>();

        foreach (var description in provider.ApiVersionDescriptions)
        {
            string swaggerJsonBasePath = string.IsNullOrWhiteSpace(options.RoutePrefix) ? "." : "..";
            options.SwaggerEndpoint($"{swaggerJsonBasePath}/swagger/{description.GroupName}/swagger.json", description.ApiVersion.ToString());
        }
        options.DisplayRequestDuration();
        options.DocumentTitle = "Technical Support Api";
        options.EnablePersistAuthorization();
        options.EnableFilter();
    });

    // Exempt Swagger UI and its JSON spec from the global RequireAuthenticatedUser
    // fallback policy so the docs are accessible without a bearer token.
    app.MapSwagger().AllowAnonymous();
}

#endregion

#region "Authentication And Authorization"

app.UseAuthentication();
app.UseAuthorization();

#endregion

#region "Hangfire"

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { app.Services.GetRequiredService<HangfireAuthorizationFilter>() },
    IgnoreAntiforgeryToken = true,
    AppPath = null,
    DisplayStorageConnectionString = false
});


//Hangfire Jobs
//HangfireJobConfig.RegisterJobs();

#endregion

#region "Localization"

var supportedCultures = new[] { "en-US", "ar-EG" };
var localizationOptions = new RequestLocalizationOptions()
    .SetDefaultCulture(supportedCultures[0])
    .AddSupportedCultures(supportedCultures);

app.UseRequestLocalization(localizationOptions);

#endregion

#region "Seeding"

app.AddSeedsRequest().GetAwaiter().GetResult();

#endregion

app.MapControllers();
app.UseExceptionHandler();

app.UseMiddleware<CultureMiddleware>();
app.UseStaticFiles();
app.UseFileServer();
app.UseRateLimiter();

app.MapHealthChecks("health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.MapHub<GeneralHub>("/hubs/company").RequireCors("AllowReactApp");

//To Run Swagger Ui In Browser
if (app.Environment.IsDevelopment())
    app.MapGet("/", () => Results.Redirect("/swagger/index.html")).AllowAnonymous();

app.Run();
