using System.Net;
using System.Text;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Contracts.Files.Models;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class CrystalReportInspectorClientTests
{
    [Fact]
    public async Task InspectAsync_SendsEntityKey_AndReturnsCurrentContractEvidence()
    {
        using var httpClient = CreateHttpClient(new CallbackHandler(request =>
        {
            var multipart = Assert.IsType<MultipartFormDataContent>(request.Content);
            Assert.Contains(multipart, part =>
                string.Equals(part.Headers.ContentDisposition?.Name?.Trim('"'), "entityKey", StringComparison.Ordinal));
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(
                    "{\"isValid\":true,\"title\":\"Countries\",\"subject\":null," +
                    "\"hasSavedData\":false,\"hasEmbeddedCredentials\":false," +
                    "\"subreportCount\":0,\"contractSchemaVersion\":1," +
                    "\"contractFingerprint\":\"" + new string('a', 64) + "\",\"failure\":0}",
                    Encoding.UTF8,
                    "application/json")
            });
        }));
        var client = CreateClient(httpClient);

        var result = await client.InspectAsync("countries", CreateUpload(), CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result.IsValid);
        Assert.Equal(1, result.ContractSchemaVersion);
        Assert.Equal(new string('a', 64), result.ContractFingerprint);
        Assert.Equal(CrystalReportInspectionFailure.None, result.Failure);
    }

    [Fact]
    public async Task InspectAsync_MapsRuntimeSchemaMismatchWithoutLeakingDetails()
    {
        using var httpClient = CreateHttpClient(new CallbackHandler(_ => Task.FromResult(
            new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent(
                    "{\"code\":\"crystal_runtime_schema_mismatch\",\"message\":\"internal detail\"}",
                    Encoding.UTF8,
                    "application/json")
            })));
        var client = CreateClient(httpClient);

        var result = await client.InspectAsync("countries", CreateUpload(), CancellationToken.None);

        Assert.NotNull(result);
        Assert.False(result.IsValid);
        Assert.Equal(CrystalReportInspectionFailure.SchemaMismatch, result.Failure);
        Assert.Equal("Crystal runtime rejected the report.", result.ValidationReason);
    }

    [Fact]
    public async Task InspectAsync_ReturnsUnavailableForMalformedRuntimeJson()
    {
        using var httpClient = CreateHttpClient(new CallbackHandler(_ => Task.FromResult(
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("{not-json", Encoding.UTF8, "application/json")
            })));
        var client = CreateClient(httpClient);

        var result = await client.InspectAsync("countries", CreateUpload(), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task InspectAsync_RejectsOversizedChunkedResponseWhileStreaming()
    {
        var payload = Encoding.UTF8.GetBytes(
            "{\"isValid\":true,\"title\":\"Countries\",\"subject\":null," +
            "\"hasSavedData\":false,\"hasEmbeddedCredentials\":false,\"subreportCount\":0}");
        using var httpClient = CreateHttpClient(new CallbackHandler(_ => Task.FromResult(
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StreamingContent(payload)
            })));
        var client = CreateClient(httpClient, maxInspectionResponseSizeBytes: 16);

        var result = await client.InspectAsync("countries", CreateUpload(), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task InspectAsync_WhenRuntimeIsDisabled_DoesNotSendHttpRequest()
    {
        var handler = new CallbackHandler(_ =>
            throw new InvalidOperationException("The disabled runtime must not send HTTP requests."));
        using var httpClient = CreateHttpClient(handler);
        var client = new CrystalReportInspectorClient(
            httpClient,
            Options.Create(new CrystalReportStorageOptions { RuntimeEnabled = false }),
            new TestExecutionContext("crystal-test-correlation"),
            NullLogger<CrystalReportInspectorClient>.Instance);

        var result = await client.InspectAsync("countries", CreateUpload(), CancellationToken.None);

        Assert.Null(result);
    }

    private static FileUpload CreateUpload()
    {
        var bytes = Encoding.ASCII.GetBytes("managed-rpt");
        return new FileUpload(
            "Countries.rpt",
            "application/octet-stream",
            bytes.Length,
            () => new MemoryStream(bytes, writable: false));
    }

    private static HttpClient CreateHttpClient(HttpMessageHandler handler) => new(handler)
    {
        BaseAddress = new Uri("https://crystal.test/")
    };

    private static CrystalReportInspectorClient CreateClient(
        HttpClient httpClient,
        long maxInspectionResponseSizeBytes = 1024) =>
        new(
            httpClient,
            Options.Create(new CrystalReportStorageOptions
            {
                RuntimeEnabled = true,
                RuntimeBaseUrl = "https://crystal.test/",
                MaxInspectionResponseSizeBytes = maxInspectionResponseSizeBytes
            }),
            new TestExecutionContext("crystal-test-correlation"),
            NullLogger<CrystalReportInspectorClient>.Instance);

    private sealed class TestExecutionContext(string correlationId) : ICurrentExecutionContext
    {
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
        public string? CorrelationId => correlationId;
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
