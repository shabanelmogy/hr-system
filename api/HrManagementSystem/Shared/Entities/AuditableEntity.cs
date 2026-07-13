namespace HrManagementSystem.Shared.Entities;

public class AuditableEntity
{
    public string CreatedById { get; set; } = string.Empty;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public string CreatedByPc { get; set; } = string.Empty;
    public string? UpdatedById { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public string? UpdatedByPc { get; set; }
    public string? DeletedById { get; set; }
    public DateTime? DeletedOn { get; set; }
    public string? DeletedByPc { get; set; }
    public bool IsDeleted { get; set; }
    public ApplicationUser CreatedBy { get; set; } = default!;
    public ApplicationUser? UpdatedBy { get; set; }
    public ApplicationUser? DeletedBy { get; set; }
}
