using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Api.Modules;
using ErpSystem.Api.Hosting;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

var modules = ErpModuleRegistry.Create();
HostDeploymentConfigurationValidator.Validate(
    builder.Configuration,
    builder.Environment.EnvironmentName,
    modules.Select(module => module.Name));

builder.Services.AddErpHostInfrastructure(
    builder.Configuration,
    modules.Select(module => module.Name));

builder.Services.AddModules(
    builder.Configuration,
    modules);

builder.Host.UseSerilog((context, configuration) =>
{
    configuration.ReadFrom.Configuration(context.Configuration);
});

var app = builder.Build();
var catalog = app.Services.GetRequiredService<ModuleCatalog>();

if (HostForwardedHeadersServiceCollectionExtensions.IsForwardingEnabled(builder.Configuration))
    app.UseForwardedHeaders();

app.UseExceptionHandler();
app.UseMiddleware<HostCorrelationIdMiddleware>();
app.ConfigureModulesEarly(catalog);

if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (diagnosticContext, context) =>
    {
        diagnosticContext.Set("UserId", context.User.FindFirstValue(ClaimTypes.NameIdentifier));
        diagnosticContext.Set("UserName", context.User.FindFirstValue(ClaimTypes.Name));
    };
});

app.UseCors(HostInfrastructureServiceCollectionExtensions.BrowserCorsPolicy);

var supportedCultures = new[] { "en-US", "ar-EG" };
app.UseRequestLocalization(new RequestLocalizationOptions()
    .SetDefaultCulture(supportedCultures[0])
    .AddSupportedCultures(supportedCultures));
app.UseMiddleware<HostCultureMiddleware>();
app.UseStaticFiles();

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
            options.SwaggerEndpoint(
                $"{swaggerJsonBasePath}/swagger/{description.GroupName}/swagger.json",
                description.ApiVersion.ToString());
        }

        options.DisplayRequestDuration();
        options.DocumentTitle = "ERP System API";
        options.EnablePersistAuthorization();
        options.EnableFilter();
    });

    app.MapSwagger().AllowAnonymous();
}

app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();

await app.PrepareHostRuntimeAsync(catalog);
app.ConfigureModules(catalog);
app.ConfigureHostRuntimeContributors();

app.MapControllers();
app.MapModuleEndpoints(catalog);
app.MapHostRuntimeEndpoints();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = HostHealthCheckPredicates.IsReadiness,
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
}).RequireAuthorization();

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = HostHealthCheckPredicates.IsLiveness
}).AllowAnonymous();

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = HostHealthCheckPredicates.IsReadiness,
    ResultStatusCodes =
    {
        [HealthStatus.Healthy] = StatusCodes.Status200OK,
        [HealthStatus.Degraded] = StatusCodes.Status503ServiceUnavailable,
        [HealthStatus.Unhealthy] = StatusCodes.Status503ServiceUnavailable
    }
}).AllowAnonymous();

if (swaggerEnabled)
    app.MapGet("/", () => Results.Redirect("/swagger/index.html")).AllowAnonymous();

app.Run();
