using Syncfusion.Drawing;
using Syncfusion.Pdf;
using Syncfusion.Pdf.Graphics;
using Syncfusion.Pdf.Grid;

namespace HrManagementSystem.Features.Analytics.Exporting.Services
{
    public class ExportPdfFileService : IExportPdfFileService
    {
        public byte[] CreatePDF(List<Dictionary<string, object>> forecasts, string fileName, string reportHead, string culture)
        {
            if (forecasts == null || forecasts.Count == 0)
            {
                throw new ArgumentNullException(nameof(forecasts), "Forecast cannot be null or empty ");
            }

            using var document = new PdfDocument();
            var customFont = LoadFontFromFile("wwwroot/fonts/arial.ttf"); // Load font from local directory
            var currentPage = document.Pages.Add();
            var clientSize = currentPage.GetClientSize();

            DrawHeader(currentPage, customFont, clientSize, reportHead, culture);
            var pdfGrid = CreateGrid(forecasts, customFont, culture);
            DrawGrid(currentPage, pdfGrid, clientSize);

            // Save the document to a MemoryStream and return as a byte array
            using var stream = new MemoryStream();
            document.Save(stream);
            return stream.ToArray();
        }

        private static PdfFont LoadFontFromFile(string fontFilePath)
        {
            // Load the font directly from the local file system
            var fontStream = new FileStream(fontFilePath, FileMode.Open, FileAccess.Read);
            return new PdfTrueTypeFont(fontStream, 14);  // Create a PDF font from the stream
        }

        private static void DrawHeader(PdfPage page, PdfFont font, SizeF clientSize, string reportHead, string culture)
        {
            var headerText = new PdfTextElement(reportHead, font, new PdfSolidBrush(Color.FromArgb(1, 53, 67, 168)))
            {
                StringFormat = new PdfStringFormat
                {
                    TextDirection = culture == "ar" ? PdfTextDirection.RightToLeft : PdfTextDirection.LeftToRight,
                    Alignment = PdfTextAlignment.Center
                }
            };

            headerText.Draw(page, new RectangleF(0, 0, page.GetClientSize().Width, page.GetClientSize().Height));
        }

        private static PdfGrid CreateGrid(List<Dictionary<string, object>> forecasts, PdfFont customFont, string culture)
        {
            var pdfGrid = new PdfGrid
            {
                Style = { CellPadding = { Left = 8, Right = 8 }, Font = customFont },
            };

            var firstRow = ReverseDictionaryIfRtl(forecasts.First(), culture);

            // Create columns based on the keys of the first dictionary
            foreach (var key in firstRow.Keys)
            {
                pdfGrid.Columns.Add(new PdfGridColumn(pdfGrid));
            }

            pdfGrid.ApplyBuiltinStyle(PdfGridBuiltinStyle.GridTable4Accent1);

            AddHeaderRow(pdfGrid, forecasts, culture);
            AddDataRows(pdfGrid, forecasts, culture);

            return pdfGrid;
        }

        private static void AddHeaderRow(PdfGrid pdfGrid, List<Dictionary<string, object>> forecasts, string culture)
        {
            PdfGridRow headerRow = pdfGrid.Headers.Add(1)[0];
            int columnIndex = 0;

            var firstRow = ReverseDictionaryIfRtl(forecasts.First(), culture);

            foreach (var key in firstRow.Keys)
            {
                headerRow.Cells[columnIndex].Value = key;
                headerRow.Cells[columnIndex].StringFormat = new PdfStringFormat
                {
                    TextDirection = CultureInfo.CurrentCulture.TwoLetterISOLanguageName == "ar" ? PdfTextDirection.RightToLeft : PdfTextDirection.LeftToRight,
                    Alignment = CultureInfo.CurrentCulture.TwoLetterISOLanguageName == "ar" ? PdfTextAlignment.Right : PdfTextAlignment.Left
                };
                columnIndex++;
            }
        }

        private static void AddDataRows(PdfGrid pdfGrid, List<Dictionary<string, object>> forecasts, string culture)
        {
            foreach (var forecast in forecasts)
            {
                PdfGridRow row = pdfGrid.Rows.Add();
                var reversedForecast = ReverseDictionaryIfRtl(forecast, culture);
                int columnIndex = 0;

                foreach (var value in reversedForecast.Values)
                {
                    row.Cells[columnIndex].Value = value?.ToString() ?? string.Empty;
                    row.Cells[columnIndex].StringFormat = new PdfStringFormat
                    {
                        TextDirection = CultureInfo.CurrentCulture.TwoLetterISOLanguageName == "ar" ? PdfTextDirection.RightToLeft : PdfTextDirection.LeftToRight,
                        Alignment = CultureInfo.CurrentCulture.TwoLetterISOLanguageName == "ar" ? PdfTextAlignment.Right : PdfTextAlignment.Left
                    };
                    columnIndex++;
                }
            }
        }

        private static Dictionary<string, object> ReverseDictionaryIfRtl(Dictionary<string, object> dictionary, string culture)
        {
            if (culture == "ar")
            {
                return dictionary.Reverse().ToDictionary(pair => pair.Key, pair => pair.Value);
            }

            return dictionary;
        }

        private static void DrawGrid(PdfPage page, PdfGrid pdfGrid, SizeF clientSize)
        {
            pdfGrid.Draw(page, new RectangleF(0, 30, clientSize.Width, clientSize.Height - 30));
        }
    }
}
