using System.Net;
using System.Net.Http.Headers;
using System.Text;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;
using HrManagementSystem.Infrastructure.Features.Analytics.CrystalReports.Storage;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace HrManagementSystem.Tests;

public sealed class CrystalReportRendererClientTests
{
    [Fact]
    public async Task RenderAsync_SendsManagedIdentityAndSource_AndReturnsPdf()
    {
        var handler = new CallbackHandler(async request =>
        {
            Assert.Equal("/internal/reports/render", request.RequestUri?.AbsolutePath);
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
            new HttpResponseMessage(HttpStatusCode.BadRequest))))
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

    private static CrystalReportRendererClient CreateClient(HttpClient httpClient) =>
        new(
            httpClient,
            Options.Create(new CrystalReportStorageOptions
            {
                InspectorBaseUrl = "https://crystal.test/",
                MaxRuntimeDataSizeBytes = 1024,
                MaxRenderedFileSizeBytes = 1024
            }),
            NullLogger<CrystalReportRendererClient>.Instance);

    private sealed class CallbackHandler(
        Func<HttpRequestMessage, Task<HttpResponseMessage>> callback) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request, CancellationToken cancellationToken) => callback(request);
    }
}
