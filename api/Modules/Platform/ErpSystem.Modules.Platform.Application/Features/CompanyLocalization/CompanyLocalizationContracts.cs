namespace ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;

public sealed record CompanyUiSourceInfo(string Id, string Client, string Namespace);
public sealed record CompanyLocalizationSettingsResponse(string TenantId, int CompanyId, string DefaultLanguage, int Revision,
    IReadOnlyList<string> Languages, IReadOnlyList<CompanyUiSourceInfo> Sources, IReadOnlyDictionary<string,string> CatalogVersions);
public sealed record CompanyLocalizationTextRow(string Key, string BaseValue, string TargetValue, string ShippedValue, bool IsCustomized);
public sealed record CompanyLocalizationTextsResponse(int Revision, IReadOnlyList<CompanyLocalizationTextRow> Items,
    int TotalCount, int Page, int PageSize, string CatalogVersion);
public sealed record CompanyLocalizationRuntimeOverride(string Namespace, string Language, string Key, string Value);
public sealed record CompanyLocalizationRuntimeResponse(string TenantId, int CompanyId, string DefaultLanguage, int Revision,
    string CatalogVersion, IReadOnlyList<CompanyLocalizationRuntimeOverride> Overrides);
public sealed record CompanyLocalizationTextsQuery(
    string Source = "", string BaseLanguage = "en", string TargetLanguage = "ar",
    string Search = "", string Status = "all", int Page = 1, int PageSize = 25);
public sealed record SetCompanyLanguageRequest(string Language, int ExpectedRevision);
public sealed record SetCompanyTextRequest(string Source, string Language, string Key, string Value, int ExpectedRevision);
public sealed record ResetCompanyTextRequest(string Source, string Language, string Key, int ExpectedRevision);
public enum CompanyLocalizationChangeKind { SetDefault, SetText, ResetText }
public sealed record CompanyLocalizationChange(CompanyLocalizationChangeKind Kind, string Language, int ExpectedRevision,
    string Source = "", string Key = "", string Value = "");

public interface ICompanyLocalizationStore
{
    Task<CompanyLocalizationSettingsResponse?> GetSettingsAsync(CancellationToken token);
    Task<CompanyLocalizationTextsResponse?> GetTextsAsync(CompanyLocalizationTextsQuery query, CancellationToken token);
    Task<CompanyLocalizationRuntimeResponse?> GetRuntimeAsync(string client, CancellationToken token);
    Task<Result> ApplyAsync(CompanyLocalizationChange change, CancellationToken token);
}