[CmdletBinding()]
param(
    [switch]$IncludeWeb,
    [string]$ApiProject = "api/HrManagementSystem.Api/HrManagementSystem.Api.csproj",
    [string]$ConnectorProject = "api/HrManagementSystem.AttendanceConnector/HrManagementSystem.AttendanceConnector.csproj",
    [string]$WebDirectory = "web-next"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Start-AttendanceChild {
    param([Parameter(Mandatory)][string]$FilePath, [Parameter(Mandatory)][string]$WorkingDirectory, [Parameter(Mandatory)][string[]]$Arguments)

    $child = Start-Process -FilePath $FilePath -ArgumentList $Arguments `
        -WorkingDirectory $WorkingDirectory -WindowStyle Hidden -PassThru
    if ($child.Id -le 0) { throw "Could not start child process." }
    return $child
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$apiPath = Join-Path $repoRoot $ApiProject
$connectorPath = Join-Path $repoRoot $ConnectorProject
$webPath = Join-Path $repoRoot $WebDirectory
foreach ($path in @($apiPath, $connectorPath)) {
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Required project was not found: $path" }
}
if ($IncludeWeb -and -not (Test-Path -LiteralPath (Join-Path $webPath "package.json") -PathType Leaf)) {
    throw "Web project was not found: $webPath"
}

$children = [System.Collections.Generic.List[System.Diagnostics.Process]]::new()
try {
    # The connector binds loopback by default. An optional internal key is inherited
    # from the process environment, never passed as a command-line argument.
    $children.Add((Start-AttendanceChild -FilePath "dotnet" -WorkingDirectory $repoRoot -Arguments @("run", "--project", $apiPath, "--no-launch-profile")))
    $children.Add((Start-AttendanceChild -FilePath "dotnet" -WorkingDirectory $repoRoot -Arguments @("run", "--project", $connectorPath, "--no-launch-profile")))

    if ($IncludeWeb) {
        $children.Add((Start-AttendanceChild -FilePath "npm.cmd" -WorkingDirectory $webPath -Arguments @("run", "dev")))
    }

    Write-Host "Attendance development children started: $($children.Id -join ', '). Press Ctrl+C to stop only these children."
    while ($true) {
        Start-Sleep -Seconds 2
        foreach ($child in @($children)) {
            if ($child.HasExited) { throw "A development child exited unexpectedly (PID $($child.Id))." }
        }
    }
}
finally {
    foreach ($child in $children) {
        try {
            if (-not $child.HasExited) { Stop-Process -Id $child.Id -ErrorAction SilentlyContinue }
        }
        catch { }
    }
}
