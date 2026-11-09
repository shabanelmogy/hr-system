using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace ErpSystem.Modules.Reporting.Contracts.Features.Analytics.CrystalReports
{
    /// <summary>Versioned, length-framed UTF8 fields shared with the isolated .NET Framework runtime.</summary>
    public static class EntityContractFingerprint
    {
        public static string Compute(int schemaVersion, IEnumerable<string> definition)
        {
            if (definition == null) throw new ArgumentNullException(nameof(definition));
            using (var buffer = new MemoryStream())
            {
                using (var writer = new BinaryWriter(buffer, new UTF8Encoding(false, true), true))
                {
                    writer.Write("erp.managed-crystal.entity.v1");
                    writer.Write(schemaVersion);
                    foreach (var field in definition)
                        writer.Write(field ?? throw new ArgumentException("Definition fields cannot be null.", nameof(definition)));
                }
                using (var algorithm = SHA256.Create())
                {
                    var hash = algorithm.ComputeHash(buffer.ToArray());
                    var result = new StringBuilder(hash.Length * 2);
                    foreach (var value in hash) result.Append(value.ToString("x2", CultureInfo.InvariantCulture));
                    return result.ToString();
                }
            }
        }
    }
}
