# Attendance Devices Implementation Request

Use this file as the copy-ready request for creating or refactoring one feature.
Replace every angle-bracketed value before implementation starts. The review artifact
remains the evidence ledger; this request states the work to perform.

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Attendance Devices` (`attendance-devices`) |
| Operating mode | `new feature` |
| Applied reference | `countries` |
| Request date | `2026-08-26` |
| Review artifact | `documentation/system/features/attendance-devices/ATTENDANCE_DEVICES-REVIEW-ARTIFACTS.md` |
| Required-file manifest | `documentation/system/features/attendance-devices/required-files.json` |

## Execution request

Implement or refactor `Attendance Devices` end to end in every Required platform.
Use the centralized documentation system and `countries` only as an
architecture and verification reference. Audit current source first, preserve
unrelated changes, and do not copy reference-specific fields, ownership, views,
or findings.

Before changing runtime source:

1. Run `./documentation/system/Generate-Documentation.ps1 -Check`.
2. Read `AGENTS.md`, `documentation/system/README.md`, this request, the review
   artifact, the feature's generated phase packets, and the selected reference's
   required-file manifest.
3. Verify every referenced runtime path and record current, requested,
   intentionally different, and unresolved behavior separately.
4. Freeze the decisions below. Do not infer a missing decision from the reference.

## Frozen product decisions

| Concern | Required decision |
| --- | --- |
| Ownership and scope | `Company-owned: TenantId and CompanyId come only from ICurrentActor and EF global filters. BranchId is a nullable future association in phase one because Branch is currently excluded from EF and has no lookup/API; clients cannot set an unchecked BranchId. Promote it to a required same-company FK only after the Branch feature is persisted.` |
| Fields and relationships | `Device, DeviceCredential, RawDeviceUser, RawAttendancePunch, and DevicePullRun as defined by HR-CONNECTION-ONLY-PROMPT.md. Device name/provider/host/port/timezone are normalized; credential secrets are write-only and protected at rest; raw rows and pull runs belong to exactly one same-company device. Original device-local time is retained beside UTC.` |
| Permissions and read-only | `AttendanceDevices:View, AttendanceDevices:Manage, AttendanceDevices:Credentials, AttendanceDevices:Pull, AttendanceDevices:ViewRaw. Mutations fail closed for missing permission or application read-only state. All connector operations are read-only against hardware.` |
| List contract | `All large lists are database-paged. One-based API pages, default 10, allowed 5/10/25/50, maximum 100. Device users search external code/name; punches filter device, external code, from/to; pull runs filter device/status/operation. Public sort keys use feature allow-lists and stable Id tie-breaks.` |
| Lifecycle | `Devices are created, edited, enabled, or disabled; no physical delete and no device-side mutation in phase one. Credential update never returns existing secrets. Pull commands create durable run records and are idempotent for raw punches.` |
| Web views | `Required: device master/detail page, raw users Grid, raw punches Grid, pull-runs Grid. Cards/Chart/Report/Import/Export are Excluded because this phase is operational raw integration, not analytics or bulk authoring.` |
| Mobile views | `Deferred. Owner: mobile feature backlog; reopen after the web/API hardware workflow and device testing contract are stable. No placeholder route or UI.` |
| Reporting | `Excluded. Raw operational records are available through bounded lists only; derived reporting is a later attendance/business phase.` |
| Import | `Excluded for web and mobile. Devices are entered through the managed form and raw records come only from providers.` |
| Realtime and notifications | `Realtime resource attendance-devices is Required for authoritative query invalidation after device and pull-run changes. Durable inbox notifications are Deferred until operations/audience requirements are approved; pull status remains queryable.` |

## Import contract

Complete this table when Import is Required on any platform. Otherwise retain the
decision, reason, owner, and trigger that would reopen it.

| Concern | Required decision |
| --- | --- |
| Platform and owner | `N/A - Excluded in phase one` |
| Format and template | `N/A` |
| File bounds | `N/A` |
| API wire contract | `N/A` |
| Validation order | `N/A` |
| Duplicate scope | `N/A` |
| Relationships | `N/A` |
| Transaction | `N/A` |
| Feedback | `N/A` |
| Side effects | `N/A` |
| Accessibility | `N/A` |
| Tests | `N/A` |

## Required implementation

- API: domain rules, persistence, contracts, CQRS handlers, thin versioned
  controller, permissions, stable errors, post-commit work, localization, and
  focused tests.
- Next.js: thin route, exact transport types/service, one server-list state,
  approved views, shared controls/components, forms/dialogs, lifecycle actions,
  realtime invalidation, localization, RTL, accessibility, and tests.
- Expo: Deferred in phase one. Do not add a placeholder route or runtime until the
  web/API hardware workflow and manual device matrix are approved.
- Documentation: cross-platform master, API/web/mobile applied profiles, final
  required-file manifest, review artifact, feature-scoped recipes, and regenerated
  phases 00 through 06.

## Verification and handoff

Run the applicable API build/tests, web architecture/type/strict/lint/tests/build,
mobile check/tests, documentation generation/check under supported PowerShell
versions, local-link validation, and `git diff --check`. Record exact commands,
counts, dates, skipped gates, environmental blockers, and unrelated inherited
failures. Do not describe the feature as fully ready while a Required feature gate
or manual release matrix remains unresolved.

Report at handoff:

- completed behavior and exact contracts;
- intentional platform differences;
- verification results separated into feature, repository, and environment gates;
- remaining findings with severity, evidence, owner, and release decision;
- every modified and newly created runtime/documentation path.
