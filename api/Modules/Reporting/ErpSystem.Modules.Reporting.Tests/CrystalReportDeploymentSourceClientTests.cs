using System.Net;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class CrystalReportDeploymentSourceClientTests
{
    [Fact]
    public async Task ListAsync_MapsDeploymentCatalogWithoutExposingPaths()
    {
        var handler = new CallbackHandler(request =>
        {
            Assert.Equal("/internal/reports/catalog", request.RequestUri?.AbsolutePath);
            Assert.Equal("states", GetQueryValue(request.RequestUri, "entityKey"));
            Assert.Equal("crystal-test-correlation", request.Headers.GetValues("X-Correlation-ID").Single());

            const string json = """
                [{
                  "sourceId":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                  "entityKey":"states",
                  "reportKey":"states",
                  "fileName":"States.rpt",
                  "title":"States",
                  "subject":"States",
                  "size":8,
                  "sha256":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                  "lastModifiedUtc":"2026-09-14T00:00:00Z",
                  "isImportable":true,
                  "validationReason":null
                }]
                """;
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            });
        });
        using var httpClient = CreateHttpClient(handler);
        var client = CreateClient(httpClient);

        var result = await client.ListAsync("states", CancellationToken.None);

        var item = Assert.Single(result!);
        Assert.Equal("states", item.EntityKey);
        Assert.Equal("States.rpt", item.FileName);
        Assert.True(item.IsImportable);
    }

    [Fact]
    public async Task ListAsync_RejectsMalformedCatalogItemContract()
    {
        const string json = """
            [{
              "sourceId":null,
              "entityKey":"states",
              "reportKey":"states",
              "fileName":"States.rpt",
              "title":"States",
              "subject":null,
              "size":8,
              "sha256":"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
              "lastModifiedUtc":"2026-09-14T00:00:00Z",
              "isImportable":true,
              "validationReason":null
            }]
            """;
        using var httpClient = CreateHttpClient(new CallbackHandler(_ => Task.FromResult(
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            })));
        var client = CreateClient(httpClient);

        var result = await client.ListAsync(null, CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task DownloadAsync_VerifiesHashAndReturnsBoundedUpload()
    {
        var bytes = Encoding.ASCII.GetBytes("crystal-report-source");
        var expectedHash = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();
        var sourceId = new string('a', 64);
        var handler = new CallbackHandler(request =>
        {
            Assert.Equal($"/internal/reports/catalog/{sourceId}/source", request.RequestUri?.AbsolutePath);
            Assert.Equal(expectedHash, GetQueryValue(request.RequestUri, "expectedSha256"));

            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new ByteArrayContent(bytes)
            };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = "States.rpt"
            };
            return Task.FromResult(response);
        });
        using var httpClient = CreateHttpClient(handler);
        var client = CreateClient(httpClient);

        var result = await client.DownloadAsync(sourceId, expectedHash, CancellationToken.None);

        Assert.True(result.IsSuccess);
        var upload = Assert.IsType<ErpSystem.Modules.Platform.Contracts.Files.Models.FileUpload>(result.File);
        Assert.Equal("States.rpt", upload.FileName);
        Assert.Equal(bytes.Length, upload.Length);
        await using var stream = upload.OpenReadStream();
        using var memory = new MemoryStream();
        await stream.CopyToAsync(memory);
        Assert.Equal(bytes, memory.ToArray());
    }

    [Fact]
    public async Task DownloadAsync_RejectsChangedSourceHash()
    {
        var bytes = Encoding.ASCII.GetBytes("changed-source");
        var handler = new CallbackHandler(_ => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new ByteArrayContent(bytes)
        }));
        using var httpClient = CreateHttpClient(handler);
        var client = CreateClient(httpClient);

        var result = await client.DownloadAsync(
            new string('a', 64),
            new string('b', 64),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(CrystalReportDeploymentDownloadFailure.SourceChanged, result.Failure);
    }

    [Fact]
    public async Task DownloadAsync_PreservesRuntimeConflictForChangedDeploymentSource()
    {
        using var httpClient = CreateHttpClient(new CallbackHandler(_ => Task.FromResult(
            new HttpResponseMessage(HttpStatusCode.Conflict))));
        var client = CreateClient(httpClient);

        var result = await client.DownloadAsync(
            new string('a', 64),
            new string('b', 64),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(CrystalReportDeploymentDownloadFailure.SourceChanged, result.Failure);
    }

    [Fact]
    public async Task DownloadAsync_RejectsOversizedChunkedSourceWhileStreaming()
    {
        var bytes = Encoding.ASCII.GetBytes("source-beyond-configured-limit");
        using var httpClient = CreateHttpClient(new CallbackHandler(_ => Task.FromResult(
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StreamingContent(bytes)
            })));
        var client = CreateClient(httpClient, maxFileSizeBytes: 8);

        var result = await client.DownloadAsync(
            new string('a', 64),
            new string('b', 64),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(CrystalReportDeploymentDownloadFailure.Unavailable, result.Failure);
    }

    [Fact]
    public async Task ListAsync_WhenRuntimeIsDisabled_DoesNotSendHttpRequest()
    {
        var handler = new CallbackHandler(_ =>
            throw new InvalidOperationException("The disabled runtime must not send HTTP requests."));
        using var httpClient = CreateHttpClient(handler);
        var client = new CrystalReportDeploymentSourceClient(
            httpClient,
            Options.Create(new CrystalReportStorageOptions { RuntimeEnabled = false }),
            new TestExecutionContext("crystal-test-correlation"),
            NullLogger<CrystalReportDeploymentSourceClient>.Instance);

        var result = await client.ListAsync(null, CancellationToken.None);

        Assert.Null(result);
    }

    private static HttpClient CreateHttpClient(HttpMessageHandler handler) => new(handler)
    {
        BaseAddress = new Uri("https://crystal.test/")
    };

    private static CrystalReportDeploymentSourceClient CreateClient(
        HttpClient httpClient,
        long maxFileSizeBytes = 1024) =>
        new(
            httpClient,
            Options.Create(new CrystalReportStorageOptions
            {
                RuntimeEnabled = true,
                RuntimeBaseUrl = "https://crystal.test/",
                MaxFileSizeBytes = maxFileSizeBytes,
                MaxCatalogResponseSizeBytes = 1024,
                MaxDeploymentCandidates = 10
            }),
            new TestExecutionContext("crystal-test-correlation"),
            NullLogger<CrystalReportDeploymentSourceClient>.Instance);

    private sealed class TestExecutionContext(string correlationId) : ICurrentExecutionContext
    {
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
        public string? CorrelationId => correlationId;
    }

    private static string? GetQueryValue(Uri? uri, string key)
    {
        if (uri is null)
            return null;

        foreach (var pair in uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var pieces = pair.Split('=', 2);
            if (pieces.Length == 2 && string.Equals(pieces[0], key, StringComparison.Ordinal))
                return Uri.UnescapeDataString(pieces[1]);
        }

        return null;
    }

    private sealed class CallbackHandler(
        Func<HttpRequestMessage, Task<HttpResponseMessage>> callback) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken) => callback(request);
    }

    private sealed class StreamingContent(byte[] payload) : HttpContent
    {
        protected override Task SerializeToStreamAsync(Stream stream, TransportContext? context) =>
            stream.WriteAsync(payload, 0, payload.Length);

        protected override bool TryComputeLength(out long length)
        {
            length = 0;
            return false;
        }
    }
}
