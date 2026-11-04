using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using System;
using System.Linq;
using Ras = CrystalDecisions.ReportAppServer.ReportDefModel;

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

            if (CrystalReportDirectionGeometry.Mirrors(language))
                MirrorLines(report, language, pageContentWidth);
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

            // Lines are updated atomically through RAS after Engine object traversal.
            if (item is LineObject)
                return;

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

        private static void MirrorLines(ReportDocument report, string language, float pageContentWidth)
        {
            var controller = report.ReportClientDocument.ReportDefController.ReportObjectController;
            var lines = controller.GetReportObjectsByKind(Ras.CrReportObjectKindEnum.crReportObjectKindLine)
                .Cast<Ras.ISCRLineObject>().ToArray();

            foreach (var line in lines)
            {
                if (!CrystalReportDirectionGeometry.ShouldMirrorLine(
                    language, line.Left, line.Right, line.Top, line.Bottom))
                    continue;

                var width = line.Right - line.Left;
                var left = CrystalReportDirectionGeometry.LeftForLanguage(
                    language, pageContentWidth, line.Left, width);
                var mirrored = (Ras.ISCRLineObject)line.Clone(true);

                // A live endpoint setter can temporarily make a vertical line diagonal.
                // Modify a detached clone so both X endpoints change together, retaining
                // Y endpoints, section attachments, formatting and suppression formulas.
                mirrored.Left = left;
                mirrored.Right = left + width;
                controller.Modify(line, mirrored);
            }
        }
    }
}
