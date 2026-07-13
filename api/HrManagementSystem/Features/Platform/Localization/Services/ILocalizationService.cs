using HrManagementSystem.Features.Platform.Localization.Contracts;

namespace HrManagementSystem.Features.Platform.Localization.Services
{
    public interface ILocalizationService
    {
        Task<Result<Dictionary<string, string>>> GetLocalization(string language, CancellationToken cancellationToken = default);

        Task<Result> SaveLocalization(string language, Dictionary<string, string> localizationData, CancellationToken cancellationToken = default);

        Task<Result> UpdateLocalizationKey(LocalizationRequest request, CancellationToken cancellationToken = default);

        Task<Result> DeleteLocalizationKey(string language, string key, CancellationToken cancellationToken = default);
    }
}
