namespace HrManagementSystem.Infrastructure.Common.Settings;

public class HangfireSettings
{
    public const string SectionName = "HangfireSettings";

    public List<string> AllowedHosts { get; set; } = new();
}
