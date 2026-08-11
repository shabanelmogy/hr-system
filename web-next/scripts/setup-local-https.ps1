$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$certificateDirectory = Join-Path $projectRoot 'certificates'
$mkcertDirectory = Join-Path $env:LOCALAPPDATA 'mkcert'
$mkcertExecutable = Get-ChildItem -LiteralPath $mkcertDirectory -Filter 'mkcert-v*-windows-*.exe' -File -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $mkcertExecutable) {
  throw 'Next.js native mkcert was not found. Run npm run dev:https once, stop it, then run npm run cert:install.'
}

New-Item -ItemType Directory -Force -Path $certificateDirectory | Out-Null

$keyPath = Join-Path $certificateDirectory 'localhost-key.pem'
$certificatePath = Join-Path $certificateDirectory 'localhost.pem'
$backupSuffix = ".stale-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

foreach ($existingPath in @($keyPath, $certificatePath)) {
  if (Test-Path -LiteralPath $existingPath) {
    Move-Item -LiteralPath $existingPath -Destination "$existingPath$backupSuffix"
  }
}

& $mkcertExecutable.FullName `
  -install `
  -key-file $keyPath `
  -cert-file $certificatePath `
  localhost 127.0.0.1 ::1

if ($LASTEXITCODE -ne 0) {
  throw "mkcert failed with exit code $LASTEXITCODE."
}

Write-Output 'Local HTTPS certificate installed for the current Windows user.'
Write-Output "Certificate: $certificatePath"
Write-Output "Private key: $keyPath"
