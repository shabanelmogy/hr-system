using System.Text.Json;
using System.Xml.Linq;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

if (args.Length != 3 || !Uri.TryCreate(args[1], UriKind.Absolute, out var baseUrl) ||
    !baseUrl.IsLoopback || baseUrl.UserInfo.Length != 0)
    throw new ArgumentException("Expected isolated runtime site directory, loopback URL and result JSON path.");

var stage = Path.GetFullPath(args[0]);
var folder = Path.Combine(stage, "Reports", "Countries");
var files = new[]
{
    "Countries.RuntimeVerificationFixture.rpt",
    "Countries.RuntimeVerificationOversize.rpt",
    "\u0645.rpt"
}.Select(name => Path.Combine(folder, name)).ToArray();
if (files.Any(File.Exists))
    throw new InvalidOperationException("Refusing to replace existing verification files.");

var key = XDocument.Load(Path.Combine(stage, "Web.config")).Descendants("add")
    .Single(element => (string?)element.Attribute("key") == "InternalApiKey").Attribute("value")?.Value;
if (string.IsNullOrWhiteSpace(key))
    throw new InvalidOperationException("Use a privately configured isolated runtime site.");

var previousKey = Environment.GetEnvironmentVariable("CRYSTAL_REPORT_INTERNAL_API_KEY");
Environment.SetEnvironmentVariable("CRYSTAL_REPORT_INTERNAL_API_KEY", null);
try
{
    await File.WriteAllBytesAsync(files[0], [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);
    using (var large = File.Create(files[1]))
        large.SetLength(11L * 1024 * 1024);
    await File.WriteAllTextAsync(files[2], "unaddressable-name metadata fixture");

    using var http = new HttpClient(new HttpClientHandler { AllowAutoRedirect = false })
    {
        BaseAddress = baseUrl,
        Timeout = TimeSpan.FromSeconds(30)
    };
    var client = new CrystalReportDeploymentSourceClient(
        http,
        Options.Create(new CrystalReportStorageOptions
        {
            RuntimeEnabled = true,
            RuntimeBaseUrl = baseUrl.AbsoluteUri,
            RuntimeApiKey = key
        }),
        new TestContext(),
        NullLogger<CrystalReportDeploymentSourceClient>.Instance);
    var entries = await client.ListAsync("countries", CancellationToken.None);
    if (entries is null || entries.Count != 2 || entries.Count(entry => entry.IsImportable) != 1)
        throw new InvalidOperationException("Mixed catalog interoperability failed.");

    var rejected = entries.Single(entry => !entry.IsImportable);
    if (rejected.Size != 11L * 1024 * 1024)
        throw new InvalidOperationException("Rejected metadata was altered.");
    var rejectedDownload = await client.DownloadAsync(rejected.SourceId, new string('a', 64), CancellationToken.None);
    if (rejectedDownload.IsSuccess)
        throw new InvalidOperationException("Rejected source became downloadable.");

    var valid = entries.Single(entry => entry.IsImportable);
    var validDownload = await client.DownloadAsync(valid.SourceId, valid.Sha256, CancellationToken.None);
    if (!validDownload.IsSuccess || validDownload.File is null)
        throw new InvalidOperationException("Approved source hash download failed.");

    await File.WriteAllTextAsync(args[2], JsonSerializer.Serialize(new
    {
        DateUtc = DateTime.UtcNow,
        CurrentNet10ClientToActualNet48Iis = true,
        MixedCatalogCount = entries.Count,
        ImportableCount = 1,
        RejectedOversizeMetadataPreserved = true,
        UnaddressableFilenameOmitted = true,
        RejectedSourceDownloadDenied = true,
        ValidSourceHashDownloadPassed = true,
        SyntheticMetadataFixturesOnly = true,
        NativeRenderAttempted = false,
        Passed = true
    }, new JsonSerializerOptions { WriteIndented = true }));
    Console.WriteLine("Actual .NET10 client -> .NET48 IIS: mixed catalog, rejected source denial and approved hash download passed.");
}
finally
{
    foreach (var file in files)
        if (File.Exists(file))
            File.Delete(file);
    Environment.SetEnvironmentVariable("CRYSTAL_REPORT_INTERNAL_API_KEY", previousKey);
}

sealed class TestContext : ICurrentExecutionContext
{
    public string? UserId => null;
    public string? TenantId => null;
    public int? CompanyId => null;
}
