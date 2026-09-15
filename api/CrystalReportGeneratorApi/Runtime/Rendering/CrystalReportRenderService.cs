using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using CrystalReportGeneratorApi.Runtime;
using System;
using System.Data;
using System.IO;
using System.Linq;
using System.Xml;

namespace CrystalReportGeneratorApi.Runtime.Rendering
{
    public sealed class CrystalReportRenderService
    {
        private readonly CrystalReportProfileRegistry _profiles;

        public CrystalReportRenderService()
            : this(CrystalReportProfileRegistry.CreateDefault())
        {
        }

        public CrystalReportRenderService(CrystalReportProfileRegistry profiles)
        {
            _profiles = profiles ?? throw new ArgumentNullException(nameof(profiles));
        }

        public CrystalReportRenderOutput Render(
            string reportFilePath,
            string entityKey,
            string reportKey,
            string language,
            string dataXml)
        {
            var profile = _profiles.GetRequired(entityKey);
            var data = ReadData(dataXml);
            ValidateSchema(data, profile);

            using (var report = new ReportDocument())
            {
                try
                {
                    report.Load(reportFilePath, OpenReportMethod.OpenReportByTempCopy);
                    var rejectionReason = CrystalReportManagedSourcePolicy.GetRejectionReason(report);
                    if (rejectionReason != null)
                        throw new UnsupportedCrystalReportProfileException(rejectionReason);

                    CrystalReportManagedParameters.Apply(report, language);
                    report.SetDataSource(data);

                    var pdf = ExportPdf(report);
                    return new CrystalReportRenderOutput(reportKey + ".pdf", pdf);
                }
                finally
                {
                    report.Close();
                }
            }
        }

        private static DataTable ReadData(string dataXml)
        {
            if (string.IsNullOrWhiteSpace(dataXml))
                throw new UnsupportedCrystalReportProfileException("The report data is required.");

            var dataSet = new DataSet();
            var settings = new XmlReaderSettings
            {
                DtdProcessing = DtdProcessing.Prohibit,
                XmlResolver = null,
                MaxCharactersInDocument = CrystalReportRuntimeSettings.MaximumRuntimeDataSizeBytes
            };
            using (var text = new StringReader(dataXml))
            using (var reader = XmlReader.Create(text, settings))
                dataSet.ReadXml(reader, XmlReadMode.ReadSchema);

            if (dataSet.Tables.Count != 1)
                throw new UnsupportedCrystalReportProfileException(
                    "The report data must contain exactly one table.");

            return dataSet.Tables[0];
        }

        private static void ValidateSchema(DataTable data, CrystalReportProfile profile)
        {
            var columns = data.Columns.Cast<DataColumn>()
                .Select(column => column.ColumnName)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
            if (profile.RequiredColumns.Any(column => !columns.Contains(column)))
                throw new UnsupportedCrystalReportProfileException(
                    "The report data schema does not match the approved entity profile.");
        }

        private static byte[] ExportPdf(ReportDocument report)
        {
            using (var exportStream = report.ExportToStream(ExportFormatType.PortableDocFormat))
            using (var output = new MemoryStream())
            {
                CopyToBounded(exportStream, output, CrystalReportRuntimeSettings.MaximumRenderedFileSizeBytes);
                if (output.Length == 0)
                    throw new InvalidOperationException("The rendered PDF size is invalid.");

                var bytes = output.ToArray();
                if (bytes.Length < 5 ||
                    bytes[0] != (byte)'%' ||
                    bytes[1] != (byte)'P' ||
                    bytes[2] != (byte)'D' ||
                    bytes[3] != (byte)'F' ||
                    bytes[4] != (byte)'-')
                    throw new InvalidOperationException("Crystal Reports did not return a valid PDF document.");

                return bytes;
            }
        }

        private static void CopyToBounded(Stream source, Stream destination, long maximumBytes)
        {
            var buffer = new byte[81920];
            long total = 0;
            int read;
            while ((read = source.Read(buffer, 0, buffer.Length)) > 0)
            {
                total += read;
                if (total > maximumBytes)
                    throw new InvalidOperationException("The rendered PDF exceeds the configured size limit.");

                destination.Write(buffer, 0, read);
            }
        }
    }

    public sealed class CrystalReportRenderOutput
    {
        public CrystalReportRenderOutput(string fileName, byte[] content)
        {
            FileName = fileName;
            Content = content;
        }

        public string FileName { get; private set; }
        public byte[] Content { get; private set; }
    }
}
