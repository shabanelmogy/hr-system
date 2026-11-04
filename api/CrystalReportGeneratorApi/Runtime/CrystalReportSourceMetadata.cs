namespace CrystalReportGeneratorApi.Runtime
{
    internal sealed class CrystalReportSourceMetadata
    {
        public int TableCount { get; set; }
        public int SubreportCount { get; set; }
        public int SqlExpressionCount { get; set; }
    }

    internal static class CrystalReportPushedDataPolicy
    {
        public static string GetRejectionReason(CrystalReportSourceMetadata metadata)
        {
            if (metadata.SubreportCount != 0)
                return "Crystal Report subreports are not supported by the managed runtime.";
            if (metadata.TableCount != 1)
                return "Crystal Report files must contain exactly one table or Command for API-supplied data.";
            if (metadata.SqlExpressionCount != 0)
                return "Crystal Report SQL-expression fields are not supported with API-supplied data.";
            return null;
        }
    }
}
