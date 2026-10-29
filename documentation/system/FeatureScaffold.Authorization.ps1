function Assert-FeatureScaffoldAuthorization {
    param(
        [string] $PlanText,
        [string] $FeatureId,
        [string] $SliceId,
        [bool] $PreflightOnly
    )

    if ($PreflightOnly) {
        foreach ($field in @(
            @{ Name = 'Preflight-only slice'; Value = $SliceId },
            @{ Name = 'Preflight-only feature'; Value = $FeatureId }
        )) {
            $pattern = '(?im)^\|\s*' + [regex]::Escape($field.Name) + '\s*\|\s*`?' + [regex]::Escape($field.Value) + '`?\s*\|'
            if ($PlanText -notmatch $pattern) { throw "Preflight-only authorization must name exact $($field.Name): $($field.Value)" }
        }
        return
    }

    if ($PlanText -notmatch '(?im)^\|\s*Status\s*\|\s*[^|]*(execution-ready|implementation ready|in progress|verified)[^|]*\|') {
        throw 'Canonical plan is not execution-ready/Implementation Ready/In Progress/Verified. Runtime scaffolding is blocked; preflight-only requires explicit exact-slice authorization.'
    }
}

function Assert-PreflightContract {
    param([string] $ContractText)
    if ($ContractText -notmatch '(?im)^\|\s*Contract version\s*\|\s*`?2\.0`?\s*\|') {
        throw 'Preflight-only requires a current version-2.0 feature contract.'
    }
    if ($ContractText -notmatch '(?im)^\|\s*Runtime authorization\s*\|\s*Blocked\b[^|]*preflight-only[^|]*\|') {
        throw 'Preflight-only contract must explicitly block runtime authorization.'
    }
}
