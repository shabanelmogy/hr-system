namespace HrManagementSystem.Features.Platform.EntityChangeLogs.Contracts
{
    public class EntityChangeLogsRequest
    {
        public int EntityId { get; set; }
        public string? EntityName { get; set; }
        public string? JsonOldValues { get; set; }
        public string? JsonNewValues { get; set; }
        public string ChangedById { get; set; } = string.Empty;
        public string ChangedByPc { get; set; } = string.Empty;
    }
}
