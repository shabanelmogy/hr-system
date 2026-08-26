using HrManagementSystem.AttendanceConnector.Models;

namespace HrManagementSystem.AttendanceConnector.Services;

/// <summary>Fixed provider allow-list. Request data can select, but never load, a driver.</summary>
public sealed class DeviceDriverRegistry
{
    private static readonly ProviderInfo[] Catalog =
    [
        new("zkteco-com", "ZKTeco COM SDK", false, false, true, true, true, true, null),
        new("hikvision", "Hikvision ISAPI", false, false, false, false, false, false, "No production adapter is installed."),
        new("dahua", "Dahua", false, false, false, false, false, false, "SDK assets are not an implemented adapter."),
        new("suprema", "Suprema Device SDK", false, false, false, false, false, false, "Vendor adapter and license are unavailable."),
        new("anviz", "Anviz", false, false, false, false, false, false, "SDK assets are not an implemented adapter."),
        new("zkteco-zkbio", "ZKTeco ZKBio", false, false, false, false, false, false, "No production adapter is installed."),
        new("suprema-biostar", "Suprema BioStar", false, false, false, false, false, false, "No production adapter is installed."),
        new("anviz-cloud", "Anviz Cloud", false, false, false, false, false, false, "No production adapter is installed."),
        new("matrix-cosec", "Matrix COSEC", false, false, false, false, false, false, "Push receiver is not implemented."),
        new("other", "Other", false, false, false, false, false, false, "No production adapter is installed.")
    ];

    private readonly IReadOnlyDictionary<string, IDeviceDriver> _drivers;
    private readonly ZkComDeviceDriver _zkteco;

    public DeviceDriverRegistry(ZkComDeviceDriver zkteco)
    {
        _zkteco = zkteco;
        _drivers = new IDeviceDriver[] { zkteco }.ToDictionary(driver => driver.ProviderId, StringComparer.OrdinalIgnoreCase);
    }

    public IReadOnlyList<ProviderInfo> GetProviders()
    {
        var zktecoInfo = _zkteco.GetInfo();
        return Catalog.Select(provider => provider.ProviderId == zktecoInfo.ProviderId ? zktecoInfo : provider).ToArray();
    }

    public IDeviceDriver GetRequired(string providerId)
    {
        if (_drivers.TryGetValue(providerId.Trim(), out var driver)) return driver;
        if (Catalog.Any(provider => string.Equals(provider.ProviderId, providerId.Trim(), StringComparison.OrdinalIgnoreCase)))
            throw new ConnectorException("PROVIDER_UNAVAILABLE", "The selected provider has no available production adapter.", StatusCodes.Status503ServiceUnavailable);
        throw new ConnectorException("PROVIDER_NOT_FOUND", "The selected provider is not registered by this connector.", StatusCodes.Status404NotFound);
    }

    public async Task<DetectResult> DetectAsync(DeviceEndpointRequest request, CancellationToken cancellationToken)
    {
        var info = _zkteco.GetInfo();
        if (!info.Available) return new DetectResult(false, null, 0, "No installed provider can probe this device.");
        try
        {
            var result = await _zkteco.TestConnectionAsync(request with { ProviderId = _zkteco.ProviderId }, cancellationToken);
            return result.Connected
                ? new DetectResult(true, _zkteco.ProviderId, 100, "A registered provider matched the submitted device address.")
                : new DetectResult(false, null, 0, "No installed provider matched the submitted device address.");
        }
        catch (ConnectorException)
        {
            return new DetectResult(false, null, 0, "No installed provider matched the submitted device address.");
        }
    }
}
