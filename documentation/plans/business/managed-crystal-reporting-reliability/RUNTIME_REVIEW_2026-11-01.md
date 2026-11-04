# Crystal runtime API review — 2026-11-01

Scope: requester explicitly asked to review `api/CrystalReportGeneratorApi` in
connection with Angular Countries' hosted report503. This is read-only runtime
analysis and bounded probes, not authorization to deploy or advance the separate
managed-report roadmap. No runtime/configuration/secret/report file was changed
in either deployed service. Only review documentation and central notes are updated.

## Findings

### PROD-029 — P1: deployed internal authentication and routes differ from source

The deployment destination recorded in the project's publish profile is
`https://crystalreport-generator.runasp.net`. Normal-TLS direct probes observed:

| Request | Credentials | Result |
| --- | --- | --- |
| GET internal/reports/catalog?entityKey=countries | No API key | 200, two report descriptors |
| Same GET | Deliberately invalid API key | 200, two report descriptors |
| Same GET | Configured local internal key, value never logged | 200, two descriptors |
| GET internal/reports/health | Missing/configured key | 404 |
| POST internal/reports/inspect with an empty, non-multipart body | Missing/invalid key | 415 |
| POST internal/reports/render with an empty, non-multipart body | Missing/invalid key | 415 |

The malformed-body POST probes cannot enter native inspection/rendering: the
controller's multipart check rejects them first. No real PDF execution or report
source download was attempted.415 establishes entry into body validation without
authentication denial; it does not prove a successful anonymous render.

Current source applies `InternalApiKeyAttribute` to all four internal controllers,
returns401 for a missing/wrong key (503 if the expected key is absent), and includes
`internal/reports/health`. Public Swagger also advertises legacy routes absent
from current source (`/report/generate`, `/report/states/generate`, `/report/info`,
`/api/invoice/generate-qr`) and lacks the current health route.

There is an evidenced source/deployment behavior mismatch. A stale or mixed
deployment is an inference, not a proven explanation of the server's assembly,
proxy/cache policy or exact cause. Verify the actual package, IIS application root,
old DLL removal and configuration before republishing. Missing/wrong-key denial
must be checked again against catalog, source, inspect, render and health. Do not
relax current authentication to match the public deployment.

### FOLLOW-023 — P2: one rejected runtime entry makes the entire ERP catalog unavailable

`CrystalReportCatalogService.ReadCatalogFile` intentionally describes rejected
files with `IsImportable=false` and a validation reason. Two reproducible outputs
do not satisfy `CrystalReportDeploymentSourceClient.IsValidCatalogItem`:

- A file larger than10MiB retains its real size but is rejected by the runtime;
  the ERP client rejects any item larger than its maximum, including non-importable
  descriptors.
- A filename containing only Arabic characters cannot normalize to a canonical
  report key; the runtime returns a rejected entry with null ReportKey/SourceId,
  which the ERP client rejects.

The client uses `values.Any(invalid)` before the application filters importable
reports, so one such entry returns null for the entire list. The global query
handler converts that null to `CrystalReport.CatalogUnavailable`/503.

Reproduced using the **actual newly built net48 catalog method** for both rejected
entries and the **actual current ERP deployment-source client** with the two valid
hosted descriptors plus each rejected entry. Both whole-list failures reproduced.
Synthetic file fixtures exercised catalog metadata only; they are not genuine
Crystal templates and no native engine was invoked.

Align the runtime/client contract for rejected descriptors and add cross-boundary
regressions. Preserve fail-closed handling of truly malformed remote payloads;
do not remove all validation or hide transport failures. This is a real source
interoperability defect, but **not the established cause of today's deployed503**:
the currently observed Countries catalog contains only two valid entries.

## What the current503 does and does not establish

The actual current `CrystalReportDeploymentSourceClient`, with integration enabled
and its base URL set to the published Crystal destination, successfully returned
both reports: `Countries.rpt` and `Countries.WithStates.rpt`. This verifies current
transport/JSON compatibility from this workstation, not ERP-server egress or a
real render. The previously verified ERP endpoint still returned503 under PROD-028.

