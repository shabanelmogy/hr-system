[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Destination,

    [Parameter(Mandatory = $true)]
    [ValidateSet('Design', 'Migrate', 'Extend')]
    [string]$Mode,

    [string]$ProjectName,

    # Existing application to analyze (Migrate mode).
    [string]$Source,

    # Extend mode: refresh planning/_system from this template version.
    [switch]$RefreshSystem
)

$ErrorActionPreference = 'Stop'
$planningTemplateRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$templatesRoot = Split-Path -Parent $planningTemplateRoot
$destinationPath = [System.IO.Path]::GetFullPath($Destination)
$planningRoot = [System.IO.Path]::Combine($destinationPath, 'planning')
$systemRoot = [System.IO.Path]::Combine($planningRoot, '_system')
$artifactsRoot = [System.IO.Path]::Combine($planningTemplateRoot, 'artifacts')
$utf8 = [System.Text.UTF8Encoding]::new($false)

function Copy-Tree([string]$From, [string]$To) {
    if (-not (Test-Path -LiteralPath $From)) { throw "Template path '$From' is missing." }
    New-Item -ItemType Directory -Path $To -Force | Out-Null
    # Windows PowerShell 5.1 has no Path.GetRelativePath; derive it from the resolved root.
    $root = (Resolve-Path -LiteralPath $From).ProviderPath.TrimEnd('\', '/')
    Get-ChildItem -LiteralPath $root -Recurse -File | ForEach-Object {
        $relative = $_.FullName.Substring($root.Length).TrimStart('\', '/')
        $target = [System.IO.Path]::Combine($To, $relative)
        New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
        Copy-Item -LiteralPath $_.FullName -Destination $target -Force
    }
}

function Install-System {
    if (Test-Path -LiteralPath $systemRoot) { Remove-Item -LiteralPath $systemRoot -Recurse -Force }
    New-Item -ItemType Directory -Path $systemRoot -Force | Out-Null
    foreach ($file in @('START_HERE.md', 'PROCESS.md', 'README.md', 'Test-PlanReadiness.ps1')) {
        Copy-Item -LiteralPath ([System.IO.Path]::Combine($planningTemplateRoot, $file)) -Destination $systemRoot -Force
    }
    foreach ($folder in @('skills', 'checklists', 'examples')) {
        Copy-Tree ([System.IO.Path]::Combine($planningTemplateRoot, $folder)) ([System.IO.Path]::Combine($systemRoot, $folder))
    }
    # The readiness check validates the manifest with the same rules as the generators.
    $conversionRoot = [System.IO.Path]::Combine($templatesRoot, 'conversion')
    foreach ($file in @('Test-ConversionManifest.ps1', 'conversion-manifest.schema.json', 'conversion-manifest.example.json')) {
        $path = [System.IO.Path]::Combine($conversionRoot, $file)
        if (Test-Path -LiteralPath $path) { Copy-Item -LiteralPath $path -Destination $systemRoot -Force }
    }
    $version = 'unknown'
    $metadataPath = [System.IO.Path]::Combine($templatesRoot, 'template.json')
    if (Test-Path -LiteralPath $metadataPath) {
        $version = [string](Get-Content -LiteralPath $metadataPath -Raw | ConvertFrom-Json).templateVersion
    }
    [System.IO.File]::WriteAllText([System.IO.Path]::Combine($systemRoot, 'VERSION'), "$version`n", $utf8)
}

function Install-AgentsFile {
    $agentsTemplate = [System.IO.Path]::Combine($templatesRoot, 'assets', 'AGENTS.md')
    $agentsTarget = [System.IO.Path]::Combine($destinationPath, 'AGENTS.md')
    if (-not (Test-Path -LiteralPath $agentsTemplate)) { return }
    if (-not (Test-Path -LiteralPath $agentsTarget)) {
        Copy-Item -LiteralPath $agentsTemplate -Destination $agentsTarget
        return
    }
    $existing = [System.IO.File]::ReadAllText($agentsTarget)
    if ($existing -notmatch 'planning/_system/START_HERE\.md') {
        $block = "`n`n<!-- BEGIN:planning-system -->`n" + [System.IO.File]::ReadAllText($agentsTemplate) + "`n<!-- END:planning-system -->`n"
        [System.IO.File]::WriteAllText($agentsTarget, $existing.TrimEnd() + $block, $utf8)
    }
}

if ($Mode -eq 'Extend') {
    if (-not (Test-Path -LiteralPath ([System.IO.Path]::Combine($planningRoot, 'status.md')))) {
        throw "Extend mode needs an existing planning workspace at '$planningRoot'. Use -Mode Design or -Mode Migrate first."
    }
    if ($RefreshSystem -or -not (Test-Path -LiteralPath $systemRoot)) { Install-System }
    Install-AgentsFile
    Write-Host "Planning workspace ready for Track E (Extend) at '$planningRoot'."
    Write-Host "Ask your assistant: 'Read AGENTS.md. I want to add a feature: <short description>.'"
    return
}

if (Test-Path -LiteralPath $planningRoot) {
    throw "A planning workspace already exists at '$planningRoot'. Use -Mode Extend, or choose another destination."
}
if ($Mode -eq 'Migrate') {
    if ([string]::IsNullOrWhiteSpace($Source)) { throw "Migrate mode requires -Source <path to the existing application>." }
    $sourcePath = [System.IO.Path]::GetFullPath($Source)
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Container)) { throw "Source '$sourcePath' does not exist." }
}
if ([string]::IsNullOrWhiteSpace($ProjectName)) { $ProjectName = Split-Path -Leaf $destinationPath }

