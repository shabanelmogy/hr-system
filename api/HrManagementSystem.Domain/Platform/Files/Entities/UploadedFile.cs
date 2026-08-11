namespace HrManagementSystem.Domain.Platform.Files.Entities
{
    public sealed class UploadedFile : CompanyAuditableEntity
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public string FileName { get; set; } = string.Empty;
        public string StoredFileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public string FileExtension { get; set; } = string.Empty;
    }
}
