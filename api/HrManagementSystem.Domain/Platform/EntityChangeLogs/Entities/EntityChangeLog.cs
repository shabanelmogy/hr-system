using HrManagementSystem.Domain.Common.Abstractions;

namespace HrManagementSystem.Domain.Platform.EntityChangeLogs.Entities
{
    public class EntityChangeLog : ICompanyScoped
    {
        public string TenantId { get; set; } = string.Empty;
        public int CompanyId { get; set; }
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
