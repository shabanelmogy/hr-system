namespace HrManagementSystem.Features.Analytics.Reports.Entities
{
    public class ReportMaster : AuditableEntity
    {
        public int Id { get; set; }
        public string ReportName { get; set; } = null!;
        public string ExportedName { get; set; } = null!;
        public string ReportPath { get; set; } = null!;
        public string Logo { get; set; } = string.Empty;
        public string ViewName { get; set; } = null!;
        public int ReportCategoryId { get; set; }
        public ReportCategory? ReportCategory { get; set; }
        public ICollection<ReportDetail>? ReportDetails { get; set; }
    }
}
