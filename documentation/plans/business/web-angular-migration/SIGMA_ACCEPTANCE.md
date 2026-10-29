# Sigma Reference — Adopted Angular Acceptance Details

Plan: web-angular-migration. Status: Required target acceptance, not implemented
or runtime-verified. Requester approved the eight reviewed recommendations on
2026-10-28 (D16). This file owns SIG-01..SIG-08 details; ERP_ACCEPTANCE continues
to own ERP-01..ERP-12. PLAN owns scope and ROADMAP owns delivery order.

## 1. Evidence and adaptation boundary

External source root: `F:/My Work/Sigma/SiGmaAngularFrontEnd`.
Reviewed 2026-10-28; source HEAD `76d6f3ee9d36bc27c418472ced7fe579aa79492e`.
The scoped reference files below had no working-tree changes at integration.
The review inspected source and test definitions; no Sigma build, test, browser,
database or performance verification was run. These are external examples, not
existing ERP behavior or approved Angular runtime references.

Sigma package declarations are Angular 21.2.25 and PrimeNG 21.1.10. Its app opts
into Zone-based change detection and its tsconfig disables strict/noImplicitAny.
ERP retains Angular 22, compatible PrimeNG, Strict TS/strictTemplates, Zoneless,
D06 Signals/SignalStore, shared @app/tokens and direct API/no-BFF architecture.
Re-express and test the accepted behaviors under those contracts. Do not copy
Sigma auth/token persistence, endpoint/envelope formats, permission assumptions,
Cache TTL/capacity, page-size constants or global request rewriting.

Existing ERP Next/API/applied books remain the functional/security authority.
Use existing framework/library capabilities where sufficient; this adoption does
not mandate a custom query engine, a universal Cache or an additional service.
S0/S1 selects compatible mechanisms through the existing proof gates. No new
business capability, schema, permission, offline mode or runtime implementation
is authorized by accepting these requirements.

## 2. Traceability and timing

| ID | Required behavior | Owner | Foundation / real-consumer gate | Complements |
| --- | --- | --- | --- | --- |
| SIG-01 | Finite lookup bootstrap and separately owned live refresh | Shared query + feature lookup owner | S1 harness; S3 and every applicable lookup consumer | ERP-02 |
| SIG-02 | Request lifetime follows the actual route/session owner | Shared transport + Platform navigation | S1 harness; S2 integration; S3 list consumer | ERP-02/06 |
| SIG-03 | Explicit page/dialog/silent loading ownership | Shared feedback + shell + feature | S1 harness; S2 shell; each consumer | ERP-03/11 |
| SIG-04 | Attachments survive failed saves and follow draft ownership | File/API owner + shared file adapter + feature | First attachment-enabled feature, even before S8 | ERP-04/06/10 |
| SIG-05 | Isolated child drafts and confirmation race safety | Shared forms/navigation + feature | First structured editor; relevant S1 harness | ERP-04/06 |
| SIG-06 | Round-trippable applied list criteria and URL state | Shared collections + feature service/state | S1 serializer/router harness; S3 full pilot | ERP-01/10 |
| SIG-07 | Shared Angular/PrimeNG compatibility suite | Shared UI/forms + localization + QA | S1 suite; each dependency upgrade and affected consumer | ERP-02/03/04 |
| SIG-08 | Explicit scroll owners and reachable fixed controls | Shared layout/table/dialog + accessibility | S1 harness; actual S2/S3 and later layouts | ERP-03/11 |

Each child contract maps applicable SIG IDs to its owner, source baseline,
status, test command/result and fixture/browser/live evidence. Use Not started,
In progress, Verified, or N/A with evidence. Requirement adoption and a test file's
existence do not establish Verified. Foundation harnesses use distinct test
compositions; production consumers verify actual permissions/data/lifetimes.

## 3. SIG-01 — Lookup bootstrap and refresh

- Give initial lookup acquisition a finite success/error contract suitable for
  combined initialization. A continuous watch must not keep bootstrap pending.
- Own refresh subscriptions by the mounted consumer; release them on teardown.
  Deduplicate concurrent eligible reads without cancelling another live reader.
- Retain same-context usable options on refresh failure, expose Retry, and preserve
  selected IDs/labels and the draft. Missing/archived choices follow owner rules.
- Clear old-context values before acquiring the next context; reject late results.
  Realtime is an invalidation hint; define expiry/revalidation and tab-return
  behavior so missed notifications do not imply indefinitely fresh data.
- Inventory reads and successful writers/invalidation per source. Classify each
  as Cache-eligible, justified direct read, or unresolved before its gate closes.
  Availability, balances, capacity and policy reads require their own owner
  decision. Do not opt every GET into caching or copy Sigma's URL/topic registry.

