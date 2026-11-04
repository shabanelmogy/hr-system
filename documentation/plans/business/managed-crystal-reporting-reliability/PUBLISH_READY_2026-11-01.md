# Current handoff: Visual Studio Publish ready — 2026-11-01

Requester clarified that publication uses existing Visual Studio Publish settings.
This supersedes the earlier ZIP/manual-JSON-merge handoff as the primary workflow.
Source fixes, current private profile configuration and local publish validation
are complete. The requester performs the remote publication; no agent deployment
or real hosted PDF acceptance is claimed.

**Latest publication:** requester published CrystalReportGeneratorApi only.
Actual hosted20boundary cases pass, health build ID matches the local published
assembly, contract fingerprint matches, and both original reports remain available
in catalog200. PROD-029 auth/version mismatch is Verified. Next operator action:
publish ErpSystem.Api with site84639-WebDeploy. ERP integration/native PDF remains
PROD-028/025; the requester explicitly stopped Angular and it must remain stopped
until they request it again.

## Publish the two existing projects

1. Publish `api/CrystalReportGeneratorApi` using **site38634-WebDeploy**, Release x64.
2. Publish `api/ErpSystem.Api` using **site84639-WebDeploy**, Release/win-x64.
3. Restart/recycle the applications if the hosting panel requires it, then verify
   authenticated runtime readiness/catalog and ERP Countries report/PDF in AR/EN.

The current profiles already select their private transforms. No ZIP extraction,
manual JSON patch or replacement of the hosted database/authentication settings
is required for this workflow. Runtime publication injects its matching internal
key and removes the local external-config reference. ERP publication injects three
ANCM process environment variables: integration enabled, intended HTTPS runtime
URL and matching internal key. Existing appsettings.json is preserved. AppOffline
is enabled on both profiles.

The Crystal profile removes obsolete binaries during synchronization. Its actual
MSDeploy skip rules preserve files outside bin and explicitly protect Reports,
ReportsLogo and App_Data, including nested content. The behavior was tested by
an actual isolated local Web Deploy synchronization using the profile rules:
the obsolete DLL disappeared; existing report/app-data/user/root files survived.
The ERP profile keeps its existing preservation setting.

The runtime profile explicitly selects **UseMsdeployExe=true** and the installed
Web Deploy executable directory. Its delete-only SkipAction is supported by that
native executable, while Visual Studio's in-process VSMSDeploy parser rejected it.
The requester-reported error was corrected; the actual WPP MSDeploy task, importing
the actual profile, now succeeds against an isolated local destination and verifies
obsolete-bin removal plus Reports/App_Data/root preservation. This is separately
recorded in msbuild-publish-task.json. Native CLI-only tests did not establish that
the earlier in-process parser accepted the rule; that earlier assumption is
explicitly superseded.

Private key values are in ignored, current-user-access-only files, never tracked
source or Swagger defaults:

- `api/CrystalReportGeneratorApi/Web.Crystal.publish-private.config`
- `api/CrystalReportGeneratorApi/App_Data/CrystalRuntime.local.config`
- `api/ErpSystem.Api/web.Crystal.publish-private.config`

The private local runtime configuration enables F5/API smoke use without embedding
a key in tracked Web.config. Runtime publishing strips that optional local file
reference and excludes the local file. ERP publishing excludes its raw private
transform. These are standard native Web.config/profile transformations; no new
application configuration provider or business layer was introduced.

To recreate the wiring on another machine after importing the site's existing
publish profiles and transferring the private patch through an appropriate private
channel, run:

```powershell
./api/scripts/Configure-CrystalReportPublish.ps1 `
  -CrystalPatchPath .codex-tmp/crystal-runtime-ready-20261101/configuration/erp-crystal.settings.json
