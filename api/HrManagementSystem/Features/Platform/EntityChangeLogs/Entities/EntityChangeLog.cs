namespace HrManagementSystem.Features.Platform.EntityChangeLogs.Entities
{
    public class EntityChangeLog
    {
        public int Id { get; set; }
        public int EntityId { get; set; }
        public string? EntityName { get; set; }
        public string? JsonOldValues { get; set; }
        public string? JsonNewValues { get; set; }
        public string ChangedById { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
        public string ChangedByPc { get; set; } = string.Empty;
    }
}
