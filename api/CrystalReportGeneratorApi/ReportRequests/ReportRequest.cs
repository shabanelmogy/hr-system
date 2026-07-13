namespace CrystalReportGeneratorApi.ReportRequests
{
    public class ReportRequest
    {
        public string ReportPath { get; set; }
        public string ReportFileName { get; set; }
        public string ExportFilename { get; set; }
        public string LogoName { get; set; }
        public string Lang { get; set; } = "ar";
    }
}