# Districts Implementation Request

Use this file as the copy-ready request for creating or refactoring one feature.
Replace every angle-bracketed value before implementation starts. The review artifact
remains the evidence ledger; this request states the work to perform.

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Districts` (`districts`) |
| Operating mode | `existing-feature change` |
| Applied reference | `states` |
| Request date | `2026-08-24` |
| Review artifact | `documentation/system/features/districts/DISTRICTS-REVIEW-ARTIFACTS.md` |
| Required-file manifest | `documentation/system/features/districts/required-files.json` |

## Execution request

Implement or refactor `Districts` end to end in every Required platform.
Use the centralized documentation system and `states` only as an
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
| Ownership and scope | `Global geographical reference data; no tenant/company owner` |
| Fields and relationships | `NameAr, NameEn, Code, required active StateId; active Addresses block archive` |
| Permissions and read-only | `Districts:View/Create/Edit/Delete; mobile honors shared read-only mode` |
| List contract | `Paged server list; District fields/operators, status/State/address filters, allow-listed sorting, bounded page size` |
| Lifecycle | `Archive/restore/bulk archive; active State and Address guards; State lifecycle resource lock; atomic bulk` |
| Web views | `Grid, Cards, Chart, Import, and Crystal Report Required` |
| Mobile views | `Table, Cards, Chart, Import, and Crystal Report Required` |
| Reporting | `Required on web and mobile through the managed Crystal Report catalog/runtime; Districts:View plus CrystalReports:View and managed Run access` |
| Import | `Required on web and mobile as client-parsed XLSX and atomic JSON bulk create` |
| Realtime and notifications | `districts resource; post-commit change; direct /basic-data/districts route` |

## Import contract

| Concern | Required decision |
| --- | --- |
| Platform and owner | `Web and mobile parse XLSX locally with their platform-native file APIs and submit the same atomic JSON contract.` |
| Format and template | `XLSX first worksheet; client-generated districts-import-template.xlsx; exact ordered headers nameAr, nameEn, code, stateName.` |
| File bounds | `.xlsx; official XLSX or application/octet-stream MIME (blank MIME tolerated by browsers); 5 MiB; 1-100 nonblank rows; empty workbook, duplicate/wrong headers, unexpected columns, and formulas rejected.` |
| API wire contract | `POST /api/v1/districts/bulk; Districts:Create; exact body { "districts": [...] }; 201 with { "createdCount": number }.` |
| Validation order | `File metadata and ZIP signature; first sheet; exact headers/formula rule; row count; trim; District field schema; State resolution; same-file duplicates; API parent/conflict race closure.` |
| Duplicate scope | `NameAr-to-NameAr, NameEn-to-NameEn, and Code-to-Code only; case-insensitive and scoped by StateId both within the file and against persistence.` |
| Relationships | `GET /api/v1/states/lookup under States:View; match active State English or Arabic name case-insensitively; missing/inactive or unavailable lookup blocks submission.` |
| Transaction | `All valid submitted rows are one atomic batch under distinct State lifecycle locks. There is no idempotency key; a no-response or 5xx outcome is uncertain, locks retry, and requires list reconciliation before another submit.` |
| Feedback | `Preview every parsed row; show pending/invalid/submitted/uploaded/failed/uncertain status and row error; deterministic validation errors; no rejected-row download in this release.` |
| Side effects | `One post-commit DistrictChange with BulkAdd and count; localized notification; districts realtime event; invalidate District queries after confirmed success.` |
| Accessibility | `Translated English/Arabic labels and errors, inherited RTL, keyboard/touch-operable upload/template/submit/clear/retry/reconcile actions, live lookup/submission feedback.` |
| Tests | `Both-client lookup resolution/state, field-scoped duplicates, exact body normalization, permission/read-only behavior, controller route/permission/status, validator limits, atomic handler/conflict/parent/side-effect order, report dataset, and focused web/mobile/API gates.` |

## Reporting contract

| Concern | Required decision |
| --- | --- |
| Platform and engine | `Web and mobile use the managed Crystal Report catalog/render contract; web uses shared ReportViewer and mobile uses authenticated native PDF cache, print/open, share, and cleanup. No feature-owned legacy report endpoint.` |
| Catalog and authorization | `Both clients listPublished("districts"); Districts:View guards the feature, CrystalReports:View guards the mobile Report view, and the managed catalog enforces published version plus Run access.` |
| Render contract | `Both clients render(reportId, { language, filters }); clients send only the managed report ID, ar|en, and approved filters.` |
| Dataset | `One ReportData table with DistrictId, DistrictAr, DistrictEn, DistrictCode, StateId, StateAr, StateEn, AddressesCount; active Districts whose State and Country are active; deterministic DistrictId order.` |
| Filters | `Optional exact-match NameAr/NameEn aliases and StateAr/StateEn aliases only; unknown nonblank filters reject the dataset request.` |
| Runtime profile | `The HR API dataset schema and CrystalReportGeneratorApi managed runtime profile must match exactly.` |
| UI states | `Published-report loading, permission, empty, error/retry, localized catalog selection, bounded filters, PDF loading/error/open/print/share behavior, and mobile cache cleanup.` |
| Tests | `Dataset schema/filter/active-parent behavior, approved entity profile, both-client report wiring/query key/filter payload/localized names, locales, mobile PDF boundary, and production builds.` |

## Required implementation

- API: domain rules, persistence, contracts, CQRS handlers, thin versioned
  controller, permissions, stable errors, post-commit work, localization, and
  focused tests.
- Next.js: thin route, exact transport types/service, one server-list state,
  approved views, shared controls/components, forms/dialogs, lifecycle actions,
  realtime invalidation, localization, RTL, accessibility, and tests.
- Expo: thin guarded route, runtime schemas, exact endpoint client, one server-list
  state, native responsive UI, permissions/read-only behavior, localization, RTL,
  accessibility, realtime/deep links, and tests for every Required capability.
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
