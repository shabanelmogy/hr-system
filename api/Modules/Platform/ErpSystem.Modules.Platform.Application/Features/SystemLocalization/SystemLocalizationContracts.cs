using ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;
namespace ErpSystem.Modules.Platform.Application.Features.SystemLocalization;
public sealed record SystemLocalizationSettingsResponse(int Revision, IReadOnlyList<string> Languages, IReadOnlyList<CompanyUiSourceInfo> Sources, IReadOnlyDictionary<string,string> CatalogVersions);
public sealed record SystemLocalizationRuntimeResponse(int Revision, string CatalogVersion, IReadOnlyList<CompanyLocalizationRuntimeOverride> Overrides);
public interface ISystemLocalizationStore
{
 Task<SystemLocalizationSettingsResponse?> GetSettingsAsync(CancellationToken token);
 Task<CompanyLocalizationTextsResponse?> GetTextsAsync(CompanyLocalizationTextsQuery query, CancellationToken token);
 Task<SystemLocalizationRuntimeResponse?> GetRuntimeAsync(string client, CancellationToken token);
 Task<Result> ApplyAsync(CompanyLocalizationChange change, CancellationToken token);
}
