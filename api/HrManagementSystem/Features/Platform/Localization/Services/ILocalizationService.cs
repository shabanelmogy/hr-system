using HrManagementSystem.Features.Platform.Localization.Contracts;

namespace HrManagementSystem.Features.Platform.Localization.Services
{
    public interface ILocalizationService
    {
        Task<Result> GetLocalization(string language);

        Task<Result> SaveLocalization(string language, [FromBody] Dictionary<string, string> localizationData);

        Task<Result> UpdateLocalizationKey(LocalizationRequest request);

        Task<Result> DeleteLocalizationKey(string language, string key);
    }
}
