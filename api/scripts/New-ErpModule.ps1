[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateScript({
        if ($_.Equals('HR', [StringComparison]::OrdinalIgnoreCase) -or
            $_.Equals('CRM', [StringComparison]::OrdinalIgnoreCase)) {
            return $true
        }
        if ($_.Length -gt 40 -or $_ -cnotmatch '^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)*$') {
            throw "Module name '$_' must use full UpperCamel words (at most 40 characters, with no consecutive uppercase abbreviation runs; for example PointOfSale, never POS or RetailPOS)."
        }
        $true
    })]
    [string]$ModuleName,

    [Parameter(Mandatory = $false)]
    [ValidatePattern('^[a-z][a-z0-9_]{0,62}$')]
    [string]$DatabaseSchema = '',

    [Parameter(Mandatory = $false)]
    [string]$ApiRoot = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($ApiRoot)) {
    $scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
    $ApiRoot = Split-Path -Parent $scriptDirectory
}

$ReservedModuleNames = @('Api', 'Tests', 'BuildingBlocks', 'CrystalReportGeneratorApi')
$RegistryBeginMarker = '// <erp-module-registrations>'
$RegistryEndMarker = '// </erp-module-registrations>'
$HostBeginMarker = '<!-- <erp-module-references> -->'
$HostEndMarker = '<!-- </erp-module-references> -->'
$TargetFramework = 'net10.0'

function ConvertTo-SnakeCase([string]$Name) {
    return ([regex]::Replace($Name, '(?<!^)([A-Z])', '_$1')).ToLowerInvariant()
}

function ConvertTo-KebabCase([string]$Name) {
    if ($Name.Equals('HR', [StringComparison]::OrdinalIgnoreCase)) {
        return 'hr'
    }

    # Split acronym-to-word boundaries (CRMAccount -> crm-account) and normal
    # PascalCase boundaries (PointOfSale -> point-of-sale).
    $value = [regex]::Replace($Name, '([A-Z]+)([A-Z][a-z])', '$1-$2')
    $value = [regex]::Replace($value, '([a-z0-9])([A-Z])', '$1-$2')
    return $value.ToLowerInvariant()
}

function Get-DefaultModuleSchema([string]$Name) {
    # Short SQL schema per module. CLR/project names stay explicit
    # (PointOfSale, CRM, Inventory); only the
    # database schema is abbreviated. One schema per module, never a
    # sub-schema per feature by default.
    switch ($Name) {
        'HR' { return 'hr' }
        'Hr' { return 'hr' }
        'Accounting' { return 'acc' }
        'Acc' { return 'acc' }
        'PointOfSale' { return 'pos' }
        'Pos' { return 'pos' }
        'Crm' { return 'crm' }
        'CRM' { return 'crm' }
        'Inventory' { return 'inv' }
        'Inv' { return 'inv' }
        default { return ConvertTo-SnakeCase $Name }
    }
}

function Get-LayerCsproj([string]$Module, [string]$Layer, [string]$Body) {
    return @"
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>$TargetFramework</TargetFramework>
    <AssemblyName>ErpSystem.Modules.$Module.$Layer</AssemblyName>
    <RootNamespace>ErpSystem.Modules.$Module.$Layer</RootNamespace>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
$Body
</Project>
"@
}

function Write-ModuleFile([string]$Path, [string]$Content) {
    if ($PSCmdlet.ShouldProcess($Path, 'Create module file')) {
        $directory = Split-Path -Parent $Path
        if (-not (Test-Path -LiteralPath $directory)) {
            New-Item -ItemType Directory -Path $directory -Force | Out-Null
        }
        # Avoid Set-Content's platform-specific newline/BOM behavior and keep
        # this script compatible with both pwsh and Windows PowerShell.
        [System.IO.File]::WriteAllText(
            $Path,
            $Content,
            [System.Text.UTF8Encoding]::new($false))
    }
}

