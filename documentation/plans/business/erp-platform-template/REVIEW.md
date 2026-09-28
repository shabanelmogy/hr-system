# ERP Platform Review and School Merge Report

| Field | Value |
| --- | --- |
| Review date | 2026-09-28 |
| Scope | Repository root, `api/`, `web-next/`, `mobile-react/`, `documentation/`, `.github/workflows/`, plus the School Management template work (`G:\test\School Management\full-stack-school`) |
| Method | Read-only. Documentation, configuration, package manifests, and targeted source files. No build or test run in this review. |
| Evidence | Every finding cites an `E-###` row in `EVIDENCE.md`. |
| Outcome | The ERP repository is the platform base. The School contributes the planning kit, the design-token package, screen-pattern candidates, and the Education domain. |

## 1. Verdict

The ERP repository is already a stronger base than the School template on every axis that
matters for a reusable business/SaaS platform: modular monolith with nine modules, tenant +
company isolation enforced in the database, session governance, a hardened BFF, an Expo client
with enforced module boundaries and an encrypted offline outbox, and a planning system with
evidence ledgers and gates G0–G4 checked in CI.

The weak points are not architectural. They are:

1. repository hygiene left over from the HR-only era (`HrManagementSystem.*` remnants, archives,
   stray folders);
2. dependency governance (a deprecated SQL client, commercial libraries inside core, one open
   licensing decision);
3. a web theme that is ad hoc and not shared with mobile;
4. missing cross-cutting business capabilities that most products need (record chatter/chat,
   kanban, dashboard, calendar pattern, relationship-based record scope);
5. no generator for a *new product* built from this platform.

The merge plan (`PLAN.md`) addresses these in slices S0–S8 without changing the architecture.

## 2. What to keep as the platform core (do not rewrite)

| Area | Keep | Evidence |
| --- | --- | --- |
| API structure | `BuildingBlocks` + `Modules/<M>/{Contracts,Domain,Application,Infrastructure,Presentation,Tests}` + explicit `ErpModuleRegistry` | E-001, E-002 |
| Tenancy | Tenant + Company, composite keys `(TenantId, CompanyId, Id)` with composite FKs, query filters, SaveChanges guards, read-only tenant middleware | E-003 |
| Identity and sessions | Login outcomes authenticated / tenant-selection / company-selection, switch-company, security-stamp + session-id validation, refresh rotation with grace | E-004 |
| Permissions | Exact `Resource:Action` permissions, no `Manage`, `PermissionAccessMode` (TenantEntitlement / Tenant / Global) | E-005 |
| Platform services | Entity change log, notification inbox, SignalR hub, Hangfire, upload inspection (ClamAV), deployment configuration validator | E-006 |
| Web client | Next.js 16 + MUI 9, same-origin BFF with proxy security, HttpOnly cookies, governance scripts, module generator, Playwright, coverage and bundle budgets | E-007, E-008 |
| Mobile client | Expo + native components, `core/shared/platform/shell/modules` boundaries, SQLCipher outbox, route-manifest RBAC, RTL | E-009 |
| Shared UI | Web `src/shared/components/*` and mobile `src/shared/components/*`, governed by "Shared component first" | E-010, E-011 |
| Planning | `documentation/plans` protocol P0–P9, gates G0–G4, feature contracts v2, central notes, `Check-Planning.ps1` in CI | E-012 |
| CI | Gitleaks, NuGet vulnerability audit, EF model drift, SBOM, web E2E/a11y/security smokes, mobile Expo/native/release checks | E-013 |

## 3. Findings

Severity: **High** blocks the template goal or carries production risk; **Medium** should be
fixed before a second product starts from this base; **Low** is cleanup.

### 3.1 Repository and naming