New-Item -ItemType Directory -Path $planningRoot -Force | Out-Null
Get-ChildItem -LiteralPath $artifactsRoot -File | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $planningRoot
}
if ($Mode -eq 'Migrate') {
    Copy-Tree ([System.IO.Path]::Combine($artifactsRoot, 'legacy')) ([System.IO.Path]::Combine($planningRoot, 'legacy'))
    Copy-Tree ([System.IO.Path]::Combine($artifactsRoot, 'migration')) ([System.IO.Path]::Combine($planningRoot, 'migration'))
}
Install-System
Install-AgentsFile

# Fill the status header.
$track = @{ Design = 'Design'; Migrate = 'Migrate' }[$Mode]
$phase = @{ Design = 'B1 - Vision and scope'; Migrate = 'A1 - Intake and inventory' }[$Mode]
$statusPath = [System.IO.Path]::Combine($planningRoot, 'status.md')
$status = [System.IO.File]::ReadAllText($statusPath)
$status = $status.Replace('<<project name>>', $ProjectName)
$status = $status.Replace('<<Migrate | Design | Extend>>', $track)
$status = [regex]::Replace($status, '<<A1 \| B1[^>]*>>', $phase)
$status = $status.Replace('<<YYYY-MM-DD>>', (Get-Date -Format 'yyyy-MM-dd'))
if ($Mode -eq 'Design') {
    $status = $status.Replace('<<preserve exactly | preserve flows | redesign allowed | n/a>>', 'n/a')
    $status = $status.Replace('<<the single next step>>', 'Run business-discovery B1: problem, goals, constraints, tenancy, first release.')
    $status = $status.Replace('<<what was discussed and decided; where to continue>>', 'Workspace created. No discussion yet.')
}
else {
    $status = $status.Replace('<<the single next step>>', "Run legacy-analysis A1: complete legacy/inventory.md for '$sourcePath'.")
    $status = $status.Replace('<<what was discussed and decided; where to continue>>', "Workspace created. Source: $sourcePath")
}
$status = $status.Replace('<<Medium/Low findings from plan-review>>', 'None yet.')
[System.IO.File]::WriteAllText($statusPath, $status, $utf8)

if ($Mode -eq 'Migrate') {
    $analyzer = [System.IO.Path]::Combine($templatesRoot, 'conversion', 'Analyze-NextProject.ps1')
    $inventoryPath = [System.IO.Path]::Combine($planningRoot, 'legacy', 'inventory.md')
    $manualTemplate = [System.IO.File]::ReadAllText($inventoryPath)
    if (Test-Path -LiteralPath $analyzer) {
        $generated = [System.IO.Path]::Combine($planningRoot, 'legacy', 'inventory.generated.md')
        & $analyzer -Source $sourcePath -Output $generated
        $combined = [System.IO.File]::ReadAllText($generated).TrimEnd() + "`n`n---`n`n# Manual completion`n`n" +
            ($manualTemplate -replace '^# Legacy inventory\s*', '')
        [System.IO.File]::WriteAllText($inventoryPath, $combined, $utf8)
        Remove-Item -LiteralPath $generated
    }
    else {
        Write-Warning "Analyzer not found at '$analyzer'. Complete legacy/inventory.md by hand."
    }
}

Write-Host "Created planning workspace ($Mode) at '$planningRoot'."
if ($Mode -eq 'Design') {
    Write-Host "Ask your assistant: 'Read AGENTS.md and start planning. I want to discuss the business first.'"
}
else {
    Write-Host "Ask your assistant: 'Read AGENTS.md. Analyze the legacy application at $sourcePath and continue the plan.'"
}
Write-Host "Check readiness any time: pwsh '$([System.IO.Path]::Combine($systemRoot, 'Test-PlanReadiness.ps1'))' -PlanningRoot '$planningRoot'"
