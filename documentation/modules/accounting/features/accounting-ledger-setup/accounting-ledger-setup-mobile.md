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
Ledger Setup launcher; Fiscal Years is a child of the single `acc:ledger-setup`
submodule and its permissions are part of `AccountingPermissions.LedgerSetup`. Do not introduce another
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

Mirror the exact per-resource `AccountingPermissions` claims (Accounts, AccountHierarchyLevels, DimensionDefinitions/Values, AccountDimensionPolicies, Currencies, AccountingSettings, Books, JournalDefinitions, ExchangeRateTypes/Rates, AccountMappings, PostingProfiles). App read-only mode and
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

Shared offline-bootstrap correction on 2026-10-28 (`FOLLOW-010`) keys each
isolated native write connection before BEGIN and preserves the current database,
key and schema. Eight focused regression tests pass; the requester confirms the
app opens after Reload, verifying FOLLOW-010 for bootstrap. No Accounting offline policy, domain schema or API capability is added.
The canonical Mobile readiness review owns the shared corrective evidence.
The complete Mobile check now passes 194 suites / 598 tests with unchanged
coverage floors; Android export passes. The corrected code is verified in the
development bundle served through the HTTPS tunnel. Bootstrap is confirmed on the
phone; feature-specific physical journeys remain PROD-026.

Live-development maintenance on 2026-10-28 adds SDK57's development client and
an internal EAS development profile; Metro's tunnel serves a valid Android
development manifest. Build `b71a24b6-897b-41df-ba95-1c36287ed9bf` and startup
instructions are recorded in the Mobile release runbook. Fast Refresh needs
the development APK and running Metro; physical confirmation remains `PROD-026`.
No Accounting workflow, business fields or API contract changes.
After adding the client, the full Mobile gate passes again (194 suites / 593
tests), Expo Doctor is 21/21, native config/dependency checks pass, production
export retains its 3,030-source boundary and all four upload-policy tests pass.
The tunnel delivers the development bundle and registers its HMR WebSocket;
these server checks do not prove a rendered phone-side refresh.
The development build completes on 2026-10-28; its APK passes ZIP integrity and
manifest checks, includes the development launcher and matches the preview signer
certificate. The canonical Mobile runbook owns download/hashes; phone installation
and visible Fast Refresh remain `PROD-026`.

The shared 2026-10-28 export gate adds actual Android dependency-boundary evidence:
13 policy tests pass and the 3,030-source native map excludes legacy Zod,
deepmerge and CLI tooling schemas, allowing only Expo's exact Metro loader.
This leaves dependency findings `RISK-013`/`RISK-014` and physical acceptance
`PROD-026` open. No Accounting UI, contract or schema changes in this maintenance.
The complete Mobile check is repeated successfully (194 suites / 593 tests),
with the same coverage results and unchanged floors.
It also passes on the newly pinned Mobile CI/EAS Node 22.23.4 runtime, including
the native export and release-config gate. A dedicated ERP EAS project is now
linked; config verification isolates synthetic identities from the real binding.
Artifact/install acceptance remains `PROD-009`; default-runtime follow-up is
`RISK-015`. Four upload-policy tests and actual 1,221-file archive inspection
pass, preserving local compiled tokens and excluding other apps/secrets. Build
request and preview configuration are recorded in the canonical release runbook.
The first signed Android preview completes successfully on 2026-10-28 (build
`32f6f9a6-7779-4077-a42d-8d1309f32015`, version 1.0.0/code 1). This does not
close physical Accounting journeys. Both association endpoints on the preview
host return HTTP 401; public link association remains `PROD-012`.

Corrective maintenance (2026-10-27, `FOLLOW-006`) removes unnecessary manual
memoization from the generic compatibility renderer's save/lifecycle callbacks
and small column definition. React Compiler's dependency inference could not
preserve those memoization boundaries. Normal render-time functions/data retain
the current entity, selected record, scope, row version and permission closures;
no query, request mapping, lifecycle, shared component or layout is replaced.
This follows the [official React Compiler lint guidance](https://react.dev/reference/eslint-plugin-react-hooks/lints/preserve-manual-memoization)
instead of disabling its rule or adding a compiler opt-out. Ledger Setup and
Offline Operations focused tests pass 47 cases across 15 suites. This bounded
correction does not advance queued Accounting children or claim manual acceptance.
The final full Mobile check passes all source gates and 194 suites / 593 tests;
coverage is 25.56% statements, 17.85% branches, 21.30% functions and 28.14% lines
against unchanged floors. The Android production export compiles successfully
with React Compiler enabled. The subsequent SDK57 dependency alignment also
passes the complete check (194 suites / 593 tests), dependency compatibility,
disposable Android prebuild, Android export and Expo Doctor 21/21; `FOLLOW-008`
is Verified. Physical/native acceptance remains `PROD-026`; the remaining Expo
CLI/Zod dependency-audit finding is separately owned by `RISK-013`.

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
