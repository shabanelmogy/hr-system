# Audit review acceptance — 2026-11-10

Verified corrective scope: Audit export denial and translated detail filters;
bounded shared criteria; Audit-only 25-row pages; opt-in real server totals with
sequential cursor navigation; shared compact footer; icon-only Grid options in
the same row as simple search at 390px and the supplied 493px screenshot width.

## Independent outcomes

| Outcome | Result and boundary |
| --- | --- |
| Functional | Verified: 8 normal + 8 compact Audit journeys, 32 negative cases; GET/POST filters, cursor cross-page record navigation, real totals and missing-total fallback, options, selection, translated detail filters and export denial |
| Visual | Verified: 20 contexts / 36 layout snapshots, EN/AR and Light/Dark; 390x740, 493x1057, 800x740, 1440x740, 844x390; expanded/collapsed criteria, selection none/1/25, navigation open/closed and reduced CSS viewport equivalent to 125% zoom; uncut nonoverlapping footer and same-row settings/search assertions |
| Reuse | Verified: the same shared footer with Countries at matching effective viewports in all 20 contexts; Countries retains its default 10 rows; no Page menu or duplicate arrows |
| Other consumer | Verified: 16 Global Report Manager cases with real Versions-dialog Publish clicks and local error feedback; EN/AR, themes, compact/landscape/navigation |
| Accessibility | Verified for exercised controls: names, keyboard row/detail navigation, criteria focus, selection controls, usable actual cell hit targets; icon retains translated accessible name. Full assistive-technology audit Not verified |
| API/SQL | Verified locally: full restore/build/test solution, 1,369 tests passed / 3 existing opt-in browser tests skipped; trusted SQL2017 Windows authentication. Source count uses the exact same predicates, excludes cursor/Take, and aggregates without loading rows |
| Hosted | Not verified: no publication or hosted business mutation; updated ErpSystem.Api is required for totals; PROD-035 owns deployment, real data scope and representative-volume count latency |

## Builds and commands

Production assets serve normal/compact/negative Audit and Report Manager suites.
The final full Angular check rebuilt 89 byte-identical production assets. The
development build serves the layout matrix because the existing Countries
reference route `/dev/countries` is deliberately excluded from production. Both
build file hashes and current owner source hashes are retained in this folder.
Browser API responses are synthetic and never contact the hosted business API.
No development server was started or restarted for verification.

- `npm run format`; `npm run check`; final `npm run check:format`.
- Angular full gate: 1,055 tests / 198 files, 33 architecture/dependency tests,
  4 configuration tests, format/lint/types/catalog/tokens/fonts and production build.
- `npm run build -- --configuration development --output-path ../.codex-tmp/audit-layout-development-20261110`.
- `node scripts/verify-system-audit-browser.mjs` and `--compact`.
- `node scripts/verify-system-audit-failures-browser.mjs`.
- `node scripts/verify-system-audit-layout-browser.mjs`.
- `node scripts/verify-report-manager-review-browser.mjs`.
- API: `dotnet restore ErpSystem.sln --artifacts-path artifacts/audit-count-20261110`;
  `dotnet build ErpSystem.sln -c Release --no-restore --artifacts-path artifacts/audit-count-20261110`;
  `dotnet test ErpSystem.sln -c Release --no-build --no-restore --artifacts-path artifacts/audit-count-20261110`.
  SQL test env points to `.\SQL2017` master with Integrated Security; tests own
  isolated databases. No production database schema change or migration.

## Failures, warnings and limits

`baseline/landscape-covered-row.png` and its log preserve the rejected sticky
footer covering a real data cell. The shared footer now stays in normal flow.
Other baseline images are verifier diagnostics, not accepted product screenshots.
Verifier repairs normalized Windows build paths, located the Countries header
outside its collection node, searched fixture row 24 after the page changed from
50 to 25, and awaited actual drawer-mask removal before row hit tests. None was
used to remove or weaken the row-hit, overlap or navigation assertions.

The initial API runner used an outside-api artifact path and unavailable LocalDB;
the corrected full run inside api with SQL2017 passed without weakening tests.
The final API build has 483 analyzer warnings and zero errors. Angular retains
the visible initial budget warning (588.69kB /151.21kB estimated transfer) and
three component-style warning budgets; RISK-020 owns the current release risk.
Node fixture loading emits the existing module-type warning.

Counts are current reads rather than an atomic snapshot across modules. Cursor
availability remains authoritative; a known total never enables an unavailable
last-page jump. No native browser zoom, screen reader, hosted count/SQL volume
benchmark, Next/Mobile journey or deployment acceptance is implied.

Inspected screenshots include EN light 493 collapsed, AR dark 493 expanded,
EN/AR 390 footers, short landscape data/footer and the matching Countries view.
The machine-readable receipt records exact files and hashes.
