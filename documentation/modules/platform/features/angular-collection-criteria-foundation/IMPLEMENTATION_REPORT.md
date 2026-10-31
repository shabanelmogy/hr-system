# S1-A11 applied collection criteria / URL — implementation and acceptance

Phase06: **Verified**2026-10-30. Bounded Shared collections/SIG-06 foundation;
357recipes/planning Phase00 before runtime. Overall migration Draft. Source main
a2c56412 plus preserved dirty work; no commit/push/deploy or live API/SQL mutations.

## Delivered behavior and ownership

Optional pure createCollectionCriteriaCodec and component-scoped
createRouteCollectionCriteria, exported through Shared data. Existing MyDataGrid/
CardList/toolbar/search/filter/footer/record navigation/feedback/source identity
reused without a parallel shell. One shared collection-slots.scss fixes8px action spacing/wrapping in the actual projected Grid/CardList wrappers; the neutral card template no longer repeats the shared heading. CollectionSort remains public compatible alias
of the single CriteriaSort definition in Shared data; no duplicated DTO/state engine.

Owner explicitly approves public fields/operators/kinds/nullability/bounds/search/
sort/page sizes. No policy inferred from API DTO or auth context. Codec handles
zero-based page/size/sort/search/scalar filters, version1 bounded canonical JSON.
False/0/null/empty string survive; absent/cleared differs from nullable null.
Filters canonicalized by field/operator; duplicates, unknown properties/fields/
operators/types/version, unsafe integers/control text/oversized payload fail closed
to safe defaults with invalid resolution. Bounds apply to direct normalization as
well as serialized URLs. No truthiness/financial-number conversion or generic API
wire format. No scope/identity/permissions/session data serialized. Actual owners
must approve privacy and map current criteria to their API/export scope in S3.

Initial snapshot then NavigationEnd only; canonical equality prevents duplicate
reads on unrelated URL/fragment and invalid-to-valid equivalent restoration.
Explicit Apply/paging/sort push history, reset clears owned parameter, unrelated
params/fragment retained. No-op never navigates; malformed URL is not silently
rewritten. No effect writes URL. One programmatic navigation pending at a time;
repeat blocked, failed/denied/superseded navigation does not commit speculative
state, destroyed owners cannot navigate. Router Back/Forward/deep link/refresh/
neutral child-return preserve actual applied criteria and request identity.

Draft search/filter remains owner-local until Apply. Paging/refresh consume applied
state, criteria/size changes reset page, page-only changes preserve unfinished draft
in the neutral proof. Existing controlled source masks old scope/data; permission
remains current owner authority, never granted by URL. No network/cache/global store.

## Source review and verification corrections

Graphify/Angular collection preview/data/Router, Next useServerListState/Countries
controller/service, native CountriesScreen/listing and API GetCountriesQuery
reviewed. Their page-reset/API ownership informs the new generic adapter; no Next/
native rewrite or universal Countries wire format. Existing SQL-backed core captions
reused; catalog/resource/hash unchanged from S1-A9 (7200entries,
cba7ae1870dceb9a239811ecd0f9a4be1126577a32dfa1c748c94eb639fa0dc6).

Compile review corrected literal route-policy inference, required typed card template
binding and nullable sort adaptation to existing Grid API. Browser caught a missing
preview key; reused existing general.search, no new caption/resource. Encoded size
test initially used a sample below8192; corrected to measured UTF8 CJK payload without
changing limits. Added direct normalization capacity assertion. Angular/TypeScript/
ECMAScript/PrimeNG/i18next primary docs and exact current Shared sources reviewed.

An intermediate browser run was invalidated by our source edit triggering dev-server
reload mid-journey. No runtime workaround: reran after full check on stable source,
added HMR full-reload/component-update detection to the driver. Fresh40+8 passes;
request-count expectations and guard/cancel assertions retained.

## Acceptance evidence

| Check | Actual result |
| --- | --- |
| Angular full check |42files/252unit;38codec+8actual Router tests added to206 |
| Architecture/config |10architecture/4configuration passed |
| Types/catalog/tokens/fonts | Strict app/spec, catalog, tokens,14fonts pass |
| Production build |473.79kB initial/124.32kB estimated transfer;500kB budget unchanged, no warning |
| Criteria browser |40palette/mode/language/width plus focused8 complete flows on stable source |
| Fresh retained browser |Collection8/navigation8/login10/language20 pass |
| Shared form baseline |S1-A10 form40 retained; form/widget runtime unchanged in this slice |
| API/catalog baseline |S1-A9 API43/catalog7 retained; unchanged resource, not rerun |
| Phase00 |357recipes/planning passed before runtime |

Grid/Cards EN1440/AR390 captures and JSON portable under verification/. Neutral
dev/criteria and child editor route excluded from production route composition.
Actual browser checks no real API requests, no native dialogs or page errors.
Fixtures use simulated server filtering of the full dev dataset, never Shared
filtering a downloaded production page. Login intercepts hosted test API.

Feature regressions none at final acceptance. No business CRUD/Chart/Report/Import/
Export/files/offline store/new native/API/schema/permissions. Domain five-point/EF
audit N/A. Actual SIG-06/S3/API export scope and privacy approval remain Required;
no full S1 closure or Countries completion claimed. FOLLOW-016/FOLLOW-003 and release
PROD-002/017/019/RISK-018 retained; inherited RISK-012/date vendor NG0956 unchanged.
Full API/Next/native suites not repeated for this Shared-only technical extension.

## Reproduction and primary references

```powershell
npm --prefix web-angular run check
# Finish source/config writes before browser runs; keep preview stable.
$env:ANGULAR_PREVIEW_ORIGIN='https://localhost:4220'
$env:ANGULAR_API_ORIGIN='https://shabanhrms.runasp.net'
npm --prefix web-angular run verify:criteria-browser
npm --prefix web-angular run verify:criteria-browser -- --focused
./documentation/system/Generate-Documentation.ps1 -Check
./documentation/plans/Check-Planning.ps1
```

- https://angular.dev/guide/routing/read-route-state — reactive params/snapshots.
- https://angular.dev/api/router/NavigationExtras — query merge/history/fragment.
- https://angular.dev/api/router/RouterConfigOptions — deferred success/failure.
- https://angular.dev/guide/signals — computed equality and dependency tracking.
- https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-inference — const route literals.
- https://tc39.es/ecma262/multipage/global-object.html#sec-encodeuricomponent-uricomponent — URI encoding/capacity.
- https://primeng.dev/select and current Shared collection template contracts.
- https://www.i18next.com/principles/fallback — missing-key behavior; existing key reused.
- https://vite.dev/guide/api-hmr and https://angular.dev/cli/serve — stable-source browser acceptance.
