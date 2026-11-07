# System Audit Trail — Angular client acceptance

Decision: **Phase06 Verified within the authorized Angular client scope**.
Date: 2026-11-06. Authority: D42 / S4-A3 and the version 2 Screen/Workflow Contract.
The earlier `FOUNDATION_2026-11-06.md` is a historical checkpoint.

## Implemented workflow

The guarded route `/super-admin/audit-trail` and its actual sidebar entry require
both `super_admin` and `SystemAuditTrail:View`. The read-only list retains the six
source columns, record-key search, module/dependent entity/action/calendar
criteria, refresh, fixed 50-row server pages, opaque cursor chain and unknown
total. Only a known previous page or the exact authoritative next cursor is
accepted. Direct cursor-page controls remain available alongside record
navigation. Selecting a record by click or Enter loads its composite module/ID
detail; checkboxes never activate the row action.

The detail dialog presents four labeled metadata values and an escaped
field/old/new snapshot Grid. It retains 10/25/50 local paging, stable original-index
IDs, checkbox selection and record navigation. Local single-column sorting and
all nine source text-filter operators apply to the complete returned array before
paging. Null/empty values are compared as raw snapshots. Filter/sort changes reset
the page and shared selection; a replacement snapshot resets local criteria.
Local changes do not issue GETs or mutate the authoritative snapshot.

## Shared architecture and source fidelity

Small criteria, collection, detail and changes components compose the existing
`MyDataGrid`, header, fields, badge, summary, feedback and dialog public APIs.
The owning service and actor-scoped state retain transport, validation, cursor
cache, cancellation and authority. A denial from list, filters or detail masks
the entire actor's history and blocks further reads; terminal detail-forbidden
feedback remains available without exposing cached metadata.

Generic additions are `createLocalCollection` and `CollectionTextFilter`, plus
optional summary fields, a nullable header total and opt-in single-click row
activation. Remote Grid filters and default double-click activation remain
unchanged. The native Table sort input clears with `null`, matching the installed
PrimeNG contract; using `undefined` retained the preceding field and re-emitted a
stale sort. A failing/passing regression proves this correction.

The Next page is the behavioral reference. Angular intentionally uses the shared
PrimeNG widgets and contained page scrolling requested by the user. Its shared
toolbar popover replaces MUI's local filter-panel placement while retaining all
nine operators, including individual add/remove values for `isAnyOf`. The actual
Next outer document is longer at the same viewport; Angular does not copy that
outer-scroll behavior. These are explicit shared-platform adaptations, not a
claim of pixel-identical MUI rendering.

## Executed acceptance

- Full `npm run check`: **844 tests in 158 files**, 30 architecture tests and four
  configuration tests; format, typed lint, tokens, fonts, catalog, types and
  production build pass.
- Focused audit/local-filter suite: 65 tests in 13 files. A separate new footer
  regression passes after observed red/green. Sorting/navigation and the missing
  local-filter interaction also have observed failing/passing evidence.
- Angular browser matrix: eight EN/AR × light/dark × 390/1440 cases, including
  column visibility, cursor/cache behavior, checkbox isolation, keyboard detail,
  local page/sort/filter controls, escaped snapshots, local calendar UTC bounds,
  dependent criteria, unknown total and contained scrolling.
- Negative browser matrix: 32 cases across both languages. It covers denied
  routes, read-only authority, empty/error/retry states, filter 401/403, detail
  errors/404/403/malformed identity, no changes, failed next-cursor retry and
  inverted calendar range. No private server diagnostics or business writes.
- Rendered current Next reference: eight matching language/theme/viewport cases;
  six columns, detail metadata, checkbox/navigation, actual client sorting and
  filtering are exercised. Horizontal column virtualization is scrolled through
  rather than disabled for the reference.
- Full-journey owner smoke regressions pass for Tenant Management, Tenant
  Administrators, States and Districts, one case each.
- Hosted read-only proof: list 200 with 31 records, filters 200 with three modules,
  detail 200 with six changes, actual authorized Angular route rendered and owned
  session logout 204. Business writes: zero.

Independent scoped source review has no unresolved P1/P2 in the reviewed screen,
local-collection/filter additions or unknown-total footer correction. An earlier
wrong-role browser attempt encountered a blank navigation during concurrent
recompilation; isolated and complete settled-source reruns pass without guard
changes. Earlier foundation and pre-filter receipts remain historical evidence.

## Limits and remaining parent work

No API/domain/schema/dependency/native rewrite, EF migration, audit writer, export,
report, import or mutation belongs to this read-only source workflow. Test fixtures
never manufacture hosted audit data. Existing native audit behavior is retained;
compact browser acceptance is not native-device acceptance.

The initial bundle is 578.82kB, estimated transfer 148.38kB, with the existing
500kB warning tracked by RISK-020. Existing PROD-019/028/025 retain their separate
release scopes. No commit, push, merge or deployment is claimed.

Current portable receipts and source hashes are in
`verification/SYSTEM_AUDIT_WORKSPACE_2026-11-06.json`, with bounded representative
captures and fixture/reference/live/regression results registered by the manifest.
Phase07 Arabic education follows this Verified decision. Error logs/settings,
system UI texts, advanced operational tools and the comprehensive whole-Super-Admin
review remain Required; the parent goal stays Active.