Proof: finite multi-lookup bootstrap; two consumers sharing a read; teardown;
failed refresh with retained selection; successful retry; missed notification;
context switch during an in-flight request; hidden-tab return without a storm.

## 4. SIG-02 — Navigation and request lifetime

- Updating query/fragment state on the same screen must preserve needed bootstrap
  and current operations. Compare actual route identity, including record/path,
  matrix parameters and outlets where used; query-only criteria still use the
  feature's latest-query/stale-response policy.
- Rejected navigation must not prematurely cancel a read owned by the retained
  screen. Successful departure cancels or fences departed-screen results without
  cancelling reads created for the target screen.
- Session/context-owned reads follow that owner rather than every routed page.
  Use explicit typed request metadata for read-only POSTs and lifetime exceptions;
  never infer read semantics from endpoint names. External transport is excluded
  from API-specific interception unless explicitly reviewed.
- Track write safety independently of read cancellation. Release pending state
  exactly once on success/error/unsubscribe, including before success navigation.
  Client cancellation does not prove server rollback; preserve ERP-06 uncertain
  result handling and no automatic write replay.

Proof: query/fragment changes during bootstrap; blocked navigation; successful
departure; target-page/session reads; explicit POST search; overlapping writes
and error/unsubscribe release without clearing a later operation.

## 5. SIG-03 — Loading ownership

Classify each operation as page, dialog/local, or an explicitly allowed silent
refresh. Keep one visible progress owner for an operation, with busy/aria-busy,
duplicate protection, errors and Retry still available. A dialog that obscures
the shell loader needs visible local progress. Retained-data refresh may remain
silent under its contract; initial missing data must have a visible state.

Overlapping work remains pending until the last owned operation settles. Success,
error, cancellation and destruction release their own activity; a departed
operation cannot release a new screen's activity. Query-only navigation preserves
progress for retained work. Verify rendered visibility and render notifications
under Zoneless, including fast completion without a stuck or stale indicator.

## 6. SIG-04 — Attachment save/discard lifecycle

Record the actual API attachment contract first: atomic multipart, staged upload,
or existing stored-reference behavior. Introduce a per-editor tracker only where
that contract requires it; do not assume Sigma's stored paths/deletion API.

- Keep previously saved attachments intact when a replacement/removal is drafted
  and saving fails. Delete or detach the old reference only after confirmed save
  and according to server ownership/reference/retention rules.
- Track new uncommitted uploads separately. Discard cleans eligible staged uploads
  without deleting previously saved documents; commit retains referenced uploads.
- An isolated child draft transfers attachment ownership to its parent only on
  child acceptance. Child cancellation cannot damage parent or persisted files.
- Coordinate active upload/cleanup with save and close; prevent cleanup/upload
  races. Failed cleanup is recoverable and separately reported from save success.
- Resolve uncertain saves before deleting potentially committed attachments.
  Verify server authorization/reference checks and orphan expiry/reconciliation;
  browser cleanup cannot guarantee cleanup after a crash or lost connection.

Proof: replace then failed save; remove then discard; child accept/cancel; save
during upload; partial cleanup failure; lost save response; editor destruction
and authoritative orphan handling. An actual API gap gates its owning slice.

## 7. SIG-05 — Child drafts and confirmation races

Use one authoritative parent form; an independently cancellable child editor uses
an isolated typed draft and commits to the parent only on acceptance. Cancel must
preserve the parent values, child order and attachment ownership.

After an asynchronous remove/discard decision, revalidate the current owner,
stable child identity and allowed action. Never apply an old row index to a
changed collection. Prevent duplicate decisions and serialize conflicting
save/navigation/confirmation actions; safely freeze and restore relevant controls
where needed without re-enabling a control now disabled by policy.

Proof: cancel an edited child; reorder/remove while confirmation waits; parent
save/owner destruction/scope transition while waiting; denied navigation and
pending save; restored focus and unchanged unrelated values. Repeat under Zoneless.

## 8. SIG-06 — Applied criteria, URL and export

Define a typed, allowlisted, bounded serialization contract per list. Round-trip
approved non-sensitive applied filters, page/size/sort and column criteria through
deep links and return-from-editor navigation. Preserve the distinction between
draft filter inputs and the applied query used by paging, refresh and export.
Keep private/personnel/financial values out of URLs unless explicitly approved;
restoration still rechecks permission and current tenant/company context.

