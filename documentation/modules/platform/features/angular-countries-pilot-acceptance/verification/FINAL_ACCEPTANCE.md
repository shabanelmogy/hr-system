# Countries final acceptance — 2026-11-01

## Decision

**Non-report Countries pilot acceptance: Verified.** The current Angular screen,
configured shared controls, CRUD/lifecycle/import, responsive presentation and real
hosted realtime reconciliation passed the checks below. The only outstanding
current pilot acceptance blocker is the hosted managed-report catalog/render,
**PROD-028**. Complete S3-A8 Phase 06 remains **Not Verified**; Phase 07 has not
started and the business route remains `/dev/countries`.

This accepts the implemented Countries scope. It does not close the entire Angular
migration, all optional PrimeNG capabilities, or production release readiness.
D35 still excludes mandatory Next execution/comparison. No API/domain/schema,
Next or native runtime source was changed. EF migration is N/A: the live checks
use existing authorized application commands without changing persisted meaning.

## Fresh technical gate

`npm run check`, with `VITEST_MAX_WORKERS=2`, completed successfully after the new
verification script and npm command were added. It includes formatting, zero-warning
semantic lint, four configuration tests, tokens/fonts/catalog, 26 architecture and
dependency tests, strict app/spec types and Angular templates, **84 unit files /
472 tests**, and the production build. Initial **495.64 kB / 128.92 kB estimated
transfer** passes the unchanged 500 kB warning / 1 MB error budgets.

Raw command receipt: [final/ANGULAR_CHECK.txt](final/ANGULAR_CHECK.txt).
The application source hashes are retained in
[final/source-fingerprint.json](final/source-fingerprint.json). Component folder,
external-resource and shared-owner enforcement remains active through the gate.

## Fresh intercepted browser acceptance

All cases use the actual installed Chrome browser and current Angular components.
Business API responses and mutations in this table are intercepted fixtures.
Counts describe completed harness scenarios, not individual assertions.

| Suite | Cases | Verified scope |
| --- | ---: | --- |
| Countries Grid/Cards presentation | 40 | Five palettes × light/dark × EN/AR × 390/1440; rows, cards, geometry and contained width |
| Actual Grid controls presentation | 40 | Same matrix; options dialog, shared tokens and native PrimeNG filter surface |
| Chart presentation and behavior | 40 | Same matrix; actual Chart.js paint, accessible alternatives, no unnecessary read on repaint, empty/error/authority/exit |
| Report UI with synthetic PDF | 40 | Same matrix; catalog/selection/PDF lease, download/fallback and failure handling; no Crystal engine proof |
| XLSX Import presentation/success | 40 | Same matrix; real local workbook parsing, template, preview, paging and intercepted submission |
| Countries read lifecycle | 8 | Sorting/search/paging/detail, errors/retry, permissions, identity replacement, delayed response disposal |
| Actual shared Grid interactions | 8 | Header menus, column controls, filters/server mapping, options/reset, footer/focus and current screen behavior |
| Create/edit/lifecycle actions | 8 | Validation/focus, dirty protection, keyboard/record navigation, pending/uncertain outcomes, archive/restore/bulk and authority |
| Import failures | 15 | Workbook/shape/limit/permission/read-only/duplicate/network/server/pending/discard cases |
| Import additional journeys | 5 | File replacement/cancel, view discard, permission changes including pending command, keyboard page size and paging |
| Realtime lifetime/failure | 9 | Real SignalR client against deterministic transports; bursts/dedup/trailing reads/reconnect/drafts/revocation/401/403 |
| **Total** | **253** | All fresh cases passed |

The per-suite raw JSON receipts and their exact counts are registered in
[final/SUMMARY.json](final/SUMMARY.json). Representative current screenshots were
visually inspected: compact Arabic Grid, chart, import, report fixture and options,
plus wide English Cards. Full palette geometry is automated evidence; the six
retained images are representative review evidence, not a claim that every image
received separate manual approval. Existing development/vendor console warnings
remain attributed in CLEAN_CODE_IMPLEMENTATION.md; this gate does not claim that
all vendor development warnings have been removed.

## Real hosted write and realtime acceptance

New repeatable script:
`web-angular/scripts/verify-country-pilot-live.mjs`.
It defaults to the configured API and HTTPS frontend **4210**, uses independent
Cookie browser contexts, normal TLS validation and the existing demo sign-in UI.
It requires explicit `--test-writes` and is not part of the automatic CI command.

