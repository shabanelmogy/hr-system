using Newtonsoft.Json;
using System;
using System.Collections;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Web.Http;
using System.Web.Http.Dispatcher;

namespace CrystalReportGeneratorApi.ContractTests
{
    internal static class RuntimeBoundaryTests
    {
        private const string KeyVariable = "CRYSTAL_REPORT_INTERNAL_API_KEY";
        private const string FixtureKey = "isolated-runtime-boundary-fixture";

        public static void Run(Assembly runtime)
        {
            VerifyCatalog(runtime);
            var previous = Environment.GetEnvironmentVariable(KeyVariable);
            try
            {
                Environment.SetEnvironmentVariable(KeyVariable, FixtureKey);
                using (var config = new HttpConfiguration())
                {
                    runtime.GetType("CrystalReportGeneratorApi.WebApiConfig", true)
                        .GetMethod("Register").Invoke(null, new object[] { config });
                    var assemblies = config.Services.GetAssembliesResolver().GetAssemblies();
                    Require(assemblies.Count == 1 && assemblies.Single() == runtime,
                        "Only the current runtime assembly may supply controllers.");
                    using (var server = new HttpServer(config))
                    using (var http = new HttpClient(server) { BaseAddress = new Uri("https://runtime.test/") })
                    {
                        foreach (var route in new[] { "catalog", "health", "inspect", "render", "verify-database" })
                        {
                            VerifyDenied(http, route, null, HttpStatusCode.Unauthorized);
                            VerifyDenied(http, route, "incorrect", HttpStatusCode.Unauthorized);
                            VerifyDenied(http, route, FixtureKey + "," + FixtureKey, HttpStatusCode.Unauthorized);
                        }
                        foreach (var route in new[] { "inspect", "render", "verify-database" })
                        {
                            using (var request = Request(route, FixtureKey))
                            using (var response = http.SendAsync(request).GetAwaiter().GetResult())
                                Require(response.StatusCode == HttpStatusCode.UnsupportedMediaType,
                                    "Authorized requests must reach multipart validation.");
                        }
                        VerifyRenderFailure(http, "countries", "<Root><ReportData><Wrong>value</Wrong></ReportData></Root>",
                            "crystal_runtime_schema_mismatch");
                        VerifyRenderFailure(http, "unknown", "<Root><ReportData><Wrong>value</Wrong></ReportData></Root>",
                            "crystal_runtime_unsupported_profile");
                        Environment.SetEnvironmentVariable(KeyVariable, null);
                        VerifyDenied(http, "catalog", null, HttpStatusCode.ServiceUnavailable);
                    }
                }
            }
            finally
            {
                Environment.SetEnvironmentVariable(KeyVariable, previous);
            }
            Console.WriteLine("Runtime boundary: catalog normalization/oversize and 16 actual HTTP authorization cases passed.");
            Console.WriteLine("Render boundary: schema mismatch and unsupported entity retain distinct HTTP400 codes before native execution.");
        }

