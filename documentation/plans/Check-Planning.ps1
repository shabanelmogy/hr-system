param()

$ErrorActionPreference = "Stop"

$planningRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$businessRoot = Join-Path $planningRoot "business"
$notesRoot = Join-Path $planningRoot "notes"

$requiredFiles = @(
    "README.md",
    "PLAN_CREATION_PROTOCOL.md",
    "PLANNING_METHOD_PROVENANCE.md",
    "BUSINESS_PLANNING_STANDARD.md",
    "BUSINESS_DISCOVERY_INTERVIEW.md",
    "EVIDENCE_AUDIT_STANDARD.md",
    "EVIDENCE_TEMPLATE.md",
    "SPEC_SUMMARY_TEMPLATE.md",
    "BUSINESS_PLAN_TEMPLATE.md",
    "PLAN_QUALITY_GATE.md",
    "PLAN_REGISTRY.md",
    "NOTES_MIGRATION_GUIDE.md",
    "New-BusinessPlan.ps1",
    "business/README.md",
    "notes/README.md",
    "notes/PRODUCTION_NOTES.md",
    "notes/DEFERRED_ITEMS.md",
    "notes/KNOWN_RISKS.md",
    "notes/FOLLOW_UPS.md",
    "notes/DECISION_BACKLOG.md",
    "notes/API_NOTES.md",
    "notes/WEB_NOTES.md",
    "notes/MOBILE_NOTES.md",
    "notes/CROSS_PLATFORM_NOTES.md"
)

$errors = New-Object System.Collections.Generic.List[string]

foreach ($relativePath in $requiredFiles) {
    $fullPath = Join-Path $planningRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        $errors.Add("Missing required planning file: documentation/plans/$relativePath")
    }
}

if (Test-Path -LiteralPath $businessRoot -PathType Container) {
    foreach ($directory in Get-ChildItem -LiteralPath $businessRoot -Directory) {
        if ($directory.Name -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$') {
            $errors.Add("Business plan folder must use kebab-case: $($directory.FullName)")
            continue
        }

        foreach ($requiredPlanFile in @("DISCOVERY.md", "EVIDENCE.md", "SPEC_SUMMARY.md", "PLAN.md", "DECISIONS.md", "RESEARCH.md")) {
            $planPath = Join-Path $directory.FullName $requiredPlanFile
            if (-not (Test-Path -LiteralPath $planPath -PathType Leaf)) {
                $errors.Add("Business plan '$($directory.Name)' is missing $requiredPlanFile")
            }
        }

        $planFile = Join-Path $directory.FullName "PLAN.md"
        if (Test-Path -LiteralPath $planFile -PathType Leaf) {
            $content = Get-Content -LiteralPath $planFile -Raw
            $escapedId = [regex]::Escape($directory.Name)
            if ($content -notmatch "\|\s*Plan ID\s*\|\s*`?$escapedId`?\s*\|") {
                $errors.Add("Business plan '$($directory.Name)' PLAN.md must declare the same Plan ID as its folder name")
            }
        }

        $evidenceFile = Join-Path $directory.FullName "EVIDENCE.md"
        if (Test-Path -LiteralPath $evidenceFile -PathType Leaf) {
            $evidenceContent = Get-Content -LiteralPath $evidenceFile -Raw
            foreach ($classification in @("VERIFIED CURRENT", "REQUESTED TARGET", "ASSUMPTION", "UNKNOWN", "NOT APPLICABLE")) {
                if ($evidenceContent -notmatch [regex]::Escape($classification)) {
                    $errors.Add("Business plan '$($directory.Name)' EVIDENCE.md must preserve classification '$classification'")
                }
            }
        }
    }
}

$canonicalNoteFiles = @(
    @{ File = "PRODUCTION_NOTES.md"; Prefix = "PROD" },
    @{ File = "DEFERRED_ITEMS.md"; Prefix = "DEF" },
    @{ File = "KNOWN_RISKS.md"; Prefix = "RISK" },
    @{ File = "FOLLOW_UPS.md"; Prefix = "FOLLOW" },
    @{ File = "DECISION_BACKLOG.md"; Prefix = "DEC" }
)

