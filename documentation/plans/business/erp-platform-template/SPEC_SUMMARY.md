# ERP Platform Template — Pre-Plan Specification

## Product and outcome

Turn this ERP repository into the reusable base for business/SaaS products: API + Web + Mobile
with one design language, a complete screen-pattern catalog, common collaboration capabilities,
record-level access scope, and a generator that starts a new product with only the modules it
needs. Outcome: a second product (first candidate: Education) starts from this base without
copying or re-inventing platform code.

## Scope

### Required

- S0 Repository hygiene and rename remnants.
- S1 Dependency and licence governance.
- S2 Planning kit adaptation to the ERP planning system.
- S3 Web theme driven by `@app/tokens`.
- S4 Mobile theme driven by `@app/tokens`.
- S5 New-product workspace generator.
- S6 Screen-pattern catalog candidates P-008 … P-014 and the P-004 Stepper decision.
- S7 Relationship-based record scope (platform authorization).
- S8 Collaboration: record chatter and kanban (each a separate gated business plan).

### Deferred

- Direct/group chat beyond record chatter (DEC-015).
- Tenant self-service theme editor (only primary-color branding in S3/S4).
- Token breakpoints for web (D-009).

### Excluded

- Rewriting the API architecture or replacing MUI.
- Importing the School generators, Clean Architecture API, or Next.js UI.
- Renaming the `ErpSystem` namespace.

## Primary journeys

1. Architect → runs the workspace generator with a product name and module list → gets a
   repository with API, web, mobile, docs, and CI containing only those modules → builds and
   passes CI unchanged.
2. Module developer → opens a plan in `documentation/plans` → selects patterns from the catalog →
   composes shared components → passes G0–G4 and feature phases.
3. Tenant administrator → selects a palette and primary brand color → web and mobile render the
   same theme.
4. Teacher (Education) → sees only students in classes they teach, through the S7 record scope.

## Domain and source of truth

No new business domain. Owners: Platform (identity, tenancy, authorization, collaboration),
`packages/tokens` (design values), `SCREEN_PATTERN_CATALOG.md` (patterns), `templates/` (kit and
generator).

## Architecture and integrations

Kept as is (REVIEW §2). New pieces: `packages/tokens` consumption (DEC-014), a record-scope
policy abstraction in BuildingBlocks/Platform (S7), chatter services on the existing change log,
notification inbox, and SignalR hub (S8).

## Web / Mobile / Design decisions

Web MUI (D-002), mobile native (D-003), shared tokens (D-004), MUI mapping (D-009, D-010),
pattern candidates (D-011). Every new pattern states Web and Mobile as Implemented, Adapted,
Deferred, or Excluded.

## Privacy / security / commercial applicability

- Commercial: DEC-011 (MediatR), DEC-013 (Syncfusion, ActiveReportsJS, Crystal,
  EFCore.BulkExtensions) must be decided before a second product ships.
- Privacy: `*ByPc` audit fields reviewed in S1; chatter messages are tenant data under existing
  retention rules.
- Security: S7 must filter before retrieval (no record-existence leaks).

## Verified current-state summary

See `EVIDENCE.md`; conclusion: keep the architecture, fix hygiene, governance, theme, patterns,
and capabilities.

## ASSUMPTIONS

| ID | Assumption | Why needed | Impact if wrong | Validation trigger |
| --- | --- | --- | --- | --- |
| A-001 | Existing web layouts rely on MUI default breakpoints. | Adapter default | Visual shifts | S3 screenshot comparison |
| A-002 | `HrManagementSystem.*` folders hold no untracked source. | Safe removal | Lost code | S0 `git status` + listing |
| A-003 | A file dependency on `packages/tokens` works with current `npm ci` CI jobs and Metro. | S3/S4 adoption | CI change | DEC-014 spike |

## OPEN RISKS / UNKNOWNS

| ID / note | Risk or unknown | Impact | Owner | Resolution/reopen trigger |
| --- | --- | --- | --- | --- |
| DEC-012 | Issuer/audience rename logs out every session | Users re-login | Owner + Platform | Planned release window |
| DEC-013 | Licence obligations inherited by new products | Legal/commercial | Owner | Before second product |
| E-020 | AttendanceConnector deployment unknown | Removal risk | Owner | S0 |

## Readiness to plan

- [x] High-cost ambiguities resolved or explicitly assumed.
- [x] Current versus target behavior is separated.
- [ ] Blocking unknowns are resolved (DEC-011 … DEC-016 open; none blocks S0–S2).
- [ ] Applicable design/privacy/commercial reviews completed.
- [x] Requester has approved turning this specification into an implementation plan (2026-09-28).
