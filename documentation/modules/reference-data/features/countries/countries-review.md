# Countries Feature Full Review

Status: Canonical project-level reference for creating one feature across
`api`, `web-next`, and `mobile-react` by following the current Countries slice.

Reviewed: 2026-08-23

## 1. Review Manifest

| Item | Decision |
|---|---|
| Capability | Manage global country reference data |
| API profile | [Countries API Implementation Profile](countries-api.md) |
| HTTP contract | [Countries Controller Contract](countries-api-contract.md) |
| Web profile | [Countries Web/Full-Stack Applied Profile](countries-web.md) |
| Mobile profile | [Countries Mobile Applied Profile](countries-mobile.md) |
| General API workflow | [API Feature Development Workflow](../../../../guides/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md) |
| General web guide | [Server-Managed Frontend Reference](../../../../guides/web/server-managed-feature-reference.md) |
| General mobile guide | [Mobile Feature Guide](../../../../guides/mobile/MOBILE_FEATURE_GUIDE.md) |
| Documentation workflow | [Feature Documentation System](../../../../system/README.md) |
| Legacy frontend | Retired Vite client; not an implementation target |
| API ownership | Global Platform catalog; `super_admin` role plus action permission required |
| Clients | Canonical browser client and active Expo/React Native mobile client |
| Required consistency | HTTP fields, validation semantics, permissions, lifecycle, paging, sorting, errors and invalidation |
| Allowed platform variation | Layout, view set, page size, device integrations and control density |

This package follows the review pattern of a master manifest plus applied
platform evidence. The source files remain authoritative. If a profile and code
disagree, fix the profile or record a finding; do not make a new feature imitate
stale documentation.

## 2. What “Follow Countries Exactly” Means

It means reproducing this architecture and behavior:

```text
API contract and business invariants
  -> CQRS command/query slices
    -> persistence ports and implementations
      -> one transaction
        -> post-commit notification/realtime

Next route
  -> feature public API
    -> one server-list controller state
      -> typed service/query cache
        -> shared API

Expo route + route policy
  -> feature public API
    -> one server-list state
      -> Zod-validated API/query cache
        -> shared API
```

Development-only create/edit forms may use the shared web `MyForm` or mobile
`AppForm` mock-data action. It fills feature-owned valid samples for review,
never submits automatically, and is excluded from production behavior.

It does not mean copying field names, global ownership, screenshots, every
optional view or Countries' known gaps. A new feature is exact when it preserves
the contracts and boundaries while substituting its own domain decisions.

## 3. Frozen Shared Contract

### Identity, scope and lifecycle

| Concern | Countries authority |
|---|---|
| ID | Positive integer |
| Scope | Global reference data, not tenant/company-owned |
| Read lifecycle | Active, archived or all |
| Update lifecycle | Active only |
| Archive | Idempotent; blocked by active states, active addresses, Company operating scope, or Company registration; shares a transaction-owned Country lifecycle resource with State, Address, and Company Geographic Scope writes |
| Bulk archive | 1-100 distinct positive IDs; all-or-nothing; archived IDs ignored in count; sorted lifecycle resources |
| Restore | Idempotent and serialized with dependent State writes |
| Delete model | Soft archive only; no hard delete/toggle |

### Downstream address boundary

`Address` is a company-scoped location record that references an active global
Country as its required root. State and District are optional structured
references, but when supplied they must belong to the selected Country through
the State hierarchy. `CompanyCountry` controls operating scope and is not a
copy of Country data; address-owner workflows must consult that scope before
persisting a company or branch location. Currency remains Country metadata for
the current release and is not an address field.

`Company.RegistrationCountryId` separately represents the legal registration
Country. A Country cannot be archived while any non-archived Company uses it for
registration or any active CompanyCountry uses it for operating scope. The scope
write acquires every selected Country lifecycle resource so this check remains
true under concurrent requests.

### Permissions