Local main-ERP settings have `CrystalReports:RuntimeEnabled=false`, an empty
`RuntimeBaseUrl` and an empty `RuntimeApiKey`. `CreateRequest` explicitly returns
null without making an HTTP call when integration is disabled. This is sufficient
to produce the same503 locally. These safe defaults **do not prove the hosted
effective values**; environment variables or deployed configuration can override
them. Check those values, the selected API version and correlated ERP logs on the
actual host. An unrelated/incorrect runtime URL, network failure or older ERP
deployment remains possible. No unique hosted root cause is asserted without that
evidence.

Expected configuration relationship (keys deliberately omitted):

```text
ERP host:
  CrystalReports:RuntimeEnabled = true
  CrystalReports:RuntimeBaseUrl = https://crystalreport-generator.runasp.net/
  CrystalReports:RuntimeApiKey = deployment secret
  OR CRYSTAL_REPORT_INTERNAL_API_KEY = deployment secret

Crystal runtime host:
  InternalApiKey OR CRYSTAL_REPORT_INTERNAL_API_KEY = matching deployment secret
```

The URL is the inspected publish destination, not an instruction to change hosted
configuration blindly. First confirm it is the intended runtime for this ERP.

## Deployment prerequisites and positive source observations

- Runtime is a separate ASP.NET Web API2/.NET Framework4.8 application. Release x64
  builds successfully. It should retain its own Windows/IIS/SAP runtime deployment;
  Angular and the .NET10 ERP host do not execute Crystal in-process.
- The local physical `Reports` directory and `.rpt` files are absent; csproj has
  folder declarations, not report Content items. The catalog requires an existing
  deployment-owned `Reports/<entity>/...rpt` tree. This is a local/fresh-deployment
  prerequisite, **not proof that the current remote tree is missing**: the hosted
  catalog demonstrably contains two files. Preserve deployment-owned templates.
- Catalog discovery reads files/hashes without instantiating `ReportDocument`.
  A successful list is not proof that SAP native components or templates can render.
- Source checks internal keys without browser Origin dependence, bounds file/data/
  PDF sizes, restricts managed entity/template contracts and connection metadata,
  disables DTD resolution, uses hash-checked source download, guards path/reparse
  boundaries, disposes documents and limits concurrent native execution.
- Source health deliberately checks assemblies/config/temp/profile fingerprint,
  not a complete engine execution or catalog acceptance. Actual AR/EN inspector/
  render acceptance and operational load remain PROD-025/RISK-008.

## Checks and limits

| Check | Result |
| --- | --- |
| Runtime net48 Release x64 build, isolated output | Passed |
| Runtime contract-harness Release x64 build/execution | Passed; canonical embedded bytes/fingerprint and semantic template cases |
| ERP client/renderer/inspector focused tests |17passed,0failed,0skipped |
| Actual ERP catalog client to published runtime | Passed,2compatible descriptors |
| Two real-method rejected-entry interoperability reproductions | Both reproduced whole-list unavailability |
| Hosted authentication/route probes | Failed expected current policy; PROD-029 |
| Real SAP inspector/native PDF/AR-EN/font/load acceptance | Not performed, not established by builds/catalog |
| Full ERP solution gate | Not run for this read-only review; no API runtime source changed |

Portable sanitized receipts live in `runtime-review-2026-11-01/`. No key values,
credential headers, publish passwords or report contents are stored. An initial
PowerShell reflection probe failed due to PSObject-to-string arguments; a typed
C# invocation bridge corrected the probe, after official MethodInfo documentation
review. Its setup failure is not an application failure or a passing repro.

Primary references consulted:
[Microsoft Web API authentication/filter behavior](https://learn.microsoft.com/en-us/aspnet/web-api/overview/security/authentication-and-authorization-in-aspnet-web-api),
[SAP Crystal for Visual Studio supported platforms](https://www.sap.com/documents/2016/06/f871031e-757c-0010-82c7-eda71af511fa.html),
[Microsoft MethodInfo invocation contract](https://learn.microsoft.com/en-us/dotnet/api/system.reflection.methodbase.invoke?view=netframework-4.8.1).

No patches or publication were performed. Recommended order: verify/correct the
intended current deployment and host-to-host configuration, correct FOLLOW-023
under its owning API/runtime workflow, then prove real authenticated catalog and
AR/EN renders before closing PROD-028 and the Countries pilot.
