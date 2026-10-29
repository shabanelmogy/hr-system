# Angular module navigation — Screen / Workflow Contract

Execution order: API -> Web -> Mobile -> integrated live verification -> documentation/closure.

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S2-A2 — Accessible module discovery and navigation |
| Child Feature ID | angular-module-navigation |
| Child feature name | Angular accessible module discovery and navigation |
| Owner | Platform Modules / Shell Web |
| Depends on | angular-application-shell Verified/Closed |
| Execution status | Closed |
| Runtime authorization | Authorized exact S2-A2 after current Phase 00 books, 25-source manifest, 245 recipes and planning passed; G0-G3 fixed, remaining G4 hosted-only |

## 1. Child boundary and outcome

Discover applications and enabled areas from the existing authoritative /api/v1/modules/accessible. Open real Angular module and area routes; reload/back preserve the selected destination. The client registry intersects server modules with known presentation definitions. Never navigate to untrusted server entryPath, arbitrary URLs or an unported business route. An authorized area with no registered Angular business destination shows the existing bilingual modules.noAvailableFeatures empty state from the current Next SubmoduleEntryPage. This is explicit current workspace availability, not a pretend implemented business screen. Role dashboards, administration CRUD, company/year transitions and subsequent child screens remain FOLLOW-015. No fake metrics/counts or grants.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.modules.launcher | Web | /apps | Discover permitted applications | Typed navigation tiles | P-007 | Shared launcher; no form | web-next/src/shared/components/layout/module-launcher/ModuleLauncher.tsx | Implemented | Cards Required; Grid/Table/Tree/Detail/Report/Import/Export/Chart Excluded | Finite loading, translated retry/empty/forbidden; no dirty draft/conflict | Online authoritative, no offline grant cache | Clearly synthetic API fixtures only | Authenticated current identity plus server entitlements; known client definitions | Current source tile sizes, responsive/RTL, links and keyboard focus | Business CRUD Deferred FOLLOW-015; no links to unported paths |
| platform.modules.launcher | Mobile | existing home/ledger hub | Retain native discovery | Existing permission-filtered cards | P-007 | Existing native AppCard | mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupOverviewScreen.tsx | Adapted | New views Excluded; native retained | Existing native owner | Existing native policy | No new mocks | Existing native route policy | Existing native ergonomics/RTL | No native runtime rewrite |
| platform.modules.overview | Web | /apps/:moduleCode | Choose permitted area | Typed navigation tiles | P-007 | Shared compact launcher | web-next/src/platform/modules/ModuleOverviewPage.tsx | Implemented | Cards Required; all other views Excluded | Loading/error/forbidden/empty; no form dirty/conflict | Online authoritative | Synthetic fixture areas only | Server module/submodule and known client presentation intersection | Back links/deep links, names wrap, EN/AR modes | User-visible areas point only at registered Angular area routes |
| platform.modules.overview | Mobile | existing native ledger hub | Retain native module navigation | Permission-filtered cards | P-007 | Existing native hub | mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupOverviewScreen.tsx | Adapted | New views Excluded | Existing native owner | Existing native policy | N/A new data | Existing native authority | Existing touch/RTL | No native rewrite |
| platform.modules.area | Web | /apps/:moduleCode/:submoduleCode | Enter permitted area | Guarded destination or truthful no-screen empty | P-007 | Shared feedback and back navigation | web-next/src/platform/modules/SubmoduleEntryPage.tsx | Implemented | All business views Deferred FOLLOW-015; no placeholders presented as CRUD | Unknown/denied module or area Forbidden; enabled area without registered feature empty | Online authoritative | No fake business entities | Trusted server catalog + local registered destination, never entryPath | Localized heading and back action, focus/deep link | Empty destination deliberately follows source noAvailableFeatures until child port |
| platform.modules.area | Mobile | existing native child route | Retain business entry | Existing native route owner | P-007 | Existing native hub | mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupOverviewScreen.tsx | Adapted | New views Excluded | Existing native owner | Existing policy | N/A | Existing route policy | Native retained | No source change |

## 3. Closest existing reference

Current ModuleLauncherPage, ModuleOverviewPage, SubmoduleEntryPage, moduleApi/types/registry/routeRequirements and five moduleDefinition files. Shared ModuleLauncher defines 196px-wide/206px-tall module tiles, 150px submodule tiles, palette-owned accents and centered responsive grids. Next MainLayout hides the sidebar on exact /apps; extend the existing shared frame generically for that composition. Native ledger hub and current home retained.

## 4. Reuse and composition contract

Current Shared ActionButton/AppIcon/PageHeader/SurfaceCard/ApplicationFrame before new code. None provides tile navigation or generic page feedback; add reusable LauncherGrid and FeedbackState inside Shared, with labels/links/tone inputs and no auth/network. Platform owns schema parsing, catalog HTTP service, scoped signal state and pages through one curated public API. Simple bounded finite read state uses Signals, not a new global store or speculative query infrastructure.

## 5. Screen and workspace contract

