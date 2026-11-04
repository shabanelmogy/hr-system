#Requires -Version 7.0
[CmdletBinding()]
param(
    [Parameter(Mandatory)][uri]$BaseUrl,
    [string]$RuntimeConfigurationPath,
    [string]$DeploymentManifestPath,
    [string]$ResultsPath,
    [Security.SecureString]$InternalApiKey
)

$ErrorActionPreference = 'Stop'
if ($BaseUrl.Scheme -notin @('http', 'https') -or
    ($BaseUrl.Scheme -ne 'https' -and -not $BaseUrl.IsLoopback) -or
    $BaseUrl.UserInfo -or $BaseUrl.Query -or $BaseUrl.Fragment) {
    throw 'Use an HTTPS runtime URL; HTTP is allowed only for an isolated loopback smoke.'
}
$key = $env:CRYSTAL_REPORT_INTERNAL_API_KEY
if ($RuntimeConfigurationPath) {
    [xml]$runtimeConfiguration = [IO.File]::ReadAllText((Resolve-Path -LiteralPath $RuntimeConfigurationPath))
    $key = $runtimeConfiguration.SelectSingleNode('/configuration/appSettings/add[@key="InternalApiKey"]').GetAttribute('value')
    $localSettingsFile = $runtimeConfiguration.configuration.appSettings.GetAttribute('file')
    if ($localSettingsFile) {
        $localSettingsPath = Join-Path (Split-Path -Parent (Resolve-Path -LiteralPath $RuntimeConfigurationPath)) $localSettingsFile
        if (Test-Path -LiteralPath $localSettingsPath) {
            [xml]$localSettings = [IO.File]::ReadAllText($localSettingsPath)
            $keyEntry = $localSettings.SelectSingleNode('/appSettings/add[@key="InternalApiKey"]')
            if ($keyEntry) { $key = $keyEntry.GetAttribute('value') }
        }
    }
}
if ($InternalApiKey) {
    $keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($InternalApiKey)
    try { $key = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer) }
}
if ([string]::IsNullOrWhiteSpace($key)) { throw 'Supply the private key through a secure input, environment or private configuration file.' }
if (-not $ResultsPath) {
    $ResultsPath = Join-Path $PSScriptRoot ('../../.codex-tmp/crystal-smoke-' + [guid]::NewGuid().ToString('N') + '.json')
}
$expectedManifest = if ($DeploymentManifestPath) { Get-Content -LiteralPath $DeploymentManifestPath -Raw | ConvertFrom-Json } else { $null }
$handler = [Net.Http.HttpClientHandler]::new()
$handler.AllowAutoRedirect = $false
$http = [Net.Http.HttpClient]::new($handler)
$http.BaseAddress = [uri]($BaseUrl.AbsoluteUri.TrimEnd('/') + '/')
$http.Timeout = [TimeSpan]::FromSeconds(30)
$cases = [Collections.Generic.List[object]]::new()
$failureType = $null
try {
    $unknownSource = ('a' * 64) + '/source?expectedSha256=' + ('b' * 64)
    foreach ($route in @('catalog?entityKey=countries', 'health', ('catalog/' + $unknownSource), 'inspect', 'render')) {
        foreach ($mode in @('missing', 'wrong', 'duplicate', 'valid')) {
            $post = $route -in @('inspect', 'render')
            $method = if ($post) { [Net.Http.HttpMethod]::Post } else { [Net.Http.HttpMethod]::Get }
            $request = [Net.Http.HttpRequestMessage]::new($method, ('internal/reports/' + $route))
            try {
                switch ($mode) {
                    'wrong' { $null = $request.Headers.TryAddWithoutValidation('X-Internal-Api-Key', 'invalid-smoke-probe') }
                    'duplicate' { $null = $request.Headers.TryAddWithoutValidation('X-Internal-Api-Key', [string[]]@($key, $key)) }
                    'valid' { $null = $request.Headers.TryAddWithoutValidation('X-Internal-Api-Key', $key) }
                }
                # Non-multipart content cannot start native inspection/rendering.
                if ($post) { $request.Content = [Net.Http.StringContent]::new('non-multipart smoke') }
                $response = $http.SendAsync($request).GetAwaiter().GetResult()
                try {
                    $expected = if ($mode -ne 'valid') { 401 } elseif ($post) { 415 } elseif ($route.StartsWith('catalog/')) { 404 } else { 200 }
                    $passed = [int]$response.StatusCode -eq $expected
                    $buildId = $null
                    $fingerprint = $null
                    if ($route -eq 'health' -and $mode -eq 'valid' -and $passed) {
                        $health = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult() | ConvertFrom-Json
                        $buildId = $health.runtimeBuildId
                        $fingerprint = $health.contractFingerprint
                        $parsedBuildId = [guid]::Empty
                        $passed = [guid]::TryParse([string]$buildId, [ref]$parsedBuildId) -and
                            [string]$fingerprint -cmatch '^[a-f0-9]{64}$'
                        if ($expectedManifest) {
                            $passed = $passed -and $buildId -eq $expectedManifest.RuntimeBuildId -and
                                $fingerprint -eq $expectedManifest.ContractFingerprint
                        }
                    }
                    $cases.Add([pscustomobject]@{
                        Route = $route; KeyMode = $mode; Status = [int]$response.StatusCode
                        Expected = $expected; BuildId = $buildId; Fingerprint = $fingerprint; Passed = $passed
                    })
                } finally { $response.Dispose() }
            } finally { $request.Dispose() }
        }
    }
} catch {
    $failureType = $_.Exception.GetType().Name
} finally {
    $key = $null
    $http.Dispose()
    $passed = -not $failureType -and $cases.Count -eq 20 -and $cases.Passed -notcontains $false
    @{
        DateUtc = [DateTime]::UtcNow.ToString('o'); BaseUrl = $BaseUrl.AbsoluteUri
        NativeRenderAttempted = $false; Cases = $cases; FailureType = $failureType; Passed = $passed
    } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $ResultsPath -Encoding utf8NoBOM
}
if (-not $passed) { throw "Crystal runtime smoke failed; inspect sanitized receipt: $ResultsPath" }
Write-Host "Crystal runtime:20 HTTP boundary/build checks passed. Native PDF acceptance remains separate. Receipt: $ResultsPath"
