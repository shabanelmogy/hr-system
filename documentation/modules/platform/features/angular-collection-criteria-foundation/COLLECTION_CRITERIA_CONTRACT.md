# Frozen Shared collection applied criteria / URL contract

S1-A11 completes a SIG-06 foundation slice within existing Shared collections,
not another global query/state engine. G0-G3 frozen;357 recipes/planning/current-
only Phase00 before runtime. Remaining G4 PROD-002/017/019/RISK-018 release-only.
No business/API/schema/native/resource change; overall migration Draft.

## Existing-System Relationship Review

Graphify/current Angular collection.types/CollectionPreview/scoped-read/Router,
Next useServerListState/useCountryGridLogic/countryService, native CountriesScreen/
shared listing and API GetCountriesQuery reviewed. Existing Shared list accepts
opaque criteriaKey; preview owns local draft/search/debounce and paging but has no
URL restoration. Next/native reducers reset page on search/filter/sort/size, their
current source is not a URL persistence mechanism. API Countries owns concrete
1-based page/query filters and bounds; do not copy it as universal wire format.

Reuse actual MyDataGrid/CardList/toolbar/search/OptionSelect/filter slot/footer/
record navigation/feedback, source/query identity and stale result guards. No raw
vendor Grid or new shell. Add optional domain-neutral pure codec and component-
scoped Router bridge under Shared data; no global store/network/cache. Move the
sort interface to data criteria and retain CollectionSort as a public type alias
for backward compatibility if needed; no DTO duplication or business policy.

## Typed allowlist and bounded serialization

CollectionCriteria:zero-based pageIndex, pageSize, nullable sort{field,direction},
nullable search{field,operator,value:string}, readonly filters{field,operator,
value:string|boolean|safe integer|null}[]. Codec URL envelope version1. Canonical
JSON key order; filter order canonical by field/operator, duplicate field/operator
rejected. No truthy filtering: false/0/empty string/explicit nullable null survive;
absent filter differs from null, clear removes it. String decimals remain strings.
No Number coercion/financial semantics, Dates, nested objects or array values.

Owner policy must explicitly mark each searchable/filterable field approved-public,
allow fields/operators/scalar kinds/nullability/ranges/length and sort fields/page
sizes/default sort. No automatic policy from DTO or private/personnel/financial
URL values; each actual owner separately approves allowed public criteria. No URL
scope/permission/session/company/user authority. Search optional opt-in, otherwise
excluded. Unknown fields/operators/properties, unsafe integers/wrong types/invalid
sort/version/duplicates all fail closed to defaults; no partially applied criteria.
Page0..100000; positive allowlisted page sizes; at most8filters; each string max128
UTF16 units/no C0/control characters; payload max2048 units/8192 URI-encoded chars.
Policy config invalid throws developer error, not a silently weakened policy.

Codec parse returns defaults plus valid flag/reason on malformed/unapproved/over-
sized input. No automatic URL rewrite/network request for invalid restore beyond
the caller's one safe default query. Programmatic normalization validates too.
Key for criteria excludes page/size; full URL key includes them. Apply helper
resets page only on actual search/filter/sort/size change; page-only retains other
applied values. Owner still maps vendor events/criteria to API wire/export scope.

## Router/history/lifecycle contract

One owned query parameter (default list) with validated name, never localStorage.
Initial route snapshot then successful NavigationEnd only; do not derive committed
query state from speculative navigation or write from effects. Angular deferred URL
updates retained. Distinct canonical values suppress redundant reads when unrelated
query params/fragments change. Preserve unrelated params/fragment on explicit Apply.
Push history on changed Apply/paging/sort; reset clears owned parameter; no-op never
navigates. Malformed URL remains until explicit successful Apply/reset, no loop.

Only one programmatic navigation in flight: second Apply returns blocked, owner can
retry; no queue or last-write race. Failed/denied/superseded navigation returns a
typed canceled outcome and does not commit speculative state. Destroyed component
cannot navigate/emit stale results. Router Back/Forward/deep links/refresh/editor-
return restore actual URL. Actual scope/permission rechecked by owner; URL never
grants access and pending context replacement masks old results by existing source
identity. No authorization decision inside codec, no business write/transaction.

Draft search/filter stays owner-local until explicit Apply; paging/refresh/export
consume applied snapshot. Page-only changes preserve unfinished draft in the proof;
changed filter restoration resynchronizes it. No debounce/auto-apply hidden in Shared.
Export mechanism/business scope Excluded in technical kit, actual S3 ERP-10 remains
Required and must consume exact applied criteria with explicit authorized scope.

## UI Pattern, Rules, Edge Cases, Impact

Web P-001/C-01 neutral dev/criteria list + read-only editor-return proof Required;
MyDataGrid/CardList current source references. Required grid/card, search/filter/
sort/page/refresh/feedback; technical child detail only. Business CRUD/Chart/Report/
Import/Export/files/offline store/new native views Excluded independently. No new
captions: existing SQL-backed core labels and Shared controls; current catalog hash
unchanged. No actual domain mock generator, EF/five-point business audit N/A.

Rules:Shared pure schema/serialization/page reset/navigation lifetime; feature owns
privacy approval/API mapping/auth/scope/load/cancel/draft/export. Existing Shared
collection presentation continues controlled with query identity, no local filtering
of a server page. Neutral simulated-server fixture is dev-only and explicitly so.
Edges:false/0/null/clear/empty/invalid/oversized/version/sort/bounds/duplicate params,
same-key no-op/unrelated URL/rapid pending/cancel/destroy/Back/Forward/deep link/
refresh/editor-return/scope/denied access/request counts. Structured input N/A scalar
filters only. Impact:Add codec/bridge/tests/dev proof; Extend existing data public
API and sort alias only; Reuse collection/source/lifecycle/localization; Retain API/
Next/native; N/A schema/security/permissions/transactions/business CRUD.

## Verification

Pure codec matrix and actual RouterTestingHarness for distinct/no-op/guards/history/
pending/destroy. Browser40palette/mode/EN-AR390/1440 plus focused8 full draft/apply/
false0null/malformed/BackForward/refresh/editor-return/scope/request-count flows.
Full Angular unit/types/architecture/catalog/tokens/14fonts/build500kB; retained
collection8/form8/login10/language20 and unsaved-navigation8 as affected. API43/
catalog7 from unchanged S1-A9 resource retained explicitly, no rerun/live writes.
357recipes/planning/diff before Verified/technical guide/closure. SIG-06 actual S3
pilot and applied export policy still required; no full S1 acceptance from harness.

## Primary references

- https://angular.dev/guide/routing/read-route-state — reactive route/query state.
- https://angular.dev/api/router/NavigationExtras — merge/preserveFragment/history.
- https://angular.dev/api/router/RouterConfigOptions — deferred URL and failures.
- https://angular.dev/guide/routing/router-reference — NavigationEnd/Cancel/Error.
- Existing SIGMA_ACCEPTANCE section8 and current Next/native/API source ownership.

Acceptance visual finding2026-10-30: actual projected-action wrapper prevented parent flex gap from spacing multiple actions. Extend the existing Grid/CardList wrapper with one shared collection-slots.scss for generic8px gap/wrapping; no feature-local toolbar shell. Neutral card template must not repeat the shared rowLabel heading. Verify both projections at390/1440 and refresh final captures/checks before Verified.
