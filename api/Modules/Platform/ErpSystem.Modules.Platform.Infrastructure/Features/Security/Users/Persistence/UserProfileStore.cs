using ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;
using ErpSystem.Modules.Platform.Contracts.Files;
using ErpSystem.Modules.Platform.Contracts.Files.Models;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Users.Persistence;

public sealed class UserProfileStore(
    PlatformDbContext context,
    IWebHostEnvironment webHostEnvironment,
    IFileUploadInspectionService uploadInspection) : IUserProfileStore
{
    private readonly string _profilePicturesPath = Path.Combine(
        webHostEnvironment.WebRootPath ?? Path.Combine(webHostEnvironment.ContentRootPath, "wwwroot"),
        "profile-pictures");

    public Task<UserProfileResponse> GetAsync(
        string userId,
        CancellationToken cancellationToken = default) =>
        context.Users
            .Where(user => user.Id == userId)
            .Select(user => new UserProfileResponse(
                user.Id,
                user.Email ?? string.Empty,
                user.UserName ?? string.Empty,
                user.FirstName,
                user.LastName))
            .SingleAsync(cancellationToken);

    public async Task<UserPhoto> GetPhotoAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var fileName = await context.Users
            .Where(user => user.Id == userId)
            .Select(user => user.ProfilePicture)
            .SingleOrDefaultAsync(cancellationToken);

        var filePath = GetProfilePicturePath(fileName);
        if (filePath is null || !File.Exists(filePath))
            return new UserPhoto();

        var bytes = await File.ReadAllBytesAsync(filePath, cancellationToken);
        return new UserPhoto
        {
            ProfilePicture = Convert.ToBase64String(bytes),
            ContentType = GetImageContentType(fileName)
        };
    }

    public async Task UpdateAsync(
        string userId,
        UpdateProfileRequest request,
        CancellationToken cancellationToken = default) =>
        _ = await context.Users
            .Where(user => user.Id == userId)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(user => user.UserName, request.UserName)
                .SetProperty(user => user.NormalizedUserName, request.UserName.ToUpper())
                .SetProperty(user => user.FirstName, request.FirstName)
                .SetProperty(user => user.LastName, request.LastName), cancellationToken);

    public async Task<UserProfilePictureUpdateOutcome> UpdatePictureAsync(
        string userId,
        UpdateProfilePictureRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await context.Users
            .AsNoTracking()
            .Where(candidate => candidate.Id == userId)
            .Select(candidate => new { candidate.Id, candidate.ProfilePicture })
            .SingleOrDefaultAsync(cancellationToken);
        if (user is null)
            return UserProfilePictureUpdateOutcome.UserNotFound;

        var oldPath = GetProfilePicturePath(user.ProfilePicture);
        if (request.Remove)
        {
            await context.Users
                .Where(candidate => candidate.Id == userId)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(candidate => candidate.ProfilePicture, (string?)null),
                    cancellationToken);
            DeleteFileIfExists(oldPath);
            return UserProfilePictureUpdateOutcome.Success;
        }

        var picture = request.ProfilePicture
            ?? throw new InvalidOperationException("A profile picture is required when Remove is false.");
        var extension = Path.GetExtension(picture.FileName).ToLowerInvariant();
        await uploadInspection.InspectAsync(
            new PlatformFileUpload(
                picture.FileName,
                picture.ContentType,
                picture.Length,
                picture.OpenReadStream),
            cancellationToken);

        Directory.CreateDirectory(_profilePicturesPath);
        var newFileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = GetProfilePicturePath(newFileName)!;

        try
        {
            await using var input = picture.OpenReadStream();
            await using var stream = File.Create(filePath);
            await input.CopyToAsync(stream, cancellationToken);

            await context.Users
                .Where(candidate => candidate.Id == userId)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(candidate => candidate.ProfilePicture, newFileName),
                    cancellationToken);
        }
        catch
        {
            DeleteFileIfExists(filePath);
            throw;
        }

        DeleteFileIfExists(oldPath);
        return UserProfilePictureUpdateOutcome.Success;
    }

    private string? GetProfilePicturePath(string? fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            return null;

        var safeFileName = Path.GetFileName(fileName);
        if (!string.Equals(safeFileName, fileName, StringComparison.Ordinal))
            return null;

        var rootPath = Path.GetFullPath(_profilePicturesPath);
        var filePath = Path.GetFullPath(Path.Combine(rootPath, safeFileName));
        var rootPrefix = rootPath.EndsWith(Path.DirectorySeparatorChar)
            ? rootPath
            : rootPath + Path.DirectorySeparatorChar;

        return filePath.StartsWith(rootPrefix, StringComparison.OrdinalIgnoreCase)
            ? filePath
            : null;
    }

    private static void DeleteFileIfExists(string? filePath)
    {
        if (filePath is not null && File.Exists(filePath))
            File.Delete(filePath);
    }

    private static string GetImageContentType(string? fileName) =>
        Path.GetExtension(fileName ?? string.Empty).ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            _ => "application/octet-stream"
        };
}
