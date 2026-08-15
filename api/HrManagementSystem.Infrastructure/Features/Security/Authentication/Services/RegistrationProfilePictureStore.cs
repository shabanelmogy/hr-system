using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public sealed class RegistrationProfilePictureStore(
    IWebHostEnvironment webHostEnvironment,
    ApplicationDbContext context,
    ILogger<RegistrationProfilePictureStore> logger)
{
    private readonly string _profilePicturesPath = Path.Combine(
        webHostEnvironment.WebRootPath ?? Path.Combine(webHostEnvironment.ContentRootPath, "wwwroot"),
        "profile-pictures");

    public async Task<bool> TrySaveAsync(
        ApplicationUser user,
        string base64Image,
        CancellationToken cancellationToken)
    {
        byte[] imageBytes;
        try
        {
            imageBytes = Convert.FromBase64String(base64Image);
        }
        catch (FormatException)
        {
            logger.LogWarning("Registration profile picture for user {UserId} is not valid base64.", user.Id);
            return false;
        }

        var extension = DetectImageExtension(imageBytes);
        Directory.CreateDirectory(_profilePicturesPath);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(_profilePicturesPath, fileName);

        try
        {
            await File.WriteAllBytesAsync(filePath, imageBytes, cancellationToken);
            await context.Users
                .Where(candidate => candidate.Id == user.Id)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(candidate => candidate.ProfilePicture, fileName),
                    cancellationToken);
            return true;
        }
        catch (OperationCanceledException)
        {
            DeleteFileIfExists(filePath);
            throw;
        }
        catch (Exception exception)
        {
            DeleteFileIfExists(filePath);
            logger.LogWarning(
                exception,
                "Could not save the registration profile picture for user {UserId}.",
                user.Id);
            return false;
        }
    }

    private static string DetectImageExtension(byte[] bytes)
    {
        if (bytes.Length >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF)
            return ".jpg";
        if (bytes.Length >= 4 && bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47)
            return ".png";
        return ".jpg";
    }

    private static void DeleteFileIfExists(string filePath)
    {
        try
        {
            if (File.Exists(filePath))
                File.Delete(filePath);
        }
        catch
        {
            // Cleanup must not hide the original storage failure.
        }
    }
}
