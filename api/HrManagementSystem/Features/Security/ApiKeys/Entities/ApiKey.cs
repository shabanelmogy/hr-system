namespace HrManagementSystem.Features.Security.ApiKeys.Entities
{
    public class ApiKey
    {
        public int Id { get; set; }
        public string Key { get; set; } = null!;
        public string ClientUri { get; set; } = null!;
        public string Description { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
}
