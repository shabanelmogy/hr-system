#Requires -Version 7.0
[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$CrystalPatchPath,
    [ValidatePattern('^[a-zA-Z0-9_.-]+$')][string]$RuntimeProfile = 'site38634-WebDeploy',
    [ValidatePattern('^[a-zA-Z0-9_.-]+$')][string]$ErpProfile = 'site84639-WebDeploy'
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$runtimeProject = Join-Path $repositoryRoot 'api/CrystalReportGeneratorApi'
$erpProject = Join-Path $repositoryRoot 'api/ErpSystem.Api'
$runtimeProfilePath = Join-Path $runtimeProject ('Properties/PublishProfiles/' + $RuntimeProfile + '.pubxml')
$erpProfilePath = Join-Path $erpProject ('Properties/PublishProfiles/' + $ErpProfile + '.pubxml')
if (-not (Test-Path -LiteralPath $runtimeProfilePath) -or -not (Test-Path -LiteralPath $erpProfilePath)) {
    throw 'Import both existing Visual Studio publish profiles before configuring their private transforms.'
}
$settings = (Get-Content -LiteralPath $CrystalPatchPath -Raw | ConvertFrom-Json).CrystalReports
$runtimeUri = $null
if ($settings.RuntimeEnabled -ne $true -or [string]::IsNullOrWhiteSpace($settings.RuntimeApiKey) -or
    -not [uri]::TryCreate($settings.RuntimeBaseUrl, [UriKind]::Absolute, [ref]$runtimeUri) -or
    $runtimeUri.Scheme -ne 'https' -or $runtimeUri.UserInfo -or $runtimeUri.Query -or $runtimeUri.Fragment) {
    throw 'Supply the generated private enabled HTTPS Crystal configuration patch.'
}

function Save-PrivateXml([xml]$Document, [string]$Path) {
    $Document.Save($Path)
    $access = [Security.AccessControl.FileSecurity]::new()
    $access.SetAccessRuleProtection($true, $false)
    $rule = [Security.AccessControl.FileSystemAccessRule]::new(
        [Security.Principal.WindowsIdentity]::GetCurrent().User, 'FullControl', 'Allow')
    $access.SetAccessRule($rule)
    [IO.FileSystemAclExtensions]::SetAccessControl([IO.FileInfo]::new($Path), $access)
}

function Set-ProfileProperty([xml]$Profile, [string]$Name, [string]$Value) {
    $group = $Profile.DocumentElement.SelectSingleNode('*[local-name()="PropertyGroup"]')
    $element = $group.SelectSingleNode('*[local-name()="' + $Name + '"]')
    if (-not $element) {
        $element = $Profile.CreateElement($Name, $Profile.DocumentElement.NamespaceURI)
        $null = $group.AppendChild($element)
    }
    $element.InnerText = $Value
}

[xml]$runtimeTransform = @'
<configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">
  <appSettings xdt:Transform="RemoveAttributes(file)">
    <add key="InternalApiKey" value="" xdt:Locator="Match(key)" xdt:Transform="SetAttributes(value)" />
  </appSettings>
</configuration>
'@
$runtimeTransform.SelectSingleNode('/configuration/appSettings/add').SetAttribute('value', $settings.RuntimeApiKey)
Save-PrivateXml $runtimeTransform (Join-Path $runtimeProject 'Web.Crystal.publish-private.config')

[xml]$localSettings = '<appSettings><add key="InternalApiKey" value="" /></appSettings>'
$localSettings.DocumentElement.FirstChild.SetAttribute('value', $settings.RuntimeApiKey)
$localDirectory = Join-Path $runtimeProject 'App_Data'
New-Item -ItemType Directory -Path $localDirectory -Force | Out-Null
Save-PrivateXml $localSettings (Join-Path $localDirectory 'CrystalRuntime.local.config')

[xml]$erpTransform = @'
<configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">
  <location path="." xdt:Locator="Match(path)">
    <system.webServer>
      <aspNetCore>
        <environmentVariables xdt:Transform="InsertIfMissing" />
        <environmentVariables />
      </aspNetCore>
    </system.webServer>
  </location>
</configuration>
'@
$variables = $erpTransform.SelectNodes('/configuration/location/system.webServer/aspNetCore/environmentVariables')[1]
$environmentSettings = [ordered]@{
    'CrystalReports__RuntimeEnabled' = 'true'
    'CrystalReports__RuntimeBaseUrl' = $runtimeUri.AbsoluteUri.TrimEnd('/') + '/'
    'CRYSTAL_REPORT_INTERNAL_API_KEY' = $settings.RuntimeApiKey
}
foreach ($entry in $environmentSettings.GetEnumerator()) {
    foreach ($operation in @('InsertIfMissing', 'SetAttributes(value)')) {
        $variable = $erpTransform.CreateElement('environmentVariable')
        $variable.SetAttribute('name', $entry.Key)
        $variable.SetAttribute('value', $entry.Value)
        foreach ($attribute in @{Locator = 'Match(name)'; Transform = $operation}.GetEnumerator()) {
            $xdtAttribute = $erpTransform.CreateAttribute('xdt', $attribute.Key, 'http://schemas.microsoft.com/XML-Document-Transform')
            $xdtAttribute.Value = $attribute.Value
            $null = $variable.Attributes.Append($xdtAttribute)
        }
        $null = $variables.AppendChild($variable)
    }
}
Save-PrivateXml $erpTransform (Join-Path $erpProject 'web.Crystal.publish-private.config')

[xml]$runtimePublish = Get-Content -LiteralPath $runtimeProfilePath -Raw
Set-ProfileProperty $runtimePublish 'LastUsedBuildConfiguration' 'Release'
Set-ProfileProperty $runtimePublish 'LastUsedPlatform' 'x64'
Set-ProfileProperty $runtimePublish 'ProjectProfileTransformFileName' 'Web.Crystal.publish-private.config'
Set-ProfileProperty $runtimePublish 'EnableMsDeployAppOffline' 'true'
Set-ProfileProperty $runtimePublish 'SiteUrlToLaunchAfterPublish' $runtimeUri.AbsoluteUri
Set-ProfileProperty $runtimePublish 'SkipExtraFilesOnServer' 'false'
Set-ProfileProperty $runtimePublish 'UseMsdeployExe' 'true'
$deploymentExecutable = @(
    (Join-Path $env:ProgramFiles 'IIS/Microsoft Web Deploy V3/msdeploy.exe'),
    (Join-Path ${env:ProgramFiles(x86)} 'IIS/Microsoft Web Deploy V3/msdeploy.exe')
) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $deploymentExecutable) { throw 'Install the Web Deploy command-line tools used by the Publish profile.' }
Set-ProfileProperty $runtimePublish 'MSDeployPath' ((Split-Path -Parent $deploymentExecutable) + [IO.Path]::DirectorySeparatorChar)
$group = $runtimePublish.DocumentElement.SelectSingleNode('*[local-name()="ItemGroup"]')
if (-not $group) {
    $group = $runtimePublish.CreateElement('ItemGroup', $runtimePublish.DocumentElement.NamespaceURI)
    $null = $runtimePublish.DocumentElement.AppendChild($group)
}
foreach ($objectName in @('filePath', 'dirPath')) {
    $ruleName = 'PreserveOutsideBin-' + $objectName
    $old = $group.SelectSingleNode('*[local-name()="MsDeploySkipRules"][@Include="' + $ruleName + '"]')
    if ($old) { $null = $group.RemoveChild($old) }
    $skip = $runtimePublish.CreateElement('MsDeploySkipRules', $runtimePublish.DocumentElement.NamespaceURI)
    $skip.SetAttribute('Include', $ruleName)
    $skipProperties = [ordered]@{
        ObjectName = $objectName
        AbsolutePath = '(?i)(?:[\\/](?:Reports|ReportsLogo|App_Data)(?:[\\/]|$))|^(?!.*[\\/]bin(?:[\\/]|$)).*'
        SkipAction = 'Delete'
    }
    foreach ($property in $skipProperties.GetEnumerator()) {
        $element = $runtimePublish.CreateElement($property.Key, $runtimePublish.DocumentElement.NamespaceURI)
        $element.InnerText = $property.Value
        $null = $skip.AppendChild($element)
    }
    $null = $group.AppendChild($skip)
}
$runtimePublish.Save($runtimeProfilePath)

[xml]$erpPublish = Get-Content -LiteralPath $erpProfilePath -Raw
Set-ProfileProperty $erpPublish 'CustomTransformFileName' 'web.Crystal.publish-private.config'
Set-ProfileProperty $erpPublish 'EnableMsDeployAppOffline' 'true'
Set-ProfileProperty $erpPublish 'SkipExtraFilesOnServer' 'true'
$erpPublish.Save($erpProfilePath)
Write-Host "Configured existing Visual Studio Publish profiles: $RuntimeProfile and $ErpProfile."
Write-Host 'Matching private transforms and local runtime key are ignored by Git. Runtime publication cleans only stale bin content; all non-bin files are preserved.'
Write-Host 'Publish Crystal first, then ERP. Passwords and remote publication were not changed.'
