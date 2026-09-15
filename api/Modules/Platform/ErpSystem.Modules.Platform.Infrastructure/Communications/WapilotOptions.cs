namespace ErpSystem.Modules.Platform.Infrastructure.Communications;

public sealed class WapilotOptions
{
    public const string SectionName = "WhatsApp:Wapilot";

    public bool Enabled { get; set; }
    public string BaseUrl { get; set; } = "https://api.wapilot.net/api";
    public string Token { get; set; } = string.Empty;
    public string InstanceId { get; set; } = string.Empty;
    public string DefaultCountryCallingCode { get; set; } = "20";
    public int TimeoutSeconds { get; set; } = 15;

    public bool IsValid() =>
        !Enabled ||
        (Uri.TryCreate(BaseUrl, UriKind.Absolute, out var uri) &&
         uri.Scheme == Uri.UriSchemeHttps &&
         !string.IsNullOrWhiteSpace(Token) &&
         !string.IsNullOrWhiteSpace(DefaultCountryCallingCode) &&
         DefaultCountryCallingCode.Length is >= 1 and <= 3 &&
         DefaultCountryCallingCode[0] != '0' &&
         DefaultCountryCallingCode.All(char.IsAsciiDigit) &&
         TimeoutSeconds is >= 1 and <= 120);
}
