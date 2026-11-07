# Super Admin Tenant Management — web applied profile

## 1. Ownership

Platform Tenants owns aggregate management; existing tenancy API/persistence, ModuleCatalogPolicy and server authorization remain unchanged. D42/S4-A1 contract is the execution authority.

## 2. Verified source

Tenant Management now has the guarded /super-admin/tenants page, shared Grid/Cards, server search/sort/page, five-tab create/edit, real detail rowVersion, nested entitlement selection, dashboard link and sidebar entry. TENANT_FOUNDATION_2026-11-06.md remains a historical foundation checkpoint. Current client acceptance is recorded separately in TENANT_WORKSPACE_2026-11-06.md. Existing API/domain/persistence and native screens remain unchanged; Next locale additions are canonical input to the generated catalog.

## 3. Data contract

Tenant string ID, rowVersion and usage/lifecycle metadata. Fourteen editor keys: identifier/name/isActive/status/start/end/plan/maxAdmins/maxUsers/billingEmail/contactName/contactPhone/notes/entitlements. Entitlements are nested moduleCode/submoduleCodes arrays, never JSON text.

## 4. Business rules

Existing super_admin role-only API; no Tenants:* grant invented. Positive Int32 capacities, maxAdmins<=maxUsers and usage floor; unique identifier; valid status/catalog; real rowVersion on update. Server remains authoritative; current source maxUsers>=0 is corrected to known API-positive rule.

## 5. Platform decisions

Web Grid/Cards and five-tab create/edit Required. Requester amendment2026-11-06 moves Add Tenant to /super-admin/tenants/new; Edit retains its dialog. C-01 permits this full-page container, with unchanged fields/atomic submission. Standalone Detail/Chart/Report/Import/Export/Tree/mock generator Excluded by current Next source. API archive/restore/purge/includeArchived UI Excluded in this parity slice. New native conversion Excluded.

## 6. Transport

GET /api/v1/tenants/getPage/get/{id}; POST /create; PUT /update/{id}. GET /modules/tenant-entitlements independently of /modules/accessible. Page1/size10/nameASC/includeArchived=false defaults, pageSize1..200. Search name/identifier/billingEmail; allow-listed sorts name/identifier/createdOn; strict metadata and identities.

## 7. Shared composition

Reuse MyDataGrid/CardList/PageHeader/DialogPanel/FormContainer/ContentTabs and shared text/boolean/numeric/date/reference fields. Focused owner components for identity/subscription/contact/entitlements/notes, card header/content and list criteria. FormSection and the nearest-form registry preserve shared summary/first-invalid focus across child component views. The aggregate entitlement field extends the public FormFieldControl contract and composes shared BooleanField controls. Catalog retry waits for its refreshed snapshot before fetching detail. The extracted TenantForm composition is reused by the create page and edit dialog. The create page uses shared PageHeader/SurfaceCard and FormContainer.appearance=page, plus a feature-owned live draft summary. It does not instantiate TenantReadState or fetch the list. Shared canDeactivate navigation guards protect dirty/pending drafts. Actor replacement starts a fresh draft only when the new authorized actor catalog is ready. Existing scoped read/dirty/close/error owners remain authoritative; no engine or duplicate visual shell.

List header spacing matches Countries through shared collection-page.shell: no local page padding/gap; ApplicationFrame owns the top inset and PageHeader owns the bottom separation. At 1440px the gaps above/below the title card are 24/24px; at 390px they are 12/16px. Shared responsive behavior applies in EN/AR and light/dark. Direct browser comparison of both routes confirms identical gaps and no document overflow in all four language/viewport combinations. The current spacing receipt is verification/HEADER_SPACING_2026-11-06.json; earlier feature acceptance remains a separate historical checkpoint.

## 8. States and lifetime

Actor-scoped page/detail/catalog; pending/background/empty/error/forbidden distinctions; hidden-tab draft preservation; first invalid tab and focus; explicit failed/uncertain/rowVersion conflict recovery; read-only and direct callbacks recheck. No offline writes/storage/automatic replay.

