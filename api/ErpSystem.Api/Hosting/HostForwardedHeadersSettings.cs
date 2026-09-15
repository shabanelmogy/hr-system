namespace ErpSystem.Api.Hosting;

public sealed class HostForwardedHeadersSettings
{
    public const string SectionName = "ForwardedHeaders";

    public bool Enabled { get; init; }
    public int ForwardLimit { get; init; } = 1;
    public bool RequireHeaderSymmetry { get; init; } = true;
    public List<string> KnownProxies { get; init; } = [];
    public List<string> KnownNetworks { get; init; } = [];
}