$seenIds = @{}
foreach ($definition in $canonicalNoteFiles) {
    $filePath = Join-Path $notesRoot $definition.File
    if (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
        continue
    }

    $content = Get-Content -LiteralPath $filePath -Raw
    $matches = [regex]::Matches($content, '(?m)^\|\s*([A-Z]+-[0-9]{3})\s*\|')
    foreach ($match in $matches) {
        $id = $match.Groups[1].Value
        if ($id -notmatch "^$($definition.Prefix)-[0-9]{3}$") {
            $errors.Add("Invalid note ID '$id' in $($definition.File); expected $($definition.Prefix)-###")
        }
        if ($seenIds.ContainsKey($id)) {
            $errors.Add("Duplicate canonical note ID '$id' in $($definition.File) and $($seenIds[$id])")
        } else {
            $seenIds[$id] = $definition.File
        }
    }
}

$indexFiles = @(
    "API_NOTES.md",
    "WEB_NOTES.md",
    "MOBILE_NOTES.md",
    "CROSS_PLATFORM_NOTES.md"
)

foreach ($indexFile in $indexFiles) {
    $filePath = Join-Path $notesRoot $indexFile
    if (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
        continue
    }

    $content = Get-Content -LiteralPath $filePath -Raw
    $matches = [regex]::Matches($content, '(?m)^\|\s*([A-Z]+-[0-9]{3})\s*\|')
    foreach ($match in $matches) {
        $id = $match.Groups[1].Value
        if (-not $seenIds.ContainsKey($id)) {
            $errors.Add("Index $indexFile references unknown canonical note ID '$id'")
        }
    }
}

$registryPath = Join-Path $planningRoot "PLAN_REGISTRY.md"
$registeredPlanIds = @{}
if (Test-Path -LiteralPath $registryPath -PathType Leaf) {
    $registryContent = Get-Content -LiteralPath $registryPath -Raw
    $registryMatches = [regex]::Matches(
        $registryContent,
        '(?m)^\|\s*`([a-z0-9]+(?:-[a-z0-9]+)*)`\s*\|'
    )
    foreach ($match in $registryMatches) {
        $id = $match.Groups[1].Value
        if ($registeredPlanIds.ContainsKey($id)) {
            $errors.Add("Duplicate Plan ID '$id' in PLAN_REGISTRY.md")
        } else {
            $registeredPlanIds[$id] = $true
        }
    }
}

if (Test-Path -LiteralPath $businessRoot -PathType Container) {
    foreach ($directory in Get-ChildItem -LiteralPath $businessRoot -Directory) {
        if (-not $registeredPlanIds.ContainsKey($directory.Name)) {
            $errors.Add("Business plan '$($directory.Name)' is not registered in PLAN_REGISTRY.md")
        }
    }
}

$checkScriptPath = $PSCommandPath
$stalePathReferences = Get-ChildItem -LiteralPath $planningRoot -Recurse -File |
    Where-Object { $_.FullName -ne $checkScriptPath } |
    Where-Object { $_.Extension -in @(".md", ".ps1", ".json") } |
    Select-String -SimpleMatch "documentation/plans/plans/"
foreach ($match in $stalePathReferences) {
    $errors.Add("Stale planning path reference in $($match.Path): documentation/plans/plans/")
}

if ($errors.Count -gt 0) {
    Write-Host "Planning checks failed:" -ForegroundColor Red
    foreach ($errorMessage in $errors) {
        Write-Host "  - $errorMessage" -ForegroundColor Red
    }
    exit 1
}

Write-Host "Planning checks passed: creation protocol, plan structure, evidence/spec files, plan registry IDs, canonical note IDs, note indexes, and canonical paths are clean."
