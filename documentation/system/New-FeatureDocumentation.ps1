[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)]
    [ValidatePattern('^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$')]
    [string]$FeatureId,

    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$FeatureName,

    [ValidateSet('countries', 'states')]
    [string]$ReferenceFeature = 'countries'
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
$artifact = $artifact.Replace('<repository-relative implementation request path>', $implementationRequestRelativePath)
$artifact = $artifact.Replace('<repository-relative path>', $draftManifestRelativePath)
$artifact = $artifact.Replace('<new feature | existing-feature review | existing-feature change>', 'new feature')
$artifact = $artifact.Replace(
    '| Applied reference | `Countries`, `States`, or `<documented alternative>` |',
    "| Applied reference | ``$ReferenceFeature`` |"
)

$implementationRequest = Get-Content -LiteralPath $implementationRequestTemplatePath -Raw -Encoding UTF8
$implementationRequest = $implementationRequest.Replace('<Feature Name>', $FeatureName)
$implementationRequest = $implementationRequest.Replace('<feature>', $FeatureId)
$implementationRequest = $implementationRequest.Replace('<ReferenceFeature>', $ReferenceFeature)
$implementationRequest = $implementationRequest.Replace('<YYYY-MM-DD>', (Get-Date).ToString('yyyy-MM-dd'))
$implementationRequest = $implementationRequest.Replace('<repository-relative review artifact path>', $artifactRelativePath)
$implementationRequest = $implementationRequest.Replace('<repository-relative draft or final manifest path>', $draftManifestRelativePath)

$draftManifest = [ordered]@{
    schemaVersion = 1
    status = 'draft'
    feature = $FeatureId
    featureName = $FeatureName
    referenceFeature = $ReferenceFeature
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
        'Complete every decision and remove every placeholder in IMPLEMENTATION-REQUEST.md before implementation.',
        'Add existing API, web, mobile, configuration, localization, and test sources.',
        'Classify every optional view, including Import, as Required, Deferred, or Excluded independently for web and mobile.',
        'When Import is Required, add its API and applicable client runtime, route/configuration, localization, and focused-test paths.',
        'Record and test the exact Import request envelope, limits, duplicate and relationship rules, atomicity, permissions, side effects, and retry behavior.',
        'Add source collections with evidence-based minimum file counts.',
        'Create and complete the four planned canonical books.',
        'Rename this file to required-files.json only after every declared path exists.',
        'Update the review artifact to point at required-files.json and mark its documentation state Final.',
        'Merge recipe-registration.draft.json into recipe-manifest.json only after the four canonical books are complete.',
        "Write generated packets under documentation/system/generated/$FeatureId/.",
        'Run generation and then Generate-Documentation.ps1 -Check.',
        'Complete phase 06 with an explicit handoff decision.'
    )
}
$draftJson = $draftManifest | ConvertTo-Json -Depth 10

$masterBookId = "$FeatureId-master"
$apiBookId = "$FeatureId-api"
$webBookId = "$FeatureId-web"
$mobileBookId = "$FeatureId-mobile"
$registrationDraft = [ordered]@{
    status = 'draft'
    referenceFeature = $ReferenceFeature
    instructions = 'Merge these entries into recipe-manifest.json only after required-files.json and all four canonical books exist.'
    books = @(
        [ordered]@{ id = $masterBookId; path = "../project/${upperFeature}_FEATURE_FULL_REVIEW.md"; title = "$FeatureName cross-platform master review" },
        [ordered]@{ id = $apiBookId; path = "../api/${pascalFeature}_API_Implementation_Profile.md"; title = "$FeatureName API implementation profile" },
        [ordered]@{ id = $webBookId; path = "../web-next/features/$FeatureId-frontend-reference.md"; title = "$FeatureName Next.js implementation profile" },
        [ordered]@{ id = $mobileBookId; path = "../mobile-react/$FeatureId-mobile-reference.md"; title = "$FeatureName Expo implementation profile" }
    )
    requiredFileManifest = "features/$FeatureId/required-files.json"
    recipes = @(
        [ordered]@{
            id = "$FeatureId-phase-00-discovery-evidence"; title = "$FeatureName Phase 00 - Discovery and Evidence"
            template = 'templates/PHASE-00-discovery-evidence.template.md'; output = "generated/$FeatureId/PHASE-00-discovery-evidence.md"
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
            id = "$FeatureId-phase-06-final-reconciliation"; title = "$FeatureName Phase 06 - Final Reconciliation"
            template = 'templates/PHASE-06-final-reconciliation.template.md'; output = "generated/$FeatureId/PHASE-06-final-reconciliation.md"
            sources = @(
                [ordered]@{ book = $masterBookId; sections = @(8, 9, 10) },
                [ordered]@{ book = $apiBookId; sections = @(10, 11) },
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
Write-Host "Reference selected: $ReferenceFeature"
Write-Host 'The draft manifest is intentionally not registered in recipe-manifest.json.'
Write-Host "After runtime evidence and the four canonical books exist, finalize the manifest and register recipes under generated/$FeatureId/."
