using System;
using System.IO;

namespace CrystalReportGeneratorApi.Runtime.Rendering
{
    public static class ManagedCrystalReportContractArtifact
    {
        public const string ResourceName =
            "CrystalReportGeneratorApi.ManagedCrystalReportContracts.v1.json";

        public static Stream OpenRead()
        {
            var stream = typeof(ManagedCrystalReportContractArtifact)
                .Assembly
                .GetManifestResourceStream(ResourceName);
            if (stream == null)
            {
                throw new InvalidOperationException(
                    "The embedded managed Crystal report contract is missing.");
            }

            return stream;
        }

        public static byte[] ReadAllBytes()
        {
            using (var stream = OpenRead())
            using (var buffer = new MemoryStream())
            {
                stream.CopyTo(buffer);
                return buffer.ToArray();
            }
        }
    }
}
