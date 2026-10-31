# S1-A3 — Shared collection foundation

Phase06: **Verified** for the exact generic technical kit on2026-10-29.
Documentation closure is reconciled separately in ROADMAP and the child contract.
Source baseline main a2c56412; no business screen, new API contract/schema/grant or
native UI is delivered by this slice. Overall migration remains Draft.

## Delivered behavior

Shared public MyDataGrid<T>/erp-data-table and CardList<T> compose the existing
actions, text/select controls, PopoverPanel, FeedbackState and ScrollViewport.
Actual PrimeNG Table, Checkbox and Paginator stay internal. Typed cell/card/empty
templates and toolbarContent/toolbarFilters slots carry caller-owned composition.

Remote single sort, search/registered field/operator/filter intents and page/size
emit controlled commands. Shared never fetches data, sorts/filters a server page,
or writes a competing page clamp. The caller owns committed criteria, debounce,
cancellation, scope, permissions, API conversion and out-of-range recovery.

Only matching ready scope/criteria/page/size rows render. Safe same-query counts
can survive replacement loading; unknown stays Unknown. Active row, page-only
eligible checkbox selection and intended cross-page record targets are separate.
Error/scope/criteria/size changes discard pending targets. A short unknown page crosses to the next requested page; missing same-page keyboard targets are ignored without dereferencing an absent row. Two additional edge tests cover this final review finding. Keyboard focus returns
to the matching record; cell actions/checkboxes do not activate another row.

Three densities, column visibility/protected last column/reset, bounded Table
scroll and Cards ScrollViewport, finite feedback/retry, locale counts and RTL
are implemented. /dev/collections is excluded by production route replacement;
neutral synthetic fixtures are confined to this technical development harness.

## Executed verification

| Check | Actual result |
| --- | --- |
| Phase00 entry |285 recipes and planning passed before bounded runtime authorization |
| Angular full check |27 files/119 unit tests,10 architecture checks,4 API configuration checks; tokens/fonts/catalog/types and production build pass |
| Production build |440.64 kB initial /116.73 kB estimated transfer; unchanged500kB warning budget, no budget warnings |
| Collection browser |40 palette/mode/language/viewport cases, Table+Cards; eight full interaction/state flows |
| Final interaction refinement |8 EN/AR/light/dark/390/1440 cases: exact52px standard rows,36px compact,56px headers, paging/record focus and RTL horizontal card keys |
| Final footer layout |8 render/geometry cases after centering record navigation; no page overflow |
| Current Next comparison |8 matched viewport/mode/language Grid+Cards captures; actual Next row52/header56/footer53 |
| Retained Next |type-check pass;3 files/11 Grid/controller/record-navigation tests pass; local installed version limitation is RISK-012 |
| API localization |40 CompanyLocalization/SystemLocalization tests pass; existing analyzer warnings remain |
| Root catalog policies |7 tests pass; generator check21 sources/7138 keys |
| Login/context/language regressions |10/24/20 browser cases pass with deterministic interception; not hosted live verification |
| Documentation |Canonical books/manifest/recipes regenerated and checked; planning check repeated at closure |

Commands: npm --prefix web-angular run check; node web-angular/scripts/verify-collection-browser.mjs;
repeat with --focused and --focused --layout-only; node web-angular/scripts/verify-collection-reference.mjs
against the existing Next e2e backend; existing login/module-context/language browser scripts with
ANGULAR_PREVIEW_ORIGIN=https://localhost:4220 and ANGULAR_API_ORIGIN=https://shabanhrms.runasp.net.
The login driver now accepts the same API-origin override instead of hardcoding a local fixture target.
API command: dotnet test api/Modules/Platform/ErpSystem.Modules.Platform.Tests/ErpSystem.Modules.Platform.Tests.csproj
--filter "FullyQualifiedName~CompanyLocalization|FullyQualifiedName~SystemLocalization".

Portable measured results and paired captures: [verification](verification/README.md).
Build, broad fixture matrix, final keyboard and final layout runs are separate evidence;
do not describe render-only cases as additional interaction coverage.

