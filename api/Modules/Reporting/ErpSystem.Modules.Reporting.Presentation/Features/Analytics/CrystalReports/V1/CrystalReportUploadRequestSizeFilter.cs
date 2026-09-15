using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;

namespace ErpSystem.Modules.Reporting.Presentation.Features.Analytics.CrystalReports.V1;

/// <summary>
/// Applies the Crystal upload body limit before form/model binding buffers the multipart request.
/// The small overhead allowance covers multipart headers and form fields, not a second report file.
/// </summary>
public sealed class CrystalReportUploadRequestSizeFilter(IConfiguration configuration) : IAsyncResourceFilter
{
    private const long DefaultMaximumReportBytes = 10L * 1024L * 1024L;
    private const long MultipartOverheadAllowanceBytes = 1024L * 1024L;
    private const long AbsoluteMaximumRequestBytes = 51L * 1024L * 1024L;

    public async Task OnResourceExecutionAsync(
        ResourceExecutingContext context,
        ResourceExecutionDelegate next)
    {
        var configured = configuration.GetValue<long?>("CrystalReports:MaxFileSizeBytes")
            ?? DefaultMaximumReportBytes;
        var maximumRequestBytes = Math.Min(
            checked(Math.Max(1, configured) + MultipartOverheadAllowanceBytes),
            AbsoluteMaximumRequestBytes);

        if (context.HttpContext.Request.ContentLength is > 0 and var contentLength &&
            contentLength > maximumRequestBytes)
        {
            context.Result = new StatusCodeResult(StatusCodes.Status413PayloadTooLarge);
            return;
        }

        var requestSizeFeature = context.HttpContext.Features.Get<IHttpMaxRequestBodySizeFeature>();
        if (requestSizeFeature is { IsReadOnly: false })
            requestSizeFeature.MaxRequestBodySize = maximumRequestBytes;

        await next();
    }
}
