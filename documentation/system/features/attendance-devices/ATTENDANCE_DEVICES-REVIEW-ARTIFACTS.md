# Attendance Devices Review Artifacts

## Metadata

| Field | Value |
| --- | --- |
| Feature | `attendance-devices` |
| API route | `/api/v1/attendance-devices` and child operational resources |
| Web route | `/attendance-devices` with `/users`, `/punches`, and `/pull-runs` |
| Mobile route | `N/A - Deferred in phase one` |
| Review owner | `HR integration implementation` |
| Review date | `2026-08-26` |
| Implementation request | `documentation/system/features/attendance-devices/IMPLEMENTATION-REQUEST.md` |
| Required-file manifest | `documentation/system/features/attendance-devices/required-files.json` |
| Operating mode | `new feature` |
| Documentation state | `Final implementation profile; manual hardware/release evidence remains open` |
| Applied reference | `countries` for architecture and verification only |
| Import decision | `Excluded` |
| Import platforms | `N/A` |
| Import format | `N/A` |
| Reporting decision | `Excluded` |
| Reporting engine | `N/A` |

## Requirement manifest

| ID | Requirement | Source | API | Web | Mobile | Status |
| --- | --- | --- | --- | --- | --- | --- |
| R-01 | Manage multiple enabled/disabled devices with an explicit provider | `HR-CONNECTION-ONLY-PROMPT.md` | Required | Required | Deferred | Open |
| R-02 | Protect write-only credentials in the backend | `HR-CONNECTION-ONLY-PROMPT.md` | Required | Credential update form only | Deferred | Open |
| R-03 | Provider catalog, Connector health, safe single-host detection, and connection test | `HR-CONNECTION-ONLY-PROMPT.md` | Required | Required | Deferred | Open |
| R-04 | Pull and store raw users and attendance without attendance judgments | `HR-CONNECTION-ONLY-PROMPT.md` | Required | Required | Deferred | Open |
| R-05 | Server filtering/paging for users, punches, and pull runs | `HR-CONNECTION-ONLY-PROMPT.md` | Required | Required | Deferred | Open |
| R-06 | Company isolation, permission separation, audit, timeout, cancellation, and SSRF controls | `HR-CONNECTION-ONLY-PROMPT.md` | Required | Required guards | Deferred | Open |
| R-07 | One documented development command and Windows companion deployment guidance | `HR-CONNECTION-ONLY-PROMPT.md` | Required | N/A | N/A | Open |
| R-08 | Fake-driver and contract tests without hardware in CI | `HR-CONNECTION-ONLY-PROMPT.md` | Required | Required stale-selection test | Deferred | Open |

## Frozen ownership decision

The persisted integration is company-owned. `TenantId` and `CompanyId` are derived
from `ICurrentActor`, enforced through `ICompanyScoped` and EF global filters, and
are never accepted from request bodies.

`BranchId` is an optional user-selected association. It is persisted with a
same-tenant/company composite foreign key and the lookup exposes only active branches
within the current company. It is not a token claim. Branch creation and branch-level
authorization are separate Organizational Structure work.

## Platform capability decisions

| Capability | API | Web | Mobile | Data scope/contract | Reason, owner, or trigger |
| --- | --- | --- | --- | --- | --- |
| Device master/detail | Required | Required | Deferred | Current company | Mobile reopens after hardware workflow stabilizes |
| Raw user Grid | Required | Required | Deferred | Current company/device; server page | Raw integration requirement |
| Raw punch Grid | Required | Required | Deferred | Current company/device/date/code; server page | Raw integration requirement |
| Pull-run Grid | Required | Required | Deferred | Current company/device/status; server page | Operational traceability |
| Cards | N/A | Excluded | Excluded | N/A | No product value over requested master/detail and grids |
| Chart | N/A | Excluded | Excluded | N/A | Would imply derived analytics outside phase one |
| Report | Excluded | Excluded | Excluded | N/A | Later attendance/business phase |
| Import | Excluded | Excluded | Excluded | N/A | Devices use forms; raw rows come from providers |
| Export | Excluded | Excluded | Excluded | N/A | Not requested for phase one |

## Evidence register

| Evidence ID | Claim | File and symbol | Verification |
| --- | --- | --- | --- |
| E-01 | Current HR CQRS baseline is Countries | `api/HrManagementSystem.Api/Features/GeographicalInformation/Countries/V1/CountriesController.cs` | Source inspection |
| E-02 | Trusted tenant/company scope is available | `api/HrManagementSystem.Application/Abstractions/Authentication/ICurrentActor.cs` | Source inspection |
| E-03 | EF globally filters company-owned entities | `api/HrManagementSystem.Infrastructure/Persistence/ApplicationDbContext.cs::ConfigureCompanyEntity` | Source inspection |
| E-04 | Branch is persisted and device selection is scope-validated | `ApplicationDbContext.cs`, `BranchConfiguration.cs`, `AttendanceDeviceConfiguration.cs` | Migration and source inspection |
| E-05 | Only ZKTeco COM is a functioning source provider | `G:/test/ZK-READER/connector/Services/DeviceDriverRegistry.cs` | Source inspection |
| E-06 | ZKTeco requires an x86 Windows companion | `G:/test/ZK-READER/connector/ZkConnector.csproj` | Source inspection |
| E-07 | Existing reusable web server Grid is product-owned | `web-next/src/shared/components/data-grid/core/MyDataGrid.tsx` | Source inspection |
| E-08 | Security audit metadata rejects secret-like keys | `api/HrManagementSystem.Infrastructure/Features/Platform/SecurityAudits/Services/SecurityAuditService.cs` | Source inspection |

