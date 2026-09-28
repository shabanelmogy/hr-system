[CmdletBinding()]
param(
    [string]$PlanningRoot = 'planning',

    # Only check stories/slices belonging to this release (value of the slice "Release" column).
    [string]$Release,

    # Treat warnings as errors.
    [switch]$Strict
)

# Mechanical readiness check for gate GR. It does not judge business quality - the plan-review
# skill does that - but it catches missing files, unfilled placeholders, open blocking questions,
# broken traceability, and an invalid conversion manifest.

$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath($PlanningRoot)
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$errors = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()
$utf8 = [System.Text.UTF8Encoding]::new($false)

function Add-Error([string]$Message) { $script:errors.Add($Message) }
function Add-Warning([string]$Message) { $script:warnings.Add($Message) }
function Get-PlanFile([string]$Relative) { return [System.IO.Path]::Combine($root, $Relative) }

function Read-Text([string]$Relative) {
    $path = Get-PlanFile $Relative
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { return $null }
    return [System.IO.File]::ReadAllText($path)
}

function Remove-Comments([string]$Text) {
    if ($null -eq $Text) { return $null }
    return [regex]::Replace($Text, '(?s)<!--.*?-->', '')
}

function Remove-CodeFences([string]$Text) {
    if ($null -eq $Text) { return $null }
    return [regex]::Replace($Text, '(?ms)^```.*?^```\s*$', '')
}

function Split-Ids([string]$Value, [string]$Pattern) {
    if ([string]::IsNullOrWhiteSpace($Value)) { return @() }
    return @([regex]::Matches($Value, $Pattern) | ForEach-Object { $_.Value } | Select-Object -Unique)
}

# Returns rows of the first Markdown table whose header contains every column in $Columns.
function Get-Table([string]$Text, [string[]]$Columns) {
    if ($null -eq $Text) { return @() }
    $lines = (Remove-CodeFences (Remove-Comments $Text)) -split "`r?`n"
    for ($i = 0; $i -lt $lines.Count - 1; $i++) {
        $line = $lines[$i].Trim()
        if (-not $line.StartsWith('|')) { continue }
        $headers = @($line.Trim('|').Split('|') | ForEach-Object { $_.Trim() })
        $missing = @($Columns | Where-Object { $headers -notcontains $_ })
        if ($missing.Count -gt 0) { continue }
        if ($lines[$i + 1].Trim() -notmatch '^\|?\s*:?-{3,}') { continue }
        $rows = [System.Collections.Generic.List[object]]::new()
        for ($j = $i + 2; $j -lt $lines.Count; $j++) {
            $rowLine = $lines[$j].Trim()
            if (-not $rowLine.StartsWith('|')) { break }
            $cells = @($rowLine.Trim('|').Split('|') | ForEach-Object { $_.Trim() })
            $row = [ordered]@{}
            for ($k = 0; $k -lt $headers.Count; $k++) {
                $row[$headers[$k]] = if ($k -lt $cells.Count) { $cells[$k] } else { '' }
            }
            $rows.Add([pscustomobject]$row)
        }
        return $rows.ToArray()
    }
    return @()
}

function Test-Empty([string]$Value) {
    return [string]::IsNullOrWhiteSpace($Value) -or $Value.Trim() -match '^(-|--|\u2014|n/?a|none|tbd|todo)$'
}

# ---------------------------------------------------------------- 1. files
if (-not (Test-Path -LiteralPath $root -PathType Container)) { throw "Planning folder '$root' does not exist." }

$status = Read-Text 'status.md'
if ($null -eq $status) { Add-Error 'status.md is missing.' }
$track = ''
if ($status -and $status -match '(?m)^\s*-\s*\*\*Track:\*\*\s*(.+)$') { $track = $Matches[1].Trim() }
if ($track -notin @('Design', 'Migrate', 'Extend')) { Add-Error "status.md: Track must be Design, Migrate, or Extend (found '$track')." }

