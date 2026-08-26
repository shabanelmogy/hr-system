namespace HrManagementSystem.Application.Features.Attendance.Devices.Contracts;

/// <summary>Metadata allow-list, not proof that an SDK is installed or hardware has been tested.</summary>
public static class AttendanceProviderCatalog
{
    public static readonly IReadOnlyList<ProviderResponse> All = new[]
    {
        new ProviderResponse("zkteco-com", "ZKTeco COM SDK", false, true, true, true, true, true, "SDK availability requires private companion health."),
        new ProviderResponse("hikvision", "Hikvision ISAPI", false, false, false, false, false, false, "Adapter not installed."),
        new ProviderResponse("dahua", "Dahua", false, false, false, false, false, false, "SDK assets only; adapter not installed."),
        new ProviderResponse("suprema", "Suprema", false, false, false, false, false, false, "Vendor SDK/license and adapter required."),
        new ProviderResponse("anviz", "Anviz", false, false, false, false, false, false, "SDK assets only; adapter not installed."),
        new ProviderResponse("zkteco-zkbio", "ZKTeco ZKBio", false, false, false, false, false, false, "Adapter not installed."),
        new ProviderResponse("suprema-biostar", "Suprema BioStar", false, false, false, false, false, false, "Adapter not installed."),
        new ProviderResponse("anviz-cloud", "Anviz Cloud", false, false, false, false, false, false, "Adapter not installed."),
        new ProviderResponse("matrix-cosec", "Matrix COSEC", false, false, false, false, false, false, "Push receiver required; adapter not installed."),
        new ProviderResponse("other", "Other", false, false, false, false, false, false, "Adapter not installed.")
    };
    public static bool IsKnown(string? id) => All.Any(x => string.Equals(x.ProviderId, id, StringComparison.OrdinalIgnoreCase));
}