| Capability | Stable permission |
|---|---|
| Page, lookup, detail, relation | `Countries:View` |
| Create and bulk create/import | `Countries:Create` |
| Update | `Countries:Edit` |
| Archive, bulk archive and restore | `Countries:Archive` (archive, bulk archive); `Countries:Restore` (restore) |

Both clients gate visible controls and direct handlers. The API controller and
`super_admin` role guard plus action permission remain the final authorization boundary.

### HTTP endpoints

| Method | Route | Success |
|---|---|---|
| GET | `/api/v1/countries` | Paged list |
| GET | `/api/v1/countries/lookup` | Active lookup |
| GET | `/api/v1/countries/{id}` | Detail, active or archived |
| GET | `/api/v1/countries/{id}/states` | Country plus active states |
| POST | `/api/v1/countries` | Create detail, `201` |
| POST | `/api/v1/countries/bulk` | Atomic count, `201` |
| PUT | `/api/v1/countries/{id}` | Updated detail |
| DELETE | `/api/v1/countries/{id}` | Archive, `204` |
| POST | `/api/v1/countries/bulk-archive` | Atomic archived count |
| POST | `/api/v1/countries/{id}/restore` | Restore, `204` |

### List contract

| Input | API rule | Web | Mobile |
|---|---|---|---|
| Page | One-based, minimum 1 | Zero-based UI converted in query mapper | Zero-based UI converted with `toApiPageNumber` |
| Size | API accepts 1-5000; interactive pages remain small | Default 10; options 5/10/25/50; always server-paged | Table 5, Cards 3; options 3/5/10 |
| Search | Trimmed, maximum 200 | Controlled debounced text | Controlled shared 350 ms debounce |
| Search field | Seven-field allow-list | User-selectable | API default `all` |
| Operator | Six-operator allow-list | User-selectable | API default `contains` |
| Status | active/archived/all | Grid Options/Cards/Chart criteria | Status filter modal |
| Currency | Optional exact three-letter ISO code | API-reserved; not exposed by current UI | Modeled but no visible control |
| Has states | Optional boolean | API-reserved; not exposed by current UI | Modeled but no visible control |
| Sort | Six-column allow-list plus deterministic ID | Default `createdOn DESC` | Default `createdOn DESC` |
| Total | `metaData.totalCount` | Shared pager/chart total | Shared pager |

No client may download one page and present local search/filtering as if it were
the complete dataset.

### Mutable fields

| Field | Rule | Stored normalization |
|---|---|---|
| Arabic/display name | Required, 2-100 printable Unicode characters; spaces, digits, and punctuation are allowed; control characters and line breaks are rejected | Trim |
| English/display name | Required, 2-100 printable Unicode characters; spaces, digits, and punctuation are allowed; control characters and line breaks are rejected | Trim |
| Alpha-2 | Optional, exactly two letters | Trim, uppercase, blank -> null |
| Alpha-3 | Optional, exactly three letters | Trim, uppercase, blank -> null |
| Phone code | Optional, leading `+` plus digits, maximum 10 | Trim, blank -> null |
| Currency | Optional, exactly three ASCII letters | Trim, uppercase, blank -> null |

`CurrencyCode` is deliberately an ISO integration value, not a Geography-owned
currency master. Accounting owns the Currency master; any `CurrencyId` link is a
reviewed Contracts-based integration.

Arabic name, English name, Alpha-2 and Alpha-3 are unique, including archived
rows. The handler checks conflicts and the database unique indexes close races.

### Stable errors

| HTTP | Code | Client behavior |
|---|---|---|
| 400 | Validation problem | Keep form/list context and show actionable validation |
| 400 | `Country.NoCountriesProvided` | Reject empty batch |
| 400 | `Country.CountryInUseByState` | Explain archive dependency |
| 400 | `Country.CountryInUseByCompany` | Explain legal-registration or operating-scope dependency |
| 404 | `Country.CountryNotFound` | Detail/action unavailable |
| 409 | `Country.Duplicated` | Web maps duplicate to fields; mobile currently shows mutation error toast |
| 409 | `UniqueConstraintViolation` | Stable conflict, never provider text |
| 401/403 | Authentication/authorization | Central session/access handling |

