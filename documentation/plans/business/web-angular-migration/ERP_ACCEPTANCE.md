# ERP Reliability and Productivity — Acceptance Contract

Plan: web-angular-migration. Status: Required target acceptance, not verified
runtime. The requester authorized including these recommendations on 2026-10-28.
This document owns the detailed acceptance criteria; PLAN owns scope and ROADMAP
owns order. No new server topology, business module or universal workflow engine
is authorized. Apply each criterion to its actual feature; N/A needs evidence.

## 1. Requirement traceability

| ID | Requirement | Owner | First application / completion gate |
| --- | --- | --- | --- |
| ERP-01 | Typed API contracts and repeatable generation assessment | API + Web Architecture | S0 proof, S1 contract tooling, each feature closure |
| ERP-02 | Shared scope-aware reference selectors | Shared UI + lookup owner | S1 shared behavior, S3 Countries/States consumers |
| ERP-03 | Keyboard-efficient entry and navigation | Shared forms/table + feature | S1 harnesses, every data-entry feature |
| ERP-04 | Structured document/collection editing without loss | Feature owner + shared forms | First real structured workflow, then every applicable feature |
| ERP-05 | Explicit optimistic concurrency and conflict recovery | Owning API + Web feature | Every protected edit/lifecycle operation |
| ERP-06 | Duplicate and uncertain-result safety / atomicity | Owning API + feature | Every material mutation, import and bulk action |
| ERP-07 | Monetary/quantity/date correctness | Domain owner + transport/form adapter | S0 convention capture, applicable Accounting/HR/CRM feature |
| ERP-08 | Explicit lifecycle and action authority | Domain/API + feature | Every stateful record and document |
| ERP-09 | Business audit and investigation path | Owning module + Platform audit | Each material write; S4 audit UI |
| ERP-10 | Safe server collections and reports/import/export | Feature + specialist adapter | S3 full pilot and relevant later feature |
| ERP-11 | Representative performance and diagnostic evidence | Web + API + QA | S3 baseline, complex feature baseline, S9 integration |
| ERP-12 | Recoverable, observable release | Operations + API/Web + QA | Before first external production data/release; references PROD-019/023/024 |

Each child contract maps applicable IDs to tests and live evidence, with status
Not started/In progress/Verified or N/A + reason. A test file's existence is not
verification. Mark verified only after running the stated check against its
recorded source baseline, data and environment.

## 2. ERP-01 — Typed API client and contract drift

The current API host configures versioned Swagger through
`api/ErpSystem.Api/Hosting/ConfigureSwaggerOptions.cs` and
`HostInfrastructureServiceCollectionExtensions.cs`. That proves configuration,
not full schema completeness or that the live endpoint is available.

Required S0 proof: obtain the actual versioned OpenAPI document in the test
environment, assess a compatible Angular/TypeScript generator, generate one
representative service and compare it to the actual API. Test nullable/optional
fields, enum/ID representation, dates/decimals, query arrays/paging, ProblemDetails,
validation paths, concurrency tokens, cancellation and binary downloads/uploads.

If proof passes, choose one generator and pin its version/config/spec provenance.
Generated files have a separate location and are never hand-edited. Feature
services wrap the generated transport and own domain request/view-model mapping;
pages do not call generated clients. Avoid separately maintained copies of the
same wire DTO. UI models may differ when explicitly named and mapped.

CI must detect stale generated output for migrated contracts using a repeatable
generation/check command. Use scoped review for unmigrated or unsupported APIs;
do not report a whole-API diff as implemented. A failed compatibility proof needs
a documented fallback to typed feature services plus contract tests before broad
rollout. Generator adoption cannot bypass runtime validation or API ownership.
Canonical broader automation note remains FOLLOW-003; this bounded migration
proof is now Required, not a promise that the full repository already has it.

## 3. ERP-02 — Shared reference/lookup control

Provide one generic shared selection behavior, composed with feature-owned typed
lookup adapters. Shared UI does not know what an account/employee/customer means.

- Search/filter/page on the server where the endpoint supports them. An unpaged
  small lookup must have a documented bounded contract; never silently truncate.
- Preserve selected ID/display value on edit, even when not in the currently
  loaded page. Resolve a selected record through the actual supported contract.
