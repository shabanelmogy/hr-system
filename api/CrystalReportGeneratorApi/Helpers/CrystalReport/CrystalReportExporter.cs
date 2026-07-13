using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using System.IO;
using System.Net;
using System.Net.Http;

namespace CrystalReportGeneratorApi.Helpers.CrystalReport
{
    public static class CrystalReportExporter
    {
        public static HttpResponseMessage ExportReportAsPdf(ReportDocument reportDocument, string exportFilename)
        {
            MemoryStream ms = new MemoryStream();
            try
            {
                using (Stream exportStream = reportDocument.ExportToStream(ExportFormatType.PortableDocFormat))
                {
                    exportStream.CopyTo(ms);
                }

                var result = new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new ByteArrayContent(ms.ToArray())
                };

                result.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("inline")
                {
                    FileName = exportFilename
                };
                result.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/pdf");

                return result;
            }
            finally
            {
                ms.Dispose();
            }
        }
    }
}