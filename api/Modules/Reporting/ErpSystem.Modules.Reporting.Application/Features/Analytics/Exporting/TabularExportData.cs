using System.Text.Json;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.Exporting;

/// <summary>Bounded, domain-neutral scalar input for the existing file generators.</summary>
public static class TabularExportData
{
    public const long MaximumRequestBytes = 8 * 1024 * 1024;
    public const int MaximumRows = 100000;
    public const int MaximumColumns = 200;
    public const int MaximumCells = 2000000;

    public static bool IsValid(List<Dictionary<string, object>>? rows)
    {
        if (rows is null || rows.Count is 0 or > MaximumRows)
            return false;
        var columns = new HashSet<string>(StringComparer.Ordinal);
        var labels = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        long minimumBytes = 2;
        foreach (var row in rows)
        {
            if (row is null || row.Count is 0 or > MaximumColumns)
                return false;
            foreach (var (key, value) in row)
            {
                if (string.IsNullOrWhiteSpace(key) || key.Length > 150 || !IsScalar(value))
                    return false;
                if (labels.TryGetValue(key, out var existing) && !string.Equals(existing, key, StringComparison.Ordinal))
                    return false;
                labels[key] = key;
                columns.Add(key);
                minimumBytes += Encoding.UTF8.GetByteCount(key) + 4;
                minimumBytes += Normalize(value) is string text ? Encoding.UTF8.GetByteCount(text) + 2 : 32;
                if (minimumBytes > MaximumRequestBytes)
                    return false;
            }
            if (columns.Count > MaximumColumns || (long)columns.Count * rows.Count > MaximumCells)
                return false;
        }
        return JsonSerializer.SerializeToUtf8Bytes(rows).LongLength <= MaximumRequestBytes;
    }

    public static bool IsScalar(object? value) => value switch
    {
        null => true,
        string text => text.Length <= 32767,
        bool or sbyte or byte or short or ushort or int or uint or long or ulong or decimal => true,
        float number => float.IsFinite(number),
        double number => double.IsFinite(number),
        JsonElement element => element.ValueKind switch
        {
            JsonValueKind.Null or JsonValueKind.True or JsonValueKind.False => true,
            JsonValueKind.String => (element.GetString()?.Length ?? 0) <= 32767,
            JsonValueKind.Number => element.TryGetDouble(out var number) && double.IsFinite(number),
            _ => false
        },
        _ => false
    };

    public static object? Normalize(object? value) => value is JsonElement element
        ? element.ValueKind switch
        {
            JsonValueKind.Null => null,
            JsonValueKind.String => element.GetString(),
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Number => element.GetDouble(),
            _ => throw new ArgumentException("Only scalar export values are supported.")
        }
        : value;

    public static bool IsSafeFileName(string? name, string format) =>
        !string.IsNullOrWhiteSpace(name) && name.Length <= 100 &&
        !name.StartsWith('.') && !name.EndsWith('.') && !name.EndsWith(' ') &&
        name.All(character => !char.IsControl(character) && "<>:\"/\\|?*".IndexOf(character, StringComparison.Ordinal) < 0) &&
        (!Path.HasExtension(name) || string.Equals(Path.GetExtension(name), "." + format, StringComparison.OrdinalIgnoreCase));
}

public sealed class GenerateExcelExportValidator : AbstractValidator<GenerateExcelExportQuery>
{
    public GenerateExcelExportValidator()
    {
        RuleFor(request => request.Data).Must(TabularExportData.IsValid)
            .WithMessage("Export requires a bounded table of scalar values.").WithErrorCode("Export.InvalidData");
        RuleFor(request => request.Culture).Must(culture => culture is "en" or "ar")
            .WithMessage("Choose English or Arabic.").WithErrorCode("Export.InvalidCulture");
    }
}

public sealed class GenerateCsvExportValidator : AbstractValidator<GenerateCsvExportQuery>
{
    public GenerateCsvExportValidator() => RuleFor(request => request.Data).Must(TabularExportData.IsValid)
        .WithMessage("Export requires a bounded table of scalar values.").WithErrorCode("Export.InvalidData");
}
