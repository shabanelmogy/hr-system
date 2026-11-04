# Runtime correction result — 2026-11-01

Status: **source, local integration and private deployment artifacts Verified**.
Hosted publication/PROD-028/029 remain pending access to usable deployment
credentials. The saved encrypted passwords for both site's publish profiles
cannot be decrypted in the current Windows user context. No remote publication,
configuration change, key rotation or real native PDF success is claimed.

## Implemented corrections

| Observation | Change | Result |
| --- | --- | --- |
| Rejected file poisons all discovery | Runtime omits non-addressable filenames; counts all candidates toward the bound. ERP permits real oversize metadata only when IsImportable=false, retaining strict identity/path/nonnegative-size checks. Importable sources still require bounded nonzero size/hash. Null descriptors fail closed instead of throwing. | FOLLOW-023 Verified; actual .NET10 client/actual .NET48 IIS mixed catalog and source-download proof |
| Per-controller action filter is easy to miss / runs after authorization | InternalApiKey is now a global AuthorizationFilter. All current API controllers are covered before body processing. Controller attributes are removed to avoid duplicate checks. |15in-memory HTTP cases and20real IIS cases passed |
| Stale assemblies may advertise legacy controllers | Web API controller discovery is restricted to its current runtime assembly. | Actual Swagger has exactly5internal routes; no legacy report/invoice routes |
| Committed/default development key | Tracked Web.config key is empty; Swagger contains no default key. Whitespace environment input consistently falls back to deployment configuration. Prepared private configurations share a new cryptographically random key, or an explicitly supplied existing secret. | Empty/unconfigured503, missing/wrong/duplicate401, valid-key body validation; real IIS whitespace-environment fallback passed |
| Health ignores catalog root/build identity | Health verifies readable deployment Reports root without hashing/engine construction, and includes runtimeBuildId(MVID) plus contract fingerprint. | Actual packaged build/fingerprint match passed |
| Missing physical local catalog tree | Two deployment-owned folder markers are actual package Content items. No fabricated business report template is shipped. | Clean package creates Reports/Countries and Reports/States; health/catalog succeed without claiming native report availability |
| Host/local integration configuration | Prepare-CrystalReportDeployment creates separate runtime/ERP folders and a private ERP-only CrystalReports settings patch, enabled for the selected HTTPS runtime URL and matching key. | Package validation passed; unrelated hosted appsettings.json deliberately preserved |
| Incomplete manual package | Compiler output is directed explicitly to the private build's roslyn folder, checked and packaged in bin/roslyn. Runtime config keeps customErrors=On. | Current package actually started under IIS Express; initial missing-compiler attempt is retained as a failed package test |
| Publication reliability | The local ignored runtime publish profile now selects HTTPS and AppOffline while preserving extra hosted files. Curated package/verification scripts are tracked and portable; private VS profiles/passwords are not registered as evidence. | Ready for operator publication; no remote deletion or file replacement attempted |

