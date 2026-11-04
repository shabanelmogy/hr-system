#Requires -Version 7.0
[CmdletBinding()]
param(
    [uri]$RuntimeBaseUrl = 'https://crystalreport-generator.runasp.net/',
    [string]$OutputDirectory,
    [Security.SecureString]$InternalApiKey,
    [switch]$ConfigurePublishProfiles
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
if ($RuntimeBaseUrl.Scheme -ne 'https' -or $RuntimeBaseUrl.UserInfo -or
    $RuntimeBaseUrl.Query -or $RuntimeBaseUrl.Fragment) {
    throw 'Select an exact HTTPS runtime base URL without credentials, query or fragment.'
}
if (-not $OutputDirectory) {
    $OutputDirectory = Join-Path $repositoryRoot ('.codex-tmp/crystal-deployment-' + [guid]::NewGuid().ToString('N'))
}
$outputRoot = [IO.Path]::GetFullPath($OutputDirectory)
$privateRoot = [IO.Path]::GetFullPath((Join-Path $repositoryRoot '.codex-tmp')) + [IO.Path]::DirectorySeparatorChar
if (-not $outputRoot.StartsWith($privateRoot, [StringComparison]::OrdinalIgnoreCase) -or
    (Test-Path -LiteralPath $outputRoot)) {
    throw 'Use a new output directory inside the ignored workspace .codex-tmp directory.'
}
New-Item -ItemType Directory -Path $outputRoot | Out-Null
if ($IsWindows) {
    $access = [Security.AccessControl.DirectorySecurity]::new()
    $access.SetAccessRuleProtection($true, $false)
    $ownerSid = [Security.Principal.WindowsIdentity]::GetCurrent().User
    $ownerRule = [Security.AccessControl.FileSystemAccessRule]::new(
        $ownerSid, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
    $access.SetAccessRule($ownerRule)
    [IO.FileSystemAclExtensions]::SetAccessControl([IO.DirectoryInfo]::new($outputRoot), $access)
}

$key = $null
if ($InternalApiKey) {
    $keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($InternalApiKey)
    try { $key = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer) }
} elseif (-not [string]::IsNullOrWhiteSpace($env:CRYSTAL_REPORT_INTERNAL_API_KEY)) {
    $key = $env:CRYSTAL_REPORT_INTERNAL_API_KEY
} else {
    $key = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
}
if ([string]::IsNullOrWhiteSpace($key)) { throw 'A nonempty private runtime key is required.' }

try {
    $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
    if (-not (Test-Path -LiteralPath $vswhere)) { throw 'Visual Studio MSBuild with Web Application tools is required.' }
    $msbuild = & $vswhere -latest -products '*' -requires Microsoft.Component.MSBuild -find 'MSBuild\**\Bin\MSBuild.exe' |
        Select-Object -First 1
    if (-not $msbuild) { throw 'Visual Studio MSBuild was not found.' }
    $runtimeSource = Join-Path $repositoryRoot 'api/CrystalReportGeneratorApi'
    $runtimeBuild = Join-Path $outputRoot 'build-runtime'
    $runtimeIntermediate = Join-Path $outputRoot 'obj-runtime'
    $runtimeBuildArguments = @(
        (Join-Path $runtimeSource 'CrystalReportGeneratorApi.csproj'), '/t:Build',
        '/p:Configuration=Release', '/p:Platform=x64', "/p:OutputPath=$runtimeBuild/",
        "/p:BaseIntermediateOutputPath=$runtimeIntermediate/",
        "/p:RoslynToolsDestinationFolder=$runtimeBuild/roslyn", '/v:minimal', '/nologo'
    )
    & $msbuild @runtimeBuildArguments *> (Join-Path $outputRoot 'runtime-build.log')
    if ($LASTEXITCODE -ne 0) { throw 'Runtime build failed; inspect the private runtime-build.log.' }
    if (-not (Test-Path -LiteralPath (Join-Path $runtimeBuild 'roslyn/csc.exe'))) {
        throw 'The runtime package is missing the configured ASP.NET CodeDOM compiler.'
    }

    $runtimeStage = Join-Path $outputRoot 'runtime'
    New-Item -ItemType Directory -Path (Join-Path $runtimeStage 'bin') -Force | Out-Null
    Get-ChildItem -LiteralPath $runtimeBuild | Copy-Item -Destination (Join-Path $runtimeStage 'bin') -Recurse
    Copy-Item -LiteralPath (Join-Path $runtimeSource 'Global.asax') -Destination $runtimeStage
    Copy-Item -LiteralPath (Join-Path $runtimeSource 'Reports') -Destination $runtimeStage -Recurse -Force
    if (Test-Path -LiteralPath (Join-Path $runtimeSource 'ReportsLogo')) {
        Copy-Item -LiteralPath (Join-Path $runtimeSource 'ReportsLogo') -Destination $runtimeStage -Recurse
    }
    [xml]$runtimeConfiguration = [IO.File]::ReadAllText((Join-Path $runtimeSource 'Web.config'))
    $runtimeConfiguration.SelectSingleNode('/configuration/appSettings/add[@key="InternalApiKey"]').SetAttribute('value', $key)
    $runtimeConfiguration.SelectSingleNode('/configuration/appSettings').RemoveAttribute('file')
    $runtimeConfiguration.SelectSingleNode('/configuration/system.web/compilation').RemoveAttribute('debug')
    $runtimeConfiguration.SelectSingleNode('/configuration/system.web/customErrors').SetAttribute('mode', 'On')
    $runtimeConfiguration.Save((Join-Path $runtimeStage 'Web.config'))

    $erpStage = Join-Path $outputRoot 'erp'
    & dotnet publish (Join-Path $repositoryRoot 'api/ErpSystem.Api/ErpSystem.Api.csproj') -c Release -r win-x64 --self-contained false -p:PublishAppSettings=false -o $erpStage *> (Join-Path $outputRoot 'erp-publish.log')
    if ($LASTEXITCODE -ne 0) { throw 'ERP publish failed; inspect the private erp-publish.log.' }
    if (Test-Path -LiteralPath (Join-Path $erpStage 'appsettings.json')) {
        throw 'The ERP code package must preserve existing hosted appsettings.json.'
    }

    $configurationStage = Join-Path $outputRoot 'configuration'
    New-Item -ItemType Directory -Path $configurationStage | Out-Null
    @{
        CrystalReports = @{
            RuntimeEnabled = $true
            RuntimeBaseUrl = $RuntimeBaseUrl.AbsoluteUri.TrimEnd('/') + '/'
            RuntimeApiKey = $key
        }
    } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $configurationStage 'erp-crystal.settings.json') -Encoding utf8NoBOM

    $runtimeDll = Join-Path $runtimeStage 'bin/CrystalReportGeneratorApi.dll'
    $runtimeAssembly = [Reflection.Assembly]::LoadFile($runtimeDll)
    $artifact = Join-Path $repositoryRoot 'api/Modules/Reporting/ErpSystem.Modules.Reporting.Contracts/Features/Analytics/CrystalReports/managed-crystal-report-contracts.v1.json'
    @{
        CreatedUtc = [DateTime]::UtcNow.ToString('o')
        RuntimeBaseUrl = $RuntimeBaseUrl.AbsoluteUri
        RuntimeBuildId = $runtimeAssembly.ManifestModule.ModuleVersionId.ToString('D')
        RuntimeAssemblySha256 = (Get-FileHash -LiteralPath $runtimeDll -Algorithm SHA256).Hash.ToLowerInvariant()
        ContractFingerprint = (Get-FileHash -LiteralPath $artifact -Algorithm SHA256).Hash.ToLowerInvariant()
        RequiresMatchingPrivateConfiguration = $true
        PreserveHostedDirectories = @('Reports', 'App_Data')
        Published = $false
    } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $outputRoot 'deployment-manifest.json') -Encoding utf8NoBOM
    [IO.Compression.ZipFile]::CreateFromDirectory(
        $runtimeStage, (Join-Path $outputRoot 'CrystalRuntime.zip'), [IO.Compression.CompressionLevel]::Optimal, $false)
    [IO.Compression.ZipFile]::CreateFromDirectory(
        $erpStage, (Join-Path $outputRoot 'ErpApi.zip'), [IO.Compression.CompressionLevel]::Optimal, $false)
    if ($ConfigurePublishProfiles) {
        & (Join-Path $PSScriptRoot 'Configure-CrystalReportPublish.ps1') -CrystalPatchPath (Join-Path $configurationStage 'erp-crystal.settings.json')
    }
    Write-Host "Prepared private deployment artifacts: $outputRoot"
    Write-Host 'CrystalRuntime.zip and ErpApi.zip contain site contents directly, without an extra top-level folder.'
    Write-Host 'runtime/ and erp/ are separate sites. Merge configuration/erp-crystal.settings.json into the existing ERP host configuration.'
    Write-Host 'Preserve hosted Reports and App_Data; restart both sites and verify the build ID, key denial, catalog and actual AR/EN PDF.'
    Write-Host 'Key values are omitted. Artifacts contain secrets, are access-restricted and must not be committed. No remote publication occurred.'
} finally {
    $key = $null
}
