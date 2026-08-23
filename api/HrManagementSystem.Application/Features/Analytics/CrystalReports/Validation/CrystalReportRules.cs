using System.Text.RegularExpressions;
using HrManagementSystem.Domain.Analytics.CrystalReports.Entities;

namespace HrManagementSystem.Application.Features.Analytics.CrystalReports.Validation;

internal static partial class CrystalReportRules
{
    internal static readonly string[] RightNames =
        ["Run", "Download", "Upload", "Publish", "ManageAccess"];

    internal static bool IsValidKey(string value) => KeyPattern().IsMatch(value);

    internal static string FileStemToKey(string fileName)
    {
        var stem = Path.GetFileNameWithoutExtension(fileName).Trim();
        return Regex.Replace(stem, "[^A-Za-z0-9]+", "-").Trim('-').ToLowerInvariant();
    }

    internal static bool MatchesEntityPrefix(string reportKey, string entityKey) =>
        reportKey.Equals(entityKey, StringComparison.OrdinalIgnoreCase) ||
        reportKey.StartsWith(entityKey + "-", StringComparison.OrdinalIgnoreCase);

    internal static CrystalReportRight ParseRights(IEnumerable<string> rights)
    {
        var result = CrystalReportRight.None;
        foreach (var right in rights)
            if (Enum.TryParse<CrystalReportRight>(right, true, out var parsed) && parsed != CrystalReportRight.None)
                result |= parsed;
        return result;
    }

    [GeneratedRegex("^[a-zA-Z0-9]+(?:[-_.][a-zA-Z0-9]+)*$")]
    private static partial Regex KeyPattern();
}
