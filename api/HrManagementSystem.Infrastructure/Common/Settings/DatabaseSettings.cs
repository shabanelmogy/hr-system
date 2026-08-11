namespace HrManagementSystem.Infrastructure.Common.Settings;

public sealed class DatabaseSettings
{
    public const string SectionName = "DatabaseSettings";

    public bool ApplyMigrationsOnStartup { get; set; }
    public bool SeedOnStartup { get; set; }
}