$coreFiles = @(
    '00-brief.md', '01-decisions.md', '02-glossary.md', '03-actors-access.md', '04-capabilities.md',
    '05-domain-model.md', '06-business-rules.md', '07-quality-attributes.md', '08-stories.md',
    '09-slice-plan.md', '10-risks.md', '11-open-questions.md'
)
if ($track -eq 'Migrate') { $coreFiles += @('legacy/inventory.md', 'legacy/behavior-catalog.md', 'legacy/defects.md') }
foreach ($file in $coreFiles) {
    if (-not (Test-Path -LiteralPath (Get-PlanFile $file) -PathType Leaf)) { Add-Error "Missing planning file: $file" }
}

# ---------------------------------------------------------------- 2. placeholders
foreach ($file in @('status.md') + $coreFiles) {
    $text = Remove-Comments (Read-Text $file)
    if ($null -eq $text) { continue }
    $count = [regex]::Matches($text, '<<[^<>\r\n]*>>').Count
    if ($count -gt 0) { Add-Error "${file}: $count unfilled <<placeholder>> value(s)." }
}

# ---------------------------------------------------------------- 3. decisions, rules, questions
$decisionText = Remove-Comments (Read-Text '01-decisions.md')
$decisionIds = @()
if ($decisionText) {
    $decisionIds = @([regex]::Matches((Remove-CodeFences $decisionText), '(?m)^###\s+(D-\d{3,})') | ForEach-Object { $_.Groups[1].Value })
}
if ($decisionIds.Count -eq 0) { Add-Warning '01-decisions.md has no recorded decisions; gate approvals should be recorded as decisions.' }

$rules = @(Get-Table (Read-Text '06-business-rules.md') @('ID', 'Statement (testable)', 'Status'))
$ruleIds = @{}
foreach ($rule in $rules) {
    if ($rule.ID -notmatch '^BR-\d{3,}$') { continue }
    $ruleIds[$rule.ID] = $rule
    if ($rule.Status -match '^Confirmed') {
        if (Test-Empty $rule.'Enforced at') { Add-Error "$($rule.ID): Confirmed rule has no 'Enforced at'." }
        if (Test-Empty $rule.Evidence) { Add-Error "$($rule.ID): Confirmed rule has no evidence." }
        if ($rule.Evidence -match 'assumption') { Add-Warning "$($rule.ID): Confirmed rule is still based on an [assumption]." }
        if ($rule.'Enforced at' -match '^\s*UI') { Add-Error "$($rule.ID): rule is enforced only in the UI." }
    }
}

$questions = @(Get-Table (Read-Text '11-open-questions.md') @('ID', 'Question', 'Blocking', 'Status'))
$questionIds = @{}
foreach ($question in $questions) {
    if ($question.ID -notmatch '^Q-\d{3,}$') { continue }
    $questionIds[$question.ID] = $question
    if ($question.Blocking -match '^(yes|y|true)$' -and $question.Status -match '^Open') {
        Add-Error "$($question.ID) is an open blocking question (needed for: $($question.'Needed for'))."
    }
}

# ---------------------------------------------------------------- 4. stories
$storyText = Remove-CodeFences (Remove-Comments (Read-Text '08-stories.md'))
$stories = @{}
if ($storyText) {
    $blocks = [regex]::Split($storyText, '(?m)^(?=###\s+[A-Z][A-Z0-9-]+\s+[\u2014\u2013:-]\s+)')
    foreach ($block in $blocks) {
        if ($block -notmatch '^###\s+([A-Z][A-Z0-9-]+)\s+[\u2014\u2013:-]\s+(.+)') { continue }
        $id = $Matches[1]
        if ($stories.ContainsKey($id)) { Add-Error "08-stories.md: duplicate story id $id."; continue }
        $field = {
            param([string]$Name)
            $m = [regex]::Match($block, "(?m)^\s*-\s*\*\*$([regex]::Escape($Name)):\*\*\s*(.*)$")
            if ($m.Success) { return $m.Groups[1].Value.Trim() } else { return $null }
        }
        $criteriaCount = 0
        $criteriaMatch = [regex]::Match($block, '(?ms)^\s*-\s*\*\*Acceptance criteria:\*\*\s*$(.*?)(?=^\s*-\s*\*\*|\z)')
        if ($criteriaMatch.Success) {
            $criteriaCount = [regex]::Matches($criteriaMatch.Groups[1].Value, '(?m)^\s*(\d+\.|-)\s+\S').Count
        }
        $stories[$id] = [pscustomobject]@{
            Id = $id
            Status = & $field 'Status'
            Rules = & $field 'Rules'
            Permissions = & $field 'Permissions'
            Scope = & $field 'Scope'
            Actor = & $field 'Actor'
            Questions = & $field 'Open questions'
            Criteria = $criteriaCount
        }
    }
}
if ($stories.Count -eq 0) { Add-Error '08-stories.md contains no stories.' }

