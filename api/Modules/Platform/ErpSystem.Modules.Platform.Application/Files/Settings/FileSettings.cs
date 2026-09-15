namespace ErpSystem.Modules.Platform.Application.Files.Settings
{
    public class FileSettings
    {
        public const int MaxFileSizeInMB = 50;
        public const int MaxFileSizeInBytes = MaxFileSizeInMB * 1024 * 1024;
        public const int MaxImageFileSizeInMB = 10;
        public const int MaxFilesPerRequest = 10;
        public const long MaxUploadRequestSizeInBytes =
            (long)MaxFileSizeInBytes * MaxFilesPerRequest + (1024 * 1024);
        // OLE compound files (D0-CF) are valid legacy .doc/.xls payloads and
        // are verified by the Platform content inspector. Keep this list only
        // for signatures that are never accepted by the upload policy.
        public static readonly string[] BlockedSignatures = ["4D-5A", "2F-2A"];
        public static readonly string[] AllowedImagesExtensions = [".jpg", ".jpeg", ".png"];
        public static readonly string[] AllowedContentTypes =
        [
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/x-ms-bmp", "image/webp",
            "video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/avi",
            "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg", "application/ogg",
            "application/zip", "application/x-zip-compressed",
            "application/x-rar-compressed", "application/vnd.rar", "application/x-rar",
            "text/plain", "text/csv", "application/csv"
        ];
    }
}
