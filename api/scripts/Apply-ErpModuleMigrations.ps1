[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
    [string]$ApiRoot = (Join-Path $PSScriptRoot ".."),

    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Release",

    [string]$ConnectionStringEnvironmentVariable = "ConnectionStrings__DefaultConnection",

    [switch]$NoBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$resolvedApiRoot = (Resolve-Path -LiteralPath $ApiRoot).Path
$registryPath = Join-Path $resolvedApiRoot "ErpSystem.Api\Modules\ErpModuleRegistry.cs"
if (-not (Test-Path -LiteralPath $registryPath -PathType Leaf)) {
    throw "The explicit ERP module registry was not found at '$registryPath'."
}

if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    throw "The dotnet CLI is required to apply module migrations."
}

function Get-ModuleEntries {
    param([string]$RegistryFile)

    $registrySource = Get-Content -LiteralPath $RegistryFile -Raw
    $matches = [regex]::Matches(
        $registrySource,
        'new\s+ErpSystem\.Modules\.(?<name>[A-Za-z][A-Za-z0-9]*)\.\k<name>Module\s*\(\)')
    if ($matches.Count -eq 0) {
        throw "The explicit module registry contains no module registrations."
    }

    $entries = [System.Collections.Generic.List[object]]::new()
    foreach ($match in $matches) {
        $moduleName = $match.Groups['name'].Value
        $moduleRoot = Join-Path $resolvedApiRoot "Modules\$moduleName"
        $bootstrapRoot = Join-Path $moduleRoot "ErpSystem.Modules.$moduleName"
        $infrastructureRoot = Join-Path $moduleRoot "ErpSystem.Modules.$moduleName.Infrastructure"
        $infrastructureProject = Join-Path $infrastructureRoot "ErpSystem.Modules.$moduleName.Infrastructure.csproj"

        if (-not (Test-Path -LiteralPath $infrastructureProject -PathType Leaf)) {
            throw "Module '$moduleName' has no module-local Infrastructure project."
        }

        $contexts = @(
            Get-ChildItem -LiteralPath $infrastructureRoot -Filter "*DbContext.cs" -File -Recurse |
                Where-Object {
                    $_.Name -notlike "*DesignFactory.cs" -and
                    $_.Name -notlike "*ModelSnapshot.cs"
                }
        )
        if ($contexts.Count -ne 1) {
            throw "Module '$moduleName' must expose exactly one module-owned *DbContext.cs file; found $($contexts.Count)."
        }

        $contextName = [System.IO.Path]::GetFileNameWithoutExtension($contexts[0].Name)
        $factoryFiles = @(
            Get-ChildItem -LiteralPath $infrastructureRoot -Filter "$contextName`DesignFactory.cs" -File -Recurse
        )
        if ($factoryFiles.Count -ne 1) {
            throw "Module '$moduleName' is missing its module-local design-time factory '$contextName`DesignFactory.cs'."
        }

        $metadataSource = (@(
            Get-ChildItem -LiteralPath $bootstrapRoot -Filter "*.cs" -File -Recurse |
                ForEach-Object { Get-Content -LiteralPath $_.FullName -Raw }
        ) -join "`n")
        $codeMatch = [regex]::Match($metadataSource, 'new\s+ModuleDefinition\(\s*"(?<code>[a-z][a-z0-9-]*)"')
        $moduleCode = if ($codeMatch.Success) { $codeMatch.Groups['code'].Value } else { $moduleName.ToLowerInvariant() }

        $dependencies = [System.Collections.Generic.List[string]]::new()
        $requiredDependencies = [System.Collections.Generic.List[string]]::new()
        foreach ($dependencyMatch in [regex]::Matches(
                $metadataSource,
                '(?<kind>Required|Optional)ModuleDependencies\s*=\s*\[(?<values>[^\]]*)\]')) {
            foreach ($dependency in [regex]::Matches($dependencyMatch.Groups['values'].Value, '"(?<code>[a-z][a-z0-9-]*)"')) {
                if (-not $dependencies.Contains($dependency.Groups['code'].Value)) {
                    $dependencies.Add($dependency.Groups['code'].Value)
                }
                if ($dependencyMatch.Groups['kind'].Value -eq 'Required' -and
                    -not $requiredDependencies.Contains($dependency.Groups['code'].Value)) {
                    $requiredDependencies.Add($dependency.Groups['code'].Value)
                }
            }
        }

        $entries.Add([pscustomobject]@{
            Name = $moduleName
            Code = $moduleCode
            Dependencies = $dependencies.ToArray()
            RequiredDependencies = $requiredDependencies.ToArray()
            Project = $infrastructureProject
            Context = $contextName
        })
    }

    return $entries
}

