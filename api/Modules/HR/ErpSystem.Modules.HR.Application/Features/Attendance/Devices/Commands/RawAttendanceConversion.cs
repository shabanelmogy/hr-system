using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Contracts;

namespace ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Commands;

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
    public static bool ValidCode(string? code) => !string.IsNullOrWhiteSpace(code) && code.Length <= 128;
    public static string? SafeName(string? name) => name is { Length: > 256 } ? name[..256] : name;
}