Preserve zero, false, absent/cleared and explicit null according to actual API
semantics. Validate restored fields/operators/types and paging bounds, handle
malformed values safely, and reset page on relevant criteria changes. Use an
explicit adapter between vendor events, feature criteria and API wire formats.
Do not copy Sigma's false-dropping route writer or Filters[grid] wire format.

Proof: filtered list -> editor -> return; refresh/direct link; browser Back/Forward
under the chosen history policy; false/zero/null/clear; bad URL; page-size-only
change; no duplicate query loop. Export uses the same applied criteria with the
explicit authorized selection/page/filtered scope required by ERP-10.

## 9. SIG-07 — Shared compatibility suite

Run a shared behavior suite under the selected Strict/Zoneless toolchain before
S1 closure and on Angular/PrimeNG upgrades. Cover value/clear propagation exactly
once through ControlValueAccessor, null/reset/disabled state, asynchronous form
updates, nested controls and valid first-error focus. Avoid forced detection
that conceals missing production change notifications.

Browser checks cover input/select/date geometry, non-overlapping clear/search
icons, long labels, keyboard/focus return and disabled/read-only controls in
EN/AR, LTR/RTL, light/dark and compact/wide layouts. Verify the shared token adapter
across all five palettes as required by ANGULAR_ARCHITECTURE section 7.

Configure overlay mounting/stacking and PrimeNG internal translations centrally;
filter menus, paginator/calendar labels and accessible names must follow runtime
language changes. Prove nested dropdown/dialog visibility and focus. Approved
specialist adapter exceptions retain their own tests; no raw feature bypass.

## 10. SIG-08 — Layout and scroll ownership

Name the intended scroll owner of each bounded table/form/dialog region. Preserve
reachable headers, filters, paging and save/action controls under the selected
screen pattern. Avoid accidental outer/inner double scrolling and clipped
overlays; do not copy a universal page-height formula or forbid page scrolling
where the reviewed ERP pattern/accessibility needs it.

Browser proof covers long tables/forms, empty/error states, nested dialogs,
compact/wide EN/AR, keyboard traversal and browser zoom. Focused/invalid fields
remain reachable, overlays escape clipping correctly, and fixed controls do not
cover content. Compare against the same Next workflow/viewports and record any
intentional adaptation in its canonical feature book.

## 11. External source map and primary references

All Sigma paths below are relative to the external source root in section 1.
Reinspect them at implementation entry; external paths are navigation evidence,
not portable runtime dependencies or files in an ERP required-file manifest.

| Requirement | Reviewed external source / symbols |
| --- | --- |
| SIG-01 | `src/app/modules/shared/service/reference-lookup-cache.service.ts`: ReferenceLookupCacheService.read/watch/clear; `reference-lookup-bindings.ts`: ReferenceLookupBindings.bind |
| SIG-02 | `src/app/modules/shared/interceptores/navigation-activity.interceptor.ts`: navigationActivityInterceptor, NAVIGATION_READ_ONLY, KEEP_READ_ON_NAVIGATION; adjacent `.spec.ts` scenarios |
| SIG-03 | `src/app/modules/shared/service/loading.service.ts`: LoadingService, LOOKUP_LOADING_SCOPE; `src/app/modules/shared/components/editor-dialog/editor-dialog.component.ts` |
| SIG-04 | `src/app/modules/shared/service/document-upload-tracker.service.ts`: DocumentUploadTracker.upload/transferTo/finishSave/discard |
| SIG-05 | `src/app/modules/shared/utils/editable-rows.ts`: EditableRows.requestRemove; `src/app/modules/shared/service/navigation-policy.service.ts`: NavigationPolicyService.allowNavigation |
| SIG-06 | `src/app/modules/shared/utils/list-route-state.ts`: readListRoute/writeListRoute; adjacent `list-query.ts`: gridFilterString/gridFilterMetadata/toListParams |
| SIG-07 | `src/app/modules/shared/components/primeng-control-compatibility.spec.ts`; adjacent `shared-presentation-compatibility.spec.ts` |
| SIG-08 | `src/app/modules/shared/components/shared-presentation-compatibility.spec.ts`: bounded scroll/paginator scenarios; shared table/dialog owners |

Primary documentation reviewed during the source assessment:
[Angular Zoneless](https://angular.dev/guide/zoneless),
[Angular interceptors and HttpContext](https://angular.dev/guide/http/interceptors),
[PrimeNG configuration](https://primeng.dev/configuration).
Framework support does not certify these ERP behaviors. Existing DEC-027,
DEC-026, RISK-016 and RISK-017 remain owned by their central notes; adoption closes
none of their gates. Any newly discovered material API/release gap receives a
central note ID under the existing planning rules before deferral or release.
