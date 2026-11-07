using System.Security.Claims;
using System.Text.Encodings.Web;
using Asp.Versioning;
using ErpSystem.Modules.Reporting.Application;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Exporting.Services;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.Exporting.Services;
using ErpSystem.Modules.Reporting.Presentation;
using FluentValidation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

// Local verification harness only. No business services, database, real sessions or log capture.
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://127.0.0.1:7358");
builder.Services.AddLogging(logging => logging.ClearProviders());
builder.Services.AddLocalization();
builder.Services.AddReportingApplication();
builder.Services.AddReportingPresentation();
builder.Services.AddSingleton<IExportExcelService, ExportExcelService>();
builder.Services.AddApiVersioning(options => options.DefaultApiVersion = new ApiVersion(1, 0)).AddMvc();
builder.Services.AddAuthentication("export-fixture").AddScheme<AuthenticationSchemeOptions, FixtureAuthentication>("export-fixture", _ => { });
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("GlobalDataExports:Export", policy => policy.RequireAuthenticatedUser().RequireClaim("Permission", "GlobalDataExports:Export"));
    options.AddPolicy("Analytics:Export", policy => policy.RequireAuthenticatedUser().RequireClaim("Permission", "Analytics:Export"));
    options.AddPolicy("TenantMember", policy => policy.RequireAuthenticatedUser().RequireRole("admin"));
});
var app = builder.Build();
app.Use(async (context, next) =>
{
    try { await next(); }
    catch (ValidationException) { context.Response.StatusCode = 400; await context.Response.WriteAsJsonAsync(new { title = "Invalid export fixture request" }); }
});
app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/fixture-health", () => Results.Ok(new { fixture = true }));
app.MapControllers();
await app.RunAsync();

internal sealed class FixtureAuthentication(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var mode = Request.Headers["X-ERP-Export-Fixture"].ToString();
        if (mode is not ("global" or "tenant" or "denied")) return Task.FromResult(AuthenticateResult.NoResult());
        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, "synthetic-export-user"), new(ClaimTypes.Role, mode == "tenant" ? "admin" : "super_admin") };
        if (mode != "denied") claims.Add(new Claim("Permission", mode == "tenant" ? "Analytics:Export" : "GlobalDataExports:Export"));
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(new ClaimsIdentity(claims, Scheme.Name)), Scheme.Name)));
    }
}