## Source fidelity and deliberate technical differences

The comparison uses the actual current Next MyDataGrid/Countries composition, not
a recreated reference. Preserve search controls/options, density,52px rows,56px
headers, min52px footer, separate record/page movement and bounded scrolling.
Record controls are centered within their footer region. Mobile controls wrap.

The harness is outside the authenticated shell and uses neutral columns/content;
its page bounds and controls are compared within that scope. Owner Countries
fields, flags, counters, quality metrics, mutations and Chart/Import views belong
to its future pilot. CardList reuses existing shared SurfaceCard for a generic
title/content scaffold; domain card sections remain typed owner templates.
The kit shares a footer between adapters, where current Next Cards has its own
page composition. PrimeNG sort/checkbox/paginator visuals replace MUI; no MUI or
React runtime is copied. Bulk selection is explicitly page-only and independent
from active-record navigation. Unknown totals use truthful previous/next controls;
out-of-range recovery remains with the caller instead of an implicit clamp.
These are explicit technical adapter decisions, not a claim of completed Countries
screen parity. Future Countries must compare its actual fields/actions/required views.

## Localization and release boundary

Eleven collections captions were added to canonical core EN/AR and emitted through
the normal schema3 API web catalog. Shared bootstrap includes common collection,
pagination and feedback captions; there is no second localization store. New web
catalog fingerprint: fde1c53c60ffcd1c19f51a55811b4e08190457848b5a69b9083f1e518e2385d8.
Deploy the matching generated API resource with these clients before claiming
hosted SQL override acceptance (PROD-019). Strict catalog matching stays enabled;
this turn did not publish the host or verify new labels persisted in SQL.

FOLLOW-012 owns the translation Settings editor persistence/reset/isolation proof;
FOLLOW-014 reference/date/dirty/structured editors; FOLLOW-015 remaining workspace;
FOLLOW-016 advanced collection options. PROD-002/017/019 and RISK-018 remain scoped
release gates. RISK-012 records this workstation's retained Next dependency drift.
No Angular feature regression remains from executed checks. Passing focused checks
does not close inherited full-repository or external-release gates.

## Domain/UI audit and closure scope

Create/Edit/structured View/List business flags/mock-generator journeys: N/A on
both Web and Native, because this is a presentation foundation with no domain
change. Generic read display/selection/filtering is verified above; business CRUD,
mock generation and actual API/DB integration remain their owning consumer gates.
Native AppDataTable is retained unchanged; no new native runtime acceptance is claimed.
Database migration/live schema change: N/A, no persistence model changed.

ERP-03 keyboard productivity and ERP-10 bounded paging/display have scoped technical
proof; actual consumer/production-size acceptance remains S3. ERP-01 typed API
generation, ERP-02 lookup and ERP-04 structured editors remain their S1/S3 contracts;
ERP-05..09/11..12 write/lifecycle/audit/release work is N/A to this no-write kit.
SIG-02 local presentation lifetime, SIG-03 finite feedback, SIG-06 controlled
criteria ownership, SIG-07 Shared compatibility and SIG-08 layout have technical
evidence above. SIG-01 lookup, SIG-04 files and SIG-05 drafts remain consumer work.
No URL/export round-trip or live business acceptance is inferred from these tests.

Customer Education: N/A — technical S1 kit; no new business journey. A separate
technical review/handoff guide may be issued only after this Verified decision.

## Gate classification at handoff

- Feature:119 unit tests and scoped checks passed; final10 collection edge tests
  repeated after the last missing-target guard and passed. No observed feature failure remains.
- Inherited repository findings: API analyzer warnings; planning emits the same
  pre-existing education-module and erp-platform-template contract warnings.
- Environment: retained Next installed/locked version drift, canonical RISK-012.
  No retained Web dependency/security release gate is claimed from this runtime.
- Manual release: new matching hosted API catalog/SQL overrides and the remaining
  scoped PROD-002/017/019/RISK-018 checks. No remote publish was performed.
