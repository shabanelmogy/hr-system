using CrystalDecisions.CrystalReports.Engine;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace CrystalReportGeneratorApi.Helpers.CrystalReport
{
    public static class CrystalReportLister
    {
        public static List<ReportInfo> GetReportTitlesInFolder(string subFolderPath, string reportCategory)
        {
            List<ReportInfo> reports = new List<ReportInfo>();
            string folderPath = System.Web.Hosting.HostingEnvironment.MapPath(subFolderPath);

            if (folderPath == null || !Directory.Exists(folderPath))
                throw new DirectoryNotFoundException($"The folder path '{subFolderPath}' could not be resolved.");

            string[] reportFiles = Directory.GetFiles(folderPath, "*.rpt", SearchOption.AllDirectories);

            foreach (string file in reportFiles)
            {
                // Get file from path
                string fileName = Path.GetFileName(file);

                // Check if file contains report category
                if (!fileName.Contains(reportCategory))
                    continue;

                ReportDocument report = new ReportDocument();
                try
                {
                    report.Load(file);
                    string reportTitle = CrystalReportInfo.GetReportTitle(report);
                    string reportSubject = CrystalReportInfo.GetReportSubject(report);
                    string fileNameWithoutExtension = Path.GetFileNameWithoutExtension(file);

                    // Extract just the Reports\Category part from the file path
                    string relativePath = ExtractRelativePath(file, "Reports");

                    reports.Add(new ReportInfo
                    {
                        Id = fileNameWithoutExtension,
                        Title = reportTitle,
                        Subject = reportSubject,
                        ReportPath = relativePath,
                        Category = reportCategory
                    });
                }
                catch (Exception ex)
                {
                    // Log error but continue processing other reports
                    System.Diagnostics.Debug.WriteLine($"Error loading report {file}: {ex.Message}");
                }
                finally
                {
                    report.Close();
                    report.Dispose();
                }
            }

            return reports;
        }

        private static string ExtractRelativePath(string fullPath, string startFolder)
        {
            int index = fullPath.IndexOf(startFolder, StringComparison.OrdinalIgnoreCase);
            if (index >= 0)
            {
                // Get the substring starting from the startFolder
                string relativePath = fullPath.Substring(index);

                // Remove the filename part, keeping only the directory path
                string directoryPath = Path.GetDirectoryName(relativePath);

                // Replace backslashes with forward slashes
                return directoryPath.Replace("\\", "/");
            }

            // Fallback if "Reports" folder is not found in the path
            string fallbackPath = Path.GetDirectoryName(fullPath);
            return fallbackPath.Replace("\\", "/");
        }
    }
}