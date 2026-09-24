param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern("^[a-z0-9]+(?:-[a-z0-9]+)*$")]
    [string]$PlanId,

    [Parameter(Mandatory = $true)]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [string]$Module,

    [string]$Target = "TBD"
)

$ErrorActionPreference = "Stop"

$planningRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$template = Join-Path $planningRoot "BUSINESS_PLAN_TEMPLATE.md"
$evidenceTemplate = Join-Path $planningRoot "EVIDENCE_TEMPLATE.md"
$specTemplate = Join-Path $planningRoot "SPEC_SUMMARY_TEMPLATE.md"
$planRoot = Join-Path (Join-Path $planningRoot "business") $PlanId
$planFile = Join-Path $planRoot "PLAN.md"

if (-not (Test-Path -LiteralPath $template)) {
    throw "Planning template is missing: $template"
}
if (-not (Test-Path -LiteralPath $evidenceTemplate)) {
    throw "Evidence template is missing: $evidenceTemplate"
}
if (-not (Test-Path -LiteralPath $specTemplate)) {
    throw "Specification template is missing: $specTemplate"
}

if (Test-Path -LiteralPath $planRoot) {
    throw "Plan already exists: $planRoot"
}

New-Item -ItemType Directory -Path $planRoot | Out-Null
New-Item -ItemType Directory -Path (Join-Path $planRoot "diagrams") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $planRoot "decomposition") | Out-Null

$content = Get-Content -LiteralPath $template -Raw
$content = $content.Replace("<Business Capability>", $Name)
$content = $content.Replace("<kebab-case-id>", $PlanId)
$content = $content.Replace("<name>", $Name)
$content = $content.Replace("<module>", $Module)
$content = $content.Replace("<release/phase>", $Target)
$content = $content.Replace("<YYYY-MM-DD>", (Get-Date -Format "yyyy-MM-dd"))

Set-Content -LiteralPath $planFile -Value $content -Encoding UTF8
Set-Content -LiteralPath (Join-Path $planRoot "DISCOVERY.md") -Value "# $Name - Discovery`n`nUse ../../BUSINESS_DISCOVERY_INTERVIEW.md and separate verified facts, requested decisions, open decisions, and planning consequences.`n" -Encoding UTF8

$evidenceContent = Get-Content -LiteralPath $evidenceTemplate -Raw
$evidenceContent = $evidenceContent.Replace("<Business Capability>", $Name)
Set-Content -LiteralPath (Join-Path $planRoot "EVIDENCE.md") -Value $evidenceContent -Encoding UTF8

$specContent = Get-Content -LiteralPath $specTemplate -Raw
$specContent = $specContent.Replace("<Business Capability>", $Name)
Set-Content -LiteralPath (Join-Path $planRoot "SPEC_SUMMARY.md") -Value $specContent -Encoding UTF8

Set-Content -LiteralPath (Join-Path $planRoot "DECISIONS.md") -Value "# $Name - Decision Log`n" -Encoding UTF8
Set-Content -LiteralPath (Join-Path $planRoot "RESEARCH.md") -Value "# $Name - Research Notes`n" -Encoding UTF8

Write-Host "Created $planFile"
Write-Host "Next: complete DISCOVERY.md, EVIDENCE.md and SPEC_SUMMARY.md; add '$PlanId' to PLAN_REGISTRY.md; obtain plan-drafting approval; then complete PLAN.md and G0-G4."
Write-Host "Before any runtime scaffold, create exactly one current feature contract from FEATURE_DECOMPOSITION_TEMPLATE.md (version 2.0) for the authorized step."
Write-Host "Complete its mandatory UI Pattern Gate for every Web and Mobile screen; a Candidate pattern blocks UI work until it is registered and reviewed in SCREEN_PATTERN_CATALOG.md."
Write-Host "The slice roadmap must declare one ACTIVE_FEATURE_STEP. Execute one feature in API -> Web -> Mobile -> integrated live verification -> documentation/closure order; keep all siblings Queued or Blocked until closure."
Write-Host "Then run ./documentation/plans/Check-Planning.ps1 before handoff. Legacy contracts are allowed as migration warnings, but cannot become Active until upgraded."
