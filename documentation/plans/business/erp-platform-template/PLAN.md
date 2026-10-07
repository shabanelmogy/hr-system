# ERP Platform Template — Master Build Plan

## 0. Plan metadata

| Field | Value |
| --- | --- |
| Plan ID | erp-platform-template |
| Business capability | Reusable business/SaaS platform template (API + Web + Mobile) and School merge |
| Owning module | Cross-platform Platform |
| Status | `Draft` |
| Target milestone | Platform Template V1 (before the second product) |
| Primary owner | Platform owner / architect |
| Reference feature(s) | Countries (P-001), Cost Centers (P-002), Add Tenant (P-003), Role Permissions (P-006) |
| Planning method version | `2.0 — capability plan + slice roadmap + feature contract + evidence ledger` |
| Related plans | `education-module`, `enterprise-saas-core`, `frontend-foundation-hardening`, `mobile-erp-readiness` |
| Last reviewed | `2026-09-28` |

### Planning evidence

- Review report: `REVIEW.md`
- Documentation and template integration review: `DOCUMENTATION_AND_TEMPLATE_REVIEW.md`
- Discovery: `DISCOVERY.md`
- Current-system evidence: `EVIDENCE.md`
- Approved pre-plan specification: `SPEC_SUMMARY.md`
- Decisions: `DECISIONS.md`; open cross-plan decisions DEC-011 … DEC-016
- Imported School evidence: `imported/`

## 1. Executive outcome

### Business problem

The ERP repository is a strong ERP but not yet a template: HR-era remnants, licence-bearing
dependencies in core, an unshared web theme, gaps in patterns and common capabilities, and no way
to start a new product from it.

### Desired outcome

A new product or module starts from this repository with platform, clients, design language,
patterns, and planning already in place, carrying only the modules and licences it needs.

### Success measures

| Measure | Current | Target | Evidence |
| --- | --- | --- | --- |
| Old-name remnants (`HrManagementSystem`) in tree and code | 6 folders + 4 code/config strings | 0 (issuer/audience per DEC-012) | Search + listing |
| Licence-bearing packages in core | 4 families | 0 in core; optional per product | `Directory.Packages.props`, `package.json` |
| Web and mobile colors from one source | No | Yes | `@app/tokens` imported by both clients |
| Active screen patterns | 6 (+1 candidate) | ≥ 10 with Web/Mobile decisions | `SCREEN_PATTERN_CATALOG.md` |
| Time to a buildable new product | Not possible | One command + green CI | S5 generator test in CI |

## 2. Scope

See `SPEC_SUMMARY.md`. Required = S0–S8. Deferred = direct/group chat, theme editor, token
breakpoints. Excluded = API re-architecture, UI library change, namespace rename.

## 3. Slice roadmap

Each slice gets its own feature contract (`FEATURE_DECOMPOSITION_TEMPLATE.md` v2) before runtime
work. Slices are listed in execution order; S5 is placed after S7 because the generator must
include record scope.

### S0 — Repository hygiene and rename remnants

| Step | Work | Exit check |
| --- | --- | --- |
| S0.1 | Done: repository folder renamed to `ERPSYSTEM` by the owner; connected folder re-granted. | Done 2026-09-28. |
| S0.2 | Confirm no untracked source, then delete `api/HrManagementSystem.*` (6 folders). | Listing; solution builds. |
| S0.3 | Remove `api/CrystalReportGeneratorApi.rar`; decide the generator folder's home with DEC-013. | Archive absent; `.gitignore` blocks `*.rar`. |
| S0.4 | Remove `api/packages/`, `api/.codex-build/`, root `node_modules/`. | Listing. |
| S0.5 | Prepared 2026-10-06: `CorrelationItemKey` → `ErpSystem.CorrelationId`, development JWT key literal → `ErpSystem-…`, example `Issuer`/`Audience` → `ErpSystem`/`ErpSystem.Clients` (example file only; live settings follow DEC-012). | `git grep HrManagementSystem` returns nothing in source/config; tests pass. |
| S0.6 | Update `README.md` (remove `web/` row) and move or delete `HR-CONNECTION-ONLY-PROMPT.md`. | Docs CI green. |
| S0.7 | Confirm AttendanceConnector status (E-020); add to the solution or remove. | Recorded decision. |
| S0.8 | Verify D-005: a user with one tenant and one company logs in without a selection step on web and mobile. | Test or recorded manual check. |

