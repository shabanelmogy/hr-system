using System.Net;
using System.Net.Http.Headers;
using System.Text;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Storage;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Reporting.Tests;

public sealed class CrystalReportRendererClientTests
{
    [Fact]
    public async Task RenderAsync_SendsManagedIdentityAndSource_AndReturnsPdf()
    {
        var handler = new CallbackHandler(async request =>
        {
            Assert.Equal("/internal/reports/render", request.RequestUri?.AbsolutePath);
            Assert.Equal("crystal-test-correlation", request.Headers.GetValues("X-Correlation-ID").Single());
            Assert.True(request.Content?.Headers.ContentType?.MediaType?
                .StartsWith("multipart/form-data", StringComparison.OrdinalIgnoreCase));
            var payload = await request.Content!.ReadAsStringAsync();
            Assert.Contains("countries", payload, StringComparison.Ordinal);
            Assert.Contains("CountryEn", payload, StringComparison.Ordinal);
            Assert.DoesNotContain("ReportPath", payload, StringComparison.OrdinalIgnoreCase);

            var response = new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new ByteArrayContent(Encoding.ASCII.GetBytes("%PDF-1.7 managed"))
            };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
            return response;
        });
        using var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://crystal.test/")
        };
        var client = CreateClient(httpClient);
        await using var source = new MemoryStream(Encoding.ASCII.GetBytes("managed-rpt"));

        var result = await client.RenderAsync(new CrystalReportRuntimeRequest(
            "countries", "countries", "Countries.rpt", source.Length, source, "en",
            "<ReportData><CountryEn>Egypt</CountryEn></ReportData>"),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("application/pdf", result.Report?.ContentType);
        Assert.Equal("countries.pdf", result.Report?.FileName);
        await result.Report!.Content.DisposeAsync();
    }

    [Fact]
    public async Task RenderAsync_MapsRejectedRuntimeProfile_ToUnsupportedEntity()
    {
        using var httpClient = new HttpClient(new CallbackHandler(_ => Task.FromResult(
            new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent(
                    "{\"code\":\"crystal_runtime_unsupported_profile\",\"message\":\"Unsupported.\"}",
                    Encoding.UTF8,
                    "application/json")
            })))
        {
            BaseAddress = new Uri("https://crystal.test/")
        };
        var client = CreateClient(httpClient);
        await using var source = new MemoryStream(Encoding.ASCII.GetBytes("managed-rpt"));

        var result = await client.RenderAsync(new CrystalReportRuntimeRequest(
            "districts", "districts", "Districts.rpt", source.Length, source, "en",
            "<ReportData />"), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(CrystalReportRenderFailure.UnsupportedEntity, result.Failure);
    }

    [Fact]
    public async Task RenderAsync_DoesNotCollapseEveryBadRequest_ToUnsupportedEntity()
    {
        using var httpClient = new HttpClient(new CallbackHandler(_ => Task.FromResult(
            new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent(
                    "{\"code\":\"crystal_runtime_invalid_report\",\"message\":\"Invalid report.\"}",
                    Encoding.UTF8,
                    "application/json")
            })))
        {
            BaseAddress = new Uri("https://crystal.test/")
        };
        var client = CreateClient(httpClient);
        await using var source = new MemoryStream(Encoding.ASCII.GetBytes("managed-rpt"));

        var result = await client.RenderAsync(new CrystalReportRuntimeRequest(
            "countries", "countries", "Countries.rpt", source.Length, source, "en",
            "<ReportData />"), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(CrystalReportRenderFailure.InvalidReport, result.Failure);
    }

    [Fact]
    public async Task RenderAsync_RejectsOversizedChunkedPdfWhileStreaming()
    {
        var payload = Encoding.ASCII.GetBytes("%PDF-1.7-payload-beyond-limit");
        using var httpClient = new HttpClient(new CallbackHandler(_ => Task.FromResult(
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StreamingContent(payload)
            })))
        {
            BaseAddress = new Uri("https://crystal.test/")
        };
        var client = CreateClient(httpClient, maxRenderedFileSizeBytes: 8);
        await using var source = new MemoryStream(Encoding.ASCII.GetBytes("managed-rpt"));

        var result = await client.RenderAsync(new CrystalReportRuntimeRequest(
            "countries", "countries", "Countries.rpt", source.Length, source, "en",
            "<ReportData><CountryEn>Egypt</CountryEn></ReportData>"),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(CrystalReportRenderFailure.RuntimeUnavailable, result.Failure);
    }

    [Fact]
    public async Task RenderAsync_WhenRuntimeIsDisabled_DoesNotSendHttpRequest()
    {
        var handler = new CallbackHandler(_ =>
            throw new InvalidOperationException("The disabled runtime must not send HTTP requests."));
        using var httpClient = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://crystal.test/")
        };
        var client = new CrystalReportRendererClient(
            httpClient,
            Options.Create(new CrystalReportStorageOptions
            {
                RuntimeEnabled = false,
                MaxRuntimeDataSizeBytes = 1024
            }),
            new TestExecutionContext("crystal-test-correlation"),
            NullLogger<CrystalReportRendererClient>.Instance);
        await using var source = new MemoryStream(Encoding.ASCII.GetBytes("managed-rpt"));

        var result = await client.RenderAsync(new CrystalReportRuntimeRequest(
            "countries", "countries", "Countries.rpt", source.Length, source, "en",
            "<ReportData />"), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(CrystalReportRenderFailure.RuntimeUnavailable, result.Failure);
    }

    private static CrystalReportRendererClient CreateClient(
        HttpClient httpClient,
        long maxRenderedFileSizeBytes = 1024) =>
        new(
            httpClient,
            Options.Create(new CrystalReportStorageOptions
            {
                RuntimeEnabled = true,
                RuntimeBaseUrl = "https://crystal.test/",
                MaxRuntimeDataSizeBytes = 1024,
                MaxRenderedFileSizeBytes = maxRenderedFileSizeBytes
            }),
            new TestExecutionContext("crystal-test-correlation"),
            NullLogger<CrystalReportRendererClient>.Instance);

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
            HttpRequestMessage request, CancellationToken cancellationToken) => callback(request);
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

