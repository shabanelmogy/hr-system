# Tenant Management and Super Admin navigation — 2026-11-06

## Scope and acceptance

Tenant Management implements the current Next Grid/Cards and five-tab create/edit
workflow at `/super-admin/tenants`. Requester amendment adds the full-page create route `/super-admin/tenants/new`, while Edit retains its dialog. D42/S4-A1 remains the authority. Phase06 is Verified within the authorized Angular client scope: current full quality gates, full-page create/edit browser and scoped source review pass. Navigation24cases also pass. The parent Super Admin goal remains
Active; later Tenant-admin/audit/error/settings/operational tools and final review
are still Required.

The preceding `TENANT_FOUNDATION_2026-11-06.md` and its receipt are historical
transport/native-form/read checkpoints. They do not certify the subsequent UI or
shared/navigation changes. The current acceptance receipt is separate.

## Implemented source parity

| Surface | Current Angular behavior and reference |
| --- | --- |
| Collection | Shared MyDataGrid and CardList; authoritative server page/search/sort, reset, record navigation and Grid options. Defaults name ASC/page1/size10/includeArchived=false. Next source: TenantManagementPage and TenantManagementMultiView/TenantsDataGrid/TenantsCardView. |
| Identity | Identifier/name/enabled; create defaults Free/1 admin/5 users/current UTC start and default catalog grants. |
| Subscription | Plan/status/start/end/admin and user limits, positive Int32, admin<=user and usage floor; date-only values become exact UTC start00:00/end23:59:59. |
| Contact and notes | Optional billing email/contact name/phone and notes retain values across inactive tabs; optional trim-empty values become null. |
| Entitlements | Interactive shared-control module/submodule selection from independent `/modules/tenant-entitlements`; null saved grants use defaults, explicit[] remains empty, unavailable saved codes produce compatibility guidance instead of silent deletion. Module/area labels use existing core translations with server-name fallback. |
| Editing | Fresh detail and actual rowVersion; no guessed revision. Conflict preserves the draft and requires explicit reload with dirty consent; uncertain outcomes lock replay. Catalog retry waits for a terminal refreshed catalog before refetching detail. |
| Authority | Existing super_admin role only, no invented Tenants:* grants. Read-only disables write entry points and direct state handlers. Actor replacement cancels acceptance and masks old data. |
| Shared forms | Small child field-group components share one page-scoped editor; nearest-form DI registration plus FormSection selects hidden invalid tabs before focus. Summary links, native Signal Forms and legacy compatibility remain shared behavior. |
| Presentation | Existing shared headers/dialogs/feedback/fields/tabs/metrics/cards. Compact metrics adapt to container width so labels do not split ordinary words in narrow cards. |

The full-page create container is an explicit requester adaptation of current Next: shared cards organize the form and a live draft summary, shared page-form actions have a spaced sticky footer, and small components reuse one form tree. Direct create links never load the Tenant list; role/read-only and shared dirty/pending route guards apply.

No Tenant Chart/Report/Import/Export/Tree, standalone details, mock generator,
archive/restore/purge or includeArchived UI is added: those surfaces are Excluded
by the frozen current-source contract. API/domain/schema, native screens and
dependencies are unchanged. API-generated localization and both web clients use
the synchronized canonical catalog; Next locale additions are the authored input.

## Requester sidebar corrections

Basic Data → Global Geography contains Countries, States and Districts with
independent View grants. States/Districts have no duplicate root entry. Countries
retains the existing development-only release boundary. Root composition supplies
the generic dataEntries contribution; Shell renders its existing navigation tree.

The `reports/global` sidebar entry and activation callback are removed as requested.
The guarded route and feature report workspaces remain. Global Template Manager
retains its existing independent permission policy. Tenant Management has a real
guarded sidebar entry and Dashboard link.

## Executed checks

- Full `npm run check` passes: format, lint,4configuration tests, tokens/fonts,
  catalog,30architecture tests, strict app/spec types,747tests/135files and build.
  Initial574.50kB/estimated148.04kB; known500kB warning remains RISK-020.
- Tenant browser8cases: EN/AR × light/dark ×390/1440. Actual shared Grid/Cards,
  search/sort/reset/options/paging, keyboard tabs, invalid section/input focus,
  inactive summary links, hidden draft retention, grant selection, dirty close,
  exact create/update UTC/entitlement/rowVersion payload, live summary, direct create URL without list fetch and no page overflow.
- Tenant negative28cases: EN/AR read-only, list/catalog/detail403, catalog/detail
  read errors and retries, unavailable saved grants and refreshed compatibility,
  server field errors, duplicate identifier, seat limits, conflict/dirty reload,
  uncertain outcome, mutation403 and pending close/replay barriers. No native dialog or raw
  private diagnostic is exposed. Mutation checks use intercepted fixtures only.