```

Alternatively `Prepare-CrystalReportDeployment.ps1 -ConfigurePublishProfiles`
generates a new matching private key/package and configures those profiles. Publish
both services together when selecting a new key. Never commit private transforms,
patches, generated configured packages or publish passwords.

## Local Runtime Error fixed

The requester reproduced generic ASP.NET Runtime Error on HTTPS44341. Local-only
details exposed `FileLoadException`: stale `System.Web.Mvc` startup code requested
`Microsoft.Web.Infrastructure`1.0.0.0 while an old bin copy was2.0.0.0. MVC is not
a dependency of the current runtime; the clean package already ran without it.

The old project bin was moved to a verified workspace quarantine path, not deleted,
and the runtime rebuilt successfully. The original HTTPS44341 Swagger returned200
with exactly5current routes. The original VS process subsequently stopped; a
separate source-directory IIS instance then passed20fresh HTTP boundary cases,
including configured local-key fallback. This independent instance does not replace
the user's normal F5 configuration.

Tracked local customErrors is RemoteOnly for local diagnosis; actual Release/profile
outputs have customErrors=On. No public customErrors=Off setting was introduced.
The profile's binary cleanup prevents the same stale-MVC pre-start problem from
being preserved at the target on the next publication.

## Verification and remaining boundary

- Corrected source and ready package: full ERP restore/build pass;1167solution
  tests pass with3existing browser-probe skips;134Reporting tests pass.
- Runtime/harness Release x64 and15actual in-memory authorization scenarios pass.
- Final configured package IIS20cases pass, including whitespace environment-key
  fallback, runtime build identity and canonical contract fingerprint.
- Actual .NET10 ERP client against actual .NET48 IIS passes mixed-catalog and
  rejected/approved source-download checks; all synthetic metadata files removed.
- Both existing Publish profiles were evaluated locally using their real MSBuild
  publishing pipelines with remote publication explicitly disabled. Outputs have
  matching keys, correct integration environment, production error policy,
  packaged compiler and excluded private/local files. No hosted appsettings
  overwrite. Actual MSDeploy file-preservation test passes.
- Current source-directory IIS20cases pass after the local startup fix.

Current sanitized receipts are in `runtime-correction-2026-11-01/`, including
`actual-publish-profile-checks.json`, `publish-profile-validation.json`,
`profile-preservation-final.json`, `local-startup-repair.json` and
`source-local-verified.json`. Related implementation detail remains in
RUNTIME_CORRECTION_RESULT_2026-11-01.md; the optional ZIP workflow remains available.

FOLLOW-023 and PROD-029 are Verified. Crystal publication and hosted negative-key/
catalog/build tests pass; PROD-028 still waits for ERP publication and real report
acceptance. Native approved AR/EN PDF
and runtime installation/template proof remain PROD-025/RISK-008. No domain/schema,
database migration, Angular/Next/mobile runtime change or full Countries Phase06/07
closure is inferred from these technical passes.

After publication a read-only/non-rendering boundary smoke can be run with:

```powershell
./api/scripts/Test-CrystalReportRuntime.ps1 `
  -BaseUrl https://crystalreport-generator.runasp.net/ `
  -RuntimeConfigurationPath api/CrystalReportGeneratorApi/Web.config
```

This uses the current ignored local key file without printing it. It checks
missing/wrong/duplicate denial, valid requests, catalog/root readiness and build/
contract shape. Native PDF rendering is a separate required actual-report journey.

References used for the fixes:
[Microsoft profile transformations](https://learn.microsoft.com/en-us/aspnet/web-forms/overview/deployment/visual-studio-web-deployment/web-config-transformations),
[ASP.NET Core Web.config transformations](https://learn.microsoft.com/ar-sa/ASPNET/Core/host-and-deploy/iis/transform-webconfig?view=aspnetcore-10.0),
[local-only ASP.NET error details](https://learn.microsoft.com/en-us/previous-versions/aspnet/994a1482%28v%3Dvs.100%29),
[DACL-only .NET file access control](https://learn.microsoft.com/en-us/dotnet/api/system.io.filesystemaclextensions?view=net-10.0).

## Later render400 correction

Requester supplied CrystalReport.RenderUnsupported. RENDER_REJECTION_2026-11-01.md
supersedes that generic diagnosis: actual hosted inspection rejects connection
metadata in both real RPT files. Corrected runtime/ERP source and bounded Angular
feedback now distinguish source/schema/parameter rejection. Publish both projects
through existing profiles for the new codes. Current rejected templates remain
unchanged; native render acceptance is still Open. No new publication performed.