## 9. Consistency

Atomic existing create DEFAULT company/entitlements/audit and optional phone notification stays server-only. Native positive-seat/date/cross-field validation prevents known rejected values. Fresh detail/rowVersion before update; conflict retains draft. Unknown saved entitlement codes must not be silently dropped and resaved.

## 10. Localization and accessibility

Core/platform-tenants EN/AR and module labels, logical shared styles, keyboard tabs/switches/pager, first invalid tab/focus and summary links on390/1440/light/dark. Catalog changes only via canonical generator and PROD-019 boundary.

## 11. Implementation preflight

Version2 contract/UI Pattern Gate and current-only request/manifest/books authored. G0-G3 fixed; Phase00 generation/check/planning required before runtime. This is existing capability parity; no interview/approval repeated for resolved D42 scope.

## 12. Verification

Phase06 Verified within the authorized Angular client scope2026-11-06. Full npm run check passes747tests/135files,30architecture,4configuration and format/lint/catalog/tokens/fonts/types/build. Full-page create/edit browser8EN/AR/light/dark/390/1440cases and28negative cases pass, including direct create link without list reads, shared dirty/pending guards, keyboard tabs, live draft summary, first-invalid hidden-tab focus, catalog recovery, duplicate/seat/server errors, conflict and uncertain replay barriers. Navigation24cases pass. Shared regressions:1States,1Districts full journey and40CountriesImport cases. Independent source review has no unresolved P1/P2; actor-replacement recovery finding fixed with observed red/green evidence. Current report/receipt: TENANT_WORKSPACE_2026-11-06.md and verification/TENANT_WORKSPACE_2026-11-06.json. The preceding foundation hosted page/detail/catalog evidence remains historical; no hosted business write or native acceptance is claimed. Initial574.50kB warning remains RISK-020.

## 13. Operations and release

Retain PROD-019 catalog publication, PROD-028/025 reporting/provider and RISK-020 startup warning. These are external gates, not permission to waive Tenant client defects. Existing dashboard summary is retained; real management links activate only with route.

## 14. Education

Phase07 Arabic customer guide completed after the current Phase06 Verified decision: documentation/plans/business/web-angular-migration/education/angular-tenant-management-workspace.md. It documents full-page Add Tenant, retained edit dialog, all five tabs, live summary, shared validation/dirty/pending/conflict and exact hosted/native limits. The guide is registered as existing evidence.

## 15. Handoff

Navigation maintenance2026-11-06: requester groups Tenant Administrators and Tenant
Management beneath one translated Tenant administration branch inside Basic Data.
Composition owns `tenant-navigation.ts`; shared NavigationList renders it. Existing
routes/owner policies remain, including selected management entry on `/tenants/new`.
The two workflows no longer render as root entries; Global Geography remains a
sibling branch. Next/native are unchanged. Current navigation acceptance is recorded
separately from the historical Phase06 totals above.

Scoped navigation acceptance:24 fixture-browser cases EN/AR at390/1440 pass,
including the nested tenant branch and no root duplicates. Full Angular check
passes921tests/181files,31architecture checks,4configuration checks and
format/lint/types/catalog/tokens/fonts/build. Initial579.49kB warning remains the
existing RISK-020. Source review confirms existing activation handlers and route
guards remain. Receipt: verification/tenant-navigation-2026-11-06.json. The parent
goal remains Paused; shared export runtime acceptance is still pending.

Tenant client runtime/verification and education are complete. Canonical documentation generation/check passes484recipes and planning passes with two inherited unrelated v2-contract warnings. Final source hashes match the current implementation. The active documentation stage transfers to the next sibling preflight in the parent sequence. Later Tenant-admin/audit/error/settings/operational tools and final comprehensive review remain Required under the Active parent goal; no sibling runtime was started. States/Districts remain Closed.
