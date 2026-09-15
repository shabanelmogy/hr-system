using ErpSystem.Modules.Reporting.Application.Features.Analytics.Exporting.Services;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.Exporting;

public sealed record GenerateExcelExportQuery(
    List<Dictionary<string, object>> Data,
    string Culture) : IQuery<byte[]>;

public sealed record GenerateCsvExportQuery(List<Dictionary<string, object>> Data) : IQuery<byte[]>;

public sealed record GeneratedPdfExport(byte[] Content, string DownloadFileName);

public sealed record GeneratePdfExportQuery(
    List<Dictionary<string, object>> Data,
    string FileName,
    string ReportHead,
    string Culture) : IQuery<GeneratedPdfExport>;

public sealed class GenerateExcelExportQueryHandler(IExportExcelService exporter)
    : IQueryHandler<GenerateExcelExportQuery, byte[]>
{
    public Task<byte[]> Handle(GenerateExcelExportQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(exporter.ExportToExcelBytes(query.Data, "Sheet1", query.Culture));
}

public sealed class GenerateCsvExportQueryHandler(IExportExcelService exporter)
    : IQueryHandler<GenerateCsvExportQuery, byte[]>
{
    public Task<byte[]> Handle(GenerateCsvExportQuery query, CancellationToken cancellationToken) =>
        Task.FromResult(exporter.ExportToCsvBytes(query.Data));
}

public sealed class GeneratePdfExportQueryHandler(
    IExportPdfFileService exporter,
    TimeProvider timeProvider)
    : IQueryHandler<GeneratePdfExportQuery, GeneratedPdfExport>
{
    public Task<GeneratedPdfExport> Handle(
        GeneratePdfExportQuery query,
        CancellationToken cancellationToken)
    {
        var content = exporter.CreatePDF(query.Data, query.FileName, query.ReportHead, query.Culture);
        var date = timeProvider.GetUtcNow().UtcDateTime.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        return Task.FromResult(new GeneratedPdfExport(content, $"{query.FileName}_{date}.pdf"));
    }
}