## 4. Platform Responsibility Matrix

| Responsibility | API | Web-next | Mobile-react |
|---|---|---|---|
| Business invariants | Authoritative | Mirror for UX | Mirror for UX |
| Runtime authorization | Controller/policies | Presentation + handler guards | Route + presentation + handler guards |
| List execution | EF server query | Serialize criteria/cache page | Serialize criteria, Zod parse/cache page |
| Response validation | Typed server response | TypeScript service types | Required Zod boundary |
| Paging | One-based | Zero-based Grid/Card UI; Chart resets to page zero and has no pager | Zero-based table/card UI |
| Detail | Distinct detail endpoint | Required for edit/view | Hook exists; current screen uses list row |
| Write transaction | Authoritative, atomic | Mutation request | Mutation request |
| Archive dependencies | Authoritative | Confirmation/error feedback | Confirmation/error feedback |
| Audit | DbContext + update trail | None | None |
| Realtime production | Post-commit Hangfire job | Invalidate Countries + States | Invalidate `['countries']` |
| Reports | Global managed Crystal viewer requires `super_admin` + `GlobalCrystalReports:View` and never queries tenant entitlement; tenant ActiveReportsJS templates remain a separate contract | Global Crystal viewer uses the Platform catalog/render boundary; tenant template APIs remain separate | Independent PDF/device workflow |
| Import | Atomic 1-100 bulk-create endpoint without an idempotency key | Shared bounded XLSX parse/template/preview, feature validation, locked uncertainty reconciliation | Shared bounded native XLSX parse/template/preview, feature validation, locked uncertainty reconciliation |
| Localization | EN/AR errors/notifications | EN/AR UI | EN/AR UI |

## 5. Source Evidence Register

### API

| Evidence | Proves |
|---|---|
| `CountriesController.cs` | Routes, permissions, response codes and one-slice dispatch |
| `Country.cs`, `CountryConfiguration.cs` | Domain properties, relationship, lengths and indexes |
| `CountryMappingConfig.cs` | Mutation normalization and relation/count projections |
| `GetCountriesQuery.cs`, `CountryReadStore.cs` | Query allow-lists and exact server semantics |
| Commands/handlers | Lifecycle, uniqueness, atomicity and commit-before-job order |
| Country stores/ports | Read/write ownership and persistence boundaries |
| Automatic audit trail | Created/changed/deleted/restored history ([Audit Trail](../../../../guides/api/AUDIT_TRAIL.md)) |
| Country scheduler/job | Notification/realtime integration |
| Country CQRS tests | Handler, architecture and controller evidence |
| `Domain/Application/Infrastructure/Api` ReportTemplates slices | Tenant-owned definitions, published/management split, permissions, optimistic concurrency, revisions, approved source catalog and migration |
| `GetCountryReportDataQuery` and `GET /api/v1/countries/report-data` | Stable active-country JSON array behind `super_admin` and `Countries:View` |
| `ReportTemplateFeatureTests.cs` | Definition safety, tenant query-filter isolation, unloaded revision history and append-only revisions |

### Web-next

| Evidence | Proves |
|---|---|
| Thin App Router page and `index.ts` | Route/public API boundary |
| `CountriesPage.tsx` | Screen composition and dialogs |
| `useCountryGridLogic.ts` | One list controller and guarded actions |
| `countryPageQuery.ts` | Exact criteria serialization |
| `useCountryQueries.ts`, `countryService.ts` | Cache and HTTP normalization |
| `CountriesMultiView.tsx` and view folders | Five-view Grid/Cards/Chart/Report/Import composition |
| `CountryReportPage.tsx` + shared `ManagedCrystalReportView` | Super Admin global Crystal catalog, approved filters, render lifecycle and localized report selection; no tenant/company Reporting entitlement |
| `CountryForm.tsx`, validation | Detail-backed modes and request rules |
| web Countries tests | Query/service/permission/chart/cell evidence |

