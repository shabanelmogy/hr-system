namespace HrManagementSystem.Features.Analytics.Reports.Entities
{
    public class ReportDetail : AuditableEntity
    {
        public int Id { get; set; }
        public string PropertyName { get; set; } = string.Empty;
        public string ColumnName { get; set; } = string.Empty;
        public int ReportMasterId { get; set; }
        public ReportMaster ReportMaster { get; set; } = null!;
    }
}
