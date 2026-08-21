[CmdletBinding()]
param(
    [string]$Recipe = "all",
    [switch]$Check
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$systemRoot = $PSScriptRoot
$manifestPath = Join-Path $systemRoot "recipe-manifest.json"
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $systemRoot $manifest.repositoryRoot))

function Resolve-SystemPath {
    param([Parameter(Mandatory)][string]$RelativePath)

    return [System.IO.Path]::GetFullPath((Join-Path $systemRoot $RelativePath))
}

function Assert-RepositoryPath {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Label
    )

    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $prefix = $repositoryRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
    if (-not $fullPath.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase) -and
        -not $fullPath.Equals($repositoryRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "$Label resolves outside the repository: $fullPath"
    }

    return $fullPath
}

function Get-NormalizedText {
    param([Parameter(Mandatory)][string]$Text)

    return ($Text -replace "`r`n", "`n").TrimEnd() + "`n"
}

function Get-TextHash {
    param([Parameter(Mandatory)][string]$Text)

    $bytes = [System.Text.Encoding]::UTF8.GetBytes((Get-NormalizedText -Text $Text))
    $hash = [System.Security.Cryptography.SHA256]::HashData($bytes)
    return [System.Convert]::ToHexString($hash).ToLowerInvariant()
}

function Get-NumberedSection {
    param(
        [Parameter(Mandatory)][string]$BookPath,
        [Parameter(Mandatory)][int]$SectionNumber
    )

    $content = (Get-Content -LiteralPath $BookPath -Raw) -replace "`r`n", "`n"
    $pattern = '(?ms)^##\s+(?<number>\d+)\.\s+.*?(?=^##\s+\d+\.|\z)'
    $match = [regex]::Matches($content, $pattern) |
        Where-Object { [int]$_.Groups['number'].Value -eq $SectionNumber } |
        Select-Object -First 1

    if ($null -eq $match) {
        throw "Section $SectionNumber was not found in $BookPath"
    }

    return Get-NormalizedText -Text $match.Value
}

function Test-RequiredSources {
    foreach ($requiredManifestRelative in $manifest.requiredFileManifests) {
        $requiredManifestPath = Assert-RepositoryPath -Path (Resolve-SystemPath -RelativePath $requiredManifestRelative) -Label "Required-file manifest"
        if (-not (Test-Path -LiteralPath $requiredManifestPath -PathType Leaf)) {
            throw "Required-file manifest is missing: $requiredManifestPath"
        }

        $requiredManifest = Get-Content -LiteralPath $requiredManifestPath -Raw | ConvertFrom-Json

        foreach ($entry in $requiredManifest.requiredFiles) {
            $requiredPath = Assert-RepositoryPath -Path (Join-Path $repositoryRoot $entry.path) -Label "Required source"
            if (-not (Test-Path -LiteralPath $requiredPath -PathType Leaf)) {
                throw "Required source is missing [$($entry.layer)/$($entry.id)]: $($entry.path)"
            }
        }

        foreach ($collection in $requiredManifest.sourceCollections) {
            $collectionPath = Assert-RepositoryPath -Path (Join-Path $repositoryRoot $collection.path) -Label "Source collection"
            if (-not (Test-Path -LiteralPath $collectionPath -PathType Container)) {
                throw "Source collection is missing [$($collection.layer)/$($collection.id)]: $($collection.path)"
            }

            $files = @(Get-ChildItem -LiteralPath $collectionPath -Recurse -File)
            if ($files.Count -lt [int]$collection.minimumFiles) {
                throw "Source collection [$($collection.layer)/$($collection.id)] contains $($files.Count) files; expected at least $($collection.minimumFiles)."
            }
        }
    }
}

$booksById = @{}
foreach ($book in $manifest.books) {
    $bookPath = Assert-RepositoryPath -Path (Resolve-SystemPath -RelativePath $book.path) -Label "Canonical book"
    if (-not (Test-Path -LiteralPath $bookPath -PathType Leaf)) {
        throw "Canonical book is missing: $bookPath"
    }
    $booksById[$book.id] = [pscustomobject]@{
        Id = $book.id
        Title = $book.title
        RelativePath = $book.path
        FullPath = $bookPath
    }
}

$selectedRecipes = @($manifest.recipes | Where-Object { $Recipe -eq "all" -or $_.id -eq $Recipe })
if ($selectedRecipes.Count -eq 0) {
    $available = ($manifest.recipes.id -join ", ")
    throw "Unknown recipe '$Recipe'. Available recipes: all, $available"
}

Test-RequiredSources
$failures = [System.Collections.Generic.List[string]]::new()

foreach ($recipeEntry in $selectedRecipes) {
    $fingerprintRows = [System.Collections.Generic.List[string]]::new()
    $referenceRows = [System.Collections.Generic.List[string]]::new()

    foreach ($source in $recipeEntry.sources) {
        if (-not $booksById.ContainsKey($source.book)) {
            throw "Recipe '$($recipeEntry.id)' references unknown book '$($source.book)'."
        }

        $book = $booksById[$source.book]
        $sections = @($source.sections | ForEach-Object { [int]$_ })
        $referenceRows.Add("- **$($book.Title):** ``$($book.RelativePath)`` sections $($sections -join ', ')")

        foreach ($sectionNumber in $sections) {
            $sectionText = Get-NumberedSection -BookPath $book.FullPath -SectionNumber $sectionNumber
            $fingerprintRows.Add("| $($book.Id) | $sectionNumber | ``$(Get-TextHash -Text $sectionText)`` |")
        }
    }

    $templatePath = Assert-RepositoryPath -Path (Resolve-SystemPath -RelativePath $recipeEntry.template) -Label "Recipe template"
    $outputPath = Assert-RepositoryPath -Path (Resolve-SystemPath -RelativePath $recipeEntry.output) -Label "Generated output"
    $template = Get-Content -LiteralPath $templatePath -Raw
    if ($template.Contains("...")) {
        throw "Template '$($recipeEntry.template)' contains an ellipsis token. Replace it with an explicit instruction."
    }

    $fingerprints = @(
        "| Book | Section | SHA-256 |",
        "| --- | ---: | --- |"
    ) + $fingerprintRows

    $rendered = $template.Replace("{{SOURCE_FINGERPRINTS}}", ($fingerprints -join "`n"))
    $rendered = $rendered.Replace("{{APPROVED_REFERENCES}}", ($referenceRows -join "`n"))
    $rendered = $rendered.Replace("{{RECIPE_TITLE}}", [string]$recipeEntry.title)
    $header = "<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + $($recipeEntry.template) -->`n`n"
    $expected = Get-NormalizedText -Text ($header + $rendered)

    if ($Check) {
        if (-not (Test-Path -LiteralPath $outputPath -PathType Leaf)) {
            $failures.Add("Missing generated packet: $($recipeEntry.output)")
            continue
        }

        $actual = Get-NormalizedText -Text (Get-Content -LiteralPath $outputPath -Raw)
        if ($actual -cne $expected) {
            $failures.Add("Stale generated packet: $($recipeEntry.output)")
        }
        continue
    }

    $outputDirectory = Split-Path -Parent $outputPath
    New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
    Set-Content -LiteralPath $outputPath -Value $expected -Encoding utf8NoBOM -NoNewline
    Write-Host "Generated $($recipeEntry.output)"
}

if ($Check -and $failures.Count -gt 0) {
    $failures | ForEach-Object { Write-Error $_ }
    throw "Documentation check failed with $($failures.Count) issue(s)."
}

if ($Check) {
    Write-Host "Documentation system check passed for $($selectedRecipes.Count) recipe(s)."
}
