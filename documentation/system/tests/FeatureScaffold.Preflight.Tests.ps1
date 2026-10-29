$ErrorActionPreference = 'Stop'
$generator = Join-Path (Split-Path -Parent $PSScriptRoot) 'New-FeatureDocumentation.ps1'
$repository = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
$probeId = 'unauthorized-browser-preflight-probe'
$probePath = Join-Path $repository "documentation/modules/platform/features/$probeId"
if (Test-Path -LiteralPath $probePath) { throw 'Probe path already exists; refusing to use it.' }
$planText = Get-Content -LiteralPath (Join-Path $repository 'documentation/plans/business/web-angular-migration/PLAN.md') -Raw
$sliceMatch = [regex]::Match($planText, '(?m)^\|\s*Preflight-only slice\s*\|\s*([^|]+)\|')
if (-not $sliceMatch.Success) { throw 'Canonical plan must declare its exact preflight slice.' }
$authorizedSlice = $sliceMatch.Groups[1].Value.Trim()

function Assert-Rejected([bool] $Preflight, [string] $ExpectedMessage) {
    $arguments = @{
        FeatureId = $probeId
        FeatureName = 'Unauthorized preflight probe'
        PlanId = 'web-angular-migration'
        SliceId = $authorizedSlice
        Module = 'Platform'
        WhatIf = $true
    }
    if ($Preflight) { $arguments.PreflightOnly = $true }
    $message = ''
    try { & $generator @arguments } catch { $message = $_.Exception.Message }
    if ($message -notmatch $ExpectedMessage) { throw "Unexpected rejection: $message" }
    if (Test-Path -LiteralPath $probePath) { throw 'Rejected/WhatIf request created files.' }
}

Assert-Rejected $false 'not execution-ready'
Assert-Rejected $true 'Preflight-only feature'
Write-Host 'Scaffold integration guards passed: Draft runtime and unauthorized sibling rejected before file creation.'
