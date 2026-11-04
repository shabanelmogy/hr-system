#Requires -Version 7.0
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$HostSettingsPath,
    [Parameter(Mandatory)][string]$CrystalPatchPath,
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'
try {
    $hostSettings = Get-Content -LiteralPath $HostSettingsPath -Raw | ConvertFrom-Json -AsHashtable
    $patch = Get-Content -LiteralPath $CrystalPatchPath -Raw | ConvertFrom-Json -AsHashtable
} catch {
    throw 'Both inputs must be readable valid JSON configuration files. Input contents are never printed.'
}
if ($hostSettings -isnot [Collections.IDictionary] -or $patch -isnot [Collections.IDictionary] -or
    $patch.CrystalReports -isnot [Collections.IDictionary]) {
    throw 'Expected existing host settings and a CrystalReports configuration patch.'
}
$crystal = $patch.CrystalReports
$runtimeUri = $null
if ($crystal.RuntimeEnabled -ne $true -or
    -not [uri]::TryCreate([string]$crystal.RuntimeBaseUrl, [UriKind]::Absolute, [ref]$runtimeUri) -or
    $runtimeUri.Scheme -ne 'https' -or $runtimeUri.UserInfo -or $runtimeUri.Query -or $runtimeUri.Fragment -or
    [string]::IsNullOrWhiteSpace([string]$crystal.RuntimeApiKey)) {
    throw 'The private patch must enable an exact HTTPS runtime and include its matching key.'
}
if (-not $OutputPath) {
    $patchDirectory = Split-Path -Parent (Resolve-Path -LiteralPath $CrystalPatchPath)
    $OutputPath = Join-Path $patchDirectory 'appsettings.ready.json'
}
$outputAbsolute = [IO.Path]::GetFullPath($OutputPath)
if ($outputAbsolute -eq [IO.Path]::GetFullPath($HostSettingsPath) -or
    $outputAbsolute -eq [IO.Path]::GetFullPath($CrystalPatchPath)) {
    throw 'Write a separate output file; original host settings and patch must remain unchanged.'
}
if (-not $hostSettings.Contains('CrystalReports')) { $hostSettings['CrystalReports'] = @{} }
if ($hostSettings.CrystalReports -isnot [Collections.IDictionary]) {
    throw 'The existing CrystalReports section must be a JSON object.'
}
foreach ($setting in @('RuntimeEnabled', 'RuntimeBaseUrl', 'RuntimeApiKey')) {
    $hostSettings.CrystalReports[$setting] = $crystal[$setting]
}
$payload = [Text.UTF8Encoding]::new($false).GetBytes(($hostSettings | ConvertTo-Json -Depth 100))
$outputStream = [IO.File]::Open($outputAbsolute, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
try { $outputStream.Write($payload, 0, $payload.Length) }
finally { $outputStream.Dispose() }
Write-Host "Prepared merged private host settings: $outputAbsolute"
Write-Host 'Only the three Crystal runtime integration values changed. Upload this as appsettings.json after backing up the hosted original.'
Write-Host 'Key values are omitted; keep the original and merged configurations outside Git.'
