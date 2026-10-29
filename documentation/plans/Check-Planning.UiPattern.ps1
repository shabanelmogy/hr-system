function Get-PlanningUiPatternErrors {
    param(
        [string] $PatternId,
        [string] $PlatformStatus,
        [string] $Capabilities,
        [string] $Reason
    )

    if ($PatternId -match '^N/A\b') {
        if ($PlatformStatus -ne 'Excluded' -or $Capabilities -notmatch '\bExcluded\b' -or
            $Capabilities -match '\b(?:Required|Deferred)\b' -or
            [string]::IsNullOrWhiteSpace($Reason) -or $Reason -match '^(?:N/A|TBD)\b') {
            return 'N/A UI pattern requires an Excluded platform, only Excluded views, and a concrete no-UI reason'
        }
    } elseif ($PatternId -notmatch '^(?:P-[0-9]{3}|Candidate)\b') {
        return "UI Pattern Gate pattern '$PatternId' must be P-###, Candidate, or a justified N/A technical surface"
    }
}
