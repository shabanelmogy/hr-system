namespace HrManagementSystem.Features.Platform.Files.Errors
{
    public class FileErrors(IStringLocalizer<FileErrors> localizer, IConfiguration configuration)
    {
        private readonly IStringLocalizer<FileErrors> _localizer = localizer;
        private readonly IConfiguration _configuration = configuration;

        public Error InvalidFileSize()
        {
            var maxSizeForUploadFile = _configuration.GetSection("FileSettings:MaxFileSizeInMB").Get<string>();
            var message = string.Format(_localizer[nameof(InvalidFileSize)], maxSizeForUploadFile);

            return new Error("Files.InvalidFileSize", message, StatusCodes.Status400BadRequest);
        }
    }
}
