[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)]
    [ValidatePattern('^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$')]
    [string]$FeatureId,

    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$FeatureName,

    [Parameter(Mandatory)]
    [ValidatePattern('^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$')]
    [string]$PlanId,

    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$SliceId,

    [Parameter(Mandatory)]
    [ValidatePattern('^[A-Za-z][A-Za-z0-9.-]*$')]
    [string]$Module,

    [ValidatePattern('^(?:none|[a-z][a-z0-9]*(?:-[a-z0-9]+)*)$')]
    [string]$ReferenceFeature = 'none'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$FeatureName = $FeatureName.Trim()
if ($FeatureName.Length -eq 0) {
    throw 'FeatureName must contain a non-whitespace display name.'
}

$systemRoot = $PSScriptRoot
$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $systemRoot '../..'))
$featureRoot = [System.IO.Path]::GetFullPath((Join-Path $systemRoot "features/$FeatureId"))
$expectedPrefix = $repositoryRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar

if (-not $featureRoot.StartsWith($expectedPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Feature documentation path resolves outside the repository: $featureRoot"
}

if (Test-Path -LiteralPath $featureRoot) {
    throw "Feature documentation already exists: $featureRoot. This command never overwrites an existing scaffold."
}

$registryPath = Join-Path $repositoryRoot 'documentation/plans/PLAN_REGISTRY.md'
if (-not (Test-Path -LiteralPath $registryPath -PathType Leaf)) {
    throw "Planning registry is missing: documentation/plans/PLAN_REGISTRY.md"
}

$registryLine = Get-Content -LiteralPath $registryPath -Encoding UTF8 |
    Where-Object { $_ -match ("^\|\s*``" + [regex]::Escape($PlanId) + "``\s*\|") } |
    Select-Object -First 1
if ([string]::IsNullOrWhiteSpace($registryLine)) {
    throw "PlanId '$PlanId' is not registered in documentation/plans/PLAN_REGISTRY.md."
}

$registryColumns = @($registryLine -split '\|' | ForEach-Object { $_.Trim().Trim('`') })
$registeredModule = $registryColumns[3]
$registeredPlanPath = $registryColumns[5]
if (-not $registeredModule.Equals($Module, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "PlanId '$PlanId' is registered for module '$registeredModule', not '$Module'."
}
if ([string]::IsNullOrWhiteSpace($registeredPlanPath) -or $registeredPlanPath -match '[<>]') {
    throw "PlanId '$PlanId' has an invalid canonical plan path in PLAN_REGISTRY.md: '$registeredPlanPath'."
}

$canonicalPlanRelativePath = $registeredPlanPath -replace '\\', '/'
$canonicalPlanPath = [System.IO.Path]::GetFullPath((Join-Path $repositoryRoot ($canonicalPlanRelativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)))
$repositoryPrefix = $repositoryRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
if (-not $canonicalPlanPath.StartsWith($repositoryPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Canonical plan path resolves outside the repository: $canonicalPlanRelativePath"
}
$archiveRoot = [System.IO.Path]::GetFullPath((Join-Path $repositoryRoot 'documentation/old files'))
$archivePrefix = $archiveRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
if ($canonicalPlanPath.Equals($archiveRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
    $canonicalPlanPath.StartsWith($archivePrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "PlanId '$PlanId' cannot use an archived canonical plan under documentation/old files."
}
if (-not (Test-Path -LiteralPath $canonicalPlanPath -PathType Leaf)) {
    throw "Canonical plan does not exist for PlanId '$PlanId': $canonicalPlanRelativePath"
}

$planText = Get-Content -LiteralPath $canonicalPlanPath -Raw -Encoding UTF8
if ($planText -notmatch ("(?im)^\|\s*Plan ID\s*\|\s*" + [regex]::Escape($PlanId) + "\s*\|")) {
    throw "Canonical plan metadata does not declare Plan ID '$PlanId'."
}
if ($planText -notmatch ("(?im)^\|\s*Owning module\s*\|\s*" + [regex]::Escape($Module) + "\s*\|")) {
    throw "Canonical plan metadata does not declare owning module '$Module'."
}
if ($planText -notmatch [regex]::Escape($SliceId)) {
    throw "SliceId '$SliceId' was not found in canonical plan '$canonicalPlanRelativePath'. Use the exact authorized slice identifier/name from the plan."
}
if ($planText -notmatch '(?im)^\|\s*Status\s*\|\s*[^|]*(execution-ready|implementation ready|in progress|verified)[^|]*\|') {
    throw "Canonical plan '$PlanId' is not marked execution-ready/Implementation Ready/In Progress/Verified. Resolve the planning gate before scaffolding runtime work."
}

$decompositionSection = [regex]::Match(
    $planText,
    '(?ims)^###\s+Feature Decomposition Gate\s*\r?\n(?<body>.*?)(?=^###\s+|^##\s+|\z)')
$decompositionDecision = 'Not declared - Phase 00 planning reconciliation required'
$screenWorkflowContractRelativePath = 'N/A'
if (-not $decompositionSection.Success) {
    Write-Warning "Canonical plan '$PlanId' predates the Feature Decomposition Gate. Scaffold creation may continue for compatibility, but Phase 00 blocks runtime implementation until the authorized slice is updated with the gate."
} else {

$decompositionRows = @(
    foreach ($line in ($decompositionSection.Groups['body'].Value -split "\r?\n")) {
        if ($line -notmatch '^\s*\|') {
            continue
        }

        $cells = @($line.Trim().Trim('|') -split '\|' | ForEach-Object { $_.Trim().Trim([char]96) })
        if ($cells.Count -lt 5 -or $cells[1] -notin @('Single feature', 'Decompose')) {
            continue
        }

        if ($cells[2] -notmatch '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$') {
            throw "Feature Decomposition Gate contains invalid Feature ID '$($cells[2])' in canonical plan '$PlanId'."
        }

        [pscustomobject]@{
            Slice = $cells[0]
            Decision = $cells[1]
            FeatureId = $cells[2]
            Contract = $cells[3]
            Boundary = $cells[4]
        }
    }
)

$sliceDecompositionRows = @($decompositionRows | Where-Object {
    $_.Slice.Equals($SliceId, [System.StringComparison]::OrdinalIgnoreCase)
})
if ($sliceDecompositionRows.Count -eq 0) {
    throw "Feature Decomposition Gate has no row for authorized SliceId '$SliceId'. Use the exact slice identifier/name and bind it to one or more Feature IDs."
}

$sliceDecisions = @($sliceDecompositionRows.Decision | Select-Object -Unique)
if ($sliceDecisions.Count -ne 1) {
    throw "Feature Decomposition Gate for SliceId '$SliceId' mixes Single feature and Decompose decisions."
}
$decompositionDecision = [string]$sliceDecisions[0]
$matchingDecompositionRows = @($sliceDecompositionRows | Where-Object {
    $_.FeatureId.Equals($FeatureId, [System.StringComparison]::OrdinalIgnoreCase)
})
if ($matchingDecompositionRows.Count -ne 1) {
    throw "Feature Decomposition Gate for SliceId '$SliceId' must contain FeatureId '$FeatureId' exactly once."
}
$featureDecomposition = $matchingDecompositionRows[0]

if ([string]::IsNullOrWhiteSpace($featureDecomposition.Boundary) -or
    $featureDecomposition.Boundary -match '<[^>]+>|\bTBD\b') {
    throw "Feature Decomposition Gate boundary for FeatureId '$FeatureId' is unresolved."
}

if ($decompositionDecision -eq 'Single feature') {
    if ($sliceDecompositionRows.Count -ne 1) {
        throw "SliceId '$SliceId' is marked Single feature but declares $($sliceDecompositionRows.Count) feature rows."
    }
} else {
    $distinctChildIds = @($sliceDecompositionRows.FeatureId | Select-Object -Unique)
    if ($distinctChildIds.Count -lt 2) {
        throw "SliceId '$SliceId' is marked Decompose but must declare at least two distinct child Feature IDs."
    }
    if ([string]::IsNullOrWhiteSpace($featureDecomposition.Contract) -or
        $featureDecomposition.Contract -match '^(?i:N/A)' -or
        $featureDecomposition.Contract -match '<[^>]+>|\bTBD\b') {
        throw "Decomposed FeatureId '$FeatureId' must reference a completed Screen/Workflow Contract."
    }

    $screenWorkflowContractRelativePath = $featureDecomposition.Contract -replace '\\', '/'
    $screenWorkflowContractPath = [System.IO.Path]::GetFullPath((Join-Path $repositoryRoot ($screenWorkflowContractRelativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar)))
    $planDirectory = Split-Path -Parent $canonicalPlanPath
    $decompositionRoot = [System.IO.Path]::GetFullPath((Join-Path $planDirectory 'decomposition'))
    $decompositionPrefix = $decompositionRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
    if (-not $screenWorkflowContractPath.StartsWith($decompositionPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Screen/Workflow Contract for FeatureId '$FeatureId' must live under the owning plan's decomposition/ folder."
    }
    if (-not (Test-Path -LiteralPath $screenWorkflowContractPath -PathType Leaf)) {
        throw "Screen/Workflow Contract is missing for decomposed FeatureId '$FeatureId': $screenWorkflowContractRelativePath"
    }

    $screenWorkflowContractText = Get-Content -LiteralPath $screenWorkflowContractPath -Raw -Encoding UTF8
    $requiredContractHeadings = @(
        '## 1. Child boundary and outcome',
        '## 2. Closest existing reference',
        '## 3. Reuse and composition contract',
        '## 4. Screen and workspace contract',
        '## 5. Create, edit, view, and lifecycle contract',
        '## 6. Typed transport and server criteria',
        '## 7. UX states, permissions, and read-only behavior',
        '## 8. Concurrency and consistency',
        '## 9. i18n, RTL, accessibility, and responsive behavior',
        '## 10. Verification contract',
        '## 11. Child exit gate'
    )
    foreach ($heading in $requiredContractHeadings) {
        if (-not $screenWorkflowContractText.Contains($heading)) {
            throw "Screen/Workflow Contract for FeatureId '$FeatureId' is missing required section '$heading'."
        }
    }
    if ($screenWorkflowContractText -match '<[A-Za-z][^>\r\n]*>') {
        throw "Screen/Workflow Contract for FeatureId '$FeatureId' contains unresolved template placeholders: $screenWorkflowContractRelativePath"
    }
    if ($screenWorkflowContractText -notmatch ("(?im)^\|\s*Child Feature ID\s*\|\s*\x60?" + [regex]::Escape($FeatureId) + "\x60?\s*\|")) {
        throw "Screen/Workflow Contract metadata does not declare Child Feature ID '$FeatureId'."
    }
    if ($screenWorkflowContractText -notmatch ("(?im)^\|\s*Authorized slice\s*\|\s*\x60?" + [regex]::Escape($SliceId) + "\x60?\s*\|")) {
        throw "Screen/Workflow Contract metadata does not declare authorized SliceId '$SliceId'."
    }
}
}

$planIdDisplay = $PlanId
$sliceIdDisplay = $SliceId
$moduleDisplay = $Module
$canonicalPlanDirectory = [System.IO.Path]::GetDirectoryName(($canonicalPlanRelativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar))
$educationRelativePath = (($canonicalPlanDirectory -replace '\\', '/').TrimEnd('/')) + "/education/$FeatureId.md"
$referenceDisplay = if ([string]::IsNullOrWhiteSpace($ReferenceFeature) -or $ReferenceFeature -eq 'none') { 'N/A' } else { $ReferenceFeature }
if ($referenceDisplay -ne 'N/A') {
    $referenceManifest = Join-Path $systemRoot "features/$ReferenceFeature/required-files.json"
    if (-not (Test-Path -LiteralPath $referenceManifest -PathType Leaf)) {
        throw "ReferenceFeature '$ReferenceFeature' has no final required-files.json under documentation/system/features/$ReferenceFeature/."
    }
}

$featureParts = @($FeatureId -split '-')
$pascalFeature = ($featureParts | ForEach-Object {
    if ($_.Length -eq 1) { $_.ToUpperInvariant() }
    else { $_.Substring(0, 1).ToUpperInvariant() + $_.Substring(1) }
}) -join ''
$upperFeature = ($FeatureId -replace '-', '_').ToUpperInvariant()
$artifactFileName = "$upperFeature-REVIEW-ARTIFACTS.md"
$implementationRequestFileName = 'IMPLEMENTATION-REQUEST.md'
$artifactRelativePath = "documentation/system/features/$FeatureId/$artifactFileName"
$implementationRequestRelativePath = "documentation/system/features/$FeatureId/$implementationRequestFileName"
$draftManifestRelativePath = "documentation/system/features/$FeatureId/required-files.draft.json"
$registrationDraftRelativePath = "documentation/system/features/$FeatureId/recipe-registration.draft.json"
$artifactPath = Join-Path $featureRoot $artifactFileName
$implementationRequestPath = Join-Path $featureRoot $implementationRequestFileName
$draftManifestPath = Join-Path $featureRoot 'required-files.draft.json'
$registrationDraftPath = Join-Path $featureRoot 'recipe-registration.draft.json'
$templatePath = Join-Path $systemRoot 'templates/FEATURE-REVIEW-ARTIFACTS.template.md'
$implementationRequestTemplatePath = Join-Path $systemRoot 'templates/FEATURE-IMPLEMENTATION-REQUEST.template.md'

$plannedBooks = [ordered]@{
    master = "documentation/project/${upperFeature}_FEATURE_FULL_REVIEW.md"
    api = "documentation/api/${pascalFeature}_API_Implementation_Profile.md"
    web = "documentation/web-next/features/$FeatureId-frontend-reference.md"
    mobile = "documentation/mobile-react/$FeatureId-mobile-reference.md"
}

$artifact = Get-Content -LiteralPath $templatePath -Raw -Encoding UTF8
$artifact = $artifact.Replace('<Feature Name>', $FeatureName)
$artifact = $artifact.Replace('<feature>', $FeatureId)
$artifact = $artifact.Replace('<FEATURE>', $upperFeature)
$artifact = $artifact.Replace('<YYYY-MM-DD>', (Get-Date).ToString('yyyy-MM-dd'))
$artifact = $artifact.Replace('<PlanId or N/A>', $planIdDisplay)
$artifact = $artifact.Replace('<SliceId or N/A>', $sliceIdDisplay)
$artifact = $artifact.Replace('<CanonicalPlanPath or N/A>', $canonicalPlanRelativePath)
$artifact = $artifact.Replace('<FeatureDecompositionDecision>', $decompositionDecision)
$artifact = $artifact.Replace('<ScreenWorkflowContractPath>', $screenWorkflowContractRelativePath)
$artifact = $artifact.Replace('<ReferenceFeature or N/A>', $referenceDisplay)
$artifact = $artifact.Replace('<repository-relative path or N/A>', $educationRelativePath)
$artifact = $artifact.Replace('<repository-relative implementation request path>', $implementationRequestRelativePath)
$artifact = $artifact.Replace('<repository-relative path>', $draftManifestRelativePath)
$artifact = $artifact.Replace('<new feature | existing-feature review | existing-feature change>', 'new feature')

$implementationRequest = Get-Content -LiteralPath $implementationRequestTemplatePath -Raw -Encoding UTF8
$implementationRequest = $implementationRequest.Replace('<Feature Name>', $FeatureName)
$implementationRequest = $implementationRequest.Replace('<feature>', $FeatureId)
$implementationRequest = $implementationRequest.Replace('<YYYY-MM-DD>', (Get-Date).ToString('yyyy-MM-dd'))
$implementationRequest = $implementationRequest.Replace('<PlanId or N/A>', $planIdDisplay)
$implementationRequest = $implementationRequest.Replace('<SliceId or N/A>', $sliceIdDisplay)
$implementationRequest = $implementationRequest.Replace('<CanonicalPlanPath or N/A>', $canonicalPlanRelativePath)
$implementationRequest = $implementationRequest.Replace('<FeatureDecompositionDecision>', $decompositionDecision)
$implementationRequest = $implementationRequest.Replace('<ScreenWorkflowContractPath>', $screenWorkflowContractRelativePath)
$implementationRequest = $implementationRequest.Replace('<ReferenceFeature or N/A>', $referenceDisplay)
$implementationRequest = $implementationRequest.Replace('<CustomerEducationPath>', $educationRelativePath)
$implementationRequest = $implementationRequest.Replace('<platform | hr | accounting | ...>', $moduleDisplay)
$implementationRequest = $implementationRequest.Replace('<repository-relative review artifact path>', $artifactRelativePath)
$implementationRequest = $implementationRequest.Replace('<repository-relative draft or final manifest path>', $draftManifestRelativePath)

$draftManifest = [ordered]@{
    schemaVersion = 1
    status = 'draft'
    feature = $FeatureId
    featureName = $FeatureName
    referenceFeature = $referenceDisplay
    planId = $planIdDisplay
    sliceId = $sliceIdDisplay
    canonicalPlan = $canonicalPlanRelativePath
    featureDecompositionDecision = $decompositionDecision
    screenWorkflowContract = $screenWorkflowContractRelativePath
    plannedCustomerEducation = $educationRelativePath
    purpose = "Draft evidence plan for $FeatureName. This file is not registered until every final source exists."
    reviewArtifact = $artifactRelativePath
    implementationRequest = $implementationRequestRelativePath
    plannedCanonicalBooks = $plannedBooks
    sourceCollections = @()
    requiredFiles = @(
        [ordered]@{
            id = 'root-agent-guidance'
            layer = 'configuration'
            path = 'AGENTS.md'
            purpose = 'Repository-wide feature and documentation rules'
        },
        [ordered]@{
            id = 'review-artifact'
            layer = 'documentation'
            path = $artifactRelativePath
            purpose = 'Feature requirement, evidence, finding, and verification ledger'
        },
        [ordered]@{
            id = 'implementation-request'
            layer = 'documentation'
            path = $implementationRequestRelativePath
            purpose = 'Copy-ready feature scope, platform decisions, contracts, and quality gates'
        }
    )
    finalizationChecklist = @(
        'Replace every placeholder in the review artifact.',
        'Complete the Existing-System Relationship Review and every decision in IMPLEMENTATION-REQUEST.md before implementation.',
        'Complete the Business Rules Matrix with one primary owner, stable outcome/error, and required test for every known rule.',
        'Complete every Edge Cases & Validation category with scenarios or an explicit N/A reason, enforcement layer, and required test.',
        'Complete the Impact Matrix with Reuse, Extend, Change, Add, or reasoned N/A across every listed area.',
        'Remove every remaining placeholder from IMPLEMENTATION-REQUEST.md before runtime implementation.',
        'Add Phase 00 current API, web, mobile, configuration, localization, and test evidence sources.',
        'Classify every optional view, including Import, as Required, Deferred, or Excluded independently for web and mobile.',
        'When Import is Required, add its API and applicable client runtime, route/configuration, localization, and focused-test paths.',
        'Record and test the exact Import request envelope, limits, duplicate and relationship rules, atomicity, permissions, side effects, and retry behavior.',
        'Add source collections with evidence-based minimum file counts.',
        'Create the four initial applied implementation books from the approved plan plus verified current source; label target-only behavior explicitly.',
        'Rename this file to required-files.json when the Phase 00 evidence paths exist; extend it with runtime files during implementation.',
        'Update the review artifact to point at required-files.json and mark its documentation state Final.',
        'Merge recipe-registration.draft.json into recipe-manifest.json after the Phase 00 books and preflight manifest are complete.',
        "Write generated packets under documentation/system/generated/$FeatureId/.",
        'Run generation and then Generate-Documentation.ps1 -Check.',
        'Complete phase 06 with an explicit verification decision.',
        'Do not start customer-facing education until phase 06 records Verified.',
        'For customer-visible work, complete phase 07 and its Customer Education Pack before Closed.',
        'When Customer Education is Required, add the verified education document to required-files.json and rerun Generate-Documentation.ps1 -Check before Closed.'
    )
}
$draftJson = $draftManifest | ConvertTo-Json -Depth 10

$masterBookId = "$FeatureId-master"
$apiBookId = "$FeatureId-api"
$webBookId = "$FeatureId-web"
$mobileBookId = "$FeatureId-mobile"
$registrationDraft = [ordered]@{
    status = 'draft'
    referenceFeature = $referenceDisplay
    planId = $planIdDisplay
    sliceId = $sliceIdDisplay
    canonicalPlan = $canonicalPlanRelativePath
    featureDecompositionDecision = $decompositionDecision
    screenWorkflowContract = $screenWorkflowContractRelativePath
    plannedCustomerEducation = $educationRelativePath
    instructions = 'Merge these entries into recipe-manifest.json after Phase 00 has a final preflight required-files.json and all four initial applied implementation books. Extend the manifest/books with runtime evidence during implementation.'
    books = @(
        [ordered]@{ id = $masterBookId; path = "../project/${upperFeature}_FEATURE_FULL_REVIEW.md"; title = "$FeatureName cross-platform master review" },
        [ordered]@{ id = $apiBookId; path = "../api/${pascalFeature}_API_Implementation_Profile.md"; title = "$FeatureName API implementation profile" },
        [ordered]@{ id = $webBookId; path = "../web-next/features/$FeatureId-frontend-reference.md"; title = "$FeatureName Next.js implementation profile" },
        [ordered]@{ id = $mobileBookId; path = "../mobile-react/$FeatureId-mobile-reference.md"; title = "$FeatureName Expo implementation profile" }
    )
    requiredFileManifest = "features/$FeatureId/required-files.json"
    recipes = @(
        [ordered]@{
            id = "$FeatureId-phase-00-implementation-preflight"; title = "$FeatureName Phase 00 - Implementation Preflight"
            template = 'templates/PHASE-00-implementation-preflight.template.md'; output = "generated/$FeatureId/PHASE-00-implementation-preflight.md"
            sources = @(
                [ordered]@{ book = $masterBookId; sections = @(1, 2, 5, 8, 9) },
                [ordered]@{ book = $apiBookId; sections = @(1, 10, 11) },
                [ordered]@{ book = $webBookId; sections = @(1, 2, 12, 13) },
                [ordered]@{ book = $mobileBookId; sections = @(1, 14, 15) }
            )
        },
        [ordered]@{
            id = "$FeatureId-phase-01-domain-api"; title = "$FeatureName Phase 01 - Domain and API"
            template = 'templates/PHASE-01-domain-api.template.md'; output = "generated/$FeatureId/PHASE-01-domain-api.md"
            sources = @(
                [ordered]@{ book = $masterBookId; sections = @(3, 4, 6) },
                [ordered]@{ book = $apiBookId; sections = @(1, 2, 3, 4, 5, 6, 7, 8, 9, 10) }
            )
        },
        [ordered]@{
            id = "$FeatureId-phase-02-web-client"; title = "$FeatureName Phase 02 - Next.js Client"
            template = 'templates/PHASE-02-web-client.template.md'; output = "generated/$FeatureId/PHASE-02-web-client.md"
            sources = @(
                [ordered]@{ book = $masterBookId; sections = @(3, 4, 6, 7) },
                [ordered]@{ book = $webBookId; sections = @(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14) }
            )
        },
        [ordered]@{
            id = "$FeatureId-phase-03-mobile-client"; title = "$FeatureName Phase 03 - Expo Mobile Client"
            template = 'templates/PHASE-03-mobile-client.template.md'; output = "generated/$FeatureId/PHASE-03-mobile-client.md"
            sources = @(
                [ordered]@{ book = $masterBookId; sections = @(3, 4, 6, 7) },
                [ordered]@{ book = $mobileBookId; sections = @(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15) }
            )
        },
        [ordered]@{
            id = "$FeatureId-phase-04-domain-actions"; title = "$FeatureName Phase 04 - Domain Actions and Lifecycle"
            template = 'templates/PHASE-04-domain-actions.template.md'; output = "generated/$FeatureId/PHASE-04-domain-actions.md"
            sources = @(
                [ordered]@{ book = $masterBookId; sections = @(3, 4, 6, 7, 8) },
                [ordered]@{ book = $apiBookId; sections = @(6, 7, 8) },
                [ordered]@{ book = $webBookId; sections = @(6, 7, 8, 9) },
                [ordered]@{ book = $mobileBookId; sections = @(9, 10, 11) }
            )
        },
        [ordered]@{
            id = "$FeatureId-phase-05-integration-runtime"; title = "$FeatureName Phase 05 - Integration and Runtime"
            template = 'templates/PHASE-05-integration-runtime.template.md'; output = "generated/$FeatureId/PHASE-05-integration-runtime.md"
            sources = @(
                [ordered]@{ book = $masterBookId; sections = @(4, 5, 6, 7, 9) },
                [ordered]@{ book = $apiBookId; sections = @(8, 9, 10) },
                [ordered]@{ book = $webBookId; sections = @(8, 10, 13) },
                [ordered]@{ book = $mobileBookId; sections = @(2, 11, 12, 15) }
            )
        },
        [ordered]@{
            id = "$FeatureId-phase-06-verification-acceptance"; title = "$FeatureName Phase 06 - Verification and Acceptance"
            template = 'templates/PHASE-06-verification-acceptance.template.md'; output = "generated/$FeatureId/PHASE-06-verification-acceptance.md"
            sources = @(
                [ordered]@{ book = $masterBookId; sections = @(8, 9, 10) },
                [ordered]@{ book = $apiBookId; sections = @(10, 11) },
                [ordered]@{ book = $webBookId; sections = @(12, 13, 14) },
                [ordered]@{ book = $mobileBookId; sections = @(14, 15) }
            )
        },
        [ordered]@{
            id = "$FeatureId-phase-07-customer-education-closure"; title = "$FeatureName Phase 07 - Customer Education and Closure"
            template = 'templates/PHASE-07-customer-education-closure.template.md'; output = "generated/$FeatureId/PHASE-07-customer-education-closure.md"
            sources = @(
                [ordered]@{ book = $masterBookId; sections = @(8, 9, 10) },
                [ordered]@{ book = $webBookId; sections = @(12, 13, 14) },
                [ordered]@{ book = $mobileBookId; sections = @(14, 15) }
            )
        }
    )
}
$registrationDraftJson = $registrationDraft | ConvertTo-Json -Depth 12

if (-not $PSCmdlet.ShouldProcess($featureRoot, "Create documentation scaffold for $FeatureName")) {
    return
}

New-Item -ItemType Directory -Path $featureRoot | Out-Null
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($artifactPath, $artifact, $utf8NoBom)
[System.IO.File]::WriteAllText($implementationRequestPath, $implementationRequest, $utf8NoBom)
[System.IO.File]::WriteAllText($draftManifestPath, ($draftJson + "`n"), $utf8NoBom)
[System.IO.File]::WriteAllText($registrationDraftPath, ($registrationDraftJson + "`n"), $utf8NoBom)

Write-Host "Created $artifactRelativePath"
Write-Host "Created $implementationRequestRelativePath"
Write-Host "Created $draftManifestRelativePath"
Write-Host "Created $registrationDraftRelativePath"
Write-Host "Plan: $planIdDisplay / Slice: $sliceIdDisplay"
Write-Host "Feature decomposition: $decompositionDecision / Contract: $screenWorkflowContractRelativePath"
Write-Host "Reference selected: $referenceDisplay"
Write-Host 'The draft manifest is intentionally not registered in recipe-manifest.json.'
Write-Host 'Runtime implementation starts only after Phase 00 implementation preflight and execution-readiness evidence are complete.'
Write-Host "During Phase 00, create the four initial applied implementation books, finalize the preflight manifest, register recipes, and generate the Phase 00 packet before runtime coding."
Write-Host 'Phase 06 must record Verified before Phase 07 customer education/closure can complete.'
