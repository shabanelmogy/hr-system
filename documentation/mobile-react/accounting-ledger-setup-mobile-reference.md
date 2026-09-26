# Accounting Ledger Setup — Expo Implementation Contract

Status: **Fiscal Years/Currency/COA typed client evidence exists; remaining Ledger Setup routes are generic compatibility evidence pending typed child refactors; Phase 06 live journey verification remains required.**

## 1. Feature boundary

Create the Ledger Setup capability under `src/modules/accounting` and thin Expo
routes under the existing Finance route group. Fiscal Years is the same-module
reference for layered transport/domain/presentation boundaries, not a business
template.

Future Slice 1 work follows the child Screen Contracts in
`documentation/plans/business/accounting-core-gl/SLICE-01-LEDGER-SETUP-EXECUTION.md`.
The current generic Ledger Setup record/renderer is implementation evidence to
refactor. Each child owns typed domain/remote schemas, repository/use-case/query
boundaries and focused screen composition.

## 2. Route and module registration

Extend `ROUTES.finance`, the Accounting module definition and RBAC route manifest
for Accounts plus Accounting Setup screens. The user-facing Finance entry is one
Ledger Setup launcher; Fiscal Years and Ledger Setup remain separate technical
submodules to preserve server entitlement compatibility. Do not introduce another
module code or parallel Finance root.

## 3. Domain and runtime schemas

Mobile domain models mirror required setup semantics while remote response payloads
are validated with runtime schemas. Company/tenant scope is never client authored.
RowVersion remains opaque and is sent on protected mutations.

## 4. Repository and use-case layer

Remote data sources own HTTP serialization. Repositories map transport to domain.
Use cases own client-side orchestration/normalization only; server/domain remain
business-rule authority.

## 5. Query state

React Query owns stable key families and mutation invalidation. Server-owned
search/filter/sort/paging is used for potentially large setup collections.
Company switch/session lifecycle follows existing platform behavior.

## 6. Chart of Accounts tree

Use `AppHierarchicalTree` for touch-friendly hierarchy/search/selection and
accessible direct actions. Do not implement custom tree physics or infer hierarchy
from account-code prefix.

## 7. Account form and detail

`AppForm` exposes parent/level, proposed editable code, bilingual names,
AllowPosting, ManualPostingPolicy, CurrencyPolicy/specific currency and dimension
constraints. View mode is explicit and mutation controls honor read-only/permission
state.

## 8. Setup collection screens

Currency already has typed ownership. Dimensions, Books, Journal definitions,
Exchange Rates, Link Accounts and Posting Profiles are currently generic
compatibility routes and must become typed domain/application/data/presentation
children. They use `AppListScreen`, `AppDataTable`, shared cards only when Required,
`AppStateView`, shared filters and confirmations.

### Screen Pattern decisions

| Surface | Pattern | Mobile composition |
| --- | --- | --- |
| Flat setup masters | `P-001` | native Table/Cards as contracted plus typed full-screen `AppForm` |
| Accounts | `P-002` primary + P-001 list | stacked/segmented `AppHierarchicalTree`, detail and record Table |
| Account Dimension Constraints and Link Accounts | `P-006` | scoped stacked cards with explicit dirty/save/effective semantics |
| Company Settings | `P-005` | dedicated singleton `AppForm`; no fake list/archive |
| Ledger Setup overview | `P-007` | permission-filtered launcher only |
| Resolve Preview | feature-specific read-only diagnostic sub-surface | typed modal/sheet inside Posting Profiles |

P-003 is not used for independent resources. P-004 remains Candidate and cannot
authorize Mobile implementation.

## 9. Currency cutover consumers

The Accounting currency catalog becomes the selector/validation source for HR
mobile consumers that need valid currencies. Existing HR business records retain
CurrencyCode values; Mobile does not migrate financial data locally.

## 10. Link Accounts and resolution

Expose company-purpose mapping and only typed reference sources backed by real owner
Contracts. Posting-profile preview shows resolved/zero/ambiguous diagnostics.
Absent BankAccount/PaymentMethod/Cashbox/ContactGroup/PartyRole masters do not
produce placeholder picker items.

## 11. Permissions and online authority

Mirror Accounts, Dimensions and AccountingSetup permissions. App read-only mode and
RouteGuard block mutations/navigation appropriately. All financial setup mutations
require server connectivity and final server confirmation.

## 12. Offline/cache policy

Offline financial writes are Excluded. Cached setup reads are Deferred until an
approved offline-read policy defines TTL/scope/invalidation. Do not synthesize local
success after uncertain requests.

## 13. Localization, RTL, accessibility, and responsive behavior

Every visible string is localized English/Arabic. Use logical spacing/direction and
theme tokens. Touch targets, form error focus, screen-reader labels, safe areas,
keyboard handling and phone/tablet layouts use shared design-system behavior.

Translation is separate from stored business names. Every named master exposes,
requires and preserves `NameAr` and `NameEn` in create/edit/detail/Table/Card and
valid local mock drafts. Current locale chooses primary display with documented
fallback; neither value overwrites the other. Settings, historical Rates and
Mappings do not invent names and instead render localized referenced-owner labels.

## 14. Verification

Typed Currency/COA source evidence plus generic compatibility evidence includes server-page state for paged setup lists, full active
account hierarchy from `/accounts/tree`, and detail fetch before tree edits so
RowVersion is current. Dimension selector options traverse each server page
to avoid silently hiding definitions beyond 500. Cards, table and tree expose direct archive/restore
actions; lookup search must actually filter the shown options. Specific currency
is required only when the account currency policy selects it, and switching
away sends null. Phase 06 must still collect live phone/tablet creation,
editing, view, permissions, read-only, EN/AR/RTL and API-backed evidence.
Passing static typecheck and focused tests is not a substitute for this audit.

The device audit is sent as part of the feature-specific scenario derived from
`documentation/plans/business/accounting-core-gl/MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md`.
It must name the actual device/OS/build and cover Table/Cards/detail/form, Arabic and
English with RTL/LTR, light/dark where supported, safe area, keyboard, dirty-back,
portrait/landscape, permissions/read-only/company scope, online-only financial
mutations, stale conflict and cleanup. Emulator/source evidence alone is not a
manual pass; the user explicitly accepts the combined Web/device result.

## 15. Deferred and handoff

Deferred/Excluded: offline writes, setup import, bulk actions, notifications,
realtime correctness, JournalEntry runtime, posting, GL/TB and Month Close. Phase 06
must verify actual Mobile behavior against this contract before Phase 07 customer
education can describe it.
