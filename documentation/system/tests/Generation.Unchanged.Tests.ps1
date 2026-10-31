$ErrorActionPreference = 'Stop'
$systemRoot = Split-Path -Parent $PSScriptRoot
$generator = Join-Path $systemRoot 'Generate-Documentation.ps1'
$manifest = Get-Content -LiteralPath (Join-Path $systemRoot 'recipe-manifest.json') -Raw | ConvertFrom-Json
$recipe = $manifest.recipes | Select-Object -First 1
$packet = [IO.Path]::GetFullPath((Join-Path $systemRoot $recipe.output))
& $generator -Recipe $recipe.id -Check
$before = [IO.File]::ReadAllBytes($packet)
$timestamp = [IO.File]::GetLastWriteTimeUtc($packet)
$mappingName = 'ErpDocumentationTest-' + [Guid]::NewGuid().ToString('N')
$mapping = [IO.MemoryMappedFiles.MemoryMappedFile]::CreateFromFile($packet, [IO.FileMode]::Open, $mappingName, 0, [IO.MemoryMappedFiles.MemoryMappedFileAccess]::Read)
$view = $mapping.CreateViewAccessor(0, 0, [IO.MemoryMappedFiles.MemoryMappedFileAccess]::Read)
try {
    & $generator -Recipe $recipe.id
    if ([IO.File]::GetLastWriteTimeUtc($packet) -ne $timestamp) { throw 'Unchanged packet was rewritten.' }
    $after = [IO.File]::ReadAllBytes($packet)
    if ([Convert]::ToBase64String($before) -cne [Convert]::ToBase64String($after)) { throw 'Packet bytes changed.' }
} finally {
    $view.Dispose()
    $mapping.Dispose()
}
& $generator -Recipe $recipe.id -Check
Write-Host 'Unchanged generation passed with a live read-only memory mapping; content and timestamp preserved.'
