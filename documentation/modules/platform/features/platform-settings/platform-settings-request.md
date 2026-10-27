# Platform Settings Implementation Request

## Authority and readiness
Existing configuration workspace rebuild, authorized 2026-10-19. Plan: platform-error-logs; exact slice: Settings tabbed workspace. Screen contract: documentation/plans/business/platform-error-logs/decomposition/platform-settings.md. Ownership and all execution decisions are complete there. Initial API/Web/Mobile/master books exist; required-files.json lists current evidence only. Phase 00 Ready; runtime and acceptance remain pending.

## Approved product decisions / Existing-System Relationship Review
Platform composes the existing owned configuration workflows; Shell composes native preferences. Existing users/roles/error viewers remain Administration siblings. Settings becomes a single child destination with actual tab bodies. No generic settings DTO, global Save, new business field, new permission, new API/schema or migration. New Web route /administration/settings; reuse Mobile /settings. Existing child routes remain compatible. Child edit/reset/default permissions and trusted scopes are unchanged. The parent admits any existing child grant without granting any child authority.

## Business Rules Matrix
| Rule | Primary owner | Outcome | Required test |
| --- | --- | --- | --- |
| One Settings leaf inside Administration | Platform navigation | No parallel top-level Settings group | navigation nesting |
| Only allowed tabs mount | existing route policy | no unauthorized request/content | system/company/denied policy tests |
| Actual independent editor panels | child public pages/screens | existing saves and revisions | tab body and retention conflict browser |
| Dirty panel exit protected | shared registry/discard UI | cancel retains edits; accepted exit replaces panel | dirty tab transition |
| Shared-first screen | shared components | no new tab/Grid shell | composition and browser audit |

## Edge Cases & Validation
Missing session/permissions: shared forbidden or no group, tested. Invalid/unauthorized tab: allowed fallback without mounting denied content, tested. Empty allowed set: shared feedback. Busy/dirty panel: shared guard/confirmation, tested. Company/auth transition: existing scope/cache/dirty guards retained. Stale revision, malformed fields, request/network failure: existing child error/conflict contracts and tests. Long labels/RTL/compact layout: shared scrolling tabs and browser overflow check. Cross-tab transaction/import/report/mock/new lifecycle: N/A because excluded from the navigation workspace.

## Impact Matrix
Navigation/routes: Change/Add Web route; Mobile existing route. Shared tabs/header/screen/feedback/unsaved: Reuse. Child services/hooks/repositories/forms/DTOs/API/database: Reuse unchanged. Localization: Reuse existing keys, Add bilingual shell description only if needed. Tests: Add workspace/tab/policy journeys, adapt previous nesting assertions. Docs/manifests: Add owning feature and reconcile affected child profiles; regenerate. Native dependencies/persistence: N/A unchanged.

## Platform decisions
Web/Mobile tabs and existing child content Required. New hub Grid/Cards/Tree/Chart/Report/Import/Export/realtime/mock-data creation Excluded. Child views remain existing contracts. Native physical acceptance Deferred with existing PROD-026. Customer Education Required after verified Phase06. Shared inventory: SCREEN_PATTERN_CATALOG P-007/P-005/P-001 and FormTabs/AppFormTabs; child list uses MyDataGrid/AppDataTable, child forms MyForm/AppForm. No feature-local look-alike.

## Verification
Follow the exact contract acceptance matrix, focused tests then full proportional gates. Record inherited failures separately. Do not claim physical native or production readiness.
