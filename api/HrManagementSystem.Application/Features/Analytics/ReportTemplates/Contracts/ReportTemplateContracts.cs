namespace HrManagementSystem.Application.Features.Analytics.ReportTemplates.Contracts;

public sealed record ReportTemplateListItemResponse(
    Guid Id,
    string FeatureKey,
    string Name,
    string? Description,
    string DataSourceKey,
    int RevisionNumber,
    bool IsPublished,
    bool IsArchived,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    string RowVersion);

public sealed record ReportTemplateDetailResponse(
    Guid Id,
    string FeatureKey,
    string Name,
    string? Description,
    string DataSourceKey,
    string DefinitionJson,
    string ContentHash,
    int RevisionNumber,
    bool IsPublished,
    bool IsArchived,
    DateTime CreatedOn,
    DateTime? UpdatedOn,
    string RowVersion);

public sealed record ReportTemplateRevisionResponse(
    Guid Id,
    Guid ReportTemplateId,
    int RevisionNumber,
    string Operation,
    string Name,
    string? Description,
    string DataSourceKey,
    string DefinitionJson,
    string ContentHash,
    bool IsPublished,
    bool IsArchived,
    DateTime CreatedOn);

public sealed record ReportDataSourceDescriptorResponse(
    string Key,
    string FeatureKey,
    string DisplayName,
    string DataProvider,
    string ConnectString,
    string RelativeApiPath,
    string HttpMethod,
    bool RequiresAuthentication);

public sealed record UpdateReportTemplateRequest(
    string Name,
    string? Description,
    string DataSourceKey,
    string DefinitionJson,
    string RowVersion);

public sealed record CreateReportTemplateRequest(
    string FeatureKey,
    string Name,
    string? Description,
    string DataSourceKey,
    string DefinitionJson);

public sealed record DuplicateReportTemplateRequest(string Name);

public sealed record ReportTemplateConcurrencyRequest(string RowVersion);
