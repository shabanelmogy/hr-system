# Organizational Structure Implementation Request

This file is the copy-ready request and frozen contract for the completed feature.
The review artifact remains the evidence ledger; this request states the work and
handoff gates.

## Request metadata

| Field | Value |
| --- | --- |
| Feature | `Organizational Structure` (`organizational-structure`) |
| Operating mode | `existing-feature change promoted to a complete cross-platform feature` |
| Applied reference | `states` |
| Request date | `2026-08-30` |
| Review artifact | `documentation/system/features/organizational-structure/ORGANIZATIONAL_STRUCTURE-REVIEW-ARTIFACTS.md` |
| Required-file manifest | `documentation/system/features/organizational-structure/required-files.json` |

## Execution request

Implement or refactor `Organizational Structure` end to end in every Required platform.
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
| Ownership and scope | `Tenant and current-company owned. TenantId and CompanyId come only from ICurrentActor/ApplicationDbContext scope; clients never send either value.` |
| Fields and relationships | `Manage Branch, Department, Division, JobTitle, JobLevel, Position, and JobDescription. Trim names/descriptions, uppercase codes/currency/version tokens, preserve EN/AR fields, require active same-company parents, prevent recursive Departments, validate salary ranges and headcount, and bind each JobDescription version to one Position.` |
| Permissions and read-only | `OrganizationalStructure:View/Create/Edit/Delete plus OrganizationalStructure:ApproveJobDescriptions. Read-only blocks every mutation in direct handlers on both clients.` |
| List contract | `GET /api/v1/organizational-structure/{resource}; one-based API paging, 1-500 page size, six search operators, resource-specific all/nameAr/nameEn/code/parent fields, active/archived/all status, deterministic Id tie-break, and nameEn/nameAr/code/parent/createdOn sort allow-list.` |
| Lifecycle | `Archive/restore is Required for directory records with active-child guards. Job descriptions use Draft/Approved/Rejected/Expired; approved content is immutable, effective periods cannot overlap for one Position, and approve/reject are explicit domain actions. Bulk archive is Excluded in this release.` |
| Web views | `Grid Required; Cards Required; current-page Chart Required; Report Required; Import Required; Export Excluded.` |
| Mobile views | `Table Required; Cards Required; current-page Chart Required; Report Required; Import Required; Export Excluded.` |
| Reporting | `Required. Managed Crystal catalog per resource; report IDs and bounded NameAr/NameEn filters only.` |
| Import | `Required on web and mobile. XLSX, max 100 rows/5 MiB, active-code relationship lookups, duplicate validation, and atomic bulk API.` |
| Realtime and notifications | `Resource organizational-structure; current-company permission audience; web and mobile expose one guarded entity route under /basic-data/organizational-structure/{resource}; paired EN/AR singular change keys.` |

## Import contract

Complete this table when Import is Required on any platform. Otherwise retain the
decision, reason, owner, and trigger that would reopen it.

| Concern | Required decision |
| --- | --- |
| Platform and owner | `Web and mobile; HR data governance owns the workbook contract.` |
| Format and template | `XLSX first worksheet with exact ordered headers nameAr,nameEn,code; dependent resources add parentCode, positions add jobTitleCode/jobLevelCode, and job-levels add levelOrder.` |
| File bounds | `Maximum 5 MiB and 100 data rows.` |
| API wire contract | `POST /api/v1/organizational-structure/{resource}/bulk with { items: OrganizationalStructureMutation[] }; response { createdCount }.` |
| Validation order | `File acceptance, exact headers, row normalization, schema, active lookups, in-file duplicates, then API validation.` |
| Duplicate scope | `Case-insensitive resource/company identity remains protected by existing database indexes and the atomic service.` |
| Relationships | `Branch → Department → Division → Position → JobDescription; positions additionally resolve active JobTitle and JobLevel by code.` |
| Transaction | `One server transaction for the batch; failures roll back all rows.` |
| Feedback | `Shared SpreadsheetImportCard/Feedback and AppSpreadsheetImportView show preview, row status, errors, success, and uncertain outcome.` |
| Side effects | `Committed bulk change schedules the organizational change job and invalidates both client query prefixes.` |
| Accessibility | `Shared controls, paired EN/AR strings, RTL-safe layouts, keyboard/touch accessible actions.` |
| Tests | `Focused API build plus web/mobile type-check; import parser, endpoint, and manual authenticated batch checks are release gates.` |

## Required implementation

- API: domain rules, persistence, contracts, CQRS handlers, thin versioned
  controller, permissions, stable errors, post-commit work, localization, and
  focused tests.
- Next.js: one thin route/page per entity, exact transport types/service, one
  server-list state per page, approved views, shared controls/components,
  forms/dialogs, lifecycle actions, realtime invalidation, localization, RTL,
  accessibility, and tests.
- Expo: one thin guarded route/page per entity, runtime schemas, exact endpoint
  client, one server-list state per screen, native responsive UI,
  permissions/read-only behavior, localization, RTL, accessibility,
  realtime/deep links, and tests for every Required capability.
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
