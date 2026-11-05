$ErrorActionPreference = 'Stop'
$canonical = Join-Path (Get-Location) 'documentation/system/Generate-Documentation.ps1'
$source = Get-Content -LiteralPath $canonical -Raw
$systemDirectory = Split-Path $canonical
$source = $source.Replace('$systemRoot = $PSScriptRoot', ('$systemRoot = ''' + $systemDirectory.Replace("'", "''") + "'"))
$filter = @'
$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
$manifest.recipes = @($manifest.recipes | Where-Object { $_.id -like 'angular-*' })
$manifest.requiredFileManifests = @($manifest.requiredFileManifests | Where-Object { $_ -like '*/angular-*/required-files.json' })
'@
$source = $source.Replace('$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json', $filter)
& ([scriptblock]::Create($source))
& ([scriptblock]::Create($source)) -Check
