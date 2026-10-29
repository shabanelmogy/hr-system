$ErrorActionPreference = 'Stop'
. (Join-Path (Split-Path -Parent $PSScriptRoot) 'FeatureScaffold.Authorization.ps1')

$draft = "| Status | Draft |`n| Preflight-only slice | S0-AUTH |`n| Preflight-only feature | browser-auth |"
function Assert-AuthorizationCase([string] $Name, [string] $Plan, [string] $Feature, [string] $Slice, [bool] $Preflight, [bool] $Pass) {
    $accepted = $true
    try { Assert-FeatureScaffoldAuthorization $Plan $Feature $Slice $Preflight } catch { $accepted = $false }
    if ($accepted -ne $Pass) { throw "Unexpected scaffold authorization result: $Name" }
}
Assert-AuthorizationCase 'exact preflight permitted' $draft 'browser-auth' 'S0-AUTH' $true $true
Assert-AuthorizationCase 'draft does not become runtime-ready' $draft 'browser-auth' 'S0-AUTH' $false $false
Assert-AuthorizationCase 'sibling preflight denied' $draft 'other-feature' 'S0-AUTH' $true $false
Assert-AuthorizationCase 'different slice denied' $draft 'browser-auth' 'S1' $true $false
Assert-AuthorizationCase 'missing preflight authority denied' '| Status | Draft |' 'browser-auth' 'S0-AUTH' $true $false
Assert-AuthorizationCase 'normal ready-plan path preserved' '| Status | Implementation Ready |' 'browser-auth' 'S0-AUTH' $false $true
Write-Host 'Scaffold authorization regression tests passed (6 cases).'

$validPreflightContract = "| Contract version | 2.0 |`n| Runtime authorization | Blocked - preflight-only |"
Assert-PreflightContract $validPreflightContract
foreach ($invalidContract in @(
    '| Contract version | 1.0 |',
    '| Contract version | 2.0 |',
    "| Contract version | 2.0 |`n| Runtime authorization | Authorized |"
)) {
    $rejected = $false
    try { Assert-PreflightContract $invalidContract } catch { $rejected = $true }
    if (-not $rejected) { throw 'Incomplete or runtime-authorized preflight contract was accepted.' }
}
Write-Host 'Preflight contract guards passed (4 cases).'
