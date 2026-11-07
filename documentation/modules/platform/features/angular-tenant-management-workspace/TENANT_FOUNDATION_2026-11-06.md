# Tenant Management Angular foundation — 2026-11-06

## Implemented bounded checkpoint

The current Platform management owner has typed Tenant DTO/query/page/detail,
retained cookie/CSRF transport for getPage/get/create/update, native Signal Form
validation/conversion, exact server-positive seat/date rules, catalog-bound nested
entitlements and semantic dirty keys. The separate Modules owner exposes a narrow
tenant-entitlements catalog API; navigation-accessible modules are not substituted.
TenantReadState owns actor-scoped server paging/search/sort,403latching, canceled
old reads and coalesced pending refresh. TenantEntitlementsState independently owns
assignable choices and distinguishes forbidden/error/ready-empty. A role-only
route guard exists but no customer Tenant route or menu is wired yet.

The existing dashboard subscription status contract is reused. Tenant reads accept
over-capacity usage because usage is evidence, not an invalid response; write
validation enforces the configured/current-use limits. Numeric input accepts
trim/leading-zero source conventions without clamp. Grants are treated as sets in
dirty comparison without mutating the draft or dropping unknown saved grants.

## Verified corrections and important contracts

- Shared isDateOnly is reused instead of a duplicate Date-parser validator. A
  failing regression proved that the duplicate accepted unsupported year0000;
  final tests reject it and invalid rollover, retaining year0001 support.
- The tenancy API returns stable domain codes in ProblemDetails.title, unlike
  geography's errors dictionary. A failing transport regression proved that the
  generic dictionary-only classifier lost Tenant.ConcurrencyConflict. The owner
  service now preserves only exact known public Tenant title codes and existing
  field errors; it never copies diagnostic detail or unknown arbitrary titles/dictionary codes.
  Independent review found and closed the dictionary-code bypass with another
  observed failing regression and final full-suite verification.
- UTC transport boundaries match the current Next source exactly: start00:00:00.000Z
  and end23:59:59.000Z. Both date fields remain source-required in this UI scope.
- Update requires real nonempty rowVersion; no generated revision or retry.
- Default searchValue is an empty string so resetting criteria does not trigger
  a second equivalent request when the debounced search catches up.

## Executed verification

Full npm run check passes726tests/132files and30architecture/dependency checks,
with format/lint/configuration/tokens/fonts/catalog/strict app+spec types and a
production build. Current initial574.50kB retains only the existing RISK-020 budget
warning. Formatting was rechecked after adding the read-only verification script.
The previous District browser acceptance and its1States regression remain dated
UI evidence; no new Tenant Management UI/browser journey is claimed here.

Using the already running trusted4210 login, actual hosted reads passed: Tenant
page200with1record, fresh detail200with rowVersion and entitlement data, and
tenant-entitlements catalog200with8modules. Owned session logout204; no business
writes, Tenant creation, notification or session revocation. Script:
web-angular/scripts/verify-tenant-management-live-read.mjs. Portable evidence and
current source hashes are in verification/TENANT_FOUNDATION_2026-11-06.json.

## Required continuation

This checkpoint is not complete Tenant Management acceptance. The current sole
Active feature remains S4-A1. Required next: editor state with fresh detail/rowVersion,
explicit conflict/uncertain/dirty handling, small five-tab components and interactive
entitlements; shared form error summary/focus across component boundaries and
inactive tabs; actual Grid/Cards/page/route/dashboard/sidebar entries; complete
source-matched browser/negative verification, Phase06 then education/closure.

When the create editor is wired, apply the actual source defaults (planFree,
maxAdmins1/maxUsers5, current UTC start date and default catalog grants). The neutral
emptyTenantDraft is a validation/reset primitive, not the create-screen UX default.

ContentTabs already supports controlled selected/keepAlive. Source review identified
that FormContainer contentChildren cannot see fields inside child component views.
Any correction belongs in the shared form owner (generic registration and section
focus), with meaningful tests/MCP consultation before use. No local Tenant copy or
engine is authorized by this finding. It is a current Required implementation
dependency, not an unowned release deferral.

States/Districts clients are Closed; actual report provider/template/catalog
publication remains PROD-019/028/025. Native/Next business implementations, API
semantics/schema and dependencies are retained. Tenant-admins, audit/error tools,
settings/operational tools and the final comprehensive Super Admin review remain
Required; the parent goal stays Active. No commit, push, merge or deployment.
