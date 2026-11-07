using System.Security.Claims;
using System.Text.Encodings.Web;
using Asp.Versioning;
using ErpSystem.BuildingBlocks.Application.Abstractions.AuditTrail;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Persistence.AuditTrail;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Features.Platform.AuditTrail;
using ErpSystem.Modules.Platform.Application.Features.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Contracts.ErrorLogs;
using ErpSystem.Modules.Platform.Domain.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.AuditTrail;
using ErpSystem.Modules.Platform.Infrastructure.Features.Platform.ErrorLogs;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using ErpSystem.Modules.Platform.Presentation;
using FluentValidation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

// Test-only loopback host: actual controllers/handlers/stores with disposable synthetic memory data.
// It does not load host secrets, connect SQL, capture real logs, issue sessions or deploy anything.
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://127.0.0.1:7359");
builder.Services.AddLogging(options => options.ClearProviders());
builder.Services.AddLocalization();
builder.Services.AddPlatformApplication();
builder.Services.AddPlatformPresentation();
builder.Services.AddApiVersioning(options => options.DefaultApiVersion = new ApiVersion(1, 0)).AddMvc();
builder.Services.AddDbContext<PlatformDbContext>(options => options.UseInMemoryDatabase("system-log-proof"));
builder.Services.AddSingleton<ICurrentExecutionContext, FixtureActor>();
builder.Services.AddSingleton<ErrorLogCaptureQueue>();
builder.Services.AddSingleton<IErrorLogCaptureSink>(provider => provider.GetRequiredService<ErrorLogCaptureQueue>());
builder.Services.AddScoped<IErrorLogStore, ErrorLogStore>();
builder.Services.AddScoped<IAuditTrailSource>(provider => new AuditTrailSource<PlatformDbContext>(provider.GetRequiredService<PlatformDbContext>(), "platform"));
builder.Services.AddScoped<IAuditTrailUserDirectory, AuditTrailUserDirectory>();
builder.Services.AddAuthentication("log-fixture").AddScheme<AuthenticationSchemeOptions, FixtureAuthentication>("log-fixture", _ => { });
builder.Services.AddAuthorization(options =>
{
    foreach (var permission in new[] { "SystemErrorLogs:View", "SystemErrorLogs:ViewDetails", "SystemErrorLogs:Export", "SystemAuditTrail:View" })
        options.AddPolicy(permission, policy => policy.RequireAuthenticatedUser().RequireClaim("Permission", permission));
});
var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PlatformDbContext>();
    db.Users.Add(new PlatformApplicationUser { Id = "proof-user", UserName = "proof-user", FirstName = "Synthetic", LastName = "Operator" });
    var start = new DateTime(2026, 11, 6, 10, 0, 0, DateTimeKind.Utc);
    for (var index = 1; index <= 63; index++)
    {
        var text = index % 3 == 0 ? "Target" : "Other";
        db.ErrorLogEntries.Add(ErrorLogEntry.Create(Guid.Parse($"2b92450e-c383-feee-839f-{index:000000000000}"), start.AddSeconds(index),
            "api", "error", null, null, "proof-user", "SyntheticService", "Read", 500, index, "synthetic-correlation", text, "Browser", "Chrome", "192.0.2.1", "[]"));
        db.Set<AuditTrailEntry>().Add(new AuditTrailEntry
        {
            Id = index, EntityName = "SyntheticEntity", EntityKey = index.ToString(System.Globalization.CultureInfo.InvariantCulture),
            EntityDisplay = text + " " + index, Action = AuditAction.Modified, UserId = "proof-user", OccurredOnUtc = start.AddSeconds(index), ChangeCount = index
        });
    }
    await db.SaveChangesAsync();
}
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api") && HttpMethods.IsPost(context.Request.Method) && context.Request.Headers["X-ERP-XSRF"] != "log-fixture")
    { context.Response.StatusCode = 400; return; }
    try { await next(); }
    catch (ValidationException) { context.Response.StatusCode = 400; await context.Response.WriteAsJsonAsync(new { title = "Invalid synthetic filter" }); }
});
app.UseAuthentication();
app.UseAuthorization();
app.MapGet("/fixture-health", () => Results.Ok(new { fixture = true }));
app.MapControllers();
await app.RunAsync();

internal sealed class FixtureActor : ICurrentExecutionContext
{
    public string? UserId => "proof-user";
    public string? TenantId => null;
    public int? CompanyId => null;
    public bool IsInRole(string role) => role == "super_admin";
}
internal sealed class FixtureAuthentication(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (Request.Headers["X-ERP-Log-Fixture"] != "allowed") return Task.FromResult(AuthenticateResult.NoResult());
        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, "proof-user"), new(ClaimTypes.Role, "super_admin") };
        foreach (var permission in new[] { "SystemErrorLogs:View", "SystemErrorLogs:ViewDetails", "SystemErrorLogs:Export", "SystemAuditTrail:View" }) claims.Add(new("Permission", permission));
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(new ClaimsIdentity(claims, Scheme.Name)), Scheme.Name)));
    }
}
