using System.Net.Http.Json;
using System.Text.Json;
using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;

namespace HrManagementSystem.Infrastructure.Features.Attendance.Devices.Services;

/// <summary>Bounded private transport. Secrets remain in memory and never appear in URLs or logs.</summary>
public sealed class AttendanceConnectorClient(HttpClient httpClient, IConfiguration configuration)
    : IAttendanceConnectorClient
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static ConnectorFailure Unavailable() =>
        new("CONNECTOR_UNAVAILABLE", "The private device connector could not complete this operation.");

    public async Task<ConnectorHealthResponse> GetHealthAsync(CancellationToken ct)
    {
        var response = await SendAsync<HealthWire>(HttpMethod.Get, "health", null, ct);
        return response is null
            ? new ConnectorHealthResponse("unavailable", false, "x86", AttendanceProviderCatalog.All)
            : new ConnectorHealthResponse(response.Status, response.SdkAvailable, response.Architecture,
                response.Providers ?? AttendanceProviderCatalog.All);
    }

    public async Task<DetectDeviceResponse> DetectAsync(DetectDeviceRequest request, CancellationToken ct) =>
        await SendAsync<DetectDeviceResponse>(HttpMethod.Post, "devices/detect", request, ct)
        ?? new DetectDeviceResponse(false, null, 0, "The private connector is unavailable or no provider matched.");

    public async Task<ConnectorTestResult> TestAsync(ConnectorEndpoint endpoint, CancellationToken ct)
    {
        var response = await SendAsync<TestWire>(HttpMethod.Post, "devices/test", endpoint, ct);
        return response is null
            ? new ConnectorTestResult(false, null, null, null, null, await ReadFailureAsync(ct) ?? Unavailable())
            : new ConnectorTestResult(response.Connected, response.Device?.SerialNumber, response.Device?.FirmwareVersion,
                response.Device?.Platform, response.Device?.SdkVersion, response.Error);
    }

    public async Task<ConnectorUsersResult> PullUsersAsync(ConnectorEndpoint endpoint, CancellationToken ct)
    {
        var response = await SendAsync<ConnectorUsersResult>(HttpMethod.Post, "devices/pull-users", endpoint, ct);
        return response ?? new ConnectorUsersResult(0, 0, [], await ReadFailureAsync(ct) ?? Unavailable());
    }

    public async Task<ConnectorPunchesResult> PullAttendanceAsync(ConnectorAttendanceEndpoint endpoint, CancellationToken ct)
    {
        var response = await SendAsync<ConnectorPunchesResult>(HttpMethod.Post, "devices/pull-attendance", endpoint, ct);
        return response ?? new ConnectorPunchesResult(0, 0, [], await ReadFailureAsync(ct) ?? Unavailable());
    }

    private ConnectorFailure? _lastFailure;
    private async Task<T?> SendAsync<T>(HttpMethod method, string path, object? payload, CancellationToken ct)
    {
        _lastFailure = null;
        if (httpClient.BaseAddress is not { } address || address.Scheme is not ("http" or "https")) return default;
        var key = configuration["AttendanceConnector:InternalApiKey"];
        if (!address.IsLoopback && (address.Scheme != "https" || string.IsNullOrWhiteSpace(key))) return default;
        try
        {
            using var message = new HttpRequestMessage(method, path);
            if (payload is not null) message.Content = JsonContent.Create(payload);
            if (!string.IsNullOrWhiteSpace(key)) message.Headers.TryAddWithoutValidation("X-Attendance-Connector-Key", key);
            using var response = await httpClient.SendAsync(message, HttpCompletionOption.ResponseContentRead, ct);
            if (!response.IsSuccessStatusCode)
            {
                _lastFailure = await response.Content.ReadFromJsonAsync<FailureWire>(Json, ct) is { Error: { } error }
                    ? error : Unavailable();
                return default;
            }
            return await response.Content.ReadFromJsonAsync<T>(Json, ct);
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested) { _lastFailure = new("CONNECTOR_TIMEOUT", "The private device connector timed out."); return default; }
        catch (HttpRequestException) { _lastFailure = Unavailable(); return default; }
        catch (JsonException) { _lastFailure = new("CONNECTOR_PROTOCOL_ERROR", "The private device connector returned an invalid response."); return default; }
        catch (NotSupportedException) { _lastFailure = new("CONNECTOR_PROTOCOL_ERROR", "The private device connector returned an unsupported response."); return default; }
    }
    private Task<ConnectorFailure?> ReadFailureAsync(CancellationToken _) => Task.FromResult(_lastFailure);

    private sealed record FailureWire(ConnectorFailure? Error);
    private sealed record DeviceWire(string? SerialNumber, string? FirmwareVersion, string? Platform, string? SdkVersion);
    private sealed record TestWire(bool Connected, DeviceWire? Device, ConnectorFailure? Error);
    private sealed record HealthWire(string Status, bool SdkAvailable, string Architecture, IReadOnlyList<ProviderResponse>? Providers);
}