foreach ($story in $stories.Values) {
    $isReady = $story.Status -match '^(Ready|In progress|Done)'
    foreach ($ruleId in (Split-Ids $story.Rules 'BR-\d{3,}')) {
        if (-not $ruleIds.ContainsKey($ruleId)) { Add-Error "$($story.Id) references unknown rule $ruleId." }
        elseif ($isReady -and $ruleIds[$ruleId].Status -notmatch '^Confirmed') { Add-Error "$($story.Id) is $($story.Status) but rule $ruleId is not Confirmed." }
    }
    foreach ($questionId in (Split-Ids $story.Questions 'Q-\d{3,}')) {
        if (-not $questionIds.ContainsKey($questionId)) { Add-Error "$($story.Id) references unknown question $questionId." }
        elseif ($isReady -and $questionIds[$questionId].Status -match '^Open') { Add-Error "$($story.Id) is $($story.Status) but question $questionId is still open." }
    }
    if (-not $isReady) { continue }
    if ($story.Criteria -eq 0) { Add-Error "$($story.Id): no acceptance criteria." }
    elseif ($story.Criteria -lt 2) { Add-Warning "$($story.Id): only one acceptance criterion; add negative authorization/scope cases." }
    if (Test-Empty $story.Actor) { Add-Error "$($story.Id): actor is missing." }
    if (Test-Empty $story.Permissions) { Add-Error "$($story.Id): permissions are missing." }
    if (Test-Empty $story.Scope) { Add-Error "$($story.Id): resource scope is missing." }
    if (Test-Empty $story.Rules) { Add-Warning "$($story.Id): no linked business rules." }
}

# ---------------------------------------------------------------- 5. slices
$slices = @(Get-Table (Read-Text '09-slice-plan.md') @('Slice', 'Stories', 'Depends on', 'Status'))
if ($slices.Count -eq 0) { Add-Error '09-slice-plan.md has no slice table.' }
$seenSlices = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
$plannedStories = @{}
foreach ($slice in $slices) {
    $sliceId = $slice.Slice
    if ([string]::IsNullOrWhiteSpace($sliceId)) { continue }
    $inRelease = [string]::IsNullOrWhiteSpace($Release) -or $slice.Release -eq $Release
    foreach ($dependency in (Split-Ids $slice.'Depends on' 'S\d+[A-Za-z]?')) {
        if (-not $seenSlices.Contains($dependency)) { Add-Error "Slice $sliceId depends on $dependency, which is not listed earlier." }
    }
    foreach ($storyId in (Split-Ids $slice.Stories '[A-Z][A-Z0-9]*-\d+[A-Z0-9-]*')) {
        if ($plannedStories.ContainsKey($storyId)) { Add-Error "Story $storyId appears in slices $($plannedStories[$storyId]) and $sliceId." }
        $plannedStories[$storyId] = $sliceId
        if (-not $stories.ContainsKey($storyId)) { Add-Error "Slice $sliceId references unknown story $storyId."; continue }
        if ($inRelease -and $stories[$storyId].Status -notmatch '^(Ready|In progress|Done)') {
            $message = "Slice $sliceId contains story $storyId with status '$($stories[$storyId].Status)'."
            if ($slice.Status -match '^(Ready|In progress)') { Add-Error $message } else { Add-Warning $message }
        }
    }
    if ($inRelease -and (Test-Empty $slice.'Exit checks') -and $slice.PSObject.Properties.Name -contains 'Exit checks') {
        Add-Error "Slice $sliceId has no exit checks."
    }
    [void]$seenSlices.Add($sliceId)
}
foreach ($story in $stories.Values) {
    if ($story.Status -match '^Ready' -and -not $plannedStories.ContainsKey($story.Id)) {
        Add-Warning "Ready story $($story.Id) is not in any slice."
    }
}