### Mobile-react

| Evidence | Proves |
|---|---|
| Guarded Expo route and route manifest | Direct access and navigation policy |
| `CountriesScreen.tsx` | Server list, views, permissions and action state |
| country API/types/schemas | Serialized requests and runtime responses |
| country keys/hooks | Cache hierarchy and mutation invalidation |
| `CountryCard.tsx`, `CountryForm.tsx` | Touch actions and full-screen modes |
| `CountryReportView.tsx` | Device PDF workflow |
| mobile focused/shared tests | API, list, route and realtime evidence |

## 6. Build Sequence for a New Three-Project Feature

### Phase A — freeze the contract

1. Name the aggregate, actor and business capability.
2. Classify global/tenant/company ownership and trusted API scope.
3. Define ID, editable fields, nullability, normalization and uniqueness.
4. Define list/detail/relation/lookup/request response shapes separately.
5. Define lifecycle transitions, dependency checks and idempotency.
   For every parent/child check, identify every concurrent mutation that can make
   the predicate stale and select one shared database transaction-lock strategy.
6. Define permissions, error codes, localization and post-commit consumers.
7. Define list scale, page limits, search fields/operators, filters and sort
   allow-list with a deterministic tie-break.

Do not begin UI work while any answer is inferred from Countries rather than
specified for the new feature.

### Phase B — implement API first

1. Add entity behavior and EF configuration/migration.
2. Add Application-owned contracts and narrow read/write/validation/audit/job ports.
3. Add query/command slices and FluentValidation.
4. Add infrastructure stores, mapping, audit trail and post-commit job.
5. Register DI, mapping, validation queries, permissions and localization.
6. Add thin versioned controller and XML/HTTP documentation.
7. Prove handler transaction order, shared dependency-lock resources,
   persistence, scope, errors, lifecycle, atomic batches, controller routes and
   architecture.

### Phase C — implement web-next

1. Add centralized API and application routes plus thin page adapter.
2. Add separate types, pure query mapper and normalized service.
3. Add hierarchical React Query keys/hooks and one feature controller.
4. Build the authoritative server Grid with only API-supported sorting.
5. Add permission/read-only/lifecycle actions and detail-backed forms.
6. Add distinct initial-loading/fetching/error/retry/empty/no-results states;
   background fetching must preserve the current content.
7. Add optional Cards/Chart/Report/Import only with explicit data scope.
8. Add EN/AR, RTL, keyboard/focus/accessibility and realtime invalidation.
9. Prove pure mappings plus controller/view/mutation integration.

### Phase D — implement mobile-react

1. Add physical Expo route, typed route, route policy and module navigation.
2. Add feature types plus required Zod schemas.
3. Add endpoint/query serialization, API methods and query hierarchy.
4. Add one server-list state and compose Table/Cards through `AppListScreen`.
5. Add guarded actions and full-screen form with dirty/busy protection.
6. Add pull-to-refresh and explicit loading/error/retry/empty states.
7. Add platform-appropriate reports/import/media only when required.
8. Add paired localization, RTL, theme, safe-area, keyboard, touch and responsive behavior.
9. Register realtime/notification route mapping and add integration tests.

### Phase E — reconcile all three

1. Compare every route, field, nullable member and response shape.
2. Compare query serialization to API allow-lists and defaults.
3. Compare form validation/normalization to backend rules.
4. Compare permissions and lifecycle predicates.
5. Compare mutation success/error behavior and cache invalidation.
6. Verify post-commit jobs refresh every affected client/cache.
7. Run all project gates and manual responsive/localization matrices.

