using System.Net;
using System.Net.Sockets;
using HrManagementSystem.AttendanceConnector.Models;
using Microsoft.Extensions.Options;

namespace HrManagementSystem.AttendanceConnector.Services;

public sealed class AttendanceConnectorOptions
{
    public const string SectionName = "AttendanceConnector";
    public string[] AllowedNetworks { get; init; } = [];
    public int[] AllowedPorts { get; init; } = [4370];
    public int MaxRecords { get; init; } = 20_000;
    public int DefaultTimeoutSeconds { get; init; } = 30;
    public int MaximumTimeoutSeconds { get; init; } = 120;
    public string? InternalApiKey { get; init; }
    public string[] CorsOrigins { get; init; } = [];
}

public sealed class TargetPolicy
{
    private readonly IReadOnlyList<IpNetwork> _networks;
    private readonly HashSet<int> _ports;

    public TargetPolicy(IOptions<AttendanceConnectorOptions> options)
    {
        var value = options.Value;
        if (value.MaxRecords is < 1 or > 100_000)
            throw new InvalidOperationException("AttendanceConnector:MaxRecords must be between 1 and 100000.");
        if (value.DefaultTimeoutSeconds is < 1 or > 120 || value.MaximumTimeoutSeconds is < 1 or > 300 || value.DefaultTimeoutSeconds > value.MaximumTimeoutSeconds)
            throw new InvalidOperationException("Attendance connector timeout configuration is invalid.");
        if (value.AllowedPorts is null || value.AllowedPorts.Length == 0 || value.AllowedPorts.Any(port => port is < 1 or > 65535))
            throw new InvalidOperationException("AttendanceConnector:AllowedPorts must contain valid TCP ports.");

        _ports = value.AllowedPorts.ToHashSet();
        _networks = (value.AllowedNetworks ?? [])
            .Where(network => !string.IsNullOrWhiteSpace(network))
            .Select(IpNetwork.Parse)
            .ToArray();
    }

    public void Validate(DeviceEndpointRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ProviderId) || request.ProviderId.Length > 80)
            throw new ConnectorException("INVALID_REQUEST", "A registered provider identifier is required.", StatusCodes.Status400BadRequest);
        if (request.Port is < 1 or > 65535 || !_ports.Contains(request.Port))
            throw new ConnectorException("TARGET_PORT_NOT_ALLOWED", "The device port is not allowed by connector policy.", StatusCodes.Status400BadRequest);
        if (!IPAddress.TryParse(request.Host?.Trim(), out var address) || address.AddressFamily is not (AddressFamily.InterNetwork or AddressFamily.InterNetworkV6))
            throw new ConnectorException("INVALID_TARGET", "The device host must be a numeric IPv4 or IPv6 address.", StatusCodes.Status400BadRequest);
        if (_networks.Count == 0 || !_networks.Any(network => network.Contains(address)))
            throw new ConnectorException("TARGET_NOT_ALLOWED", "The device address is not allowed by connector policy.", StatusCodes.Status403Forbidden);
        if (request.TimeoutSeconds is not null && (request.TimeoutSeconds < 1 || request.TimeoutSeconds > 300))
            throw new ConnectorException("INVALID_REQUEST", "The requested timeout is outside the allowed range.", StatusCodes.Status400BadRequest);
        if (request.CommKey is not null && (!int.TryParse(request.CommKey, out var commKey) || commKey < 0))
            throw new ConnectorException("INVALID_REQUEST", "The communication key format is invalid.", StatusCodes.Status400BadRequest);
    }

    public TimeSpan GetTimeout(DeviceEndpointRequest request, AttendanceConnectorOptions options)
    {
        var seconds = request.TimeoutSeconds ?? options.DefaultTimeoutSeconds;
        return TimeSpan.FromSeconds(Math.Min(seconds, options.MaximumTimeoutSeconds));
    }
}

internal sealed class IpNetwork
{
    private IpNetwork(IPAddress address, int prefixLength) { Address = address; PrefixLength = prefixLength; }
    private IPAddress Address { get; }
    private int PrefixLength { get; }

    public static IpNetwork Parse(string value)
    {
        var parts = value.Split('/', StringSplitOptions.TrimEntries);
        if (parts.Length != 2 || !IPAddress.TryParse(parts[0], out var address) || !int.TryParse(parts[1], out var prefix))
            throw new InvalidOperationException("AttendanceConnector:AllowedNetworks contains an invalid CIDR.");
        var maxPrefix = address.AddressFamily == AddressFamily.InterNetwork ? 32 : 128;
        if (prefix < 0 || prefix > maxPrefix)
            throw new InvalidOperationException("AttendanceConnector:AllowedNetworks contains an invalid CIDR prefix.");
        return new IpNetwork(address, prefix);
    }

    public bool Contains(IPAddress candidate)
    {
        if (candidate.AddressFamily != Address.AddressFamily) return false;
        var addressBytes = Address.GetAddressBytes();
        var candidateBytes = candidate.GetAddressBytes();
        var remaining = PrefixLength;
        for (var index = 0; index < addressBytes.Length && remaining > 0; index++)
        {
            var bits = Math.Min(8, remaining);
            var mask = (byte)(0xFF << (8 - bits));
            if ((addressBytes[index] & mask) != (candidateBytes[index] & mask)) return false;
            remaining -= bits;
        }
        return true;
    }
}