## Read and list contract

- API pages are one-based; UI pages are zero-based and converted at the service boundary.
- Default page size is `10`; allowed values are `5`, `10`, `25`, and `50`; maximum is `100`.
- Raw users search by external code or device name and filter by device.
- Raw punches filter by device, external code, `from`, and `to`; both original local
  time and computed UTC are returned.
- Pull runs filter by device, operation, and status.
- Sort keys are feature allow-lists. Every primary order adds stable `Id` ordering.
- Initial, refreshing, empty, no-result, error, and retry states are explicit.

## Detail and write contract

- Create and update device contracts are separate and contain no tenant/company ID.
- Provider IDs come from a compiled allow-list and remain explicit per device.
- Host validation accepts one entered host only; it never scans a subnet.
- Credential updates accept provider-specific secrets, protect them at rest, and
  return only `credentialsConfigured`/updated metadata, never secret values.
- Disable is idempotent and prevents new pull/test jobs; no device-side mutation,
  physical delete, or biometric-template movement exists in phase one.
- Changing the selected device clears prior probe/result state before a new request.

## Permission and lifecycle matrix

| Action | Permission | Enabled device | Disabled device | Read-only |
| --- | --- | --- | --- | --- |
| View devices/status | `AttendanceDevices:View` | Allowed | Allowed | Allowed |
| Create/edit/enable/disable | `AttendanceDevices:Manage` | Allowed | Allowed | Blocked |
| Update credentials | `AttendanceDevices:Credentials` | Allowed | Allowed | Blocked |
| Test/detect/pull | `AttendanceDevices:Pull` | Allowed | Test/pull blocked | Blocked |
| View raw users/punches/runs | `AttendanceDevices:ViewRaw` | Allowed | Allowed | Allowed |

## Provider and Connector contract

- Stable provider IDs: `zkteco-com`, `hikvision`, `dahua`, `suprema`, `anviz`,
  `zkteco-zkbio`, `suprema-biostar`, `anviz-cloud`, `matrix-cosec`, and `other`.
- Only `zkteco-com` may report `available=true` from the initial companion, and only
  when the 32-bit COM runtime actually loads.
- SDK assets without implemented adapters remain unavailable. `configured`,
  `available`, capabilities, and last connection result are distinct facts.
- The browser never calls the companion or submits deployment addresses. The HR API
  uses a named client with explicit timeout, cancellation, safe error translation,
  and an optional internal key that becomes mandatory for non-loopback deployment.
- The Connector registry is code-owned and never reflects or loads assemblies from
  request values.

## Raw persistence and idempotency contract

- Raw data is staging/integration data, not the final attendance model.
- `occurredAtDeviceLocal` remains `DateTimeKind.Unspecified`; `occurredAtUtc` is
  calculated using the stored timezone without discarding the source.
- Punch uniqueness is current company + device + provider event ID when present;
  otherwise a stable hash of normalized external code, local time, verify mode,
  in/out mode, and work code closes repeated-pull races.
- Pull runs are created before scheduling, record read/inserted/duplicate/skipped/
  error counts, and are resumable/idempotent under Hangfire retry.
- Raw payloads are bounded and scrubbed; credentials, biometric templates, tokens,
  passwords, and SDK exception details are never stored.

## Import contract

`Excluded` for API, web, and mobile in phase one. All parsing, file, transaction,
retry-artifact, and template fields are `N/A`.

## Reporting contract

`Excluded` in phase one. There is no Crystal or RDLX entity key, dataset, viewer,
or report permission for this integration slice.

## Findings and handoffs

| ID | Severity | Finding | Evidence | Owner | Resolution |
| --- | --- | --- | --- | --- | --- |
| F-01 | Medium | Branch management and per-branch authorization are not included | Optional foreign key/lookup exists but no management UI or permission model | Organizational Structure | Deliver Branch vertical slice and access policy |
| F-02 | High | Source Connector has no authentication and hard-coded URL/CORS | `G:/test/ZK-READER/connector/Program.cs` | Attendance Devices | Replace in HR companion; browser never calls it |
| F-03 | High | Repository API settings contain literal SQL credentials | `api/HrManagementSystem.Api/appsettings.json` | Platform operations | Rotate/remove in a separate security change; never copy pattern |
| F-04 | Medium | Real providers except ZKTeco lack implemented adapters or vendor access | source vendor catalog | Integrations | Keep unavailable until adapter readiness is proven |

## Verification

| Layer | Command or check | Result | Date |
| --- | --- | --- | --- |
| Documentation baseline | `./documentation/system/Generate-Documentation.ps1 -Check` | Passed: 35 recipes | `2026-08-26` |
| API | Focused/full commands recorded in phase 06 | Pending | `2026-08-26` |
| Web | Architecture/type/lint/test/build recorded in phase 06 | Pending | `2026-08-26` |
| Mobile | N/A - Deferred | Deferred | `2026-08-26` |

## Final reconciliation

- [x] Product scope and excluded attendance/payroll business logic are explicit.
- [x] Tenant/company ownership and the Branch prerequisite are explicit.
- [x] Import and reporting are explicitly Excluded on every platform.
- [x] Mobile is explicitly Deferred with a reopening trigger.
- [ ] Runtime paths exist and required endpoints pass focused tests.
- [ ] Hardware-independent fake-driver tests pass.
- [ ] Four canonical profiles and the final required-file manifest exist.
- [ ] Feature-scoped recipes generate phases 00 through 06 and check mode passes.
- [ ] Hardware/provider manual release checks have recorded evidence.
