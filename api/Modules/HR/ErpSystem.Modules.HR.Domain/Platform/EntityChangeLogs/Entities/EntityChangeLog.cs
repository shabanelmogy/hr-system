using ErpSystem.Modules.HR.Domain.Common.Abstractions;

namespace ErpSystem.Modules.HR.Domain.Platform.EntityChangeLogs.Entities
{
    public class EntityChangeLog : ICompanyScoped
    {
        public string TenantId { get; set; } = string.Empty;
        public int CompanyId { get; set; }
        public int Id { get; set; }
        public int EntityId { get; set; }
        public string? EntityKey { get; set; }
        public string? EntityName { get; set; }
        public string? JsonOldValues { get; set; }
        public string? JsonNewValues { get; set; }
        public string ChangedById { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; }
        public string ChangedByPc { get; set; } = string.Empty;
    }
}