### S1 — Dependency and licence governance

| Step | Work | Exit check |
| --- | --- | --- |
| S1.1 | Replace `System.Data.SqlClient` with `Microsoft.Data.SqlClient`. | Build, tests, NuGet audit green. |
| S1.2 | Audit `Newtonsoft.Json` call sites; keep only where required. | List recorded. |
| S1.3 | Resolve DEC-011 (MediatR) and DEC-013 (commercial packages); move Syncfusion, ActiveReportsJS, Crystal, BulkExtensions behind optional modules or replace. | Core builds without them. |
| S1.4 | Audit `crypto-js` usage on web; replace with Web Crypto or remove. | Dependency removed or justified. |
| S1.5 | Review `AuditableEntity` `*ByPc` fields: purpose, privacy, keep or remove (migration if removed). | Decision + migration plan. |
| S1.6 | Align SignalR client versions when mobile upgrade is safe. | Versions recorded. |

### S2 — Fold the planning kit into the ERP system and slim the documentation

Scope and inventory: `DOCUMENTATION_AND_TEMPLATE_REVIEW.md` (D-013, D-014).

| Step | Work | Exit check |
| --- | --- | --- |
| S2.1 | Add `.codex/skills/erp-business-planning` (drives P0–P9 with `BUSINESS_DISCOVERY_INTERVIEW.md`, evidence, spec, plan, gates) and `.codex/skills/erp-legacy-migration` (external application inventory, behavior catalog, defect disposition, data-migration plan into `EVIDENCE`/`RESEARCH`/`PROD-###`). | Skill review; no reference to `templates/planning`. |
| S2.2 | Delete `templates/planning/` (50 files). | `Check-Planning.ps1` green. |
| S2.3 | DOC-2 and DOC-3: reconcile, then delete the duplicate frontend roadmap and the Accounting v1.0 source + 22 phase stubs. | Links and `module.json` updated; both checks green. |
| S2.4 | DOC-4: `New-ErpModule.ps1` creates four module files; remove empty sub-READMEs; update `modules/README.md`. | Generator test; docs CI green. |
| S2.5 | DOC-6, DOC-7, DOC-9, DOC-10 per DEC-017 / DEC-018. | `Generate-Documentation.ps1 -Check` green. |

### S3 — Web theme from tokens

Change set for S3.1, S3.3, S3.5 and S4.1–S4.2 applied and verified 2026-10-06: `S3-S4-UNIFIED-THEME.md`. S3.4 palette preference done; tenant branding open. S3.2 done 2026-10-07 (legacy palette deleted; color review follow-up in the same file). Color review P2, mobile colors and the Arabic font done 2026-10-07; open: tenant branding, P-00x baselines.

| Step | Work | Exit check |
| --- | --- | --- |
| S3.1 | Resolve DEC-014; add `@app/tokens` to `web-next` with `transpilePackages`. | `npm ci`, type-check, build green. |
| S3.2 | Inventory consumers of `palette.myColor` and `palette.purple.*`; map each to a semantic token. | Zero legacy keys. |
| S3.3 | `useThemeSettings` builds `createTheme(deepmerge(createMuiThemeOptions(...), appComponentDefaults))`; add the `palette.app` augmentation. | Visual comparison of reference screens (P-001, P-002, P-003, P-006) light/dark, LTR/RTL. |
| S3.4 | Palette preference + tenant primary branding via `withBrandPrimary` with a contrast check. | Test. |
| S3.5 | Add a CI job for `packages/tokens` (`npm run check`). | CI green. |

### S4 — Mobile theme from tokens

| Step | Work | Exit check |
| --- | --- | --- |
| S4.1 | Add `@app/tokens` to `mobile-react` (Metro `watchFolders`). | `npm run check`, `check:export` green. |
| S4.2 | `core/theme/theme.ts` re-exports token values under the existing mobile keys during transition; migrate consumers; record the orange-light warning color change (C-004). | No duplicated palette literals. |
| S4.3 | Same palette and brand preference as web. | Manual check on device. |