function Get-ModuleDocumentationFiles([string]$Name, [string]$Slug, [string]$Schema) {
    $runtimeRoot = "api/Modules/$Name"
    $documentationRoot = "documentation/modules/$Slug"
    $moduleJson = [ordered]@{
        moduleName = $Name
        docSlug = $Slug
        databaseSchema = $Schema
        version = '1.0.0'
        requiredModuleDependencies = @()
        optionalModuleDependencies = @()
        isUserVisible = $true
        allowsTenantEntitlement = $true
        lifecycle = 'active'
        status = 'foundation'
        runtimePaths = [ordered]@{
            root = $runtimeRoot
            contracts = "$runtimeRoot/ErpSystem.Modules.$Name.Contracts"
            domain = "$runtimeRoot/ErpSystem.Modules.$Name.Domain"
            application = "$runtimeRoot/ErpSystem.Modules.$Name.Application"
            infrastructure = "$runtimeRoot/ErpSystem.Modules.$Name.Infrastructure"
            presentation = "$runtimeRoot/ErpSystem.Modules.$Name.Presentation"
            bootstrap = "$runtimeRoot/ErpSystem.Modules.$Name"
        }
        testPath = "$runtimeRoot/ErpSystem.Modules.$Name.Tests"
        documentationPaths = [ordered]@{
            root = $documentationRoot
            api = "$documentationRoot/api/README.md"
            webNext = "$documentationRoot/web-next/README.md"
            mobileReact = "$documentationRoot/mobile-react/README.md"
            features = "$documentationRoot/features/README.md"
            phases = "$documentationRoot/phases/README.md"
            featureQualityGate = "$documentationRoot/FEATURE-QUALITY-GATE.md"
        }
    } | ConvertTo-Json -Depth 5

    return [ordered]@{
        'module.json' = $moduleJson
        'README.md' = @"
# $Name module

This package is the documentation ownership boundary for the **$Name** module.
It describes the module's verified runtime foundation and records decisions for
future capabilities. Shared ERP rules remain in @@documentation/system/@@ and are
linked rather than copied here.

## Current status

- Lifecycle: active modular-monolith module.
- Runtime foundation: six runtime projects, a module bootstrap, one module-owned
  test project, and an EF Core context using the @@$Schema@@ schema.
- Domain features, endpoints, and client screens are not generated by this
  scaffold. Add them only with verified contracts and tests.

Start with [ARCHITECTURE.md](ARCHITECTURE.md), then record delivery decisions
in [DELIVERY-ROADMAP.md](DELIVERY-ROADMAP.md). Platform entry points are kept
under [api/](api/README.md), [web-next/](web-next/README.md), and
[mobile-react/](mobile-react/README.md).

Before adding a component, service, or Contract, inventory shared BuildingBlocks
and module-local reusable pieces. Reuse or extend compatible abstractions and
record the decision in the feature book. Start new behavior module-local and
promote it only when it is domain-neutral and used by multiple modules.
"@
        'ARCHITECTURE.md' = @"
# $Name architecture

The module is a bounded context composed through @@ErpSystem.Modules.$Name.${Name}Module@@.
The host references only the bootstrap. Contracts are the only supported
cross-module dependency; do not add cross-module EF navigations, foreign keys,
or direct infrastructure calls.

## Runtime ownership

- Schema: @@$Schema@@ (one module-owned schema and migrations history table).
- Layers: Contracts, Domain, Application, Infrastructure, Presentation, and
  the bootstrap composition root.
- Integrations: stable identifiers, transport-neutral Contracts, and explicit
  events/handlers at module boundaries.

This file is a generated foundation record. Replace generic statements with
verified symbols as the module grows; do not claim a feature is implemented
until its runtime, API, clients, and tests exist.

Reuse-first is part of the module workflow: search shared BuildingBlocks and
local abstractions before creating a new piece, and keep domain logic local.
"@
        'DELIVERY-ROADMAP.md' = @"
# $Name delivery roadmap

Status vocabulary is shared across modules: **Foundation** means the structural
scaffold is verified; **Required** means committed for the current release;
**Planned** means accepted future work; **Deferred** means intentionally moved
to a later milestone; **Excluded** means outside this module's contract.

## Foundation (verified)

- Six-project runtime module structure, one module-owned test project, and
  explicit host registration.
- Module-owned @@$Schema@@ database schema and migration boundary.
- Empty feature surface awaiting the first domain slice.

## Planned

1. Freeze the domain contract and ownership decisions.
2. Implement one vertical slice through Domain, Application, Infrastructure,
   Presentation, and the applicable clients.
3. Add migrations, authorization, observability, and end-to-end verification.

Begin each slice with a documented reuse inventory. Shared promotion requires
genuine domain neutrality and use by more than one module; never copy/paste a
shared capability into a module.

No endpoint, screen, or entity is implied by this roadmap until documented in
the module's feature book and verified in source.
"@
        'api/README.md' = @"
# $Name API documentation

## Verified foundation

The module owns its API layer and exposes it through the Presentation project.
The generated scaffold has no controllers, routes, handlers, or public DTOs;
those surfaces are **not implemented** yet.

When a feature is added, document the exact route, authorization policy,
request/response envelope, validation, errors, paging/sorting, and tests here
or in a linked feature book. Cross-module communication uses Contracts/events,
never another module's Infrastructure or EF model.
"@
        'web-next/README.md' = @"
# $Name web client documentation

The module has no generated Next.js routes, pages, hooks, or API clients yet;
the web surface is **not implemented**. A future feature must document its
route, server/client boundary, loading/error/empty states, permissions,
localization, and verification before release.
"@
        'mobile-react/README.md' = @"
# $Name mobile client documentation

The module has no generated Expo/React Native screens, navigation entries, or
mobile API client yet; the mobile surface is **not implemented**. Record native
offline, retry, accessibility, localization, and permission decisions for each
future feature instead of assuming web behavior can be reused.
"@
        'features/README.md' = @"
# $Name feature catalog

This is the module-owned feature index. Keep one entry per vertical slice and
link to its reviewed API, web, mobile, and cross-project evidence. Do not copy
the shared phase rules or generated packets; use `documentation/system/` as the
single source for the documentation workflow.

The scaffold currently contains no implemented business feature. Add entries
only when the corresponding runtime and verification evidence exists, and mark
future ideas as Planned or Deferred.

Every feature must complete [FEATURE-QUALITY-GATE.md](../FEATURE-QUALITY-GATE.md)
before it can be marked implemented.
"@
        'FEATURE-QUALITY-GATE.md' = @"
# $Name feature quality gate

Copy the matrix below into every feature book and complete it before runtime
implementation. A blank cell is a failed gate. Use @@N/A — <reason>@@ only when
the capability truly does not apply; do not infer completion from a successful
build.

| Entity / aggregate | Create | Detail/List | Update | Archive or domain alternative | Restore | Archived discovery / RecordStatus | Dependency guards | Shared atomic resource | RowVersion / concurrency | Permission | Stable localized errors | Domain + handler + API tests |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| _Add one row per mutable entity_ |  |  |  |  |  |  |  |  |  |  |  |  |

## Mandatory evidence

- Ownership and tenant/company scope are explicit.
- Every active/archived transition is an explicit use case, or the approved
  domain alternative (effective dating, reversal, immutable history) is named.
- Parent archive and child create/update/restore use the same transaction-owned
  resource or an equivalent database guarantee.
- Collection queries are bounded and expose archived records when restore is
  supported.
- Error codes are stable; user-facing messages come from the owning module or
  the host localization boundary. A module never replaces
  @@IStringLocalizerFactory@@.
- Controller -> ISender -> handler -> Application port -> Infrastructure ->
  Domain -> commit is preserved.
- Tests cover missing scope, stale RowVersion, duplicate, invalid reference,
  archive-in-use, restore conflict, and one competing-write case where relevant.

The feature cannot move to Verified until every row is complete and its evidence
paths are registered in the feature's required-file manifest.
"@
        'phases/README.md' = @"
# $Name delivery phases

This optional index is the module-owned home for a dependency-ordered delivery
plan. Keep shared phase rules in @@documentation/system/@@ and record a reuse
inventory before each phase: inspect shared BuildingBlocks and module-local
pieces, reuse or extend compatible abstractions, and keep new behavior local
until a genuinely domain-neutral capability is used by multiple modules.

The generated module currently has no business phases or implemented features.
"@
    }
}