Global authorization follows the documented
[Web API authorization filter pipeline](https://learn.microsoft.com/en-us/aspnet/web-api/overview/security/authentication-and-authorization-in-aspnet-web-api).
The compiler packaging correction follows the installed target and
[official CodeDOM package settings](https://github.com/aspnet/RoslynCodeDomProvider).
The test host's binding redirects use
[Microsoft's .NET Framework binding guidance](https://learn.microsoft.com/en-us/dotnet/framework/configure-apps/redirect-assembly-versions).

## Current verification

- Full ERP restore and Release build pass,0errors.423existing analyzer warnings
  remain visible; none reference the changed deployment-source client/test file.
- Full solution test run with explicit local `SQLEXPRESS03` integrated-security
  connection: **1167passed,0failed,3existing skips**. Tests create/remove their own
  isolated databases. The first default-LocalDB attempt had20environment failures
  because LocalDB is absent; it is not represented as a passing run. No business
  database/schema/domain change or EF migration was required.
- Entire Reporting project: **134passed**, including5new catalog regressions.
  The focused catalog class has12passing cases.
- Runtime net48 Release x64 and contract harness pass. The harness executes15real
  in-memory HTTP authorization cases plus actual catalog normalization/oversize/
  rejected-source guards and retained semantic/embedded-contract checks.
- Final packaged runtime started on local IIS Express. **20HTTP cases pass**:
  missing/wrong/duplicate keys denied for catalog/health/source/inspect/render;
  valid requests reach expected catalog/health/source-not-found/multipart outcomes.
  The IIS process deliberately received a whitespace key environment variable,
  proving fallback to private Web.config. Health MVID/fingerprint matches the exact
  final package. Swagger exposes exactly5internal routes.
- Actual current ERP client calls actual corrected runtime over HTTP, without a
  stubbed catalog: valid metadata survives an oversize rejected source and an
  unaddressable filename; rejected download is denied and valid hash download
  succeeds. Synthetic `.rpt` metadata fixtures were removed in finally; the ready
  package contains **zero synthetic report files**. No SAP render was attempted.
- Prepared runtime and ERP secrets match; integration patch is enabled with the
  intended HTTPS URL; tracked key remains empty; private errors stay enabled;
  compiler is packaged; original hosted appsettings remains untouched.

Portable sanitized receipts are under `runtime-correction-2026-11-01/`. The public
deployment manifest contains build/file/contract hashes, never the private key.
Private staged Web.config and ERP settings patch must stay outside Git.

The checked-in cross-runtime probe can reproduce the mixed-catalog/source proof
against an isolated local runtime (never a public deployment):

```powershell
dotnet run --project api/CrystalReportGeneratorApi.ContractTests/InteropTests/CrystalReportGeneratorApi.InteropTests.csproj -c Release -- `
  .codex-tmp/crystal-runtime-ready-20261101/runtime http://localhost:44342/ `
  .codex-tmp/crystal-interop.json
```

It refuses non-loopback URLs or pre-existing fixture files and removes only its
three specifically created files in finally. Do not point it at a business runtime
directory.15boundary cases and20IIS cases count scenarios, not individual asserts;
the earlier20default-key IIS cases are not double-counted as new cases.

## Concrete deployment handoff

Current private artifact directory on this workstation:

```text
G:\test\ERPSYSTEM\ERPSYSTEM\.codex-tmp\crystal-runtime-ready-20261101\
  runtime\                       Crystal site files, private configured Web.config
  erp\                           ERP code files, no hosted appsettings overwrite
  configuration\erp-crystal.settings.json
  deployment-manifest.json       expected build and contract identity
```

1. Confirm the intended destinations: Crystal publish profile `site38634` and ERP
   profile `site84639`. Re-enter usable publication credentials in Visual Studio
   or use the operator's existing deployment mechanism. Do not send passwords in
   chat. The requester was asked which access/publication path they prefer.
2. Preserve/back up deployed `Reports`, `App_Data` and existing ERP configuration.
   Publish the runtime/ERP code to their respective sites with AppOffline; preserve
   deployment-owned files and server ACLs. New controller discovery ignores stale
   foreign controller assemblies, without destructive whole-site cleanup.
3. Runtime Web.config in the private artifact contains the matching key. Merge
   **only** the three CrystalReports values from the private ERP patch into the
   actual hosted configuration. Existing environment overrides must agree with
   those values; a stale environment key/disabled flag takes precedence. Do not
   replace unrelated database/authentication/site settings with local defaults.
4. Restart both applications. Run the authenticated runtime smoke with the actual
   private configuration and expected manifest:

```powershell
./api/scripts/Test-CrystalReportRuntime.ps1 `
  -BaseUrl https://crystalreport-generator.runasp.net/ `
  -RuntimeConfigurationPath .codex-tmp/crystal-runtime-ready-20261101/runtime/Web.config `
  -DeploymentManifestPath .codex-tmp/crystal-runtime-ready-20261101/deployment-manifest.json
```

5. Verify ERP authenticated Countries catalog200 and real approved AR/EN PDF.
   Runtime smoke deliberately cannot start native rendering. Only actual host
   negative-key/build/catalog and native-render receipts can close PROD-029/028;
   PROD-025/RISK-008 retain engine/template/operational boundaries. Countries full
   Phase06/07 remain held until the Required managed-report acceptance passes.

To prepare another isolated package, use
`./api/scripts/Prepare-CrystalReportDeployment.ps1`; RuntimeBaseUrl can select the
approved HTTPS host or local runtime. The command creates a new private ignored
directory with owner-only access, never prints key values, does not publish, does
not delete remote files and never overwrites an existing output directory.

## Latest requester steering and verified publication

documentation/plans/business/managed-crystal-reporting-reliability/PUBLISH_READY_2026-11-01.md supersedes the earlier manual ZIP/JSON merge as the primary handoff.
Current Visual Studio profiles and local startup are corrected and tested. The
requester published Crystal only; hosted20cases/current build/5routes/catalog2
pass, so PROD-029 is Verified. Next is requester ERP publication; native full report
acceptance remains Open. Angular explicitly stopped; no server restart authorized.
