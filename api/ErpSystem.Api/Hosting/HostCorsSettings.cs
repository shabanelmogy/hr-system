namespace ErpSystem.Api.Hosting;

public sealed class HostCorsSettings
{
    public const string SectionName = "CorsSettings";

    public List<string> AllowedOrigins { get; set; } = [];
}
