using System.Security.Cryptography;
using System.Text;
using HrManagementSystem.AttendanceConnector.Models;
using HrManagementSystem.AttendanceConnector.Services;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOptions<AttendanceConnectorOptions>().Bind(builder.Configuration.GetSection(AttendanceConnectorOptions.SectionName));
builder.Services.AddSingleton<TargetPolicy>();
builder.Services.AddSingleton<ZkComDeviceDriver>();
builder.Services.AddSingleton<DeviceDriverRegistry>();

var configured = builder.Configuration.GetSection(AttendanceConnectorOptions.SectionName).Get<AttendanceConnectorOptions>() ?? new AttendanceConnectorOptions();
var urls = builder.Configuration["AttendanceConnector:Urls"] ?? builder.Configuration["Urls"] ?? "http://127.0.0.1:5188";
foreach (var url in urls.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
    if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) || (!IsLoopbackBinding(uri) && string.IsNullOrWhiteSpace(configured.InternalApiKey)))
        throw new InvalidOperationException("A non-loopback connector binding requires AttendanceConnector:InternalApiKey.");
builder.WebHost.UseUrls(urls);

if (configured.CorsOrigins is { Length: > 0 })
    builder.Services.AddCors(cors => cors.AddPolicy("configured-origins", policy => policy
        .WithOrigins(configured.CorsOrigins.Where(IsAbsoluteHttpOrigin).ToArray()).AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
if (configured.CorsOrigins is { Length: > 0 }) app.UseCors("configured-origins");
app.Use(async (context, next) =>
{
    if (!IsLoopback(context.Connection.RemoteIpAddress) && string.IsNullOrWhiteSpace(configured.InternalApiKey))
    {
        await WriteFailure(context, new ConnectorError("CONNECTOR_ACCESS_DENIED", "The connector accepts non-loopback requests only when an internal key is configured."), StatusCodes.Status403Forbidden);
        return;
    }
    if (!string.IsNullOrWhiteSpace(configured.InternalApiKey) && !FixedTimeEquals(context.Request.Headers["X-Attendance-Connector-Key"].ToString(), configured.InternalApiKey))
    {
        await WriteFailure(context, new ConnectorError("CONNECTOR_AUTH_REQUIRED", "A valid connector key is required."), StatusCodes.Status401Unauthorized);
        return;
    }
    await next();
});

app.MapGet("/health", (DeviceDriverRegistry registry, ZkComDeviceDriver zkteco) =>
{
    var sdk = zkteco.GetSdkInfo();
    return Results.Ok(new ConnectorHealth(sdk.Available ? "ready" : "degraded", sdk.Available,
        Environment.Is64BitProcess ? "x64" : "x86", sdk.Version, registry.GetProviders()));
});
app.MapGet("/providers", (DeviceDriverRegistry registry) => Results.Ok(registry.GetProviders()));
app.MapGet("/health/live", () => Results.Ok(new { status = "live" }));
app.MapPost("/devices/test", async (DeviceEndpointRequest request, DeviceDriverRegistry registry, TargetPolicy policy, IOptions<AttendanceConnectorOptions> options, CancellationToken cancellationToken) =>
    await ExecuteAsync(request, policy, options.Value, cancellationToken, token => registry.GetRequired(request.ProviderId).TestConnectionAsync(request, token)));
app.MapPost("/devices/pull-users", async (DeviceEndpointRequest request, DeviceDriverRegistry registry, TargetPolicy policy, IOptions<AttendanceConnectorOptions> options, CancellationToken cancellationToken) =>
    await ExecuteAsync(request, policy, options.Value, cancellationToken, token => registry.GetRequired(request.ProviderId).PullUsersAsync(request, token)));
app.MapPost("/devices/pull-attendance", async (PullAttendanceRequest request, DeviceDriverRegistry registry, TargetPolicy policy, IOptions<AttendanceConnectorOptions> options, CancellationToken cancellationToken) =>
{
    if (request.From is not null && request.To is not null && request.From.Value > request.To.Value)
        return Failure(new ConnectorException("INVALID_REQUEST", "The start date cannot be after the end date.", StatusCodes.Status400BadRequest));
    return await ExecuteAsync(request, policy, options.Value, cancellationToken, token => registry.GetRequired(request.ProviderId).PullAttendanceAsync(request, token));
});
app.MapPost("/devices/detect", async (DeviceEndpointRequest request, DeviceDriverRegistry registry, TargetPolicy policy, IOptions<AttendanceConnectorOptions> options, CancellationToken cancellationToken) =>
    await ExecuteAsync(request, policy, options.Value, cancellationToken, token => registry.DetectAsync(request, token)));
app.Run();

static async Task<IResult> ExecuteAsync<T>(DeviceEndpointRequest request, TargetPolicy policy, AttendanceConnectorOptions options, CancellationToken requestAborted, Func<CancellationToken, Task<T>> operation)
{
    try
    {
        policy.Validate(request);
        using var timeout = new CancellationTokenSource(policy.GetTimeout(request, options));
        using var linked = CancellationTokenSource.CreateLinkedTokenSource(requestAborted, timeout.Token);
        return Results.Ok(await operation(linked.Token));
    }
    catch (OperationCanceledException) when (requestAborted.IsCancellationRequested) { return Failure(new ConnectorException("REQUEST_CANCELLED", "The connector request was cancelled.", StatusCodes.Status408RequestTimeout)); }
    catch (OperationCanceledException) { return Failure(new ConnectorException("OPERATION_TIMEOUT", "The connector operation exceeded its configured timeout.", StatusCodes.Status504GatewayTimeout)); }
    catch (ConnectorException exception) { return Failure(exception); }
    catch { return Failure(new ConnectorException("CONNECTOR_OPERATION_FAILED", "The connector operation could not be completed.", StatusCodes.Status502BadGateway)); }
}

static IResult Failure(ConnectorException exception) => Results.Json(new ConnectorFailure(new ConnectorError(exception.Code, exception.Message, exception.ProviderCode)), statusCode: exception.StatusCode);
static bool IsLoopbackBinding(Uri uri) => uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase) || IsLoopback(System.Net.IPAddress.TryParse(uri.Host, out var address) ? address : null);
static bool IsLoopback(System.Net.IPAddress? address) => address is not null && System.Net.IPAddress.IsLoopback(address);
static bool IsAbsoluteHttpOrigin(string origin) => Uri.TryCreate(origin, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps) && !string.IsNullOrWhiteSpace(uri.Host);
static bool FixedTimeEquals(string supplied, string expected) => !string.IsNullOrWhiteSpace(supplied) && CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(supplied), Encoding.UTF8.GetBytes(expected));
static Task WriteFailure(HttpContext context, ConnectorError error, int statusCode)
{
    context.Response.StatusCode = statusCode;
    return context.Response.WriteAsJsonAsync(new ConnectorFailure(error));
}
