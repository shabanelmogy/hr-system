namespace ErpSystem.Modules.Platform.Infrastructure.Hangfire;

public sealed class PlatformHangfireSettings
{
    public const string SectionName = "HangfireSettings";
    public const string DashboardPath = "/hangfire";

    public List<string> AllowedHosts { get; set; } = [];
}
