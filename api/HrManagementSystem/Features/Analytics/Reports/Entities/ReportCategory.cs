namespace HrManagementSystem.Features.Analytics.Reports.Entities
{
    public class ReportCategory : AuditableEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public ICollection<ReportMaster>? ReportMasters { get; set; }
    }
}
