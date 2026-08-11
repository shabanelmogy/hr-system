namespace HrManagementSystem.Infrastructure.Common.Settings;

public sealed class CorsSettings
{
    public const string SectionName = "CorsSettings";

    public List<string> AllowedOrigins { get; set; } = [];
}
