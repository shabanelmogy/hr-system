$ErrorActionPreference = 'Stop'
. (Join-Path (Split-Path -Parent $PSScriptRoot) 'Check-Planning.ExecutionState.ps1')

function Assert-Case([string] $Name, [string[]] $Errors, [bool] $ShouldPass) {
    if ($ShouldPass -and $Errors.Count -gt 0) { throw "$Name unexpectedly failed: $($Errors -join '; ')" }
    if (-not $ShouldPass -and $Errors.Count -eq 0) { throw "$Name unexpectedly passed" }
}
function Contract([string] $Id, [bool] $Active, [bool] $Closed) { [pscustomobject]@{ FeatureId = $Id; IsActive = $Active; IsClosed = $Closed } }

Assert-Case 'closed all contracts' (Get-PlanningExecutionStateErrors 'closed' $true @((Contract 's1' $false $true), (Contract 's2' $false $true)) @('None')) $true
Assert-Case 'closed unfinished' (Get-PlanningExecutionStateErrors 'closed' $true @((Contract 's1' $true $false)) @('None')) $false
Assert-Case 'closed non-None marker' (Get-PlanningExecutionStateErrors 'closed' $true @((Contract 's1' $false $true)) @('s1')) $false
Assert-Case 'closed missing marker' (Get-PlanningExecutionStateErrors 'closed' $true @((Contract 's1' $false $true)) @()) $false
Assert-Case 'open missing marker' (Get-PlanningExecutionStateErrors 'open' $false @((Contract 's1' $true $false)) @()) $false
Assert-Case 'open zero active' (Get-PlanningExecutionStateErrors 'open' $false @((Contract 's1' $false $false)) @('s1')) $false
Assert-Case 'open two active' (Get-PlanningExecutionStateErrors 'open' $false @((Contract 's1' $true $false), (Contract 's2' $true $false)) @('s1')) $false
Assert-Case 'open valid' (Get-PlanningExecutionStateErrors 'open' $false @((Contract 's1' $true $false), (Contract 's2' $false $false)) @('s1')) $true
Assert-Case 'open mismatch' (Get-PlanningExecutionStateErrors 'open' $false @((Contract 's1' $true $false)) @('s2')) $false

Write-Host 'Check-Planning execution-state regression tests passed.'