- Distinguish initial load, searching, no match, forbidden, error/retry and disabled.
- Cancel or ignore stale search responses; reset dependent options on parent/scope
  changes according to the feature contract without erasing valid edit data.
- Key any cache by owner/query and trusted tenant/company/context generation.
- Show archived/missing dependencies accurately; apply owner rules to new selection.
- Keyboard selection, labels/help/errors, focus return and RTL use shared behavior.
- Respect field-level dependencies; do not load the full entity list to simulate
  remote search or introduce a generic backend lookup service across domains.

Proof: parent-dependent States plus another appropriately scoped consumer. Include
preselected off-page value, rapid searches, scope switch and error recovery.

## 4. ERP-03 / ERP-04 — Entry productivity and structured editors

Define a shared keyboard contract before a large set of forms diverges. Natural
Tab/Shift+Tab order is mandatory. Enter/Escape behavior is explicit for table cells,
lookups and dialogs; Enter in a multiline input must not accidentally submit.
Optional save/add-row shortcuts are discoverable, screen-scoped and avoid stealing
browser/system/assistive-technology keys or text input. On narrow/touch viewports,
the same action has a visible accessible control.

Use shared error summaries and first-invalid focus, including hidden tabs and
nested rows. Keep submit enabled for validation; block only denied/read-only or
duplicate/pending actions. Display clear pending and uncertain-result feedback.
Preserve unsaved data on recoverable failure and use shared discard protection.

Repeatable children require dedicated add/edit/remove/reorder controls, stable
identity, nested validation and view-mode representation. Edit load -> change ->
save -> reload must preserve unaffected values and order according to the API.
Computed totals are derived from the authoritative form/domain inputs, not
manually synchronized duplicate state. Mock drafts must be valid and realistic.

Acceptance uses a realistic multi-row case for an implemented workflow (for
example structured job descriptions or another current aggregate), including
keyboard-only editing and a deliberate error in a later row. A future invoice or
unimplemented posting screen is not added merely to prove the migration.

## 5. ERP-05 / ERP-06 — Write correctness

### Concurrency

Carry the API's actual opaque RowVersion/ETag/version contract from detail load
to the protected write. Do not decode, synthesize, omit or overwrite it to force
success. On a conflict, retain the draft, explain stale state and offer the
supported reload/review path. Force overwrite/merge exists only if the domain
explicitly supports and authorizes it. Test with two real API clients; the later
stale write must not erase the first accepted change.

### Duplicate submission and uncertain outcomes

UI submit locking prevents concurrent clicks but is not a server guarantee.
For create/post/approve/import or other material effects, document existing
idempotency/unique-operation semantics. When keys exist, keep the same key for
the same logical attempt and define payload mismatch/expiry behavior from the
actual API. Do not assume every endpoint is idempotent or add a generic retry.

If the server may have committed but the response is lost, show an uncertain
state and reconcile using a supported lookup/status/reference path. Do not invent
success or silently replay. Test repeat click, response loss after commit, delayed
response and context change. Missing server guarantees are explicit acceptance
gaps routed to the owner before the affected feature can close.

### Atomicity

Define transaction/commit boundaries for the actual aggregate and dependent work.
The client must not make unrelated sequential writes and present them as one
atomic operation. Preserve partial-result semantics when the API deliberately
uses them. Durable cross-module side effects use existing owner contracts/outbox
when required; the UI migration does not impose distributed transactions.

## 6. ERP-07 — Amounts, quantities and time

Before an applicable feature is implemented, record:

- Currency and functional-currency ownership; money/quantity/rate precision and
  scale; wire representation and decimal parsing/serialization.
- Rounding mode and stage (line/discount/tax/document), permissible negative and
  zero values, exchange-rate date and authoritative server result.
- No assumption that all currencies use two decimals. JavaScript binary number
  arithmetic must not silently become the authority for posted financial values.
  Use reviewed string/decimal/minor-unit handling according to the API; add a
  decimal library only where required by real client calculations.
- Localized formatting is presentation. It must not corrupt the invariant wire
  value through separators, Arabic digits or trailing precision.
