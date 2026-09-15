[CmdletBinding()]
param(
    [string]$ApiRoot = (Join-Path $PSScriptRoot ".."),

    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Release",

    [switch]$NoBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$resolvedApiRoot = (Resolve-Path -LiteralPath $ApiRoot).Path
$registryPath = Join-Path $resolvedApiRoot "ErpSystem.Api\Modules\ErpModuleRegistry.cs"
if (-not (Test-Path -LiteralPath $registryPath -PathType Leaf)) {
    throw "The explicit ERP module registry was not found at '$registryPath'."
}

if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    throw "The dotnet CLI is required to verify EF model drift."
}

$registrySource = Get-Content -LiteralPath $registryPath -Raw
$moduleMatches = [regex]::Matches(
    $registrySource,
    'new\s+ErpSystem\.Modules\.(?<name>[A-Za-z][A-Za-z0-9]*)\.\k<name>Module\s*\(\)',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
if ($moduleMatches.Count -eq 0) {
    throw "The explicit ERP module registry contains no module registrations."
}

$verified = 0
foreach ($moduleMatch in $moduleMatches) {
    $moduleName = $moduleMatch.Groups['name'].Value
    $infrastructureRoot = Join-Path $resolvedApiRoot "Modules\$moduleName\ErpSystem.Modules.$moduleName.Infrastructure"
    $project = Join-Path $infrastructureRoot "ErpSystem.Modules.$moduleName.Infrastructure.csproj"
    if (-not (Test-Path -LiteralPath $project -PathType Leaf)) {
        throw "Module '$moduleName' has no module-owned Infrastructure project."
    }

    $contexts = @(
        Get-ChildItem -LiteralPath $infrastructureRoot -Filter "*DbContext.cs" -File -Recurse |
            Where-Object {
                $_.Name -notlike "*DesignFactory.cs" -and
                $_.Name -notlike "*ModelSnapshot.cs" -and
                $_.FullName -notmatch '[\\/]Migrations[\\/]'
            }
    )
    if ($contexts.Count -ne 1) {
        throw "Module '$moduleName' must expose exactly one module-owned DbContext; found $($contexts.Count)."
    }

    $contextName = [System.IO.Path]::GetFileNameWithoutExtension($contexts[0].Name)
    $arguments = @(
        "ef",
        "migrations",
        "has-pending-model-changes",
        "--project", $project,
        "--startup-project", $project,
        "--context", $contextName,
        "--configuration", $Configuration
    )
    if ($NoBuild) {
        $arguments += "--no-build"
    }

    Write-Host "Checking EF model drift for module '$moduleName' ($contextName)..."
    & dotnet @arguments
    if ($LASTEXITCODE -ne 0) {
        throw "EF model drift check failed for module '$moduleName' with exit code $LASTEXITCODE."
    }

    $verified++
}

Write-Host "EF model drift verification passed for $verified registered module(s)."
