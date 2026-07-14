namespace HrManagementSystem.Shared.Settings
{
    public class FileSettings
    {
        public const int MaxFileSizeInMB = 10;
        public const int MaxFileSizeInBytes = MaxFileSizeInMB * 1024 * 1024;
        public const int MaxFilesPerRequest = 10;
        public static readonly string[] BlockedSignatures = ["4D-5A", "2F-2A", "D0-CF"];
        public static readonly string[] AllowedImagesExtensions = [".jpg", ".jpeg", ".png"];
        public static readonly string[] AllowedContentTypes =
        [
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/webp", "image/svg+xml",
            "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo",
            "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "audio/mpeg", "audio/wav", "audio/ogg",
            "application/zip", "application/x-rar-compressed",
            "text/plain", "text/csv"
        ];
    }
}