        private static void VerifyCatalog(Assembly runtime)
        {
            var root = Path.Combine(Path.GetTempPath(), "erp-crystal-contract-" + Guid.NewGuid().ToString("N"));
            var countries = Path.Combine(root, "Countries");
            Directory.CreateDirectory(countries);
            try
            {
                File.WriteAllBytes(Path.Combine(countries, "Countries.rpt"),
                    new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 });
                using (var large = File.Create(Path.Combine(countries, "Countries.Large.rpt")))
                    large.SetLength(11L * 1024 * 1024);
                File.WriteAllText(Path.Combine(countries, "\u0645.rpt"), "invalid identity fixture");
                var type = runtime.GetType("CrystalReportGeneratorApi.Runtime.Catalog.CrystalReportCatalogService", true);
                var constructor = type.GetConstructor(BindingFlags.NonPublic | BindingFlags.Instance,
                    null, new[] { typeof(Func<string>) }, null);
                Require(constructor != null, "Catalog filesystem boundary must remain injectable internally.");
                var service = constructor.Invoke(new object[] { new Func<string>(() => root) });
                var entries = ((IEnumerable)type.GetMethod("List").Invoke(service, new object[] { "countries" }))
                    .Cast<object>().Select(value => JsonConvert.DeserializeObject<CatalogEntry>(JsonConvert.SerializeObject(value)))
                    .ToArray();
                Require(entries.Length == 2, "Unaddressable filename must not poison catalog descriptors.");
                Require(entries.All(entry => entry.SourceId != null && entry.ReportKey != null),
                    "Every emitted descriptor must have an addressable identity.");
                Require(entries.Single(entry => !entry.IsImportable).Size == 11L * 1024 * 1024,
                    "Rejected descriptor must retain its actual size.");
                Require(entries.Count(entry => entry.IsImportable) == 1,
                    "Valid catalog metadata must survive rejected candidates.");
                var rejected = entries.Single(entry => !entry.IsImportable);
                try
                {
                    type.GetMethod("OpenSource").Invoke(service,
                        new object[] { rejected.SourceId, new string('a', 64) });
                    throw new InvalidOperationException("Rejected source must not be downloadable.");
                }
                catch (TargetInvocationException exception)
                {
                    Require(exception.InnerException.GetType().Name == "CrystalReportCatalogConflictException",
                        "Rejected source download must fail closed.");
                }
            }
            finally
            {
                Directory.Delete(root, true);
            }
        }

        private static HttpRequestMessage Request(string route, string key)
        {
            var post = route == "inspect" || route == "render" || route == "verify-database";
            var request = new HttpRequestMessage(post ? HttpMethod.Post : HttpMethod.Get, "internal/reports/" + route);
            if (key != null)
                request.Headers.TryAddWithoutValidation("X-Internal-Api-Key", key.Split(','));
            if (post)
                request.Content = new StringContent("non-multipart input");
            return request;
        }

        private static void VerifyDenied(HttpClient http, string route, string key, HttpStatusCode expected)
        {
            using (var request = Request(route, key))
            using (var response = http.SendAsync(request).GetAwaiter().GetResult())
                Require(response.StatusCode == expected, "Unexpected authorization status for " + route);
        }

        private static void VerifyRenderFailure(HttpClient http, string entityKey, string xml, string expectedCode)
        {
            using (var request = new HttpRequestMessage(HttpMethod.Post, "internal/reports/render"))
            using (var multipart = new MultipartFormDataContent())
            {
                request.Headers.TryAddWithoutValidation("X-Internal-Api-Key", FixtureKey);
                multipart.Add(new ByteArrayContent(new byte[] { 1 }), "file", "Fixture.rpt");
                multipart.Add(new StringContent(entityKey), "entityKey");
                multipart.Add(new StringContent("fixture"), "reportKey");
                multipart.Add(new StringContent("en"), "language");
                multipart.Add(new StringContent(xml), "data");
                request.Content = multipart;
                using (var response = http.SendAsync(request).GetAwaiter().GetResult())
                {
                    Require(response.StatusCode == HttpStatusCode.BadRequest,
                        "Render contract failures must return HTTP400 before opening the native report.");
                    var error = JsonConvert.DeserializeObject<RuntimeError>(
                        response.Content.ReadAsStringAsync().GetAwaiter().GetResult());
                    Require(error.Code == expectedCode, "Render discarded the specific failure code.");
                }
            }
        }

        private sealed class RuntimeError
        {
            public string Code { get; set; }
        }

        private static void Require(bool value, string message)
        {
            if (!value) throw new InvalidOperationException(message);
        }

        private sealed class CatalogEntry
        {
            public string SourceId { get; set; }
            public string ReportKey { get; set; }
            public long Size { get; set; }
            public bool IsImportable { get; set; }
        }
    }
}
