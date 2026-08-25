using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Xml;

namespace CrystalReportGeneratorApi.Helpers.CrystalReport
{
    public static class ManagedReportRuntime
    {
        private static readonly IReadOnlyDictionary<string, string[]> Profiles =
            new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
            {
                ["countries"] = new[]
                {
                    "CountryId", "CountryAr", "CountryEn", "StateId", "StateAr", "StateEn"
                },
                ["states"] = new[]
                {
                    "StateId", "StateAr", "StateEn", "StateCode",
                    "CountryId", "CountryAr", "CountryEn"
                },
                ["districts"] = new[]
                {
                    "DistrictId", "DistrictAr", "DistrictEn", "DistrictCode",
                    "StateId", "StateAr", "StateEn", "AddressesCount"
                },
                ["addresstypes"] = new[]
                {
                    "AddressTypeId", "AddressTypeAr", "AddressTypeEn", "AddressesCount"
                }
            };

        public static HttpResponseMessage Render(
            string reportFilePath,
            string entityKey,
            string reportKey,
            string language,
            string dataXml)
        {
            if (!Profiles.TryGetValue(entityKey, out var requiredColumns))
                throw new UnsupportedManagedReportException(
                    "The report entity does not have an approved runtime profile.");

            var data = ReadData(dataXml);
            var columns = data.Columns.Cast<DataColumn>()
                .Select(column => column.ColumnName)
                .ToHashSet(StringComparer.OrdinalIgnoreCase);
            if (requiredColumns.Any(column => !columns.Contains(column)))
                throw new UnsupportedManagedReportException(
                    "The report data schema does not match the approved entity profile.");

            return CrystalReportRenderer.RenderReportFile(
                reportFilePath,
                $"{reportKey}.pdf",
                data,
                "Logo1.jpg",
                language);
        }

        private static DataTable ReadData(string dataXml)
        {
            if (string.IsNullOrWhiteSpace(dataXml))
                throw new UnsupportedManagedReportException("The report data is required.");

            var dataSet = new DataSet();
            var settings = new XmlReaderSettings
            {
                DtdProcessing = DtdProcessing.Prohibit,
                XmlResolver = null,
                MaxCharactersInDocument = 10L * 1024L * 1024L
            };
            using (var text = new StringReader(dataXml))
            using (var reader = XmlReader.Create(text, settings))
                dataSet.ReadXml(reader, XmlReadMode.ReadSchema);
            if (dataSet.Tables.Count != 1)
                throw new UnsupportedManagedReportException(
                    "The report data must contain exactly one table.");
            return dataSet.Tables[0];
        }
    }

    public sealed class UnsupportedManagedReportException : Exception
    {
        public UnsupportedManagedReportException(string message) : base(message)
        {
        }
    }
}
