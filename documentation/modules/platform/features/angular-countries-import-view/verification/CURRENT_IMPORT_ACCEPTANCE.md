# Countries XLSX import — current Angular acceptance

Phase06 Verified2026-10-31 under requester decision D35 for bounded Angular Countries Import. Fresh full Angular check78files/443tests,4configuration/12architecture, types/templates/catalog/tokens/fonts and production build passed. Angular browser40 palette/mode/EN-AR/390/1440 cases,15 failure/authority cases and5 additional user journeys passed. The new journeys cover file replacement/cancel, view discard/cancel, permission loss, permission loss during a pending command and keyboard page-size/paging. Final build500.38kB/131.48kB estimated transfer warns385bytes above the unchanged500kB warning budget (FOLLOW-019). No live hosted import, production release or full Countries/Table/realtime acceptance.

## Revised authority and scope

D35/SCOPE_CHANGE.md records the requester instruction to focus on precise Angular
implementation without making Next review a prerequisite. The former rendered-Next
matrix is no longer a Required gate. This is an explicit scope decision, not a claim
that a failed comparison passed. S3-A7 may close on the Angular/API/shared contract.
S3-A8 still owns complete Countries acceptance before business-route enablement.

## Verified Angular behavior

The authenticated development workspace /dev/countries has Import for super_admin
with Countries:View/Create and a writable session. Direct selection/template/submit
handlers recheck authority. Shared SpreadsheetImportPanel uses PrimeNG FileUpload;
bytes remain local, template is generated/downloaded, shared MyDataGrid owns preview,
toolbar/options, contained scroll and paging. Five palettes use @app/tokens, EN/AR
and RTL use the existing catalog. No new translation key or NgRx/BFF.

The import-only public entry lazily loads SheetJS0.20.3 and the parser. First worksheet,
5MiB/100 nonblank rows, six ordered headers, no formulas or additional data columns.
ZIP signatures/declared expansion/entry count are bounded before parsing; these
metadata checks are not a universal defense against every compressed-file workload.
Existing country field validation/normalization is reused. Later same-field duplicate
rows and invalid fields remain local with row numbers/errors; blank optional codes
stay null. Only valid rows form one JSON POST /api/v1/countries/bulk, Cookie/CSRF,
10s timeout, exact201 createdCount. Existing server atomicity covers that valid subset.

No auto retry/replay. Pending blocks replace/clear/view/context transitions. Uncertain
outcome locks selection/submit and offers Review records. Explicit clear/reselect is
needed after definitive rejection. Shared UnsavedChanges owns discard consent.
Actor replacement masks/disposes prior data/requests;401/403 latches denial. Browser
permission-change tests use the real focus/session revalidation path and verify that
late command completion cannot restore old rows or show false success.

## Current evidence

- ANGULAR_CHECK.txt: fresh full443-test/config4/architecture12/types/catalog/tokens/
  fonts/build pass; unchanged500kB warning threshold exceeded385bytes.
- browser-results.json/BROWSER_MATRIX.txt:40 actual template/file/preview/pager/
  valid12+invalid2/one-batch cases across5palettes/light-dark/EN-AR/390-1440.
- focused-results.json/BROWSER_FOCUSED.txt:15 duplicate409/403/503/network/malformed/
  pending and invalid-file/missing-Create/read-only/discard-cancel cases.
- journey-results.json/JOURNEYS.txt:5 additional state/authority/keyboard journeys.
  The first journey driver incorrectly expected10 after Home; the shared collection
  starts at5 ([5,10,25,50]). The expectation was corrected; final five cases passed,
  including Enter on Next and actual next-page Excel row7. No product change needed.
- Current Arabic desktop/light and compact/dark screenshots were visually inspected.
  No native dialogs or document horizontal overflow in the40-case matrix.
- Existing official PrimeNG22.1.4 MCP FileUpload validation remains valid: shared UI
  runtime is unchanged. Prior retained API39/Next22/native7 and Angular command8/
  Chart8/Report8 receipts are retained, not described as fresh reruns in this step.

## Boundaries and handoff

Next diagnostic work was stopped per D35 and its temporary config/E2E edits reverted.
Old source partial results/failure logs are historical only; FOLLOW-020 is deferred
to a separate Next task. No Next repair or full Next check is claimed. Its debug-only
flag experiment allowed comparison cases, but is not delivered or used as an Angular
gate. No loader was removed or readiness injected in application flows.

FOLLOW-018 keeps provenance of23 historical .log files absent from Git; nonexistent
manifest entries were removed, existing receipts retained. FOLLOW-019 owns size
optimization in S3-A8; warning/error budgets were not increased. PROD-019/023 and
RISK-016/017 retain applicable release boundaries, interpreted through D35 for current
Angular acceptance. No API/schema/domain/native runtime change or EF migration.

Phase06 Verified for this bounded slice. Phase07 education is authored after this
decision. Full Countries/host/realtime/Table release remains Not Verified. Source
hashes/current-only manifest and final documentation/planning checks own handoff.
