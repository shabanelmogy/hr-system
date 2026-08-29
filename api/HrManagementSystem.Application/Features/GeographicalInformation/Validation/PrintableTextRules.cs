using System.Globalization;

namespace HrManagementSystem.Application.Features.GeographicalInformation.Validation;

public static class PrintableTextRules
{
    public static bool IsPrintable(string? value)
    {
        if (value is null)
            return true;

        for (var index = 0; index < value.Length; index++)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(value, index);
            if (category is UnicodeCategory.Control or
                UnicodeCategory.Format or
                UnicodeCategory.LineSeparator or
                UnicodeCategory.ParagraphSeparator or
                UnicodeCategory.Surrogate)
            {
                return false;
            }

            if (char.IsHighSurrogate(value[index]) &&
                index + 1 < value.Length &&
                char.IsLowSurrogate(value[index + 1]))
            {
                index++;
            }
        }

        return true;
    }
}
