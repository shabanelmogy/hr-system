using System.Net;
using System.Text.Json;
using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;
using Microsoft.AspNetCore.DataProtection;

namespace HrManagementSystem.Infrastructure.Features.Attendance.Devices.Services;

public sealed class AttendanceDeviceCredentialProtector(IDataProtectionProvider provider) : IAttendanceCredentialProtector
{
    private readonly IDataProtector _protector = provider.CreateProtector("HrManagementSystem.AttendanceDevices.Credentials.v1");
    public string Protect(UpdateDeviceCredentialsRequest request) => _protector.Protect(JsonSerializer.Serialize(request));
    public UpdateDeviceCredentialsRequest Unprotect(string protectedPayload) =>
        JsonSerializer.Deserialize<UpdateDeviceCredentialsRequest>(_protector.Unprotect(protectedPayload))
        ?? throw new System.Security.Cryptography.CryptographicException("Invalid protected device credential.");
}

/// <summary>Explicit numeric target + CIDR + port allow-list. DNS names and local/metadata endpoints fail closed.</summary>
public sealed class AttendanceNetworkPolicy(IConfiguration configuration) : IAttendanceNetworkPolicy
{
    public bool IsAllowed(string host, int port)
    {
        if (!IPAddress.TryParse(host?.Trim(), out var ip)) return false;
        if (ip.IsIPv4MappedToIPv6) ip = ip.MapToIPv4();
        if (IPAddress.IsLoopback(ip) || ip.Equals(IPAddress.Any) || ip.Equals(IPAddress.IPv6Any) || ip.IsIPv6LinkLocal)
            return false;
        var bytes = ip.GetAddressBytes();
        if (bytes.Length == 4 && (bytes[0] is 0 or >= 224 || bytes[0] == 169 && bytes[1] == 254))
            return false;
        var ports = configuration.GetSection("AttendanceConnector:AllowedPorts").Get<int[]>() ?? [4370];
        if (!ports.Contains(port)) return false;
        var networks = configuration.GetSection("AttendanceConnector:AllowedNetworks").Get<string[]>() ?? [];
        return networks.Any(value => IPNetwork.TryParse(value, out var network) && network.Contains(ip));
    }
}
