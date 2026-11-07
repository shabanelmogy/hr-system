using ErpSystem.Modules.Reporting.Application.Features.Analytics.Exporting.Services;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.Exporting;

public sealed record GenerateTabularExportQuery(
    List<Dictionary<string, object>> Data,
    string Format,
    string FileName,
    string Culture) : IQuery<GeneratedTabularExport>;

public sealed record GeneratedTabularExport(byte[] Content, string ContentType, string FileName);

public sealed class GenerateTabularExportValidator : AbstractValidator<GenerateTabularExportQuery>
{
    public GenerateTabularExportValidator()
    {
        RuleFor(request => request.Data).Must(TabularExportData.IsValid)
            .WithMessage("Export requires a bounded table of scalar values.").WithErrorCode("Export.InvalidData");
        RuleFor(request => request.Format).Must(format => format is "xlsx" or "csv")
            .WithMessage("Choose Excel or CSV.").WithErrorCode("Export.InvalidFormat");
        RuleFor(request => request.Culture).Must(culture => culture is "en" or "ar")
            .WithMessage("Choose English or Arabic.").WithErrorCode("Export.InvalidCulture");
        RuleFor(request => request.FileName).Must((request, name) => TabularExportData.IsSafeFileName(name, request.Format))
            .WithMessage("Choose a safe export file name.").WithErrorCode("Export.InvalidFileName");
    }
}

public sealed class GenerateTabularExportHandler(IExportExcelService exporter)
    : IQueryHandler<GenerateTabularExportQuery, GeneratedTabularExport>
{
    public Task<GeneratedTabularExport> Handle(GenerateTabularExportQuery request, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var csv = request.Format == "csv";
        return Task.FromResult(new GeneratedTabularExport(
            csv ? exporter.ExportToCsvBytes(request.Data) : exporter.ExportToExcelBytes(request.Data, "Sheet1", request.Culture),
            csv ? "text/csv; charset=utf-8" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            request.FileName.EndsWith('.' + request.Format, StringComparison.OrdinalIgnoreCase)
                ? request.FileName : request.FileName + '.' + request.Format));
    }
}
