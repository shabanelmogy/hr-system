namespace HrManagementSystem.Application.Features.Platform.Files.Errors
{
    public class FileErrors(IStringLocalizer<FileErrors> localizer)
    {
        private readonly IStringLocalizer<FileErrors> _localizer = localizer;

        public Error InvalidFileSize()
        {
            var message = string.Format(_localizer[nameof(InvalidFileSize)], FileSettings.MaxFileSizeInMB);

            return new Error("Files.InvalidFileSize", message, ErrorType.Validation);
        }
    }
}