function Restore-MarkdownCodeTicks([string]$Content) {
    return $Content.Replace('@@', [string][char]0x60)
}

# ---------- resolve and validate everything before writing anything ----------

$ApiRoot = [System.IO.Path]::GetFullPath($ApiRoot)
$SolutionPath = Join-Path $ApiRoot 'ErpSystem.sln'
$CentralPackagesPath = Join-Path $ApiRoot 'Directory.Packages.props'
$HostCsproj = Join-Path (Join-Path $ApiRoot 'ErpSystem.Api') 'ErpSystem.Api.csproj'
$RegistryPath = Join-Path (Join-Path (Join-Path $ApiRoot 'ErpSystem.Api') 'Modules') 'ErpModuleRegistry.cs'
$ModulesRoot = Join-Path $ApiRoot 'Modules'
$RepositoryRoot = [System.IO.Path]::GetFullPath((Split-Path -Parent $ApiRoot))
$DocumentationRoot = Join-Path $RepositoryRoot 'documentation'
$DocumentationModulesRoot = Join-Path $DocumentationRoot 'modules'

foreach ($required in @($SolutionPath, $HostCsproj, $RegistryPath)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Required ERP file not found: $required. Run this script from the api directory of ErpSystem."
    }
}
if (-not (Test-Path -LiteralPath $CentralPackagesPath -PathType Leaf)) {
    throw "Central package policy not found: $CentralPackagesPath. Add api/Directory.Packages.props before generating a module."
}

try {
    [xml]$centralPackages = Get-Content -LiteralPath $CentralPackagesPath -Raw -ErrorAction Stop
}
catch {
    throw "Central package policy is not valid XML: $CentralPackagesPath. $($_.Exception.Message)"
}

$centralManagementNodes = @($centralPackages.SelectNodes('//ManagePackageVersionsCentrally'))
$hasEnabledCentralManagement = $centralManagementNodes | Where-Object {
    [string]::Equals(
        ([string]$_.InnerText).Trim(),
        'true',
        [StringComparison]::OrdinalIgnoreCase)
} | Select-Object -First 1
if ($null -eq $hasEnabledCentralManagement) {
    throw "Central package policy must enable ManagePackageVersionsCentrally for ERP solution projects: $CentralPackagesPath"
}
$centralRaw = Get-Content -LiteralPath $CentralPackagesPath -Raw
if ($centralRaw -notmatch '<CentralPackageVersionOverrideEnabled>\s*false\s*</CentralPackageVersionOverrideEnabled>') {
    throw "Central package policy must set CentralPackageVersionOverrideEnabled to false: $CentralPackagesPath"
}
$requiredCentralPackages = @(
    'MediatR',
    'FluentValidation',
    'FluentValidation.DependencyInjectionExtensions',
    'Microsoft.EntityFrameworkCore.SqlServer',
    'Microsoft.EntityFrameworkCore.Design',
    'Asp.Versioning.Mvc'
)
foreach ($packageId in $requiredCentralPackages) {
    $packageEntries = @($centralPackages.Project.ItemGroup.PackageVersion | Where-Object { $_.Include -eq $packageId })
    if ($packageEntries.Count -ne 1 -or [string]::IsNullOrWhiteSpace([string]$packageEntries[0].Version)) {
        throw "Central package policy must define exactly one version for '$packageId': $CentralPackagesPath"
    }
}
if (-not (Test-Path -LiteralPath $ModulesRoot)) {
    throw "Modules directory not found: $ModulesRoot."
}
if (-not (Test-Path -LiteralPath $DocumentationRoot -PathType Container)) {
    throw "Documentation directory not found: $DocumentationRoot."
}
if (-not (Test-Path -LiteralPath $DocumentationModulesRoot -PathType Container)) {
    throw "Module documentation root not found: $DocumentationModulesRoot. Create documentation/modules before generating a module."
}

if ($ModuleName -in $ReservedModuleNames) {
    throw "Module name '$ModuleName' is reserved for host infrastructure. Choose a business module name."
}

