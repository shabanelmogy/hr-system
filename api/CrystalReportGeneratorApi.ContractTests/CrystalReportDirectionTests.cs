using System;
using System.Reflection;

namespace CrystalReportGeneratorApi.ContractTests
{
    internal static class CrystalReportDirectionTests
    {
        public static void Run(Assembly runtime)
        {
            var direction = runtime.GetType("CrystalReportGeneratorApi.Runtime.Rendering.CrystalReportDirection");
            Require(direction != null, "The render pipeline is missing the historical report direction stage.");
            var apply = direction.GetMethod("Apply", BindingFlags.Public | BindingFlags.Static);
            Require(apply != null, "The shared direction stage must expose Apply.");
            var renderer = runtime.GetType("CrystalReportGeneratorApi.Runtime.Rendering.CrystalReportRenderService", true);
            var render = renderer.GetMethod("Render");
            var export = renderer.GetMethod("ExportPdf", BindingFlags.NonPublic | BindingFlags.Static);
            var bytes = render.GetMethodBody().GetILAsByteArray();
            var directionCall = FindCall(bytes, apply.MetadataToken);
            var exportCall = FindCall(bytes, export.MetadataToken);
            Require(directionCall >= 0 && exportCall > directionCall,
                "Each render must apply shared report direction before exporting PDF.");

            var geometry = runtime.GetType("CrystalReportGeneratorApi.Runtime.Rendering.CrystalReportDirectionGeometry", true);
            var position = geometry.GetMethod("LeftForLanguage", BindingFlags.Public | BindingFlags.Static);
            var mirrorLine = geometry.GetMethod("ShouldMirrorLine", BindingFlags.Public | BindingFlags.Static);
            Require(position != null && mirrorLine != null, "Axis-aligned lines must mirror without suppressing them.");

            // Coordinates are manually calculated in SDK twips for a 10000-twip canvas.
            // The first/last fixtures represent matching column headers and detail fields.
            VerifyPosition(position, "ar", 400, 1000, 400);
            VerifyPosition(position, "en", 400, 1000, 8600);
            VerifyPosition(position, "EN", 400, 1000, 8600);
            VerifyPosition(position, "ar", 7400, 1800, 7400);
            VerifyPosition(position, "en", 7400, 1800, 800);
            VerifyPosition(position, "en", 0, 10000, 0);
            VerifyPosition(position, "en", 600, 0, 9400);
            VerifyPosition(position, "en", 8600, 1000, 400);

            VerifyLine(mirrorLine, "en", 700, 700, 100, 900, true);
            VerifyLine(mirrorLine, "EN", 700, 700, 100, 900, true);
            VerifyLine(mirrorLine, "ar", 700, 700, 100, 900, false);
            VerifyLine(mirrorLine, "en", 700, 1700, 100, 100, true);
            VerifyLine(mirrorLine, "en", 700, 1700, 100, 900, false);
            // A vertical line can end at the same Y in a different section.
            VerifyLine(mirrorLine, "en", 700, 700, 100, 100, true);
            Console.WriteLine("Direction regression passed: pre-export wiring and 14 language/geometry cases; native verification is a separate SDK gate.");
        }

        private static void VerifyLine(MethodInfo method, string language,
            int left, int right, int top, int bottom, bool expected)
        {
            var actual = (bool)method.Invoke(null, new object[] { language, left, right, top, bottom });
            Require(actual == expected, "Unexpected " + language + " line-mirroring policy.");
        }

        private static void VerifyPosition(MethodInfo method, string language, int left, int width, int expected)
        {
            var actual = (int)method.Invoke(null, new object[] { language, 10000f, left, width });
            Require(actual == expected,
                "Unexpected " + language + " layout position for left=" + left + ", width=" + width);
        }

        private static int FindCall(byte[] bytes, int token)
        {
            var operand = BitConverter.GetBytes(token);
            for (var index = 0; index <= bytes.Length - 5; index++)
            {
                if (bytes[index] == 0x28 && bytes[index + 1] == operand[0] &&
                    bytes[index + 2] == operand[1] && bytes[index + 3] == operand[2] && bytes[index + 4] == operand[3])
                    return index;
            }
            return -1;
        }

        private static void Require(bool condition, string message)
        {
            if (!condition) throw new InvalidOperationException(message);
        }
    }
}
