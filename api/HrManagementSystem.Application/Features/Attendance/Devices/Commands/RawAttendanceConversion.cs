using System.Security.Cryptography;
using System.Text.Json;
using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;

namespace HrManagementSystem.Application.Features.Attendance.Devices.Commands;

public static class RawAttendanceConversion
{
    public static bool TryUtc(DateTime deviceLocal, TimeZoneInfo zone, out DateTime utc)
    {
        var local = DateTime.SpecifyKind(deviceLocal, DateTimeKind.Unspecified);
        utc = default;
        // No offset is supplied by this SDK. Do not invent an instant for ambiguous/invalid DST records.
        if (zone.IsInvalidTime(local) || zone.IsAmbiguousTime(local)) return false;
        try { utc = TimeZoneInfo.ConvertTimeToUtc(local, zone); return true; }
        catch (ArgumentException) { return false; }
    }
    public static string Key(string providerId, ConnectorPunch punch)
    {
        // Names and configured timezone are mutable metadata, not device event identity.
        var identity = !string.IsNullOrWhiteSpace(punch.ProviderEventId)
            ? JsonSerializer.Serialize(new { providerId, eventId = punch.ProviderEventId })
            : JsonSerializer.Serialize(new
            {
                providerId, punch.ExternalCode,
                local = DateTime.SpecifyKind(punch.OccurredAtDeviceLocal, DateTimeKind.Unspecified).ToString("O", CultureInfo.InvariantCulture),
                punch.VerifyMode, punch.InOutMode, punch.WorkCode
            });
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(identity)));
    }
    public static bool ValidCode(string? code) => !string.IsNullOrWhiteSpace(code) && code.Length <= 128;
    public static string? SafeName(string? name) => name is { Length: > 256 } ? name[..256] : name;
}
