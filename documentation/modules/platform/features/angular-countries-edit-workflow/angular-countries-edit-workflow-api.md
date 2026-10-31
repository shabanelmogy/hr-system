# Countries create/edit — api applied book

Current D29–D32: bounded shared form/record interaction correction Verified/Closed. Current proof: verification/FORM_RECORD_ACCEPTANCE.md; original command proof retained. API/native/schema unchanged.

Original S3-A3 commands: Phase06 Verified /Phase07 completed /Closed2026-10-30. Historical acceptance: verification/CURRENT_EDIT_ACCEPTANCE.md. Current D29–D32 correction evidence is verification/FORM_RECORD_ACCEPTANCE.md; Phase00 text below retains the approved entry contract.

## 1. Ownership

ReferenceData owns global Countries and its existing commands. Platform owns migration evidence; Shared owns generic UI/data lifetimes. This client slice adds no entity, API endpoint, schema or native ownership.

## 2. Existing-system relationship

Extend an existing capability with an Angular consumer. Keep the existing global CQRS/controller/store canonical. Reviewed CountriesController V1, CountryMutationValidator/GeographicalNameRules, permissions, Next CountryForm/GridActions and current Angular read/service/shared form/close/unsaved sources. D19/D21 own reuse and action priority.

## 3. Bounded scope and platforms

Web Create/Edit Required at authenticated development Countries, with existing Grid/Cards/View retained. Archive/Restore/Bulk is separately Verified/Closed in S3-A4; Chart/Report/Import remain Required in their exact children. New native UI Excluded; retained native Countries stays unchanged. No production business-route or full-pilot claim.

## 4. Shared reuse

D29–D32 extends existing shared form/controller first: optional native Badge counter, formTools footer, recordRequest feedback and common keyboard targets/flash. The feature supplies field limits, authoritative command results and row IDs only.

Reuse PageHeader content action slot, MyDataGrid inline/sticky action capability and RowActions in Grid/Cards; no feature-local action shell. Reuse DialogPanel, FormContainer appearance=dialog, TextField, FormCloseGuard, UnsavedChanges, server field error bridge, FeedbackState and existing scoped read. Extend only generic command-outcome/field-error helpers when no existing fit exists.

## 5. Data and transport

Existing POST /api/v1/countries returns201 CountryDetail; PUT /api/v1/countries/{id} returns200 matching ID. Exact HTTPS origin, secure cookie credentials, CSRF header and bounded timeout; cold typed services only. No auto retry, bearer persistence, BFF, invented ETag/revision or fabricated success. Validate untrusted successful responses.

## 6. Permission matrix

Page/View requires super_admin plus Countries:View. Create additionally requires Countries:Create, Edit Countries:Edit; both are blocked by the authoritative tenantReadOnly flag, matching current Next useAppReadOnly. Recheck every callback and submission. Edit only active records. Identity/permission/read-only replacement masks and invalidates the old editor; API remains authoritative.

## 7. Business rules matrix

Names are trimmed/NFC, printable,2..100. Optional Alpha2 two ASCII letters; Alpha3 and Currency three ASCII letters; normalize codes uppercase and blanks to null. Phone matches optional plus plus digits and total length1..10, following the API length rule. Fields remain flat. Server duplicate409 is a rejection, not an optimistic-concurrency guarantee. Use pure normalization/validators and meaningful tests.

## 8. Edges and validation

Cover missing/blank/short/long/control Unicode names, normalization, optional null/blank/lowercase codes, bad code lengths, plus/phone length, malformed payloads, unsafe ID, duplicate409,400 identified field errors,401/403/404, archived detail, malformed2xx, network/timeout/5xx, double submit, stale detail/write and actor replacement. Save stays enabled for incomplete/invalid forms; shared submit shows all field errors and focuses the first invalid field. No native validation/alert/confirm.

## 9. Lifetime and outcomes

The editor owns an identity/revision and semantic normalized baseline. Register shared route/context protection and local close consent. Freeze edits/close while pending. A request not dispatched is not sent; authoritative4xx except timeout-style408/499 is rejected; lost transport/5xx/malformed successful response after dispatch is uncertain. Never automatically replay. Explicitly inform the user to review server data; do not present uncertainty as no change. Preserve later revisions and ignore stale actor effects.

## 10. Localization and accessibility

Existing core/reference-countries EN/AR SQL-backed resources remain canonical. New generic/domain captions go through their owning source resources and catalog generator; PROD-019 owns deployment. RTL, native controls, accessible action labels, shared summary/error links and actual compact/wide browser checks Required. Read dialog remains without auto focus; form validation focus is retained.

## 11. Verification

Current correction Phase06 Verified: Angular405/71 files, command/form/record browser8 and shared form regression40. See verification/FORM_RECORD_ACCEPTANCE.md and FORM_RECORD_RESULTS.json for exact scope and limitations; the379-test command proof below is historical.

Phase06 Verified: full Angular379/4 configuration/11 architecture/build;8 mutation browser and8 retained screen/control cases. See verification/CURRENT_EDIT_ACCEPTANCE.md for scope, artifacts and limitations. Tests use intercepted commands; no hosted write proof.

## 12. Impact matrix

Reuse API/persistence/permissions/native and source domain semantics. Extend shared generic form-dialog spacing/optional footer, inline row actions, command outcome/field error parsing if needed. Add feature mutation contract/validation/editor state/UI and actual tests/scripts. No database migration: entity/schema unchanged. No new application package required for this child.

## 13. UI pattern and fidelity

P-001/C-01 shared dialog and form; C-02 existing Grid/Cards. The six fields and action eligibility come from current Next source. Explicit requester refinements include native paginator only, organized Grid options, full column titles, shared spacing and no autofocus for readonly View. Add/Edit compose the shared form system; no raw feature-local modal/toolbar/error shell.

## 14. Readiness and scope authorization

G0 owner/scope, G1 current relationships, G2 six-field/permission/transport contract and G3 edge/reuse/verification plan are fixed by this request, exact v2 contract and inspected sources. Remaining G4 checks are release-only PROD-019/023 and full-pilot children. Corrected bounded read acceptance is Verified/Closed. S3-A3 original commands and D29–D32 corrections are now Verified/Closed; their current-source Phase00 and G0–G3 preceded bounded runtime. Remaining host/full-pilot gates stay release-only or in their own required children.

## 15. Handoff

S3-A3 including D29–D32 correction Verified/Closed after Angular405/build, command/form/record browser8 and retained shared form40. Canonical proof verification/FORM_RECORD_ACCEPTANCE.md and FORM_RECORD_RESULTS.json; education updated after Verified. Shared TextField native Badge variant, FormContainer formTools, scoped CollectionRecordFeedback and common Grid/Card keyboard/flash keep feature ownership to contracts/callbacks. S3-A4 command ownership remains separately Closed. Next S3-A5 chart is source/Phase00 Active only; runtime remains gated. Chart/managed Crystal-PDF/XLSX Import/full pilot and complete Table matrix remain Required. No API/schema/native/live business-write change; PROD-019/023 retained.
