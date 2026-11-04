using System;

namespace CrystalReportGeneratorApi.Runtime.Rendering
{
    internal static class CrystalReportDirectionGeometry
    {
        public static bool Mirrors(string language)
        {
            return string.Equals(language, "en", StringComparison.OrdinalIgnoreCase);
        }

        public static int LeftForLanguage(string language, float pageContentWidth, int left, int width)
        {
            return Mirrors(language) ? (int)(pageContentWidth - left - width) : left;
        }

        public static bool SuppressVerticalLine(string language, int left, int right, int top, int bottom)
        {
            return Mirrors(language) && left == right && top != bottom;
        }
    }
}
