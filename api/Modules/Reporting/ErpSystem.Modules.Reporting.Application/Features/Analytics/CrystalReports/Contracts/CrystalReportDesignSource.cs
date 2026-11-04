namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

public sealed record CrystalReportDesignSource(
    string SourceKey,
    string ModuleKey,
    string Scope,
    string TableName,
    int MaxRows,
    IReadOnlyList<CrystalReportDesignColumn> Columns,
    IReadOnlyList<string> Filters,
    IReadOnlyList<CrystalReportDesignParameter> Parameters,
    int ContractSchemaVersion,
    string ContractFingerprint);

public sealed record CrystalReportDesignColumn(string Name, string Type, bool Nullable);

public sealed record CrystalReportDesignParameter(
    string Name, string Type, bool Required, bool AllowMultipleValues,
    bool DiscreteOnly, IReadOnlyList<string> AllowedValues);