| # | Severity | Finding | Evidence | Slice |
| --- | --- | --- | --- | --- |
| R-1 | Medium | Six `api/HrManagementSystem.*` folders remain on disk. They are not in `ErpSystem.sln` and contain only build output (`bin`, `obj`, `Logs`, `.csproj.user`). | E-014 | S0 |
| R-2 | Medium | `api/CrystalReportGeneratorApi/` and `CrystalReportGeneratorApi.rar` (14 MB) are not in the solution. Archives do not belong in source control. | E-015 | S0 |
| R-3 | Low | `api/packages/` (legacy NuGet folder), root `node_modules/` without a root `package.json`, `api/.codex-build/`. | E-016 | S0 |
| R-4 | Medium | Code and configuration still carry the old name: correlation key `HrManagementSystem.CorrelationId`, the development JWT key literal, and `Issuer`/`Audience` `HrManagementSystem*` in `appsettings.example.json`. Renaming issuer/audience invalidates live tokens, so it needs a decision. | E-017 | S0, DEC-012 |
| R-5 | Low | `README.md` lists a legacy `web/` application that no longer exists at the root. | E-018 | S0 |
| R-6 | Low | `HR-CONNECTION-ONLY-PROMPT.md`, `ERP_FRONTEND_MASTER_PLAN.md`, and `ACCOUNTING_MODULE_PHASES_AR.md` sit at the root while `AGENTS.md` centralizes docs under `documentation/`. The registry deliberately registers the last two in place; the prompt file has no owner. | E-019 | S0 |
| R-7 | Unknown | `api/ErpSystem.AttendanceConnector/` is not in `ErpSystem.sln`. Whether it is built by a separate pipeline is not evident. | E-020 | S0 |
| R-8 | — | The folder rename `G:\test\hr-system` → `erp-system` must be done by the owner (outside this session's permissions). Connected folders must be re-granted after the rename. | — | S0 |

### 3.2 API

| # | Severity | Finding | Evidence | Slice |
| --- | --- | --- | --- | --- |
| A-1 | High | `System.Data.SqlClient` 4.9.1 is deprecated in favour of `Microsoft.Data.SqlClient`. | E-021 | S1 |
| A-2 | High | Commercial or licence-sensitive packages sit in the central package list used by core: `Syncfusion.Blazor.SfPdfViewer` (a Blazor package in a Web API), `EFCore.BulkExtensions`, and the Crystal Reports generator. A product built from the template must not inherit licence obligations it does not use. | E-022 | S1, DEC-013 |
| A-3 | Medium | `MediatR` 12.5.0 is the last version without a commercial licence requirement; any upgrade changes licensing. | E-023 | S1, DEC-011 |
| A-4 | Low | `Newtonsoft.Json` alongside System.Text.Json. Audit which call sites still need it. | E-021 | S1 |
| A-5 | Medium | `AuditableEntity` stores `*ByPc` (client machine) fields. Value and privacy basis are undocumented; on a SaaS web client the machine name is not reliable. | E-024 | S1 |
| A-6 | High (template goal) | No generic relationship-based record scope. Permissions answer "may this user read Students"; they cannot answer "only the students in classes this teacher teaches" or "only my team". Education and HR self-service both need it. | E-025 | S7 |

### 3.3 Web (`web-next`)

| # | Severity | Finding | Evidence | Slice |
| --- | --- | --- | --- | --- |
| W-1 | High (template goal) | The MUI theme is ad hoc: `palette.myColor` is red in light and blue in dark, a `purple.*` palette is hard-coded, and `success` is indigo (light) / light blue (dark), so success is not green. Nothing is shared with mobile. | E-026 | S3 |
| W-2 | Medium | `crypto-js` in a browser client. Confirm the use; browser-side encryption of stored data is not a security boundary, and Web Crypto covers hashing. | E-027 | S1 |
| W-3 | Medium | Syncfusion (9 packages) and Mescius ActiveReportsJS are direct dependencies. The frontend plan already lazy-loads Syncfusion; for the template they must be optional per product. | E-022 | S1, DEC-013 |
| W-4 | Low | SignalR client is v10 on web and v8 on mobile. Compatible, but align when mobile upgrades. | E-028 | S1 |

### 3.4 Mobile (`mobile-react`)

| # | Severity | Finding | Evidence | Slice |
| --- | --- | --- | --- | --- |
| M-1 | Medium | `src/core/theme/theme.ts` is the origin of the palettes now in `@app/tokens`; keeping both creates drift. | E-029 | S4 |
| M-2 | Low | Mobile shared library has `importing`, `multi-view`, `carousel`, `pagination`; web has `maps`, `timeline`, `file-upload`, `lists`. Parity is documented per pattern in the catalog, not per component. | E-010, E-011 | S6 |

### 3.5 Documentation and planning

| # | Severity | Finding | Evidence | Slice |
| --- | --- | --- | --- | --- |
| D-1 | Medium | The screen-pattern catalog has P-001, P-002, P-003, P-005, P-006, P-007, and a Candidate P-004 (Stepper). Dashboard, entity detail, kanban, chat, calendar, import wizard, notification center, and onboarding patterns are missing. | E-030 | S6 |
| D-2 | Low | The planning system has no portable kit for a product outside this repository; the School kit fills this but is coupled to the School generator. | E-031 | S2 |

### 3.6 Missing platform capabilities (template goal)

| Capability | Status in ERP | Proposed owner | Slice |
| --- | --- | --- | --- |
| Record chatter (comments, mentions, activity log on any record) and direct/group chat | Absent; SignalR hub and notifications exist | Platform (Discuss) | S8, DEC-015 |
| Kanban view over a workflow state | Absent; `framer-motion` drag rules exist in `AGENTS.md` | Pattern P-010 + shared component | S6, S8 |
| Dashboard / KPI home | Absent as a pattern; web and mobile `charts` exist | Pattern P-008 | S6 |
| Calendar / schedule | CRM Appointments exists (single module) | Pattern P-012 promoted from CRM | S6 |
| Relationship-based record scope | Absent | Platform authorization | S7 |
| New-product workspace generator | Absent; module generators exist (API, web) | `templates/` | S5 |

## 4. School merge matrix

| School asset | Decision | Destination |
| --- | --- | --- |
| Planning kit (`templates/planning`, 12 skills, artifacts, checklists, scripts) | Import; `documentation/plans` stays canonical | `templates/planning/` + `ERP_MAPPING.md` |
| `@app/tokens` (palettes from the ERP mobile app, scales, contrast check) | Import and add MUI adapter (done, type-checked against MUI 9) | `packages/tokens/` |
| Template blueprint: component parity, 17 screen patterns, UX rules | Import as evidence; convert patterns into catalog candidates | `imported/TEMPLATE_BLUEPRINT.md` → S6 |
| API comparison HR vs School | Import as evidence (confirms ERP as base) | `imported/API_BACKEND_COMPARISON.md` |
| Mobile extraction plan | Import as evidence | `imported/MOBILE_TEMPLATE_EXTRACTION.md` |
| School API (Clean Architecture, single DbContext per concern) | Do not import the architecture; port the domain into an ERP module | plan `education-module` |
| School Next.js UI (shadcn direction) | Discard; web is MUI | — |
| School generators (`New-FullStackProject.ps1`, `api/`, `next/`, `conversion/`) | Do not import; replaced by S5 | stay in School repo |
| School business rules (Result XOR, capacity, teaching scope, IDOR policy) | Import into the Education plan | `education-module/SPEC_SUMMARY.md` |

## 5. Recommended order

S0 hygiene → S1 dependency governance → S2 planning kit adaptation → S3 web tokens → S4 mobile
tokens → S6 pattern catalog candidates → S7 record scope → S5 workspace generator → S8
collaboration modules; Education starts after S7 (its teacher/parent scoping depends on it).
Details and exit checks are in `PLAN.md`.
