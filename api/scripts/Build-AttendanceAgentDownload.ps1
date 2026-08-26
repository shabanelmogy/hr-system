[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateScript({ Test-Path -LiteralPath $_ -PathType Container })]
    [string]$PublishedAgentPath,

    [Parameter(Mandatory)]
    [ValidateScript({ Test-Path -LiteralPath $_ -PathType Container })]
    [string]$ApiPublishPath,

    [string]$PackagePath = (Join-Path $PSScriptRoot "..\artifacts\attendance-agent\HrAttendanceAgent-win-x86.zip")
)

$resolvedSource = (Resolve-Path -LiteralPath $PublishedAgentPath).Path
$resolvedPackage = [System.IO.Path]::GetFullPath($PackagePath)
$resolvedPublish = (Resolve-Path -LiteralPath $ApiPublishPath).Path
$packageDirectory = Split-Path -Parent $resolvedPackage
$publishedDownloadPath = Join-Path $resolvedPublish "wwwroot\downloads\attendance-agent\HrAttendanceAgent-win-x86.zip"

New-Item -ItemType Directory -Force -Path $packageDirectory | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $publishedDownloadPath) | Out-Null

Compress-Archive -Path (Join-Path $resolvedSource "*") -DestinationPath $resolvedPackage -CompressionLevel Optimal -Force
Copy-Item -LiteralPath $resolvedPackage -Destination $publishedDownloadPath -Force
Write-Host "Attendance Agent package staged: $publishedDownloadPath"
