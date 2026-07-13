namespace HrManagementSystem.Infrastructure.Security.Authentication;

public sealed class JwtOptions
{
    [Required, MinLength(32)]
    public string Key { get; set; } = string.Empty;

    [Required]
    public string Issuer { get; set; } = string.Empty;

    [Required]
    public string Audience { get; set; } = string.Empty;

    [Range(1, 60)]
    public int ExpireInMinutes { get; set; } = 10;

    [Range(1, 5)]
    public int RealtimeExpireInMinutes { get; set; } = 2;

    public string RealtimeAudience => $"{Audience}:realtime";
}
