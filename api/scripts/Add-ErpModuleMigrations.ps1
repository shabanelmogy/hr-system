[CmdletBinding()]
param(
    # Migration name, for example "RemoveByPcAuditFields".
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z][A-Za-z0-9_]*$')]
    [string]$Name,

    [string]$ApiRoot = (Join-Path $PSScriptRoot ".."),

    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Debug",

    # Also run Apply-ErpModuleMigrations.ps1 afterwards (dotnet ef database update for every module).
    [switch]$Apply
)

# Adds one EF Core migration to every registered module whose model changed since its last
# migration. Modules without model changes are skipped, so no empty migrations are created.
# Connection strings come from ErpSystem.Api/appsettings*.json through each module's design factory.

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$resolvedApiRoot = (Resolve-Path -LiteralPath $ApiRoot).Path
$registryPath = Join-Path $resolvedApiRoot "ErpSystem.Api\Modules\ErpModuleRegistry.cs"
if (-not (Test-Path -LiteralPath $registryPath -PathType Leaf)) {
    throw "The explicit ERP module registry was not found at '$registryPath'."
}
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    throw "The dotnet CLI is required."
}

$modules = [System.Collections.Generic.List[object]]::new()
foreach ($match in [regex]::Matches(
        (Get-Content -LiteralPath $registryPath -Raw),
        'new\s+ErpSystem\.Modules\.(?<name>[A-Za-z][A-Za-z0-9]*)\.\k<name>Module\s*\(\)')) {
    $moduleName = $match.Groups['name'].Value
    $infrastructureRoot = Join-Path $resolvedApiRoot "Modules\$moduleName\ErpSystem.Modules.$moduleName.Infrastructure"
    $project = Join-Path $infrastructureRoot "ErpSystem.Modules.$moduleName.Infrastructure.csproj"
    if (-not (Test-Path -LiteralPath $project -PathType Leaf)) {
        throw "Module '$moduleName' has no Infrastructure project."
    }
    $contexts = @(
        Get-ChildItem -LiteralPath $infrastructureRoot -Filter "*DbContext.cs" -File -Recurse |
            Where-Object { $_.Name -notlike "*DesignFactory.cs" -and $_.Name -notlike "*ModelSnapshot.cs" -and $_.FullName -notmatch '[\\/](bin|obj)[\\/]' }
    )
    if ($contexts.Count -ne 1) {
        throw "Module '$moduleName' must have exactly one *DbContext.cs; found $($contexts.Count)."
    }
    $modules.Add([pscustomobject]@{
        Name = $moduleName
        Project = $project
        Context = [System.IO.Path]::GetFileNameWithoutExtension($contexts[0].Name)
    })
}

Write-Host "Building the solution once ($Configuration)..."
& dotnet build (Join-Path $resolvedApiRoot "ErpSystem.sln") -c $Configuration --nologo -v quiet
if ($LASTEXITCODE -ne 0) { throw "Build failed." }

$added = [System.Collections.Generic.List[string]]::new()
$unchanged = [System.Collections.Generic.List[string]]::new()

foreach ($module in $modules) {
    $common = @(
        "--project", $module.Project,
        "--startup-project", $module.Project,
        "--context", $module.Context,
        "--configuration", $Configuration,
        "--no-build"
    )

    & dotnet ef migrations has-pending-model-changes @common *> $null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[$($module.Name)] no model changes - skipped."
        $unchanged.Add($module.Name)
        continue
    }

    Write-Host "[$($module.Name)] adding migration '$Name'..."
    & dotnet ef migrations add $Name @common --output-dir Migrations
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet ef migrations add failed for module '$($module.Name)'. Run 'dotnet ef migrations has-pending-model-changes' for that module to see the error."
    }
    $added.Add($module.Name)
}

Write-Host ""
Write-Host "Added '$Name' to: $(if ($added.Count) { $added -join ', ' } else { 'none' })"
Write-Host "No changes:       $(if ($unchanged.Count) { $unchanged -join ', ' } else { 'none' })"

if ($Apply) {
    Write-Host ""
    & (Join-Path $PSScriptRoot "Apply-ErpModuleMigrations.ps1") -ApiRoot $resolvedApiRoot -Configuration $Configuration
}
