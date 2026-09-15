using System.Net;
using Microsoft.AspNetCore.HttpOverrides;
using BclIPNetwork = System.Net.IPNetwork;

namespace ErpSystem.Api.Hosting;

public static class HostForwardedHeadersServiceCollectionExtensions
{
    private const string UnsafeGlobalEnableSetting = "ASPNETCORE_FORWARDEDHEADERS_ENABLED";

    public static IServiceCollection AddHostForwardedHeaders(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        if (string.Equals(
                configuration[UnsafeGlobalEnableSetting],
                "true",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                $"{UnsafeGlobalEnableSetting} must not enable unbounded proxy trust; use ForwardedHeaders settings.");
        }

        var section = configuration.GetSection(HostForwardedHeadersSettings.SectionName);
        var settings = section.Get<HostForwardedHeadersSettings>() ??
            new HostForwardedHeadersSettings();

        services.AddOptions<HostForwardedHeadersSettings>()
            .Bind(section)
            .Validate(IsValid, "ForwardedHeaders settings are invalid.")
            .ValidateOnStart();

        if (!settings.Enabled)
            return services;

        if (!IsValid(settings))
            throw new InvalidOperationException("ForwardedHeaders settings are invalid.");

        var knownProxies = (settings.KnownProxies ?? [])
            .Select(value => IPAddress.Parse(value.Trim()))
            .Distinct()
            .ToArray();
        var knownNetworks = (settings.KnownNetworks ?? [])
            .Select(value => BclIPNetwork.Parse(value.Trim()))
            .Distinct()
            .ToArray();

        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardedHeaders =
                ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            options.ForwardLimit = settings.ForwardLimit;
            options.RequireHeaderSymmetry = settings.RequireHeaderSymmetry;

            options.KnownProxies.Clear();
            options.KnownIPNetworks.Clear();
            foreach (var proxy in knownProxies)
                options.KnownProxies.Add(proxy);
            foreach (var network in knownNetworks)
                options.KnownIPNetworks.Add(network);
        });

        return services;
    }

    public static bool IsForwardingEnabled(IConfiguration configuration) =>
        configuration.GetValue<bool>($"{HostForwardedHeadersSettings.SectionName}:Enabled");

    private static bool IsValid(HostForwardedHeadersSettings settings)
    {
        if (!settings.Enabled)
            return true;

        if (settings.ForwardLimit is < 1 or > 5)
            return false;

        var proxies = settings.KnownProxies ?? [];
        var networks = settings.KnownNetworks ?? [];
        if (proxies.Count == 0 && networks.Count == 0)
            return false;

        if (proxies.Any(value =>
                string.IsNullOrWhiteSpace(value) ||
                !IPAddress.TryParse(value.Trim(), out _)))
        {
            return false;
        }

        foreach (var value in networks)
        {
            if (string.IsNullOrWhiteSpace(value) ||
                !BclIPNetwork.TryParse(value.Trim(), out var network) ||
                network.PrefixLength == 0)
            {
                return false;
            }
        }

        return true;
    }
}