- Distinguish date-only business dates from UTC instants and local scheduled times.
  Preserve date-only values without timezone shifts; apply timezone rules to actual
  instants/schedules. Working fiscal year remains owner-controlled.

Test fractional values, boundary rounding, negative/zero cases, reload equivalence,
EN/AR formatting, date boundaries and relevant timezone/DST transitions. The API
owns accepted business calculations; conversion does not redefine accounting policy.

## 7. ERP-08 / ERP-09 — Lifecycle and audit

Each feature has an explicit state/action matrix: current state, named action,
actor/permission, editability, scope, concurrency precondition, reason and next
state. Preserve draft/approve/post/cancel/reverse/archive distinctions where they
actually exist. Do not add an approval engine or new state to achieve UI uniformity.
Financial/stock/people history follows its owner rules; no silent edits to accepted
history and no new hard-delete action introduced by the client conversion.

Business audit remains server-owned. Current central documentation is
`documentation/guides/api/AUDIT_TRAIL.md`; review actual interceptor/module/source
coverage, exclusions and action-specific history before claiming completeness.
Lifecycle history may be distinct from field-change audit. Preserve actor, time,
record and correlation references as authorized; do not expose secrets or bypass
record/tenant/company scope. Client error logs are not the business audit ledger.

Verify one successful material action and one denied/failed attempt according to
the relevant business/security audit policy. Failed writes must not generate a
false successful business-change record. Audit view permission is independent
from edit permission. Missing coverage blocks that requirement; no parallel Angular
audit table or browser-persisted audit store is introduced.

## 8. ERP-10 / ERP-11 — Data volume and investigation

Server paging/filter/sort and deterministic order are required for collections;
selected-row navigation must work across page boundaries. Validate realistic
volumes and dependent lookups without loading all rows. Bulk selection semantics
must distinguish visible-page IDs from a server-wide selection.

Exports/reports state their scope (selected/current page/filtered/all authorized)
and cannot silently use a loaded page as the full result. Imports preserve exact
headers, formula rejection/limits, duplicate/atomicity rules and uncertain-result
reconciliation. Verify representative vendor reports/files, not empty placeholders.

Record production-build size with comparable units; measure representative first
load/navigation/search/context switch and API request counts. Choose numeric
budgets from pilot measurements and target devices/data before broad rollout.
No arbitrary machine-specific timings become CI gates without a stable method.

Preserve correlation across Angular/API, actionable error codes and sanitized
telemetry. Reproduce a failed request by authorized reference/correlation without
recording credentials or unrestricted financial/personnel payloads.

## 9. ERP-12 — Release and recovery

References, not duplicate production-note ownership:

- PROD-019: deployed browser/auth/scope/denial/conflict baseline.
- PROD-023: backup/restore/disaster recovery; basic tested recovery is Required
  before accepting first external production data. Production-scale RPO/RTO and
  scheduling details remain owned by the canonical operations note/runbook.
- PROD-024 and PROD-001: diagnostics/monitoring/collector delivery applicable to
  the claimed release; source flags do not prove hosted delivery.
- PROD-016/017: schema/config/secrets controls when those deployment changes apply.

The recovery evidence names environment, backup scope/version, encryption/access,
restore target, elapsed recovery, data validation, responsible operator and rollback
boundary. A restore must be demonstrated in an isolated test target, never over
unbacked-up live data. Reverting Angular must not silently revert business data.
Keep existing Next and Mobile compatible with any changed API contract.

No new backup product, queue, cache server or telemetry service is mandated by this
plan. Use existing deployment capabilities where they meet measured requirements.

## 10. Scope and closure rule

This migration adopts these controls as acceptance requirements; it does not
declare them missing or newly implemented everywhere. Capture existing evidence
first. If a real gap needs changed domain semantics, schema, permission or public
contract, reopen the affected gate and create/authorize the owning bounded API
slice; do not conceal business changes inside an Angular port. API/Mobile profiles
and migrations are reconciled when actually affected.

Missing material guarantees cannot be waived by a green type check, generated
client or AI-written unit tests. Each applicable requirement has a testable outcome
and owner. S9 release closes only after the traceability ledger and applicable
production notes have evidence; otherwise report the bounded verified scope.
