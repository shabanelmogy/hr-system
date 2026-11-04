using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using System;

namespace CrystalReportGeneratorApi.Runtime.Rendering
{
    internal static class CrystalReportDirection
    {
        public static void Apply(ReportDocument report, string language)
        {
            if (report == null)
                throw new ArgumentNullException(nameof(report));

            var pageContentWidth = (float)report.PrintOptions.PageContentWidth;
            foreach (Section section in report.ReportDefinition.Sections)
            {
                foreach (ReportObject item in section.ReportObjects)
                    ApplyObject(item, language, pageContentWidth);
            }
        }

        private static void ApplyObject(ReportObject item, string language, float pageContentWidth)
        {
            if (item is FieldObject || item is TextObject)
                item.ObjectFormat.HorizontalAlignment = Alignment.HorizontalCenterAlign;

            if (!CrystalReportDirectionGeometry.Mirrors(language))
                return;

            if (item is FieldObject || item is TextObject || item is PictureObject || item is ChartObject)
            {
                item.Left = CrystalReportDirectionGeometry.LeftForLanguage(
                    language, pageContentWidth, item.Left, item.Width);
                return;
            }

            if (item is LineObject line)
            {
                if (line.Top == line.Bottom)
                {
                    var width = line.Right - line.Left;
                    var left = CrystalReportDirectionGeometry.LeftForLanguage(
                        language, pageContentWidth, line.Left, width);
                    line.Left = left;
                    line.Right = left + width;
                }
                else if (CrystalReportDirectionGeometry.SuppressVerticalLine(
                    language, line.Left, line.Right, line.Top, line.Bottom))
                {
                    // Preserve the original English-layout policy for vertical rules.
                    line.ObjectFormat.EnableSuppress = true;
                }
                return;
            }

            if (item is DrawingObject drawing)
            {
                // Read both endpoints before a native setter changes the object's bounds.
                var width = drawing.Right - drawing.Left;
                var left = CrystalReportDirectionGeometry.LeftForLanguage(
                    language, pageContentWidth, drawing.Left, width);
                drawing.Left = left;
                drawing.Right = left + width;
            }
        }
    }
}
