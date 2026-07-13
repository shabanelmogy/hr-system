using System.Collections.Generic;
using System.Data;
using System.Net.Http;
using System;
using System.Collections;
using System.Linq;

namespace CrystalReportGeneratorApi.Helpers
    {
        public class ReportGenerator
        {

        public static HttpResponseMessage GenerateReport<TRequest>(
                                            TRequest request,
                                            string viewName, 
                                            string viewQuery,
                                            string reportPath,
                                            string reportFileName,
                                            string exportFileName,
                                            string logoName,
                                            string lang,
                                            List<(string PropertyName, string ColumnName)> paramMappings)
        {
            try
            {
                // Ensure the SQL view exists and is up-to-date
                DatabaseHelper.CreateOrAlterView(viewName, viewQuery);

                // Build the base query
                string query = $"SELECT * FROM {viewName}";
                var parameters = new SortedList<string, object>();
                var whereConditions = new List<string>();

                foreach (var (propertyName, columnName) in paramMappings)
                {
                    var propertyInfo = typeof(TRequest).GetProperty(propertyName);
                    if (propertyInfo == null) continue;

                    object value = propertyInfo.GetValue(request);
                    if (value == null) continue;

                    if (value is IEnumerable enumerable && !(value is string))
                    {
                        var items = enumerable.Cast<object>().ToList();
                        if (items.Any())
                        {
                            var paramNames = new List<string>();
                            for (int i = 0; i < items.Count; i++)
                            {
                                string paramName = $"@{propertyName}_{i}";
                                paramNames.Add(paramName);
                                parameters.Add(paramName, items[i]);
                            }
                            whereConditions.Add($"{columnName} IN ({string.Join(", ", paramNames)})");
                        }
                        else
                        {
                            // Optional: exclude everything if list is empty
                            whereConditions.Add("1 = 0");
                        }
                    }
                    else
                    {
                        string paramName = $"@{propertyName}";
                        whereConditions.Add($"({columnName} = {paramName} OR {paramName} IS NULL)");
                        parameters.Add(paramName, value);
                    }
                }

                // Apply WHERE clause if any conditions exist
                if (whereConditions.Any())
                {
                    query += " WHERE " + string.Join(" AND ", whereConditions);
                }

                // Run the query and get the result as DataTable
                DataTable reportDataTable = DatabaseHelper.FillDataTable(query, parameters);

                // Render the Crystal Report
                return CrystalReportFacade.RenderReport(
                    $"~/{reportPath}",
                    $"{reportFileName}.rpt",
                    $"{exportFileName}.pdf",
                    reportDataTable,
                    logoName,
                    lang);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error generating report: {ex.Message}", ex);
            }
        }
    }
}