## 7. Intentional Platform Differences

| Area | Web | Mobile | Rule |
|---|---|---|---|
| Main list | Dense Data Grid | Touch Table/Cards | Same server query, platform layout may differ |
| Search controls | Column + operator + text | Text using API defaults | Hidden criteria must not surprise users |
| Page size | 10 | 5 Table / 3 Cards | API limit remains shared |
| Analytics | Page-scoped Chart | None | Never invent client-side global metrics |
| Import | XLSX preview/bulk create | None | Mobile absence is explicit |
| Report output | Global Crystal remains default for Geography; published tenant ActiveReports templates are a separate viewable/authorable capability | Global Crystal PDF preview/share/download; tenant template behavior remains separate | Global Crystal is independent; ActiveReports templates use the main API, revisions, RowVersion, and only the approved relative Countries JSON source |
| Form surface | Modal/dialog | Full-screen modal | Same request and lifecycle contract |

Parity means equivalent business capability and truthful criteria, not
pixel-identical UI.

## 8. Findings and Required Handoffs

| ID | Area | Finding | Required handling |
|---|---|---|---|
| C-F01 | Web | Resolved: unsupported ID, Phone, States-count, Updated, Status, and Action sorting is disabled and covered by a column-contract test. | Keep visual sort affordances synchronized with the API allow-list. |
| C-F02 | Web | Resolved: Grid, Cards, and Chart expose the active search field/operator and shared visible criteria; API-reserved filters are not silently active. | Expose or reset all active criteria per view. |
| C-F03 | Web | Resolved: shared XLSX parsing now rejects more than 100 non-empty data rows before mapping or mutation while the API keeps the authoritative atomic bound. | Preserve both client feedback and server validation. |
| C-F06 | Web | Resolved: Import now validates extension/MIME/size, XLSX container, first-sheet presence, exact ordered headers, duplicate headers, empty files, formulas, and unexpected columns instead of blindly discarding row 1. | Keep feature headers/mapping separate from the shared parser. |
| C-F07 | Web | Resolved: ambiguous no-response/5xx submissions are locked as uncertain and reconcile through a refreshed Grid; stable 4xx batches are failed and never conflated with uncertainty. | Do not add blind retry without API idempotency. |
| C-F04 | Web tests | Resolved: page wiring covers criteria/loading/action/form composition, service tests assert bulk bodies, and query-hook tests prove mutation invalidation order. | Keep representative integration wiring beside pure-unit coverage. |
| C-F05 | Web reports | Resolved: global managed Crystal authorization is centralized (`super_admin` + `GlobalCrystalReports:View`, no tenant entitlement query); ActiveReportsJS tenant template/revision persistence remains a separate contract. | Preserve both explicit scopes; register every future feature/data source in the server allow-list and prove tenant isolation. |
| C-F08 | API lifecycle | Resolved: Country archive and State create/update/restore now share transaction-owned Country lifecycle resources, closing the stale dependency-check race. | Every dependent mutation must participate in the same database invariant boundary. |
| C-F12 | API lifecycle | Resolved: Company registration/operating scope now blocks Country archive and scope writes share selected Country lifecycle resources. | Global master lifecycle must remain consistent with every tenant/company reference. |
| C-F09 | Web bulk | Resolved: oversized eligible selections are rejected at 100 with localized feedback and rechecked by direct submit handlers. | Mirror API limits without truncation; keep API validation authoritative. |
| C-F10 | Web loading | Resolved: background refetch preserves current Grid/Card/Chart content and shows a non-destructive progress indicator. | Never conflate initial loading with background fetching. |
| C-F11 | Web import | Resolved: Country and State Import submit handlers enforce read-only and feature create permission directly; State keeps Countries lookup permission separate. | UI visibility is never the only mutation guard. |
| C-F13 | Web pagination | Resolved: an equivalent `sortModel` array received a new identity during the page-2 loading render, so MUI emitted a sort change and reset its controlled pager to page zero after the request had succeeded. Shared Grid code now stabilizes sort-model identity and row count, owns no competing server clamp, and has a real descending-order browser regression. | Preserve one server page writer, stable controlled-model identity, stable loading totals, and the existing centered record navigator for every Grid consumer. |
| C-M01 | Mobile | Resolved: unexposed currency/state-presence filter state and serialization were removed from the presented mobile contract. | Never retain active criteria without visible controls. |
| C-M02 | Mobile | Resolved: the unused detail hook/key were removed because the list row contains every mutable form field. | Hydrate detail only when the list is not authoritative. |
| C-M03 | Mobile tests | Resolved: Countries and States now cover screen composition/actions/permissions and mutation transport/invalidation. | Keep representative integration tests beside boundary tests. |
| C-D01 | API docs | Controller contract omitted search field/operator although code supports them. | Corrected in this review; keep contract docs synchronized. |

