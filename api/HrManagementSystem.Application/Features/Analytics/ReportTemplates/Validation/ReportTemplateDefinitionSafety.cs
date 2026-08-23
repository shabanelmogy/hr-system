using System.Security.Cryptography;
using System.Text.Json;
using HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;

namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Validation;

public static class ReportTemplateDefinitionSafety
{
    public const int MaxUtf8Bytes = 1_048_576;
    public const string CountriesFeatureKey = "countries";
    public const string CountriesDataSourceKey = "countries";
    public const string CountriesRelativeApiPath = "/api/v1/countries/report-data";
    public const string CountriesConnectString = "endpoint=/api/v1/countries/report-data";

    private static readonly string[] ForbiddenPropertyFragments =
    [
        "password", "passwd", "pwd", "credential", "secret", "apikey",
        "accesstoken", "refreshtoken", "userid", "username"
    ];

    private static readonly string[] ForbiddenConnectionFragments =
    [
        "server=", "data source=", "initial catalog=", "database=", "user id=",
        "uid=", "password=", "pwd=", "trusted_connection=", "integrated security=",
        "host=", "accountkey=", "sharedaccesssignature="
    ];

    public static bool IsApprovedPair(string? featureKey, string? dataSourceKey) =>
        string.Equals(featureKey?.Trim(), CountriesFeatureKey, StringComparison.OrdinalIgnoreCase) &&
        string.Equals(dataSourceKey?.Trim(), CountriesDataSourceKey, StringComparison.OrdinalIgnoreCase);

    public static bool IsSafe(string? definitionJson)
    {
        if (string.IsNullOrWhiteSpace(definitionJson) ||
            Encoding.UTF8.GetByteCount(definitionJson) > MaxUtf8Bytes)
        {
            return false;
        }

        try
        {
            using var document = JsonDocument.Parse(definitionJson, new JsonDocumentOptions
            {
                MaxDepth = 128,
                CommentHandling = JsonCommentHandling.Disallow,
                AllowTrailingCommas = false
            });

            var root = document.RootElement;
            return root.ValueKind == JsonValueKind.Object &&
                   root.TryGetProperty("Name", out var name) &&
                   name.ValueKind == JsonValueKind.String &&
                   !string.IsNullOrWhiteSpace(name.GetString()) &&
                   HasValidReportContent(root) &&
                   IsSafe(root, null);
        }
        catch (JsonException)
        {
            return false;
        }
    }

    public static string ComputeHash(string definitionJson) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(definitionJson)));

    public static ReportDataSourceDescriptorResponse CountriesDescriptor() =>
        new(
            CountriesDataSourceKey,
            CountriesFeatureKey,
            "Countries API",
            "JSON",
            CountriesConnectString,
            CountriesRelativeApiPath,
            "GET",
            true);

    private static bool IsSafe(JsonElement element, string? propertyName)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                foreach (var property in element.EnumerateObject())
                {
                    var normalizedName = property.Name.Replace("_", string.Empty)
                        .Replace("-", string.Empty)
                        .ToLowerInvariant();
                    if (ForbiddenPropertyFragments.Any(normalizedName.Contains) &&
                        !IsRdlxPasswordDisplayFlag(normalizedName, property.Value))
                        return false;
                    if (!IsSafe(property.Value, property.Name))
                        return false;
                }
                return true;

            case JsonValueKind.Array:
                return element.EnumerateArray().All(item => IsSafe(item, propertyName));

            case JsonValueKind.String:
                var value = element.GetString() ?? string.Empty;
                if (Uri.TryCreate(value, UriKind.Absolute, out _))
                    return false;
                if (ForbiddenConnectionFragments.Any(fragment =>
                        value.Contains(fragment, StringComparison.OrdinalIgnoreCase)))
                {
                    return false;
                }
                if (value.Contains("endpoint=", StringComparison.OrdinalIgnoreCase) &&
                    !string.Equals(value, CountriesConnectString, StringComparison.OrdinalIgnoreCase))
                {
                    return false;
                }
                if (value.StartsWith("/api/", StringComparison.OrdinalIgnoreCase) &&
                    !string.Equals(value, CountriesRelativeApiPath, StringComparison.OrdinalIgnoreCase))
                {
                    return false;
                }
                return true;

            default:
                return true;
        }
    }

    private static bool IsRdlxPasswordDisplayFlag(string normalizedName, JsonElement value) =>
        normalizedName == "password" &&
        value.ValueKind is JsonValueKind.True or JsonValueKind.False;

    private static bool HasValidReportContent(JsonElement root)
    {
        if (root.TryGetProperty("Body", out var body) &&
            body.ValueKind == JsonValueKind.Object)
        {
            return true;
        }

        if (!root.TryGetProperty("ReportSections", out var sections) ||
            sections.ValueKind != JsonValueKind.Array)
        {
            return false;
        }

        var hasSection = false;
        foreach (var section in sections.EnumerateArray())
        {
            hasSection = true;
            if (section.ValueKind != JsonValueKind.Object ||
                !section.TryGetProperty("Name", out var sectionName) ||
                sectionName.ValueKind != JsonValueKind.String ||
                string.IsNullOrWhiteSpace(sectionName.GetString()) ||
                !section.TryGetProperty("Type", out var sectionType) ||
                sectionType.ValueKind != JsonValueKind.String)
            {
                return false;
            }

            var contentProperty = sectionType.GetString() switch
            {
                "Continuous" => "Body",
                "FixedPage" => "FixedPage",
                _ => null
            };
            if (contentProperty is null ||
                !section.TryGetProperty(contentProperty, out var sectionContent) ||
                sectionContent.ValueKind != JsonValueKind.Object)
            {
                return false;
            }
        }

        return hasSection;
    }
}