# ---------------------------------------------------------------- 6. manifest
$manifestPath = Get-PlanFile 'conversion-manifest.json'
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) {
    Add-Error 'conversion-manifest.json is missing (produced by the slice-planning skill).'
}
else {
    $validator = @(
        [System.IO.Path]::Combine($scriptRoot, 'Test-ConversionManifest.ps1'),
        [System.IO.Path]::Combine((Split-Path -Parent $scriptRoot), 'conversion', 'Test-ConversionManifest.ps1')
    ) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if ($validator) {
        try { & $validator -Path $manifestPath | Out-Null }
        catch { Add-Error "conversion-manifest.json is invalid: $($_.Exception.Message)" }
    }
    else { Add-Warning 'Test-ConversionManifest.ps1 not found; manifest schema was not validated.' }

    try {
        $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
        foreach ($feature in @($manifest.features)) {
            foreach ($manifestStory in @($feature.stories)) {
                if (-not $stories.ContainsKey([string]$manifestStory.id)) {
                    Add-Error "Manifest feature '$($feature.name)' lists story $($manifestStory.id), which is not in 08-stories.md."
                }
            }
        }
    }
    catch { Add-Error "conversion-manifest.json cannot be parsed: $($_.Exception.Message)" }
}

# ---------------------------------------------------------------- 7. risks and legacy
foreach ($risk in @(Get-Table (Read-Text '10-risks.md') @('ID', 'Risk', 'Status'))) {
    if ($risk.ID -notmatch '^R-\d{3,}$') { continue }
    $impact = $risk.PSObject.Properties | Where-Object { $_.Name -like 'Impact*' } | Select-Object -First 1
    if ($impact -and $impact.Value -match '^H' -and $risk.Status -match '^Open' -and (Test-Empty $risk.Mitigation)) {
        Add-Warning "$($risk.ID): open high-impact risk without mitigation."
    }
}
if ($track -eq 'Migrate') {
    foreach ($defect in @(Get-Table (Read-Text 'legacy/defects.md') @('ID', 'Disposition'))) {
        if ($defect.ID -match '^DEF-\d+' -and (Test-Empty $defect.Disposition)) { Add-Error "$($defect.ID): legacy defect has no disposition." }
    }
}

# ---------------------------------------------------------------- report
if ($Strict -and $warnings.Count -gt 0) { foreach ($w in $warnings) { $errors.Add("(strict) $w") } }
$ready = $errors.Count -eq 0
$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('# Plan readiness report')
$lines.Add('')
$lines.Add("- Checked: $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
$lines.Add("- Track: $track")
$lines.Add("- Stories: $($stories.Count); slices: $($slices.Count); rules: $($ruleIds.Count); questions: $($questionIds.Count)")
$lines.Add("- Result: $(if ($ready) { 'PASS (mechanical checks only; run the plan-review skill for gate GR)' } else { 'FAIL' })")
$lines.Add('')
$lines.Add("## Errors ($($errors.Count))")
$lines.Add('')
if ($errors.Count -eq 0) { $lines.Add('- none') } else { foreach ($e in $errors) { $lines.Add("- $e") } }
$lines.Add('')
$lines.Add("## Warnings ($($warnings.Count))")
$lines.Add('')
if ($warnings.Count -eq 0) { $lines.Add('- none') } else { foreach ($w in $warnings) { $lines.Add("- $w") } }
$reportPath = Get-PlanFile 'readiness-report.md'
[System.IO.File]::WriteAllLines($reportPath, $lines, $utf8)

foreach ($e in $errors) { Write-Host "ERROR   $e" -ForegroundColor Red }
foreach ($w in $warnings) { Write-Host "WARNING $w" -ForegroundColor Yellow }
Write-Host "Report: $reportPath"
if (-not $ready) { throw "Plan is not ready: $($errors.Count) error(s)." }
Write-Host 'Mechanical readiness checks passed. Run the plan-review skill to complete gate GR.' -ForegroundColor Green