| Real hosted case | Result |
| --- | --- |
| Two authenticated Cookie sessions and authorized SignalR connections | Passed |
| Create through the shared UI; second session receives the committed change without manual refresh | Passed |
| Load/edit/save through the shared UI; second session receives updated data | Passed |
| Disconnect observer, update on the other session, reconnect and reconcile the missed change while retaining search criteria | Passed |
| Archive and restore an owned test record; second session reconciles both changes | Passed |
| Select/parse/submit a real local XLSX through the Import UI and receive the imported record on the other session | Passed |
| Bulk archive the two owned records and reconcile removal on the second session | Passed |

Receipt: [final/hosted-isolated-writes.json](final/hosted-isolated-writes.json).
Create/edit/import exercise the actual UI. Archive/restore/bulk in this hosted
suite invoke the existing authenticated API; their confirmation/selection UI is
covered by the separate current eight-case actions suite.

Only names with a unique run marker are created. The request guard rejects edits
or lifecycle commands against IDs not created by that run. A `finally` path finds
only marker-matched records, independently checks each marker, archives remaining
active records and logs out both sessions. The successful run created IDs **8,9**;
the earlier selector attempt created ID **7**. All three are verified archived.
They remain as test audit/history records; no physical deletion or modification of
pre-existing Countries was performed. No automatic mutation retry is introduced.

To rerun against a deliberately selected test API, start the HTTPS frontend on an
origin authorized by that API, then run from `web-angular`:

```powershell
npm run verify:country-pilot-live -- --test-writes
```

`ANGULAR_PREVIEW_ORIGIN` and `ANGULAR_API_ORIGIN` can select explicit approved test
origins; the API default comes from the existing host/local `.env` configuration.
The command deliberately fails without the write opt-in. It creates and archives
test records; it is not a read-only probe or a production smoke command.

## Hosted security and remaining report blocker

A separate fresh hosted read/security run passed Country reads200, authorized real
SignalR negotiation/connection, reload, logout204, anonymous401 and normal-account403
with no unauthorized Country-page request. Receipt:
[final/hosted-read-security.json](final/hosted-read-security.json).

The same run received **503 `CrystalReport.CatalogUnavailable`**, showed the shared
report error and did not render a real PDF. That overall hosted command is retained
as blocked, not relabeled a pass. Reporting/Operations must restore the real catalog
and provide authenticated AR/EN render acceptance under PROD-028/PROD-025 before
complete Phase 06/07 closure. Synthetic report UI success does not close it.

Development-server ready timing is not a production latency/load benchmark.
PROD-019 broader deployment/catalog/context/file/concurrency checks and PROD-023
backup/restore remain production-release owners. FOLLOW-016 optional advanced Grid
powers remain queued; they do not block this configured Countries acceptance.
FOLLOW-017 receives actual Countries delivery/reconnect proof while other lookup
consumers remain open. FOLLOW-018 historical missing logs are not restored; all
current results above have portable fresh receipts. FOLLOW-021's missing current
full palette/read harness proof is now satisfied.

## Failed attempts and research

Two new harness attempts failed before the successful hosted run and remain
explicitly retained:

1. HTTPS4220 was refused before any business write. A direct server probe returned
   CSRF403 with no allowed origin for4220, versus CSRF200 with explicit credentialed
   origin4210. The documented exact-origin requirement was respected by using4210;
   no CORS/CSRF/cookie policy was relaxed. Receipt:
   [final/origin-4220-failure.json](final/origin-4220-failure.json).
2. The first write run proved create and remote delivery, then used a component-host
   selector for input content projected into the shared dialog. The already-used
   accessible edit-dialog locator replaced that incorrect harness scope. Its single
   created record was archived, and both sessions logged out. Receipt:
   [final/dialog-scope-failure.json](final/dialog-scope-failure.json).

Research before the corrective attempts used primary documentation:
[ASP.NET Core credentialed CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-10.0),
[Playwright network events](https://playwright.dev/docs/network), and
[Playwright locators and retrying assertions](https://playwright.dev/docs/locators).
The retained failures are test setup/scope failures; they do not establish an
application regression and are not included in the253/7 passing case counts.

## Later corrective error path — 2026-11-01

RENDER_REJECTION_2026-11-01.md in the managed Crystal plan records actual hosted
template source-policy rejection and specific runtime/API codes. Angular now maps
only bounded known public template messages to its existing shared error state.
The new behavior is covered by unit/technical gates; no fresh browser acceptance
is claimed while Angular remains explicitly stopped. Native PDF and pilot Phase06
remain Not Verified. FOLLOW-024 owns the separate versioned global manager request.