- States and Districts each pass one full-journey EN/light/1440 regression after
  shared form changes. Countries Import passes40palette/theme/language/width cases.
- PrimeNG MCP Styled Mode/Card metadata was consulted for shared presentation;
  metadata validates APIs/markup only. CSS/custom-field/runtime acceptance belongs
  to compilation, tests and the actual browser assertions above.

The focused catalog retry test was observed failing before the state change, then
passing. The metric word-wrap browser assertion was also observed failing before
the generic shared CSS change, then passing in all8Tenant cases. Early verification
harness selector errors were corrected in the scripts; they are not product fixes.

## Five-point UI audit and limits

| Journey | Web result | Native decision |
| --- | --- | --- |
| Create | All14editor fields and interactive grants supported in five tabs | Existing native screen retained; new native work Excluded |
| Edit | Fresh detail, all fields/grants retained, real rowVersion; conflict draft preserved | Retained unchanged |
| View | Current source offers edit dialog and Grid/Cards; standalone detail Excluded | Retained unchanged |
| List/filter | Status/access/plan/capacity/company/account metadata, dates on Cards, authoritative search/sort/page | Retained unchanged |
| Mock generator | Excluded because current Next Tenant workflow has none; fixture records are test-only | No new generator |

Actual hosted reads were performed at the preceding foundation checkpoint:
Tenant page200with1record, detail200withrowVersion, assignable catalog200with8modules
and owned logout204. This UI round performs no hosted business writes, contact
notification, deployment or database migration. It does not claim hosted Tenant
mutation acceptance or real RPT/PDF acceptance. PROD-019 matching catalog publication,
PROD-028/025 reporting/provider and RISK-020 bundle remain their existing scopes.

Current catalog:
`f635923665fff6657d10d6f8ab04b4f6ef533d1d840ab4e2dad50114db3e515d`
(21sources/7431keys). No commit, push, merge or remote publication was performed.

## Evidence

Browser scripts: `web-angular/scripts/verify-tenant-management-browser.mjs`,
`verify-tenant-management-failures-browser.mjs` and
`verify-global-geography-navigation.mjs`. Portable results, representative mock
screenshots and current source hashes are registered in the feature manifest and
`verification/TENANT_WORKSPACE_2026-11-06.json` after the completed source/navigation
review. Raw execution logs remain ignored under `.codex-tmp/`.


Scoped independent review completed with no unresolved P1/P2. The create-page actor recovery issue was fixed with observed red/green evidence. A proposed Dashboard event bus was rejected after verifying current route ownership: DashboardState is component-scoped with no retained cache and reloads on remount. The contract records that current freshness path; no speculative cache invalidation layer was added. An earlier full check timed out once in an unchanged Reporting spec while parallel browser/test work was active; the subsequent full747test gate passed without timeout changes or suppressions.


Final documentation generation/check passes484recipes; Check-Planning.ps1 passes with two inherited unrelated v2-contract migration warnings. Arabic customer education is registered and generated after Phase06 Verified. Current source hashes were rechecked without drift. Parent Super Admin work remains Active for the next workflow and final audit.

## Header spacing maintenance — 2026-11-06

The Tenant Management list uses the same shared `collection-page.shell` as
Countries. ApplicationFrame owns the outer inset; PageHeader owns the space
between its card and the collection. Feature pages add no second padding/gap.
Measured targets above/below the title card are24/24px at1440px and12/16px at390px.
The shared responsive policy also applies to States, Districts and Tenant Admins.

Fresh `verify-tenant-management-browser.mjs` acceptance passes all8EN/AR,
light/dark,390/1440cases including the list header position/separation assertions.
Fresh `npm run check` passes772tests in142files plus format, lint, architecture,
configuration, tokens, fonts, catalog, types and production build. The existing
RISK-020 warning remains: initial578.42kB against500kB. Logs and fixture results
are local under `.codex-tmp/tenant-spacing-*` and
`.codex-tmp/angular-tenant-management/results.json`.

The earlier747test acceptance and its JSON source hashes above are a historical
checkpoint. This maintenance reruns the full Angular gate and positive browser
matrix; it does not relabel earlier negative/live-read receipts as fresh runs.

### Current source revalidation — 2026-11-06

The latest full Angular gate passes 809 tests in 154 files, together with format,
lint, architecture, configuration, tokens, fonts, catalog, types and production
build. Tenant Management positive browser acceptance passes all eight EN/AR,
light/dark, 390/1440 cases. A separate direct comparison of Countries and Tenant
Management confirms identical title-card gaps: 24px above/below at 1440px, and
12px above/16px below at 390px, with no document overflow in either language.
The current scoped receipt and source hashes are registered in
`verification/HEADER_SPACING_2026-11-06.json`. RISK-020 remains the existing
578.42kB initial-bundle warning against the 500kB target. This spacing verification
does not close the active System Audit or remaining Super Admin parity work.