These findings are not behaviors to clone. Resolve them in Countries or avoid
them in the next feature.

## 9. Verification Gates

Angular D29–D32 bounded consumer correction Verified: one-column shared Add/Edit/counter badges and shared edited active flash, predecessor after archive and keyboard navigation. Current evidence platform/angular-countries-edit-workflow/verification/FORM_RECORD_ACCEPTANCE.md. API/entity/schema/Next/native unchanged, migration N/A. Full Countries views/source/host gates remain Required.

Angular D28 bounded context filter/icons is Verified separately in platform/angular-grid-capabilities/verification/CELL_CONTEXT_ACCEPTANCE.md. Countries exposes raw status/date values through shared filterValue; reset replaces optional structured criteria. No API/Next/native runtime change. Prior owner evidence and full-pilot limitations remain.

Angular consumer handoff2026-10-30: bounded Create/Edit and archive/restore/bulk are Verified in the separate migration features angular-countries-edit-workflow and angular-countries-lifecycle under documentation/modules/platform/features/. Their CURRENT_EDIT_ACCEPTANCE.md/CURRENT_LIFECYCLE_ACCEPTANCE.md own executed Angular evidence. API contracts/entity/schema and existing Next/native consumers remain unchanged; no host business-write or full Countries pilot claim. Shared success Toast/general error Modal, translated pinned Actions header/cells and current-page native selection are Angular presentation capabilities. Required Chart/managed Crystal-PDF/Import/full-pilot children remain queued or preflight-only.

### API

```powershell
dotnet test api/Modules/ReferenceData/ErpSystem.Modules.ReferenceData.Tests/ErpSystem.Modules.ReferenceData.Tests.csproj --filter CountryCqrs
dotnet test api/ErpSystem.sln -c Release
dotnet build api/ErpSystem.sln -c Release
```

### Web-next

```powershell
npm.cmd run check:architecture
npm.cmd run lint -- --quiet
npm.cmd run type-check
npm.cmd test -- --run
npm.cmd run build
```

