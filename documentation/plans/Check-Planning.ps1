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
    "FEATURE_DECOMPOSITION_TEMPLATE.md",
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
$warnings = New-Object System.Collections.Generic.List[string]

foreach ($relativePath in $requiredFiles) {
    $fullPath = Join-Path $planningRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        $errors.Add("Missing required planning file: documentation/plans/$relativePath")
    }
}

$businessPlanTemplatePath = Join-Path $planningRoot "BUSINESS_PLAN_TEMPLATE.md"
if (Test-Path -LiteralPath $businessPlanTemplatePath -PathType Leaf) {
    $businessPlanTemplateContent = Get-Content -LiteralPath $businessPlanTemplatePath -Raw
    if ($businessPlanTemplateContent -notmatch '(?m)^### Feature Decomposition Gate$') {
        $errors.Add("BUSINESS_PLAN_TEMPLATE.md must contain the mandatory Feature Decomposition Gate")
    }
}

$decompositionTemplatePath = Join-Path $planningRoot "FEATURE_DECOMPOSITION_TEMPLATE.md"
if (Test-Path -LiteralPath $decompositionTemplatePath -PathType Leaf) {
    $decompositionTemplateContent = Get-Content -LiteralPath $decompositionTemplatePath -Raw
    foreach ($requiredHeading in @(
        "## 0. Contract metadata",
        "## 1. Child boundary and outcome",
        "## 2. UI Pattern Gate (mandatory before implementation)",
        "## 3. Closest existing reference",
        "## 4. Reuse and composition contract",
        "## 5. Screen and workspace contract",
        "## 6. Typed transport and server criteria",
        "## 7. Create, edit, view, and lifecycle contract",
        "## 8. UX states, permissions, offline, and mock data",
        "## 9. Concurrency, transactions, and consistency",
        "## 10. i18n, RTL, accessibility, and responsive behavior",
        "## 11. Vertical execution ledger (strict one-active-step gate)",
        "## 12. Verification contract",
        "## 13. Child exit gate"
    )) {
        if (-not $decompositionTemplateContent.Contains($requiredHeading)) {
            $errors.Add("FEATURE_DECOMPOSITION_TEMPLATE.md is missing required section '$requiredHeading'")
        }
    }

    foreach ($requiredTemplateMarker in @(
        "| Contract version |",
        "## 2. UI Pattern Gate (mandatory before implementation)",
        "Screen ID",
        "Primary Pattern ID",
        "Exact reviewed reference source path",
        "## 11. Vertical execution ledger (strict one-active-step gate)",
        "API → Web → Mobile → integrated live verification → documentation/closure",
        "## 13. Child exit gate"
    )) {
        if (-not $decompositionTemplateContent.Contains($requiredTemplateMarker)) {
            $errors.Add("FEATURE_DECOMPOSITION_TEMPLATE.md is missing mandatory UI-pattern/execution marker '$requiredTemplateMarker'")
        }
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
        $planContent = ""
        if (Test-Path -LiteralPath $planFile -PathType Leaf) {
            $content = Get-Content -LiteralPath $planFile -Raw
            $planContent = $content
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

        # The roadmap is the only status authority. New roadmaps must publish one
        # explicit active-feature marker; contracts and PLAN.md link to it instead
        # of duplicating execution order.
        $roadmapMarkers = @(Get-ChildItem -LiteralPath $directory.FullName -Recurse -File -Filter "*.md" |
            Select-String -Pattern '(?m)^\*\*ACTIVE_FEATURE_STEP:\*\*\s*\u0060?([^\u0060\r\n| ]+)\u0060?' |
            ForEach-Object { $_.Matches } |
            ForEach-Object { $_.Groups[1].Value })
        if ($roadmapMarkers.Count -gt 1) {
            $errors.Add("Business plan '$($directory.Name)' declares more than one ACTIVE_FEATURE_STEP marker")
        } elseif ($roadmapMarkers.Count -eq 1 -and $roadmapMarkers[0] -match '<|TBD') {
            $errors.Add("Business plan '$($directory.Name)' ACTIVE_FEATURE_STEP must name one concrete feature")
        }

        $decompositionRoot = Join-Path $directory.FullName "decomposition"
        $currentContracts = New-Object System.Collections.Generic.List[object]
        if (Test-Path -LiteralPath $decompositionRoot -PathType Container) {
            foreach ($contractFile in Get-ChildItem -LiteralPath $decompositionRoot -File -Filter "*.md") {
                $contractContent = Get-Content -LiteralPath $contractFile.FullName -Raw
                $isCurrentContract = $contractContent -match '(?m)^\|\s*Contract version\s*\|\s*(?:\u0060)?2\.0(?:\u0060)?\s*\|'
                if (-not $isCurrentContract) {
                    $warnings.Add("Legacy feature contract '$($contractFile.FullName)' has no Contract version 2.0; migrate it before making it Active")
                    continue
                }

                $featureId = ""
                $featureIdMatch = [regex]::Match($contractContent, '(?m)^\|\s*Child Feature ID\s*\|\s*([^|\r\n]+)')
                if ($featureIdMatch.Success) {
                    $featureId = $featureIdMatch.Groups[1].Value.Trim().Trim([char]0x60)
                }
                $isActiveContract = $contractContent -match '(?m)^\|\s*Execution status\s*\|\s*(?:\u0060)?Active\b'
                $currentContracts.Add([pscustomobject]@{
                    Path = $contractFile.FullName
                    FeatureId = $featureId
                    IsActive = $isActiveContract
                })

                foreach ($requiredContractHeading in @(
                    "## 0. Contract metadata",
                    "## 1. Child boundary and outcome",
                    "## 2. UI Pattern Gate (mandatory before implementation)",
                    "## 3. Closest existing reference",
                    "## 4. Reuse and composition contract",
                    "## 5. Screen and workspace contract",
                    "## 6. Typed transport and server criteria",
                    "## 7. Create, edit, view, and lifecycle contract",
                    "## 8. UX states, permissions, offline, and mock data",
                    "## 9. Concurrency, transactions, and consistency",
                    "## 10. i18n, RTL, accessibility, and responsive behavior",
                    "## 11. Vertical execution ledger (strict one-active-step gate)",
                    "## 12. Verification contract",
                    "## 13. Child exit gate"
                )) {
                    if (-not $contractContent.Contains($requiredContractHeading)) {
                        $errors.Add("Current feature contract '$($contractFile.FullName)' is missing '$requiredContractHeading'")
                    }
                }

                foreach ($requiredContractMarker in @(
                    "Screen ID",
                    "Primary Pattern ID",
                    "Exact reviewed reference source path",
                    "Platform status",
                    "Offline policy",
                    "Mock-data policy",
                    "Permission / scope",
                    "Next-step rule"
                )) {
                    if (-not $contractContent.Contains($requiredContractMarker)) {
                        $errors.Add("Current feature contract '$($contractFile.FullName)' is missing UI Pattern Gate marker '$requiredContractMarker'")
                    }
                }

                if ($contractContent -match '<[^>\r\n]+>') {
                    $errors.Add("Current feature contract '$($contractFile.FullName)' still contains template placeholders")
                }

                $uiPatternSection = [regex]::Match(
                    $contractContent,
                    '(?ms)^## 2\. UI Pattern Gate \(mandatory before implementation\)\s*(.*?)(?=^## 3\.)'
                )
                if (-not $uiPatternSection.Success) {
                    $errors.Add("Current feature contract '$($contractFile.FullName)' has no parseable UI Pattern Gate section")
                } else {
                    $uiTableLines = @($uiPatternSection.Groups[1].Value -split "`r?`n" |
                        Where-Object {
                            $_ -match '^\|.*\|\s*$' -and
                            $_ -notmatch '^\|\s*---' -and
                            $_ -notmatch '^\|\s*Screen ID\s*\|'
                        })
                    $screenPlatforms = @{}

                    foreach ($uiTableLine in $uiTableLines) {
                        $columns = @($uiTableLine.Trim().Trim([char]0x7C).Split([char]0x7C) |
                            ForEach-Object { $_.Trim() })
                        if ($columns.Count -ne 16) {
                            $errors.Add("Current feature contract '$($contractFile.FullName)' has a UI Pattern Gate row with $($columns.Count) columns; expected 16")
                            continue
                        }

                        $screenId = $columns[0]
                        $platform = $columns[1]
                        $patternId = $columns[5]
                        $referencePath = $columns[7]
                        $platformStatus = $columns[8]
                        $capabilityDecisions = $columns[9]

                        if ([string]::IsNullOrWhiteSpace($screenId) -or $screenId -match '<|TBD') {
                            $errors.Add("Current feature contract '$($contractFile.FullName)' has an invalid UI Pattern Gate Screen ID")
                        }
                        if ($platform -notin @('Web', 'Mobile')) {
                            $errors.Add("Current feature contract '$($contractFile.FullName)' UI Pattern Gate platform '$platform' must be Web or Mobile")
                            continue
                        }
                        if ($patternId -notmatch '^(?:P-[0-9]{3}|Candidate)\b') {
                            $errors.Add("Current feature contract '$($contractFile.FullName)' UI Pattern Gate pattern '$patternId' must be P-### or Candidate")
                        }
                        if ([string]::IsNullOrWhiteSpace($referencePath) -or $referencePath -match '<|TBD' -or $referencePath -notmatch '/') {
                            $errors.Add("Current feature contract '$($contractFile.FullName)' UI Pattern Gate must contain an exact reviewed source path")
                        }
                        if ($platformStatus -notmatch '^(?:Implemented|Adapted|Deferred|Excluded)\b') {
                            $errors.Add("Current feature contract '$($contractFile.FullName)' UI Pattern Gate platform status '$platformStatus' is invalid")
                        }
                        if ([regex]::Matches($capabilityDecisions, '\b(?:Required|Deferred|Excluded)\b').Count -lt 1) {
                            $errors.Add("Current feature contract '$($contractFile.FullName)' UI Pattern Gate must classify its views as Required, Deferred, or Excluded")
                        }

                        if (-not $screenPlatforms.ContainsKey($screenId)) {
                            $screenPlatforms[$screenId] = New-Object System.Collections.Generic.HashSet[string]
                        }
                        [void]$screenPlatforms[$screenId].Add($platform)
                    }

                    foreach ($screenId in $screenPlatforms.Keys) {
                        if (-not $screenPlatforms[$screenId].Contains('Web') -or -not $screenPlatforms[$screenId].Contains('Mobile')) {
                            $errors.Add("Current feature contract '$($contractFile.FullName)' Screen ID '$screenId' must have explicit Web and Mobile UI Pattern Gate rows")
                        }
                    }
                }

                $webRows = [regex]::Matches($contractContent, '(?m)^\|[^|\r\n]+\|\s*Web\s*\|').Count
                $mobileRows = [regex]::Matches($contractContent, '(?m)^\|[^|\r\n]+\|\s*Mobile\s*\|').Count
                if ($webRows -lt 1 -or $mobileRows -lt 1) {
                    $errors.Add("Current feature contract '$($contractFile.FullName)' must declare at least one Web and one Mobile UI Pattern Gate row")
                }

                $hasCandidate = $contractContent -match '(?im)^\|.*\bCandidate\b.*\|'
                if ($isActiveContract -and $hasCandidate) {
                    $errors.Add("Active feature contract '$($contractFile.FullName)' still selects a Candidate UI pattern; register/review the pattern before implementation")
                }

                if ($isActiveContract) {
                    $executionSection = [regex]::Match(
                        $contractContent,
                        '(?ms)^## 11\. Vertical execution ledger \(strict one-active-step gate\)\s*(.*?)(?=^## 12\.)'
                    )
                    $stageRows = @()
                    if ($executionSection.Success) {
                        foreach ($stageLine in @($executionSection.Groups[1].Value -split "`r?`n" | Where-Object { $_ -match '^\|\s*[0-9]+\s*\|' })) {
                            $stageColumns = @($stageLine.Trim().Trim([char]0x7C).Split([char]0x7C) |
                                ForEach-Object { $_.Trim() })
                            if ($stageColumns.Count -ne 6) {
                                $errors.Add("Active feature contract '$($contractFile.FullName)' has a malformed vertical execution row")
                                continue
                            }
                            $stageRows += [pscustomobject]@{
                                Order = [int]$stageColumns[0]
                                Status = $stageColumns[2]
                            }
                        }
                    }

                    if ($stageRows.Count -ne 5) {
                        $errors.Add("Active feature contract '$($contractFile.FullName)' must contain all five vertical execution stages")
                    } else {
                        $activeStages = @($stageRows | Where-Object { $_.Status -eq 'Active' })
                        if ($activeStages.Count -ne 1) {
                            $errors.Add("Active feature contract '$($contractFile.FullName)' must have exactly one Active vertical execution stage")
                        } else {
                            $activeOrder = $activeStages[0].Order
                            foreach ($stageRow in $stageRows) {
                                if ($stageRow.Order -lt $activeOrder -and $stageRow.Status -ne 'Verified') {
                                    $errors.Add("Active feature contract '$($contractFile.FullName)' stage $($stageRow.Order) must be Verified before stage $activeOrder is Active")
                                }
                                if ($stageRow.Order -gt $activeOrder -and $stageRow.Status -notin @('Queued', 'Blocked')) {
                                    $errors.Add("Active feature contract '$($contractFile.FullName)' stage $($stageRow.Order) must remain Queued or Blocked")
                                }
                            }
                        }
                    }
                }
            }
        }

        $planIsV2OrExecutionReady = $planContent -match '(?im)Planning method version\s*\|\s*(?:\u0060)?2\.0' -or
            $planContent -match '(?im)^\|\s*Status\s*\|.*(?:execution-ready|Implementation Ready)'
        if ($currentContracts.Count -gt 0) {
            if ($roadmapMarkers.Count -ne 1) {
                $errors.Add("Business plan '$($directory.Name)' with version 2.0 feature contracts must declare exactly one ACTIVE_FEATURE_STEP marker")
            }

            $activeContracts = @($currentContracts | Where-Object { $_.IsActive })
            if ($activeContracts.Count -ne 1) {
                $errors.Add("Business plan '$($directory.Name)' must have exactly one version 2.0 feature contract with Execution status Active")
            } elseif ($roadmapMarkers.Count -eq 1) {
                $activeFeatureId = $activeContracts[0].FeatureId
                $roadmapFeatureId = $roadmapMarkers[0].Trim([char]0x60)
                if ([string]::IsNullOrWhiteSpace($activeFeatureId) -or $activeFeatureId -ne $roadmapFeatureId) {
                    $errors.Add("Business plan '$($directory.Name)' ACTIVE_FEATURE_STEP '$roadmapFeatureId' must match the Active version 2.0 contract Child Feature ID '$activeFeatureId'")
                }
            }
        } elseif ($planIsV2OrExecutionReady) {
            $warnings.Add("Business plan '$($directory.Name)' is version 2.0 or execution-ready but has no version 2.0 feature contract; create one before runtime implementation")
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

if ($warnings.Count -gt 0) {
    Write-Host "Planning checks passed with migration warnings:" -ForegroundColor Yellow
    foreach ($warningMessage in $warnings) {
        Write-Host "  - $warningMessage" -ForegroundColor Yellow
    }
}

Write-Host "Planning checks passed: creation protocol, authority separation, UI Pattern Gate markers, one-active-step roadmap rule, plan structure, evidence/spec files, plan registry IDs, canonical note IDs, note indexes, and canonical paths are clean."
