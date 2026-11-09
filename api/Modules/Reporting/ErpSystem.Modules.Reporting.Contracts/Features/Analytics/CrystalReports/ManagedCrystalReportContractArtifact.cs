using System.Reflection;

namespace ErpSystem.Modules.Reporting.Contracts.Features.Analytics.CrystalReports;

public static class ManagedCrystalReportContractArtifact
{
    public const string ResourceName =
        "ErpSystem.Modules.Reporting.Contracts.ManagedCrystalReportContracts.v1.json";

    public static Stream OpenRead()
    {
        var stream = typeof(ManagedCrystalReportContractArtifact)
            .Assembly
            .GetManifestResourceStream(ResourceName);

        return stream ?? throw new InvalidOperationException(
            $"Embedded managed Crystal report contract '{ResourceName}' is missing.");
    }

    public static byte[] ReadAllBytes()
    {
        using var stream = OpenRead();
        using var buffer = new MemoryStream();
        stream.CopyTo(buffer);
        return buffer.ToArray();
    }

    public static IEnumerable<byte[]> ReadLegacyArtifacts()
    {
        var assembly = typeof(ManagedCrystalReportContractArtifact).Assembly;
        foreach (var name in assembly.GetManifestResourceNames()
            .Where(name => name.StartsWith("ErpSystem.Modules.Reporting.Contracts.Compatibility.", StringComparison.Ordinal))
            .Order(StringComparer.Ordinal))
        {
            using var resource = assembly.GetManifestResourceStream(name)
                ?? throw new InvalidOperationException("A packaged legacy report contract is missing.");
            using var buffer = new MemoryStream();
            resource.CopyTo(buffer);
            yield return buffer.ToArray();
        }
    }
}
