using HrManagementSystem.Application.Features.Attendance.Devices.Commands;
using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;

namespace HrManagementSystem.Tests;

public sealed class AttendanceDeviceRawDataTests
{
    [Fact]
    public void IdempotencyKey_IsStableForSameRawEvent_AndChangesForDistinctRawEvent()
    {
        var punch = new ConnectorPunch("E-1", "Raw Name", new DateTime(2026, 8, 26, 8, 30, 0),
            VerifyMode: 1, InOutMode: 0, WorkCode: 4, ProviderEventId: null);
        var same = punch with { Name = "Changed display name" };
        var different = punch with { WorkCode = 5 };

        Assert.Equal(RawAttendanceConversion.Key("zkteco-com", punch), RawAttendanceConversion.Key("zkteco-com", same));
        Assert.NotEqual(RawAttendanceConversion.Key("zkteco-com", punch), RawAttendanceConversion.Key("zkteco-com", different));
    }

    [Fact]
    public void UtcConversion_PreservesUnspecifiedOriginal_AndRejectsInvalidDstLocalTime()
    {
        var zone = TimeZoneInfo.FindSystemTimeZoneById("America/New_York");
        var normal = new DateTime(2026, 1, 15, 9, 0, 0, DateTimeKind.Local);
        var invalid = new DateTime(2026, 3, 8, 2, 30, 0, DateTimeKind.Unspecified);

        Assert.True(RawAttendanceConversion.TryUtc(normal, zone, out var utc));
        Assert.Equal(DateTimeKind.Utc, utc.Kind);
        Assert.False(RawAttendanceConversion.TryUtc(invalid, zone, out _));
    }

    [Theory]
    [InlineData("zkteco-com", true)]
    [InlineData("hikvision", true)]
    [InlineData("unknown-provider", false)]
    [InlineData("", false)]
    public void ProviderRegistryMetadata_RejectsUnknownProvider(string provider, bool expected) =>
        Assert.Equal(expected, AttendanceProviderCatalog.IsKnown(provider));

    [Fact]
    public void RawPunch_ContainsNoAttendanceInterpretationFields()
    {
        var fields = typeof(HrManagementSystem.Domain.Attendance.Devices.Entities.RawAttendancePunch)
            .GetProperties().Select(x => x.Name).ToArray();

        Assert.DoesNotContain("FirstIn", fields);
        Assert.DoesNotContain("LastOut", fields);
        Assert.DoesNotContain("WorkedHours", fields);
        Assert.Contains("OccurredAtDeviceLocal", fields);
        Assert.Contains("OccurredAtUtc", fields);
        Assert.Contains("VerifyMode", fields);
        Assert.Contains("InOutMode", fields);
        Assert.Contains("WorkCode", fields);
    }
}
