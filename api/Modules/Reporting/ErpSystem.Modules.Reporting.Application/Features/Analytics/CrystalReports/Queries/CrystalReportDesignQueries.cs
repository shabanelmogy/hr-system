using System.IO.Compression;
using System.Text;
using System.Text.Json;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

public sealed record GetGlobalCrystalReportDesignSourcesQuery : IQuery<IReadOnlyList<CrystalReportDesignSource>>;
public sealed record DownloadGlobalCrystalReportDesignerPackageQuery(string SourceKey) : IQuery<Result<CrystalReportDownload>>;

public sealed class GetGlobalCrystalReportDesignSourcesQueryHandler(
    ICrystalReportDesignSourceCatalog catalog, GlobalCrystalReportPolicy policy)
    : IQueryHandler<GetGlobalCrystalReportDesignSourcesQuery, IReadOnlyList<CrystalReportDesignSource>>
{
    public Task<IReadOnlyList<CrystalReportDesignSource>> Handle(
        GetGlobalCrystalReportDesignSourcesQuery request, CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<CrystalReportDesignSource>>(catalog.Sources
            .Where(source => source.Scope == "global" && policy.Allows(source.SourceKey)).ToArray());
}

public sealed class DownloadGlobalCrystalReportDesignerPackageQueryHandler(
    ICrystalReportDesignSourceCatalog catalog, IManagedCrystalReportSchemaSource schemas,
    GlobalCrystalReportPolicy policy, CrystalReportErrors errors)
    : IQueryHandler<DownloadGlobalCrystalReportDesignerPackageQuery, Result<CrystalReportDownload>>
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web) { WriteIndented = true };

    public Task<Result<CrystalReportDownload>> Handle(
        DownloadGlobalCrystalReportDesignerPackageQuery request, CancellationToken cancellationToken)
    {
        if (!policy.Allows(request.SourceKey, ReportingPermissions.DownloadGlobalCrystalReports))
            return Task.FromResult(Result.Failure<CrystalReportDownload>(errors.GlobalCrystalReportForbidden));
        var source = catalog.Sources.FirstOrDefault(item => item.SourceKey == request.SourceKey && item.Scope == "global");
        if (source is null)
            return Task.FromResult(Result.Failure<CrystalReportDownload>(errors.CrystalReportUnsupportedEntity));
        using var output = new MemoryStream();
        using (var archive = new ZipArchive(output, ZipArchiveMode.Create, true))
        {
            using (var schema = archive.CreateEntry(source.SourceKey + ".xsd").Open())
                schema.Write(schemas.ExportSchema(source.SourceKey));
            using (var metadata = new StreamWriter(archive.CreateEntry("source.json").Open(), Encoding.UTF8))
                metadata.Write(JsonSerializer.Serialize(source, JsonOptions));
            using var instructions = new StreamWriter(archive.CreateEntry("README.txt").Open(), Encoding.UTF8);
            instructions.Write($"""
                Crystal Designer preparation / تجهيز التصميم
                Module: {source.ModuleKey}
                Source: {source.SourceKey}
                Schema version: {source.ContractSchemaVersion}
                Fingerprint: {source.ContractFingerprint}

                1. Extract this ZIP, then create File > New > Blank Report in Crystal Designer.
                2. Database Expert > Create New Connection > ADO.NET (XML): select {source.SourceKey}.xsd.
                3. Add the {source.TableName} table; preserve all columns, types and nullability in source.json.
                4. Create the exact parameters and allowed values described in source.json.
                5. Design the report. Do not save data, credentials, SQL Command connections or subreports.
                6. Save as {source.SourceKey}-your-report.rpt; upload it to this draft as version 1.
                7. Inspect and explicitly publish after validation. Uploading never publishes automatically.

                أنشئ Blank Report في Crystal Designer واربطه بملف XSD عبر ADO.NET (XML).
                أضف الجدول والحقول والمعاملات المحددة في source.json ثم صمم التقرير واحفظ ملف RPT.
                ارفع الملف إلى المسودة ثم افحصه وانشره. هذه الحزمة لا تحتوي بيانات فعلية أو ملف RPT جاهزًا.
                The empty template is an application draft. This package contains no RPT binary or production data.
                """);
        }
        var bytes = output.ToArray();
        return Task.FromResult(Result.Success(new CrystalReportDownload(new MemoryStream(bytes, false),
            source.SourceKey + "-designer.zip", "application/zip", bytes.LongLength)));
    }
}