if ([string]::IsNullOrWhiteSpace($DatabaseSchema)) {
    $DatabaseSchema = Get-DefaultModuleSchema $ModuleName
}
$ClrModuleName = if ($ModuleName.Equals('CRM', [StringComparison]::OrdinalIgnoreCase)) {
    'Crm'
}
else {
    $ModuleName
}

$ModuleRoot = Join-Path $ModulesRoot $ModuleName
if (Test-Path -LiteralPath $ModuleRoot) {
    throw "Module directory already exists: $ModuleRoot. The generator never overwrites an existing module."
}
$ModuleDocumentationSlug = ConvertTo-KebabCase $ModuleName
$ModuleDocumentationRoot = Join-Path $DocumentationModulesRoot $ModuleDocumentationSlug
if (Test-Path -LiteralPath $ModuleDocumentationRoot) {
    throw "Module documentation directory already exists: $ModuleDocumentationRoot. The generator never overwrites an existing module package."
}

# Never delete outside the module root created by this run: resolve both sides
# and require containment before any Remove-Item in the rollback handler below.
$ResolvedModulesRoot = [System.IO.Path]::GetFullPath($ModulesRoot).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
$ResolvedModuleRoot = [System.IO.Path]::GetFullPath($ModuleRoot)
if (-not $ResolvedModuleRoot.StartsWith($ResolvedModulesRoot + [System.IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Resolved module root '$ResolvedModuleRoot' is outside the modules directory '$ResolvedModulesRoot'."
}
$ResolvedDocumentationModulesRoot = [System.IO.Path]::GetFullPath($DocumentationModulesRoot).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
$ResolvedModuleDocumentationRoot = [System.IO.Path]::GetFullPath($ModuleDocumentationRoot)
if (-not $ResolvedModuleDocumentationRoot.StartsWith($ResolvedDocumentationModulesRoot + [System.IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Resolved module documentation root '$ResolvedModuleDocumentationRoot' is outside the module documentation directory '$ResolvedDocumentationModulesRoot'."
}

if ($ModuleName.Length -lt 3 -and -not $ModuleName.Equals('HR', [StringComparison]::OrdinalIgnoreCase)) {
    throw "Module name '$ModuleName' is too short. Use a stable full name such as PointOfSale instead of an abbreviation."
}

$LayerSuffixes = @('Contracts', 'Domain', 'Application', 'Infrastructure', 'Presentation', '')
$ProjectPaths = @{}
foreach ($suffix in $LayerSuffixes) {
    $projectShortName = if ($suffix) { "ErpSystem.Modules.$ModuleName.$suffix" } else { "ErpSystem.Modules.$ModuleName" }
    $projectDir = Join-Path $ModuleRoot $projectShortName
    $projectFile = Join-Path $projectDir "$projectShortName.csproj"
    if (Test-Path -LiteralPath $projectFile) {
        throw "Project file already exists: $projectFile. The generator never overwrites existing projects."
    }
    $ProjectPaths[$suffix] = $projectFile
}
$TestProjectShortName = "ErpSystem.Modules.$ModuleName.Tests"
$TestProjectDirectory = Join-Path $ModuleRoot $TestProjectShortName
$TestProjectPath = Join-Path $TestProjectDirectory "$TestProjectShortName.csproj"
if (Test-Path -LiteralPath $TestProjectPath) {
    throw "Project file already exists: $TestProjectPath. The generator never overwrites existing projects."
}

$registryContent = Get-Content -LiteralPath $RegistryPath -Raw
$beginCount = ([regex]::Matches($registryContent, [regex]::Escape($RegistryBeginMarker))).Count
$endCount = ([regex]::Matches($registryContent, [regex]::Escape($RegistryEndMarker))).Count
if ($beginCount -ne 1 -or $endCount -ne 1) {
    throw "Registry markers must each appear exactly once in $RegistryPath."
}
if ($registryContent -match "ErpSystem\.Modules\.$ModuleName\.") {
    throw "Module '$ModuleName' is already registered in $RegistryPath."
}

$hostContent = Get-Content -LiteralPath $HostCsproj -Raw
$hostBeginCount = ([regex]::Matches($hostContent, [regex]::Escape($HostBeginMarker))).Count
$hostEndCount = ([regex]::Matches($hostContent, [regex]::Escape($HostEndMarker))).Count
if ($hostBeginCount -ne 1 -or $hostEndCount -ne 1) {
    throw "Host module-reference markers must each appear exactly once in $HostCsproj."
}
$bootstrapInclude = "..\Modules\$ModuleName\ErpSystem.Modules.$ModuleName\ErpSystem.Modules.$ModuleName.csproj"
if ($hostContent -match [regex]::Escape($bootstrapInclude)) {
    throw "Host project already references the $ModuleName bootstrap. Aborting to keep wiring explicit."
}

$dotnetCommand = Get-Command 'dotnet' -ErrorAction SilentlyContinue
if ($null -eq $dotnetCommand) {
    throw "'dotnet' CLI not found on PATH. It is required to attach the new projects to ErpSystem.sln."
}

# In-memory byte snapshots only (never backup files on disk). Restored in the
# catch handler so a late failure leaves host, registry, and solution
# byte-for-byte identical. Reads are WhatIf-safe: nothing is created.
$snapshots = @{}
$moduleRootCreated = $false
$moduleDocumentationRootCreated = $false
function Save-Snapshot([string]$Path) {
    if (-not $snapshots.ContainsKey($Path)) {
        $snapshots[$Path] = [System.IO.File]::ReadAllBytes($Path)
    }
}

function Insert-BeforeMarker([string]$Content, [string]$Marker, [string]$Line) {
    $markerIndex = $Content.IndexOf($Marker, [StringComparison]::Ordinal)
    if ($markerIndex -lt 0) {
        throw "Marker '$Marker' was not found while updating a generated file."
    }

    $lineBreakIndex = $Content.LastIndexOf("`n", $markerIndex)
    $lineStart = if ($lineBreakIndex -ge 0) { $lineBreakIndex + 1 } else { 0 }
    $indent = $Content.Substring($lineStart, $markerIndex - $lineStart)
    if ($indent -notmatch '^\s*$') {
        throw "Marker '$Marker' must be on a line by itself (apart from indentation)."
    }

    # Preserve the marker line's newline convention. This keeps successful
    # scaffolding to a textual insertion and avoids XML reserialization.
    $newline = if ($lineBreakIndex -gt 0 -and $Content[$lineBreakIndex - 1] -eq "`r") {
        "`r`n"
    }
    else {
        "`n"
    }

    return $Content.Insert(
        $markerIndex,
        $Line.TrimStart() + $newline + $indent)
}

try {

# ---------- generate the six canonical runtime projects + module tests ----------

# Create the root before any child writes. If another process wins a race
# after the preflight existence check, New-Item fails and the catch handler
# cannot delete a directory this run did not create.
if ($PSCmdlet.ShouldProcess($ResolvedModuleRoot, 'Create module root')) {
    New-Item -ItemType Directory -Path $ResolvedModuleRoot -ErrorAction Stop | Out-Null
    $moduleRootCreated = $true
}

# Create the module-owned documentation package beside the runtime scaffold.
# The package is generated from verified foundation facts only; feature books
# are added later by the owning module team.
if ($PSCmdlet.ShouldProcess($ResolvedModuleDocumentationRoot, 'Create module documentation root')) {
    New-Item -ItemType Directory -Path $ResolvedModuleDocumentationRoot -ErrorAction Stop | Out-Null
    $moduleDocumentationRootCreated = $true
}
$documentationFiles = Get-ModuleDocumentationFiles $ModuleName $ModuleDocumentationSlug $DatabaseSchema
foreach ($entry in $documentationFiles.GetEnumerator()) {
    $documentationPath = Join-Path $ResolvedModuleDocumentationRoot $entry.Key
    Write-ModuleFile $documentationPath (Restore-MarkdownCodeTicks ([string]$entry.Value))
}

$assemblyReferenceSource = @"
using System.Reflection;

namespace ErpSystem.Modules.$ModuleName.PLACEHOLDER_LAYER;

public static class AssemblyReference
{
    public static readonly Assembly Assembly = typeof(AssemblyReference).Assembly;
}
"@

# Contracts (no dependencies) and Domain (no dependencies).
Write-ModuleFile $ProjectPaths['Contracts'] (Get-LayerCsproj $ModuleName 'Contracts' '')
Write-ModuleFile (Join-Path (Join-Path $ModuleRoot "ErpSystem.Modules.$ModuleName.Contracts") 'AssemblyReference.cs') ($assemblyReferenceSource -replace 'PLACEHOLDER_LAYER', 'Contracts')
Write-ModuleFile $ProjectPaths['Domain'] (Get-LayerCsproj $ModuleName 'Domain' '')
Write-ModuleFile (Join-Path (Join-Path $ModuleRoot "ErpSystem.Modules.$ModuleName.Domain") 'AssemblyReference.cs') ($assemblyReferenceSource -replace 'PLACEHOLDER_LAYER', 'Domain')

# Application (MediatR + FluentValidation, depends on own Contracts and Domain).
$applicationBody = @"

  <ItemGroup>
    <PackageReference Include="MediatR" />
    <PackageReference Include="FluentValidation" />
    <PackageReference Include="FluentValidation.DependencyInjectionExtensions" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\..\BuildingBlocks\ErpSystem.BuildingBlocks.Application\ErpSystem.BuildingBlocks.Application.csproj" />
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Contracts\ErpSystem.Modules.$ModuleName.Contracts.csproj" />
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Domain\ErpSystem.Modules.$ModuleName.Domain.csproj" />
  </ItemGroup>
"@
Write-ModuleFile $ProjectPaths['Application'] (Get-LayerCsproj $ModuleName 'Application' $applicationBody)
Write-ModuleFile (Join-Path (Join-Path $ModuleRoot "ErpSystem.Modules.$ModuleName.Application") 'AssemblyReference.cs') ($assemblyReferenceSource -replace 'PLACEHOLDER_LAYER', 'Application')
Write-ModuleFile (Join-Path (Join-Path $ModuleRoot "ErpSystem.Modules.$ModuleName.Application") 'DependencyInjection.cs') @"
using ErpSystem.BuildingBlocks.Application;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.$ModuleName.Application;

public static class DependencyInjection
{
    public static IServiceCollection Add${ClrModuleName}Application(this IServiceCollection services)
    {
        services.AddMediatR(configuration =>
            configuration.RegisterServicesFromAssembly(AssemblyReference.Assembly));
        services.AddValidatorsFromAssembly(AssemblyReference.Assembly, includeInternalTypes: true);
        services.AddApplicationPipeline();

        return services;
    }
}
"@

# Infrastructure (EF Core SQL Server, module-owned schema and history table).
$infrastructureBody = @"

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" />
    <PackageReference Include="Microsoft.Extensions.Configuration.Json" />
    <PackageReference Include="Microsoft.Extensions.Configuration.EnvironmentVariables" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Application\ErpSystem.Modules.$ModuleName.Application.csproj" />
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Contracts\ErpSystem.Modules.$ModuleName.Contracts.csproj" />
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Domain\ErpSystem.Modules.$ModuleName.Domain.csproj" />
  </ItemGroup>
"@
Write-ModuleFile $ProjectPaths['Infrastructure'] (Get-LayerCsproj $ModuleName 'Infrastructure' $infrastructureBody)
Write-ModuleFile (Join-Path (Join-Path $ModuleRoot "ErpSystem.Modules.$ModuleName.Infrastructure") "$ClrModuleName`DbContext.cs") @"
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.$ModuleName.Infrastructure;

/// <summary>
/// Module-owned DbContext for $ModuleName. The default schema is "$DatabaseSchema"
/// and the migrations history table lives inside that schema, so module storage
/// stays separated from every other module sharing the database.
/// </summary>
public sealed class ${ClrModuleName}DbContext : DbContext
{
    public const string Schema = "$DatabaseSchema";

    // A fresh scaffold has no IEntityTypeConfiguration implementations yet.
    // This cached detection mirrors AccountingDbContext: scanning an empty
    // assembly unconditionally keeps EF model checks noisy for new modules.
    private static readonly bool HasEntityConfigurations =
        typeof(${ClrModuleName}DbContext).Assembly.GetTypes().Any(type =>
            !type.IsAbstract &&
            !type.IsGenericTypeDefinition &&
            type.GetInterfaces().Any(interfaceType =>
                interfaceType.IsGenericType &&
                interfaceType.GetGenericTypeDefinition() == typeof(IEntityTypeConfiguration<>)));

    public ${ClrModuleName}DbContext(DbContextOptions<${ClrModuleName}DbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(Schema);
        if (HasEntityConfigurations)
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(${ClrModuleName}DbContext).Assembly);
    }
}
"@
Write-ModuleFile (Join-Path (Join-Path $ModuleRoot "ErpSystem.Modules.$ModuleName.Infrastructure") "$ClrModuleName`DbContextDesignFactory.cs") @"
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ErpSystem.Modules.$ModuleName.Infrastructure;

/// <summary>
/// Creates only the $ModuleName context for EF design-time commands without
/// booting the API host or any other module.
/// </summary>
public sealed class ${ClrModuleName}DbContextDesignFactory
    : IDesignTimeDbContextFactory<${ClrModuleName}DbContext>
{
    public ${ClrModuleName}DbContext CreateDbContext(string[] args)
    {
        var connectionString = ResolveConnectionString();

        var options = new DbContextOptionsBuilder<${ClrModuleName}DbContext>()
            .UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(${ClrModuleName}DbContext).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", ${ClrModuleName}DbContext.Schema))
            .Options;

        return new ${ClrModuleName}DbContext(options);
    }

    private static string ResolveConnectionString()
    {
        var environment = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
            ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
            ?? "Development";
        // AddEnvironmentVariables below loads ConnectionStrings__$ModuleName
        // and ConnectionStrings__DefaultConnection after every optional JSON source.
        var configuration = new ConfigurationBuilder()
            .SetBasePath(FindApiDirectory())
            .AddJsonFile("appsettings.example.json", optional: true, reloadOnChange: false)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
            .AddJsonFile("appsettings." + environment + ".json", optional: true, reloadOnChange: false)
            .AddEnvironmentVariables()
            .Build();

        foreach (var name in new[] { "$ModuleName", "DefaultConnection" })
        {
            var candidate = configuration.GetConnectionString(name);
            if (IsConfigured(candidate))
                return candidate!;
        }

        throw new InvalidOperationException(
            "No effective connection string was configured. Set ConnectionStrings:$ModuleName "
            + "or ConnectionStrings:DefaultConnection before running $ModuleName EF design-time commands.");
    }

    private static bool IsConfigured(string? value)
    {
        var trimmed = value?.Trim();
        return !string.IsNullOrWhiteSpace(trimmed)
            && !(trimmed.StartsWith('<') && trimmed.EndsWith('>'));
    }

    private static string FindApiDirectory()
    {
        for (var directory = new DirectoryInfo(Directory.GetCurrentDirectory());
             directory is not null;
             directory = directory.Parent)
        {
            if (IsApiDirectory(directory.FullName))
                return directory.FullName;

            var directCandidate = Path.Combine(directory.FullName, "ErpSystem.Api");
            if (IsApiDirectory(directCandidate))
                return directCandidate;

            var repositoryCandidate = Path.Combine(directory.FullName, "api", "ErpSystem.Api");
            if (IsApiDirectory(repositoryCandidate))
                return repositoryCandidate;
        }

        throw new InvalidOperationException(
            "Unable to locate ErpSystem.Api.csproj or appsettings.example.json for EF design-time commands.");
    }

    private static bool IsApiDirectory(string path) =>
        File.Exists(Path.Combine(path, "ErpSystem.Api.csproj")) ||
        File.Exists(Path.Combine(path, "appsettings.example.json"));
}
"@
Write-ModuleFile (Join-Path (Join-Path $ModuleRoot "ErpSystem.Modules.$ModuleName.Infrastructure") 'DependencyInjection.cs') @"
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.$ModuleName.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection Add${ClrModuleName}Infrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("$ModuleName")
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string '$ModuleName' or 'DefaultConnection' not found.");

        services.AddDbContext<${ClrModuleName}DbContext>(options =>
            options.UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(DependencyInjection).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", ${ClrModuleName}DbContext.Schema)));

        return services;
    }
}
"@

# Presentation (controllers only, depends on own Application/Contracts plus the
# neutral authorization BuildingBlock so generated business modules never need
# a presentation dependency on HR or Platform internals).
$presentationBody = @"

  <ItemGroup>
    <PackageReference Include="Asp.Versioning.Mvc" />
  </ItemGroup>

  <ItemGroup>
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\..\BuildingBlocks\ErpSystem.BuildingBlocks.Authorization\ErpSystem.BuildingBlocks.Authorization.csproj" />
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Application\ErpSystem.Modules.$ModuleName.Application.csproj" />
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Contracts\ErpSystem.Modules.$ModuleName.Contracts.csproj" />
  </ItemGroup>
"@
Write-ModuleFile $ProjectPaths['Presentation'] (Get-LayerCsproj $ModuleName 'Presentation' $presentationBody)
Write-ModuleFile (Join-Path (Join-Path $ModuleRoot "ErpSystem.Modules.$ModuleName.Presentation") 'AssemblyReference.cs') ($assemblyReferenceSource -replace 'PLACEHOLDER_LAYER', 'Presentation')
Write-ModuleFile (Join-Path (Join-Path $ModuleRoot "ErpSystem.Modules.$ModuleName.Presentation") 'DependencyInjection.cs') @"
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.$ModuleName.Presentation;

public static class DependencyInjection
{
    /// <summary>
    /// Registers the $ModuleName controller assembly with MVC so module endpoints
    /// are discovered by the single host without referencing Infrastructure.
    /// Called from the module composition root, never directly by the host.
    /// </summary>
    public static IServiceCollection Add${ClrModuleName}Presentation(this IServiceCollection services)
    {
        services.AddControllers().AddApplicationPart(AssemblyReference.Assembly);
        return services;
    }
}
"@

# Bootstrap (composition root, the only project the host references).
$bootstrapBody = @"

  <ItemGroup>
    <ProjectReference Include="..\..\..\BuildingBlocks\ErpSystem.BuildingBlocks.Modularity\ErpSystem.BuildingBlocks.Modularity.csproj" />
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Application\ErpSystem.Modules.$ModuleName.Application.csproj" />
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Infrastructure\ErpSystem.Modules.$ModuleName.Infrastructure.csproj" />
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Presentation\ErpSystem.Modules.$ModuleName.Presentation.csproj" />
  </ItemGroup>
"@
$bootstrapCsproj = @"
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>$TargetFramework</TargetFramework>
    <AssemblyName>ErpSystem.Modules.$ModuleName</AssemblyName>
    <RootNamespace>ErpSystem.Modules.$ModuleName</RootNamespace>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>
$bootstrapBody
</Project>
"@
Write-ModuleFile $ProjectPaths[''] $bootstrapCsproj
Write-ModuleFile (Join-Path (Join-Path $ModuleRoot "ErpSystem.Modules.$ModuleName") "$ClrModuleName`Module.cs") @"
using ErpSystem.BuildingBlocks.Modularity;
using ErpSystem.Modules.$ModuleName.Application;
using ErpSystem.Modules.$ModuleName.Infrastructure;
using ErpSystem.Modules.$ModuleName.Presentation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.Modules.$ModuleName;

/// <summary>Bootstrap composition root for the $ModuleName bounded context.</summary>
public sealed class ${ClrModuleName}Module : IModule
{
    public string Name => "$ModuleName";
    public ModuleDefinition Definition => new("$ModuleDocumentationSlug", "$ModuleName", [])
    {
        Version = "1.0.0"
    };

    public void RegisterServices(IServiceCollection services, IConfiguration configuration)
    {
        services.Add${ClrModuleName}Application();
        services.Add${ClrModuleName}Infrastructure(configuration);
        services.Add${ClrModuleName}Presentation();
    }

    /// <summary>
    /// Module-owned, idempotent SQL Server schema bootstrap. The schema name is a
    /// compile-time constant, never user input, so this statement is not injectable.
    /// </summary>
    internal static string EnsureSchemaSql =>
        `$"IF SCHEMA_ID(N'{${ClrModuleName}DbContext.Schema}') IS NULL EXEC(N'CREATE SCHEMA [{${ClrModuleName}DbContext.Schema}]');";

    public async Task MigrateAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        var configuration = services.GetRequiredService<IConfiguration>();
        if (!ModuleMigrationSettings.ShouldApplyMigrations(configuration, Name))
            return;

        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<${ClrModuleName}DbContext>();

        // EF creates the module history table before running the first migration;
        // the module schema must exist first or that CREATE TABLE fails.
        // Ensure the schema before inspecting migrations so a fresh module can
        // exist and apply its first migration.
        await db.Database.ExecuteSqlRawAsync(EnsureSchemaSql, cancellationToken).ConfigureAwait(false);

        // No migrations are defined for a fresh module yet. GetMigrations() reads
        // the assembly only, so there is nothing further to apply until the
        // first real migration exists.
        if (!db.Database.GetMigrations().Any())
            return;

        await db.Database.MigrateAsync(cancellationToken).ConfigureAwait(false);
    }

    public async Task<IReadOnlyList<string>> GetPendingMigrationsAsync(
        IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<${ClrModuleName}DbContext>();
        return (await db.Database.GetPendingMigrationsAsync(cancellationToken).ConfigureAwait(false)).ToArray();
    }
}
"@

# Module-owned tests. Tests may see every layer of their own bounded context,
# but do not reference other business modules. Cross-module behavior belongs in
# the solution-level ArchitectureTests/IntegrationTests projects.
$testProjectBody = @"
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>$TargetFramework</TargetFramework>
    <AssemblyName>$TestProjectShortName</AssemblyName>
    <RootNamespace>$TestProjectShortName</RootNamespace>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
    <IsTestProject>true</IsTestProject>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" />
    <PackageReference Include="xunit" />
    <PackageReference Include="xunit.runner.visualstudio">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Contracts\ErpSystem.Modules.$ModuleName.Contracts.csproj" />
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Domain\ErpSystem.Modules.$ModuleName.Domain.csproj" />
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Application\ErpSystem.Modules.$ModuleName.Application.csproj" />
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Infrastructure\ErpSystem.Modules.$ModuleName.Infrastructure.csproj" />
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName.Presentation\ErpSystem.Modules.$ModuleName.Presentation.csproj" />
    <ProjectReference Include="..\ErpSystem.Modules.$ModuleName\ErpSystem.Modules.$ModuleName.csproj" />
  </ItemGroup>

</Project>
"@
Write-ModuleFile $TestProjectPath $testProjectBody
Write-ModuleFile (Join-Path $TestProjectDirectory 'Usings.cs') @"
global using Xunit;
"@
Write-ModuleFile (Join-Path $TestProjectDirectory 'ModuleOwnershipTests.cs') @"
namespace $TestProjectShortName;

public sealed class ModuleOwnershipTests
{
    [Fact]
    public void Module_bootstrap_is_owned_by_the_same_bounded_context()
    {
        Assert.Equal("$ModuleName", new global::ErpSystem.Modules.$ModuleName.${ClrModuleName}Module().Name);
    }
}
"@

# ---------- wire the host: bootstrap reference, registry entry, solution ----------

$bootstrapLine = "<ProjectReference Include=`"$bootstrapInclude`" />"
if ($PSCmdlet.ShouldProcess($HostCsproj, "Add $ModuleName bootstrap reference")) {
    # Text insertion between the stable markers keeps host formatting
    # byte-identical apart from the added line; no XML reserialization.
    Save-Snapshot $HostCsproj
    $hostUpdated = Insert-BeforeMarker (Get-Content -LiteralPath $HostCsproj -Raw) $HostEndMarker $bootstrapLine
    [System.IO.File]::WriteAllText(
        $HostCsproj,
        $hostUpdated,
        [System.Text.UTF8Encoding]::new($false))
}

if ($PSCmdlet.ShouldProcess($RegistryPath, "Register $ModuleName module")) {
    Save-Snapshot $RegistryPath
    $registryLine = "new ErpSystem.Modules.$ModuleName.${ClrModuleName}Module(),"
    $updated = Insert-BeforeMarker (Get-Content -LiteralPath $RegistryPath -Raw) $RegistryEndMarker $registryLine
    [System.IO.File]::WriteAllText(
        $RegistryPath,
        $updated,
        [System.Text.UTF8Encoding]::new($false))
}

$solutionSnapshotTaken = $false
foreach ($suffix in $LayerSuffixes) {
    $projectShortName = if ($suffix) { "ErpSystem.Modules.$ModuleName.$suffix" } else { "ErpSystem.Modules.$ModuleName" }
    $csproj = $ProjectPaths[$suffix]
    if ($PSCmdlet.ShouldProcess($SolutionPath, "Add $projectShortName to solution")) {
        if (-not $solutionSnapshotTaken) {
            Save-Snapshot $SolutionPath
            $solutionSnapshotTaken = $true
        }
        & dotnet sln $SolutionPath add $csproj --solution-folder "Modules/$ModuleName"
        if ($LASTEXITCODE -ne 0) {
            throw "dotnet sln add failed for $projectShortName with exit code $LASTEXITCODE."
        }
    }
}
if ($PSCmdlet.ShouldProcess($SolutionPath, "Add $TestProjectShortName to solution")) {
    if (-not $solutionSnapshotTaken) {
        Save-Snapshot $SolutionPath
        $solutionSnapshotTaken = $true
    }
    & dotnet sln $SolutionPath add $TestProjectPath --solution-folder "Modules/$ModuleName"
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet sln add failed for $TestProjectShortName with exit code $LASTEXITCODE."
    }
}

Write-Host "Module $ModuleName scaffolded with schema '$DatabaseSchema' and a module-owned test project."
Write-Host "Runtime root: $ResolvedModuleRoot"
Write-Host "Documentation root: $ResolvedModuleDocumentationRoot"
Write-Host "Next: add entities and an EF migration, then run the modularity tests."
}
catch {
    # Roll back everything this run touched. Snapshots restore host, registry,
    # and solution byte-for-byte. Only the runtime module root and documentation
    # package roots resolved and validated above (both guaranteed absent before
    # this run) are ever removed; no other path is deleted.
    foreach ($entry in $snapshots.GetEnumerator()) {
        [System.IO.File]::WriteAllBytes($entry.Key, [byte[]]$entry.Value)
    }
    if ($moduleRootCreated -and (Test-Path -LiteralPath $ResolvedModuleRoot)) {
        Remove-Item -LiteralPath $ResolvedModuleRoot -Recurse -Force
    }
    if ($moduleDocumentationRootCreated -and (Test-Path -LiteralPath $ResolvedModuleDocumentationRoot)) {
        Remove-Item -LiteralPath $ResolvedModuleDocumentationRoot -Recurse -Force
    }
    throw
}
