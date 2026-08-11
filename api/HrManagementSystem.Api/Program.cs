
using HrManagementSystem.Application;
using HrManagementSystem.Infrastructure;
using HrManagementSystem.Infrastructure.Common.Settings;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Host.UseSerilog((context, configuration) =>
{
    configuration.ReadFrom.Configuration(context.Configuration);
});

var app = builder.Build();

ProtectedFileStorage.MigrateLegacyFiles(app.Environment);
app.UseExceptionHandler();
app.UseMiddleware<CorrelationIdMiddleware>();

var databaseSettings = app.Services
    .GetRequiredService<IOptions<DatabaseSettings>>()
    .Value;

if (databaseSettings.ApplyMigrationsOnStartup)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

#region "serilog"

app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (diagnosticContext, context) =>
    {
        diagnosticContext.Set("UserId", context.User.FindFirstValue(ClaimTypes.NameIdentifier));
        diagnosticContext.Set("UserName", context.User.FindFirstValue(ClaimTypes.Name));
        diagnosticContext.Set("CorrelationId", context.GetCorrelationId());
    };
});

#endregion

app.UseHttpsRedirection();

#region "Cors"

app.UseCors("AllowReactApp");

#endregion

#region "Swagger"

var swaggerEnabled = app.Environment.IsDevelopment() ||
    builder.Configuration.GetValue<bool>("SwaggerSettings:Enabled");

if (swaggerEnabled)
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
        options.DocumentTitle = "HR Management System API";
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

app.Use(async (context, next) =>
{
    using var userId = LogContext.PushProperty(
        "UserId",
        context.User.FindFirstValue(ClaimTypes.NameIdentifier));
    using var userName = LogContext.PushProperty(
        "UserName",
        context.User.FindFirstValue(ClaimTypes.Name));

    await next();
});

app.UseRateLimiter();
app.UseAuthorization();

#endregion

#region "Hangfire"

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { app.Services.GetRequiredService<HangfireAuthorizationFilter>() },
    AppPath = null,
    DisplayStorageConnectionString = false
});


#endregion

#region "Localization"

var supportedCultures = new[] { "en-US", "ar-EG" };
var localizationOptions = new RequestLocalizationOptions()
    .SetDefaultCulture(supportedCultures[0])
    .AddSupportedCultures(supportedCultures);

app.UseRequestLocalization(localizationOptions);

#endregion

#region "Seeding"

if (databaseSettings.SeedOnStartup)
    await app.AddSeedsRequest();

#endregion

app.UseMiddleware<CultureMiddleware>();
app.UseStaticFiles();
app.MapControllers();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = registration => registration.Tags.Contains("ready"),
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
}).RequireAuthorization();

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false
}).AllowAnonymous();

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = registration => registration.Tags.Contains("ready")
}).AllowAnonymous();

app.MapHub<GeneralHub>("/hubs/company").RequireCors("AllowReactApp");

// Run Swagger UI from the application root when Swagger is enabled.
if (swaggerEnabled)
    app.MapGet("/", () => Results.Redirect("/swagger/index.html")).AllowAnonymous();

app.Run();