### S6 — Screen-pattern candidates

Registered as `Candidate` in `SCREEN_PATTERN_CATALOG.md` on 2026-09-28 together with ordered selection rules and composition rules C-01..C-11 (D-011). Visual reference: the Screen Patterns gallery artifact. Each becomes `Active` only with a
real source reference and an explicit decision for the other platform.

| ID | Pattern | Source idea | First expected reference |
| --- | --- | --- | --- |
| P-004 | Stepper / wizard | Blueprint §5.12 import, onboarding | Tenant onboarding; import with column mapping |
| P-008 | Transactional document (header + lines + lifecycle) | ERP core need | Journal entries (`accounting-core-gl`) |
| P-009 | Record view (360: header, tabs, related lists, activity) | Blueprint §5.6 | Employee (HR) or Party (Contacts) |
| P-010 | Dashboard / KPI overview | Blueprint §5.3 | Module home |
| P-011 | Kanban board over workflow states | Owner request; `documentation/api/User Stories/KanbanBoard/` | CRM pipeline, Education admissions |
| P-012 | Calendar / schedule | Blueprint §5.17; CRM Appointments (web, module-local) | CRM Appointments, Education timetable |
| P-013 | Activity & chatter (embedded) | Owner request | S8 chatter |
| P-014 | Work queue / approval inbox | ERP core need | Journal approval, leave approval |

### S7 — Relationship-based record scope

Design draft (2026-10-06): `S7-RECORD-SCOPE-DESIGN.md`.

| Step | Work | Exit check |
| --- | --- | --- |
| S7.1 | Define a record-scope policy abstraction: permission + tenant + company + module-supplied relationship predicate, applied as a query filter before retrieval. | Design review (G2). |
| S7.2 | Reference implementation on HR (manager sees own team) or Education (teacher sees own classes). | Tests prove out-of-scope IDs return not-found. |
| S7.3 | Document in `PERMISSION_MODEL.md` and the planning skill `access-design`. | Docs CI green. |

### S5 — New-product workspace generator

Design draft (2026-10-06): `S5-WORKSPACE-GENERATOR-DESIGN.md`.

| Step | Work | Exit check |
| --- | --- | --- |
| S5.1 | Script (`templates/New-ErpWorkspace.ps1`) takes product name and module list; copies Platform, BuildingBlocks, clients, docs, CI; strips unselected modules from registry, solution, web/mobile module folders, navigation, permissions seed. | Generated workspace builds. |
| S5.2 | Reuse `api/scripts/New-ErpModule.ps1` and web `generate:module`; add a mobile module scaffold. | Generator tests. |
| S5.3 | CI job generates a minimal workspace and runs its build/type-check. | CI green. |

### S8 — Collaboration capabilities

Each item is a separate business plan created with `New-BusinessPlan.ps1` when started.

| Item | Scope | Depends on |
| --- | --- | --- |
| Record chatter | Messages, mentions, followers, attachments, activities on any record; realtime via SignalR; notifications via inbox; change log shown inline. | S6 P-013, DEC-015 |
| Kanban view | Shared web/mobile kanban component over module-owned states; move = transition command with concurrency token; accessible move menu. | S6 P-011 |

## 4. Dependencies

S0 → S1 → (S2, S3, S4 in parallel) → S6 → S7 → S5 → S8. `education-module` starts after S7.

## 5. Quality gates

| Gate | Status | Notes |
| --- | --- | --- |
| G0 Scope and ownership | Pass (draft) | Owner approved scope and deliverable on 2026-09-28. |
| G1 Business readiness | Partial | DEC-011 … DEC-020 open; none blocks S0–S2. |
| G2 Architecture readiness | Not started | S7 design and DEC-014 required. |
| G3 Product/client readiness | Not started | S3/S4 visual baselines and pattern decisions. |
| G4 Delivery readiness | Not started | Per-slice feature contracts. |

## 6. Rules carried into every slice

- Shared component first; extend before creating (`AGENTS.md`).
- No runtime placeholder for Deferred or Excluded capabilities.
- Every change updates its canonical documentation in the same change.
- Production-only checks and deferred items get central note IDs.
