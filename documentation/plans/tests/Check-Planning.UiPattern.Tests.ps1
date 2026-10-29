$ErrorActionPreference = 'Stop'
. (Join-Path (Split-Path -Parent $PSScriptRoot) 'Check-Planning.UiPattern.ps1')

function Assert-PatternCase([string] $Name, [string] $Pattern, [string] $Status, [string] $Views, [string] $Reason, [bool] $Pass) {
    $errors = @(Get-PlanningUiPatternErrors $Pattern $Status $Views $Reason)
    if (($errors.Count -eq 0) -ne $Pass) { throw "Unexpected UI pattern result: $Name" }
}

Assert-PatternCase 'technical API boundary' 'N/A' 'Excluded' 'All visual views Excluded' 'API transport only; no screen introduced' $true
Assert-PatternCase 'required screen cannot bypass catalog' 'N/A' 'Adapted' 'Detail Required' 'API transport' $false
Assert-PatternCase 'excluded surface with required view' 'N/A' 'Excluded' 'Grid Excluded; Detail Required' 'No screen' $false
Assert-PatternCase 'deferred screen cannot be hidden' 'N/A' 'Excluded' 'Detail Deferred' 'No screen' $false
Assert-PatternCase 'missing explanation' 'N/A' 'Excluded' 'All views Excluded' '' $false
Assert-PatternCase 'unreasoned exception' 'N/A' 'Excluded' 'All views Excluded' 'N/A' $false
Assert-PatternCase 'normal reviewed screen preserved' 'P-003' 'Adapted' 'Detail Required' 'Existing editor' $true
Assert-PatternCase 'candidate still reaches existing active gate' 'Candidate' 'Adapted' 'Detail Required' 'Pending review' $true
Assert-PatternCase 'invalid pattern rejected' 'custom' 'Adapted' 'Detail Required' 'Custom editor' $false
Write-Host 'Planning UI-pattern regression tests passed (9 cases).'
