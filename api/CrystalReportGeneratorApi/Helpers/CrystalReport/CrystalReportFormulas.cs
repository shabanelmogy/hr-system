using CrystalDecisions.ReportAppServer.DataDefModel;
using CrystalDecisions.ReportAppServer.ClientDoc;
using CrystalDecisions.CrystalReports.Engine;
using System.Collections.Generic;
using System;

namespace CrystalReportGeneratorApi.Helpers.CrystalReport
{
    public static class CrystalReportFormulas
    {
        public static void AddOrUpdateFormulas(ReportDocument rpt, string imagePath, string lang)
        {
            string GetFormula(string key) => CrystalReportInfo.GetLocalizedPattern(key, lang);

            var formulaValues = new Dictionary<string, string>
                {
                    { "Id", $"{GetFormula("Id")}" },
                    { "NameAr", $"{GetFormula("NameAr")}" },
                    { "NameEn", $"{GetFormula("NameEn")}" },
                    { "CreatedOn", $"{GetFormula("CreatedOn")}" },
                    { "LogoPath", $"{imagePath}" }
                };

            foreach (var kv in formulaValues)
            {
                try
                {
                    Console.WriteLine($"Adding formula {kv.Key} with value: {kv.Value}");
                    AddFormulaViaRAS(rpt, kv.Key, kv.Value);
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"❌ Error adding formula {kv.Key}: {ex.Message}");
                }
            }
        }

        public static void AddFormulaViaRAS(ReportDocument rpt, string formulaName, string formulaText)
        {
            if (rpt == null) return;

            try
            {
                ISCDReportClientDocument rasDoc = rpt.ReportClientDocument;

                FormulaField newFormula = new FormulaField
                {
                    Name = formulaName,
                    Text = formulaText,
                    Syntax = CrFormulaSyntaxEnum.crFormulaSyntaxCrystal
                };
                try
                {
                    rasDoc.DataDefController.FormulaFieldController.Add(newFormula);
                }
                catch
                {
                    rpt.DataDefinition.FormulaFields[newFormula.Name].Text = newFormula.Text;
                }

                // لحفظ التعديلات
                rasDoc.Save();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error adding formula via RAS: {ex.Message}");
            }
        }

    }
}