### Mobile-react

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run check:architecture
npm.cmd test
npm.cmd run check
```

Focused checks prove only their named behavior. Completion requires the full
gates or an explicitly recorded blocker, plus browser/device verification for
permissions, read-only, lifecycle, EN/AR, LTR/RTL, responsive layouts,
loading/error/empty/retry, dirty/busy forms and realtime refresh.

### S3-A5 verified Angular charts — 2026-10-31

Phase06 Verified on 2026-10-31 for exact S3-A5 and requester Cards refinements.
Full npm run check passed: 75 files/417 tests, 4 configuration/12 architecture,
types/catalog/tokens/fonts and production build. Initial498.98kB/130.00kB estimated
transfer; unchanged500kB warning budget. Chart renderer212.09kB/63.63kB remains lazy.
Actual authenticated shell browser40 passed five palettes × light/dark × EN/AR ×
390×780/1440×1050. Native canvases painted, source data/counts/zeroes/UTC timeline,
theme/locale repaint without GET, reduced motion, text alternatives, first-page
reset with criteria, retry, stale authority mask and destruction verified. Native
scroll reaches the lower plots; desktop chart rows fill the available viewport.
Current Next source8 comparisons and fresh command/form/record regressions8 pass.
See verification/CURRENT_CHART_ACCEPTANCE.md and durable JSON/screenshots/logs.
No hosted business writes/deployment, schema/migration, native-device or full-pilot
acceptance. PROD-019/023, S1-A14/FOLLOW-016 and remaining pilot children stay open.

P-001 Countries collection with embedded Chart; current Next Chart source is the
reviewed baseline. Verified same four plot semantics/order, summary metrics,
font/title16px/600, card padding8px/radius16px, theme palette, source captions and
contained responsive scroll. Native PrimeNG Chart/Chart.js replaces Recharts; tick
placement, bar sizing and pie geometry follow that engine and are not certified as
pixel-identical plot internals. Full five-view visual acceptance remains S3-A8.
Requester D33 explicitly removes Chart toolbar/header Filter and scope paragraph;
Chart inherits Grid/Cards criteria and resets page1. Cards retains one shared
single-row toolbar/toggle, short accessible arrow+Asc/Desc, Search max400px and
Sort By220px. Narrow viewports scroll the toolbar internally. No feature-local shell.

Canonical Angular proof: documentation/modules/platform/features/angular-countries-chart-view/verification/CURRENT_CHART_ACCEPTANCE.md. Existing API/native runtime unchanged; no domain/schema migration. Native rendering remains retained, new native work Excluded.

### S3-A6 Countries Report — 2026-10-31

Phase06 Verified2026-10-31 for exact S3-A6 Countries managed Crystal/PDF integration.
Full npm run check:75files/422tests,4configuration/12architecture,types/catalog/
tokens/fonts/build passed; initial499.84kB/130.16kB estimated transfer, unchanged
500kB budget. Entry437recipes/planning passed before application edits.
Actual authenticated Countries Report40 palette/mode/EN-AR/390×780/1440×1050 cases,
focused failure/authority/mobile-PDF-fallback8, current Next source8, retained command8,
Chart8 and standalone Reporting8 passed. Durable JSON/logs/screenshots are in verification/.
No live hosted render/business write, actual Crystal engine/RPT output, native device,
schema/migration, full five-view pixel acceptance or production release claim.

Countries consumes GlobalReportView and globalReportAllowed through Reporting's
public API, lazy inside the existing collection workspace. Exact Countries:View
workspace authority and super_admin + GlobalCrystalReports:View gate visible/direct
Report entry; current read-only actors may render. Losing authority destroys the
embedded report and falls back to Grid. Header Refresh reloads report catalog/source
and regenerates; other views keep existing refresh. Header Filter controls report
criteria without discarding form/selection or rerendering. No nested PageHeader.
Reporting keeps existing catalog/service/PDF validation/cancellation. Applied filters
and selected report now belong to the immutable actor; replacement clears them and
draft fields. Explicit reload regenerates even if source/hash is unchanged. Shared
ReportWorkspace reference appearance uses280px sidebar/gap64 and contained scrolling;
FormContainer sidebar appearance keeps Search/Reset full width; PdfViewer fill mode
retains safe open/download, capability fallback, lease cleanup and finite inline area.
Existing standalone report defaults remain compatible; no new package or translation key.

Current source CountryReportPage/ManagedCrystalReportView/ReportViewer was rendered
at identical viewports/locales/modes with the same synthetic report catalog and PDF.
Verified independent NameAr/NameEn criteria, report selector, first catalog report,
source SHA256 request, desktop280px sidebar/gap64, compact stacked layout and global
permission rule. Source fixture lacks the report grant, so browser interception adds
GlobalCrystalReports:View to that fixture session only; no real permission is changed.
Retain the approved S3-A0 draft/applied correction: language/selection uses applied
values; Reset clears and applies once. Angular uses the existing shared labeled fields,
validation/counters, native PrimeNG controls and explicit safe PDF Open/Download bar;
Next uses its MUI field/iframe presentation. Label/input heights and button styling
are not certified pixel-identical; remaining source visual reconciliation is S3-A8,
not implicitly closed by bounded Report behavior acceptance. Native browser PDF
internals are opaque: iframe assignment is not proof that an RPT engine rendered.
PDF-disabled cases prove fallback/download bytes; valid synthetic PDF is not real RPT output.

Canonical proof: documentation/modules/platform/features/angular-countries-report-view/verification/CURRENT_REPORT_ACCEPTANCE.md. New native UI Excluded; current native retained.

## 10. Final Reconciliation Checklist

### Shared API contract

- [ ] Ownership scope and database filters are explicit.
- [ ] List/detail/relation/lookup/request contracts remain separate.
- [ ] Nullability and normalization match in API, web and mobile.
- [ ] Pages are one-based only at the API boundary.
- [ ] Search fields/operators, filters and sort allow-lists match clients.
- [ ] Every sort has a deterministic tie-break.
- [ ] Stable errors and EN/AR keys exist.
- [ ] Permissions and lifecycle behavior match all layers.
- [ ] Batches define size, duplicate behavior and atomicity.
- [ ] Save completes before notification/realtime scheduling.

### Web-next

- [ ] Thin route imports the feature public API.
- [ ] One controller owns every server-list criterion.
- [ ] Unsupported grid sorting is disabled.
- [ ] Edit/view hydrate authoritative detail.
- [ ] Actions are guarded by permission, read-only and lifecycle.
- [ ] Optional views state their true data scope.
- [ ] Crystal remains the separately selectable default; ActiveReports published and management catalogs do not cross tenants, and browser-native definitions expose neither database credentials, absolute API hosts, nor unrestricted SQL.
- [ ] Mutations and realtime invalidate all affected keys.
- [ ] EN/AR, RTL, accessibility and responsive states are verified.

### Mobile-react

- [ ] Physical route, typed route, policy and navigation agree.
- [ ] Every JSON response is runtime validated.
- [ ] Controlled server pages are never filtered/sliced locally.
- [ ] Touch actions and direct handlers fail closed.
- [ ] Full-screen form handles keyboard, safe area, dirty and busy exits.
- [ ] Phone/tablet, orientation, text scaling and theme matrix is verified.
- [ ] Reports/files use platform-safe temporary storage and cleanup.
- [ ] Realtime and notification actions route to the feature correctly.

### Evidence

- [ ] Focused source tests pass.
- [ ] Full API, web and mobile gates pass.
- [ ] Local documentation links resolve.
- [ ] Findings are fixed or have an explicit owner/decision.
- [ ] No retired Vite client implementation was treated as authority.

The feature is complete only when the checklist is supported by current source,
test and runtime evidence. Similar-looking screens are not evidence of the same
feature behavior.


## Native advanced column-filter extension — 2026-10-30

Authorized owner change: extend existing global Countries list CQRS/read-store with
optional typed bounded per-column filters and a POST /api/v1/countries/query read
endpoint. Full frozen rules, actor/permission, compatibility, validation/edge and
impact/verification matrices are in the migration child's
ADVANCED_FILTER_CONTRACT.md. No entity/schema/write/lifecycle changes. Existing
GET/Next/native clients stay compatible; new native advanced-filter UI is Excluded
from Angular migration. Angular menu uses real AND/OR criteria before count/paging;
no current-page emulation. Source implementation/verification is in progress, not
hosted publication or complete Countries acceptance. FOLLOW-016/PROD-019 own the
remaining combined-query and deployed catalog integration.