function Sort-ModuleEntries {
    param([object[]]$Entries)

    $byCode = @{}
    foreach ($entry in $Entries) {
        if ($byCode.ContainsKey($entry.Code)) {
            throw "Duplicate module code '$($entry.Code)' was discovered in the explicit registry."
        }
        $byCode[$entry.Code] = $entry
    }

    foreach ($entry in $Entries) {
        foreach ($dependency in $entry.RequiredDependencies) {
            if (-not $byCode.ContainsKey($dependency)) {
                throw "Module '$($entry.Name)' requires missing module code '$dependency'."
            }
        }
    }

    $remaining = @($Entries)
    $ordered = @()

    while ($remaining.Count -gt 0) {
        $activeCodes = @($remaining | ForEach-Object { $_.Code })
        $next = $null
        foreach ($candidate in $remaining) {
            $blocked = @($candidate.Dependencies | Where-Object { $activeCodes -contains $_ })
            if ($blocked.Count -eq 0) {
                $next = $candidate
                break
            }
        }

        if ($null -eq $next) {
            throw "A cycle or unresolved module dependency was discovered in the installed module registry."
        }

        $ordered += $next
        $remaining = @($remaining | Where-Object { $_ -ne $next })
    }

    return $ordered
}

$entries = @(Sort-ModuleEntries -Entries @(Get-ModuleEntries $registryPath))
$defaultConnectionVariable = "ConnectionStrings__DefaultConnection"
$usesCustomSecretVariable =
    $PSBoundParameters.ContainsKey("ConnectionStringEnvironmentVariable") -and
    $ConnectionStringEnvironmentVariable -ne $defaultConnectionVariable
$connectionString = [Environment]::GetEnvironmentVariable($ConnectionStringEnvironmentVariable)

if (-not $WhatIfPreference) {
    if ($usesCustomSecretVariable) {
        if ([string]::IsNullOrWhiteSpace($connectionString)) {
            throw "Environment variable '$ConnectionStringEnvironmentVariable' must contain the deployment connection string."
        }
    }
    else {
        $missingConnections = @(
            $entries | ForEach-Object {
                $moduleVariable = "ConnectionStrings__$($_.Name)"
                $moduleConnection = [Environment]::GetEnvironmentVariable($moduleVariable)
                if ([string]::IsNullOrWhiteSpace($connectionString) -and
                    [string]::IsNullOrWhiteSpace($moduleConnection)) {
                    "$($_.Name) ($moduleVariable or $defaultConnectionVariable)"
                }
            }
        )
        if ($missingConnections.Count -gt 0) {
            throw "No effective connection string was configured for: $($missingConnections -join ', ')."
        }
    }
}

# Design-time factories read the conventional ConnectionStrings__* variables.
# An explicitly selected secret-store variable therefore temporarily overrides
# the default and every discovered module variable for this run. Existing
# process values are restored in the finally block, and no secret value is
# written to output.
$environmentOverrides = @{}
if (-not [string]::IsNullOrWhiteSpace($connectionString) -and $usesCustomSecretVariable) {
    $variablesToOverride = @(
        $defaultConnectionVariable
        $entries | ForEach-Object { "ConnectionStrings__$($_.Name)" }
    ) | Select-Object -Unique

    foreach ($variable in $variablesToOverride) {
        $environmentOverrides[$variable] = [Environment]::GetEnvironmentVariable($variable)
        [Environment]::SetEnvironmentVariable($variable, $connectionString, "Process")
    }
}

try {
    foreach ($entry in $entries) {
        $operation = "Apply $($entry.Name) database migrations using $($entry.Context)"
        if (-not $PSCmdlet.ShouldProcess($entry.Name, $operation)) {
            continue
        }

        $arguments = @(
            "ef",
            "database",
            "update",
            "--project", $entry.Project,
            "--startup-project", $entry.Project,
            "--context", $entry.Context,
            "--configuration", $Configuration,
            "--verbosity", "minimal"
        )
        if ($NoBuild) {
            $arguments += "--no-build"
        }

        Write-Host "Applying migrations for module '$($entry.Name)'..."
        & dotnet @arguments
        if ($LASTEXITCODE -ne 0) {
            throw "dotnet ef database update failed for module '$($entry.Name)' with exit code $LASTEXITCODE."
        }
    }
}
finally {
    foreach ($variable in $environmentOverrides.Keys) {
        [Environment]::SetEnvironmentVariable($variable, $environmentOverrides[$variable], "Process")
    }
}
