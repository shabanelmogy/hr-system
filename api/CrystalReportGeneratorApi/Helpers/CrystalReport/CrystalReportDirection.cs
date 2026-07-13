using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using System;
using System.Windows.Media;
using System.Windows.Shapes;

namespace CrystalReportGeneratorApi.Helpers.CrystalReport
{
    public static class CrystalReportDirection
    {
        public static void AdjustReportDirection(ReportDocument reportDocument, string culture)
        {
            bool isLtr = culture.Equals("en", StringComparison.OrdinalIgnoreCase);
            float reportWidth = reportDocument.PrintOptions.PageContentWidth;

            foreach (Section section in reportDocument.ReportDefinition.Sections)
            {
                foreach (ReportObject obj in section.ReportObjects)
                {
                    switch (obj)
                    {
                        case FieldObject fieldObject:
                            fieldObject.ObjectFormat.HorizontalAlignment = Alignment.HorizontalCenterAlign;
                            if (isLtr)
                                fieldObject.Left = (int)(reportWidth - fieldObject.Left - fieldObject.Width);
                            break;

                        case TextObject textObject:
                            textObject.ObjectFormat.HorizontalAlignment = Alignment.HorizontalCenterAlign;
                            if (isLtr)
                                textObject.Left = (int)(reportWidth - textObject.Left - textObject.Width);
                            break;

                        case PictureObject imageObject:
                            if (isLtr)
                                imageObject.Left = (int)(reportWidth - imageObject.Left - imageObject.Width);
                            break;

                        case ChartObject chartObject:
                            if (isLtr)
                                chartObject.Left = (int)(reportWidth - chartObject.Left - chartObject.Width);
                            break;


                        case LineObject line:
                            if (isLtr)
                            {
                                // Horizontal line (Top == Bottom)
                                if (line.Top == line.Bottom)
                                {
                                    int width = line.Right - line.Left;
                                    int newLeft = (int)(reportWidth - line.Right);
                                    line.Left = newLeft;
                                    line.Right = newLeft + width;
                                }
                                // Vertical line (Left == Right)
                                else if (line.Left == line.Right)
                                {
                                    line.ObjectFormat.EnableSuppress = true;
                                }
                            }
                            break;

                        case DrawingObject drawingObject:
                            if (isLtr)
                            {
                                // Mirror shape (like rectangle)
                                int newLeft = (int)(reportWidth - drawingObject.Right);
                                int newRight = (int)(reportWidth - drawingObject.Left);

                                drawingObject.Left = newLeft;
                                drawingObject.Right = newRight;
                            }
                            break;
                    }
                }
            }
        }
    }
}

//drawing.ObjectFormat.EnableSuppress = true;