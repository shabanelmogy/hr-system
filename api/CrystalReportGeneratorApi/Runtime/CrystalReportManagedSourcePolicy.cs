using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using System;

namespace CrystalReportGeneratorApi.Runtime
{
    internal static class CrystalReportManagedSourcePolicy
    {
        private const string ManagedDatabaseType = "ADO.NET (XML)";
        private const string ManagedDatabaseDll = "crdb_adoplus.dll";

        public static string GetRejectionReason(ReportDocument report)
        {
            if (report == null)
                throw new ArgumentNullException(nameof(report));

            if (report.Subreports.Count != 0)
                return "Crystal Report subreports are not supported by the managed runtime.";

            if (report.HasSavedData)
                return "Crystal Report files containing saved data are not accepted.";

            if (report.Database == null || report.Database.Tables.Count == 0)
                return "Crystal Report files must use the approved pushed-data source.";

            foreach (Table table in report.Database.Tables)
            {
                try
                {
                    var connection = table.LogOnInfo == null ? null : table.LogOnInfo.ConnectionInfo;
                    if (connection == null)
                        return "Crystal Report files must use the approved pushed-data source.";

                    if (!string.IsNullOrWhiteSpace(connection.ServerName) ||
                        !string.IsNullOrWhiteSpace(connection.DatabaseName) ||
                        !string.IsNullOrWhiteSpace(connection.UserID) ||
                        !string.IsNullOrWhiteSpace(connection.Password) ||
                        connection.IntegratedSecurity)
                        return "Crystal Report files containing database connection metadata are not accepted.";

                    var attributes = connection.Attributes == null
                        ? null
                        : connection.Attributes.Collection;
                    var databaseType = GetAttribute(attributes, "QE_DatabaseType");
                    var databaseDll = GetAttribute(attributes, "Database DLL");
                    if (!string.Equals(databaseType, ManagedDatabaseType, StringComparison.OrdinalIgnoreCase) ||
                        !string.Equals(databaseDll, ManagedDatabaseDll, StringComparison.OrdinalIgnoreCase))
                        return "Crystal Report files must use the approved ADO.NET pushed-data source.";
                }
                catch
                {
                    return "Crystal Report datasource metadata could not be verified safely.";
                }
            }

            return null;
        }

        private static string GetAttribute(NameValuePairs2 attributes, string name)
        {
            if (attributes == null)
                return null;

            object value;
            try
            {
                value = attributes.Lookup(name);
            }
            catch
            {
                return null;
            }

            var pair = value as NameValuePair2;
            if (pair != null)
                value = pair.Value;
            return value == null ? null : Convert.ToString(value)?.Trim();
        }
    }
}