Add actual /apps, module and area routes behind the existing session guard. Existing home stays actual session identity plus an Applications action; normal-user home redirection and role dashboard parity remain FOLLOW-015. Header/home/settings remain available. Back actions target explicit parent routes, not browser history assumptions. Hide navigation on the launcher as source; retain frame elsewhere. No administration cards before their actual client routes exist.

## 6. Typed transport and server criteria

GET /api/v1/modules/accessible with existing HTTPS credentials; no Authorization bearer/storage. Validate array, nonempty safe code, string name, boolean isDefault, typed submodules/permissions and nullable entryPath; reject malformed/duplicate identities. Existing server authorizes purchases and any required permission. No new API/schema/migration/grant. Scoped state clears on session replacement/logout, cancels an outstanding HTTP subscription and rejects late results; finite timeout and retry only after explicit user action. No grants inferred from labels, cached IDs or local role names.

### Permission Action Matrix

| Actor | Resource | User action | API endpoint / message | Exact permission | Scope | Read-only behavior | Web control + direct guard | Mobile control + direct guard | EN label | AR label | Denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Authenticated user | Modules | Discover accessible catalog | GET /api/v1/modules/accessible | N/A authenticated catalog; API filters exact domain permissions | Current trusted session/tenant | Read permitted | Session guard + validated server intersection | Existing native policies retained | Applications | التطبيقات | Anonymous redirects; failed/403 response never reveals stale list |
| Authenticated user | Permitted module/area | Open overview | Same catalog | Existing server submodule requiredPermissions policy; no new broad grant | Current session | Read permitted | Direct route membership validation; untrusted entryPath ignored | Existing native child guard | Open application | فتح التطبيق | Unknown/unpurchased/unregistered module/area forbidden; no business API request |

## 7. Create, edit, view, and lifecycle contract

Read-only catalog and navigation. No business create/edit/list mutations, archive, report, export or aggregate lifecycle. Display actual allowed names, module accents and translated labels. Business forms/DTOs remain their future owners. Do not claim five-point domain UI parity from this navigation slice.

## 8. UX states, permissions, offline, and mock data

Initial loading has status semantics; error/denial have truthful messages and retry/back. Empty list uses current modules.empty. Forbidden direct module/area never mounts a child. No business dirty draft. All text from existing bilingual core catalog, preserving SQL overrides. Mock APIs used only in acceptance scripts. No offline persistence/authorization cache.

## 9. Concurrency, transactions, and consistency

One catalog request per current identity; deduplicate concurrent subscribers. Scope-key uses actual session object identity, not only company ID. Invalidate synchronously when auth changes before accepting a completion. Destroy or replacement unsubscribes and advances generation. No new SQL transaction. User reload rechecks API authority; explicit retry does not reuse failed/stale data.

## 10. i18n, RTL, accessibility, and responsive behavior

Existing core modules/actions/common/authorization strings; translated labels use existing registry keys and safe server-name fallback only for authorized records. Canonical module colors from @app/tokens, icons from established shared icon system. Native links, visible focus, logical directional arrows, wrapping at 390 and wide layout at 1440, both modes/languages. No API/native behavior change.

Bounded G0-G3: existing ownership/source/permission transport, requester's continued migration authorization, active P-007 and shared audit fixed. Remaining G4 only hosted/provider checks PROD-002/017/019/RISK-018; child destinations and role dashboards explicitly remain FOLLOW-015. No blocking Required catalog question remains.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Current source audit | Existing endpoint/policy reviewed; no runtime API change | documentation/modules/platform/features/angular-module-navigation/angular-module-navigation-evidence.md |
| 2 | Web | Verified | Phase 00 exact current books/checks pass | Real navigation/finite scoped catalog and focused tests | Same evidence ledger |
| 3 | Mobile | Verified | Web verified | Native retained, focused navigation regression | Same evidence ledger |
| 4 | Integrated live verification | Verified | Prior stages verified | Actual API catalog, deep-link/back, fixtures for denial/races/RTL | Same evidence ledger |
| 5 | Documentation and closure | Closed | Phase 06 Verified | Canonical books/manifest/generated packets/education | Same evidence ledger |

## 12. Verification contract

Next-step rule: no sibling runtime until this child is Verified and its documentation/closure is Closed.

Meaningful schema/unknown-code/duplicate, HTTP credentials/error and scoped cancellation/late-result/dedupe tests. Strict templates/types/catalog/architecture/build. Browser launcher/overview/empty/denied/back/reload EN/AR/light/dark/compact/wide; no href for a business route or external entryPath. Real public demo API catalog acceptance separate from fixtures; retain current login/shell regressions. Source card geometry comparison distinct from whole dashboard parity.

## 13. Child exit gate

- [x] Current Phase 00 and exact bounded authorization before runtime.
- [x] Catalog/nav/empty/forbidden and scope cancellation Verified.
- [x] Browser/live/retained regression acceptance Verified.
- [x] Canonical documentation and education after Phase 06 Verified.

Current canonical translation baseline adds eight module/area EN/AR keys through the existing exporter; SQL override protocol is unchanged. The reviewed Next global-role exclusion applies in addition to server catalog membership.
