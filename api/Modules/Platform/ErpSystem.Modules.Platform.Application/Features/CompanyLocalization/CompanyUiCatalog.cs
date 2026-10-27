namespace ErpSystem.Modules.Platform.Application.Features.CompanyLocalization;

/// <summary>Authoritative shipped UI catalog supplied by the Platform composition root.</summary>
public interface ICompanyUiCatalog
{
    IReadOnlyList<CompanyUiSource> Sources { get; }
    string GetVersion(string client);
}

public sealed record CompanyUiSource(
    string Id,
    string Client,
    string Namespace,
    IReadOnlyList<CompanyUiText> Entries);

public sealed record CompanyUiText(string Key, string? En, string? Ar, string Scope, IReadOnlyList<string>? SystemPermissions = null);
