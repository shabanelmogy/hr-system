#Requires -Version 7.0
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidatePattern('^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$')]
    [string]$EntityKey,

    [Parameter(Mandatory)]
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'
$contractPath = Join-Path $PSScriptRoot '../Modules/Reporting/ErpSystem.Modules.Reporting.Contracts/Features/Analytics/CrystalReports/managed-crystal-report-contracts.v1.json'
$contract = Get-Content -LiteralPath $contractPath -Raw | ConvertFrom-Json
$entities = @($contract.entities | Where-Object { $_.entityKey -ceq $EntityKey })
if ($entities.Count -ne 1) {
    throw "Entity '$EntityKey' does not have one canonical managed Crystal contract."
}

$destination = [IO.Path]::GetFullPath($OutputPath)
if ([IO.Path]::GetExtension($destination) -ine '.xsd') {
    throw 'OutputPath must have the .xsd extension.'
}
if (Test-Path -LiteralPath $destination) {
    throw 'The output already exists. Choose a new output path; existing files are never overwritten.'
}
if (-not (Test-Path -LiteralPath (Split-Path -Parent $destination) -PathType Container)) {
    throw 'The output parent directory must already exist.'
}

$entity = $entities[0]
$columnTypes = @{
    int32 = [int]
    string = [string]
    datetime = [datetime]
}
$dataSet = [Data.DataSet]::new('CrystalReportData')
try {
    $table = [Data.DataTable]::new([string]$entity.tableName)
    foreach ($column in $entity.columns) {
        if (-not $columnTypes.ContainsKey([string]$column.type)) {
            throw "The canonical column type '$($column.type)' is not supported by this schema exporter."
        }
        $dataColumn = $table.Columns.Add([string]$column.name, $columnTypes[[string]$column.type])
        $dataColumn.AllowDBNull = [bool]$column.nullable
    }
    $dataSet.Tables.Add($table)
    $settings = [Xml.XmlWriterSettings]::new()
    $settings.Indent = $true
    $settings.Encoding = [Text.UTF8Encoding]::new($false)
    # CreateNew prevents a concurrent invocation from silently overwriting a schema.
    $stream = [IO.File]::Open($destination, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
    try {
        $writer = [Xml.XmlWriter]::Create($stream, $settings)
        try { $dataSet.WriteXmlSchema($writer) }
        finally { $writer.Dispose() }
    }
    finally { $stream.Dispose() }
}
finally { $dataSet.Dispose() }

[pscustomobject]@{
    EntityKey = $EntityKey
    TableName = $entity.tableName
    Columns = @($entity.columns).Count
    SchemaVersion = $contract.schemaVersion
    ContractFingerprint = (Get-FileHash -LiteralPath $contractPath -Algorithm SHA256).Hash.ToLowerInvariant()
    OutputPath = $destination
    ManagedParameters = $entity.parameters
}
