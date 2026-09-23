# Ledger Setup Posting Profiles — Screen / Workflow Contract

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-posting-profiles` |
| Child feature name | Posting Profiles and Resolve Preview |
| Owner | Accounting |
| Depends on | `ledger-setup-books-journals`, `ledger-setup-coa-hierarchy`, `ledger-setup-link-accounts` vocabulary/capabilities |
| Execution status | `1H` queued after `1G` |
| Contract status | `Closed — reviewed 2026-09-22` |

## 1. Child boundary and outcome

Own effective/versioned `PostingProfile` configuration and a read-only deterministic
resolution preview. Independent acceptance proves that supported accounting context
can be configured with explicit priority/specificity/version rules and that preview
returns a typed resolved, no-match, or ambiguous diagnostic without mutating setup.

Explicitly outside this child: direct Link Account mapping ownership, journal posting,
approval workflow, source-module business state, and invention of unavailable source
masters or context types.

## 2. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Current account-determination evidence | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | existing profile/preview workflow evidence | dedicated typed child composition replaces generic resource switching |
| Link Accounts child contract | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-link-accounts.md` | shared purpose/source capability vocabulary and Account/Book lookup boundaries | profiles add conditional resolution, priority/version and diagnostics rather than direct mapping semantics |

## 3. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web list/form | `web-next/src/shared/components/navigation/header/PageHeader.tsx`, `web-next/src/shared/components/data-grid/core/MyDataGrid.tsx`, `web-next/src/shared/components/forms/dialog/MyForm.tsx`, `web-next/src/shared/components/forms/selects/MySelect.tsx`, shared date/number controls and `web-next/src/shared/components/feedback/` | reuse | typed profile collection and editor |
| Web preview | existing shared dialog/panel primitives plus `web-next/src/shared/components/feedback/` | feature-specific composition | render structured resolved/no-match/ambiguous diagnostics; never an untyped alert string |
| Mobile list/form/preview | `mobile-react/src/shared/components/multi-view/AppListScreen.tsx`, `mobile-react/src/shared/components/data-table/AppDataTable.tsx`, `mobile-react/src/shared/components/forms/AppForm.tsx`, `mobile-react/src/shared/components/controls/AppSelectField.tsx`, `mobile-react/src/shared/components/feedback/AppStateView.tsx` and established shared modal/sheet primitives | reuse | native profile management plus read-only preview |
| Account/Book selectors | lookups from `ledger-setup-coa-hierarchy` and `ledger-setup-books-journals` | reuse | active eligible same-company choices only |
| Context capabilities | typed Accounting capability catalog shared with account determination | reuse | expose only server-supported context fields and references |

## 4. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| List/Grid | Required | Posting Profiles child view under account determination | search/filter/sort/page, open profile |
| Tree/Hierarchy | Excluded | N/A | N/A |
| Detail/View | Required | typed profile detail | inspect purpose/context/account/priority/version/effective state |
| Create/Edit | Required | capability-driven profile form | create/update supported rule fields |
| Resolve Preview | Required | clearly separated read-only panel/dialog | enter documented context, run preview, inspect diagnostic |
| Journal posting | Excluded | no posting controls | preview never posts or changes configuration |

## 5. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create profile | Manage + required Book/Account lookups | choose purpose, supported context, account, priority/version/effective range | create versioned PostingProfile | authoritative list/detail refresh |
| Edit/version profile | current version + Manage | change API-authorized fields | update or version according to server contract | stale/invalid version reloads current detail |
| View profile | View | open record | GET detail | mutation controls absent in read-only mode |
| Lifecycle/effective transition | supported by server | confirm permitted archive/end/version action | server-owned lifecycle mutation | historical/effective identity remains inspectable |
| Resolve preview | View + documented inputs | enter supported context and request preview | read-only resolve query | resolved/no-match/ambiguous result with candidate evidence; no writes |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | PostingProfile detail/page/mutation/runtime schemas plus typed `resolve-preview` request/result discriminated by resolved/no-match/ambiguous outcome |
| Server search/filter/sort | Book, purpose, context capability, account, effective/status and approved sort allow-list are server-owned |
| Paging/limits | profile collection returns real total metadata; preview candidate evidence is explicitly bounded by the API contract |
| Domain errors | unsupported context/source, invalid/inactive dependency, duplicate/effective conflict, invalid priority/version, ambiguous resolution, concurrency |
| Cross-module contract | context/source inputs appear only when an owning module exposes a stable validating Contract/projection; no cross-module EF access |

Resolution precedence, specificity, priority, effective date and version rules are
server authority. The clients display diagnostics and never reproduce the resolver.

## 7. UX states, permissions, and read-only behavior

| Concern | Contract |
| --- | --- |
| Loading / empty / error | profile collection, capability/reference lookup and preview request states are independently visible |
| Permission / forbidden | read and preview require `AccountingSetup:View`; mutations require `AccountingSetup:Manage` |
| Read-only / archived / locked | read-only preserves profile/history/preview visibility while hiding/blocking mutations |
| Unsaved changes / destructive confirmation | shared dirty protection; destructive/effective lifecycle actions require explicit confirmation |
| Offline/stale behavior when applicable | online-authoritative; failed/uncertain preview or mutation is retried/refetched, never locally guessed |

## 8. Concurrency and consistency

Protected updates/lifecycle actions send the current RowVersion or approved version
token. Book/Account/capability changes invalidate dependent selectors and preview
inputs. Effective/version conflicts and competing resolution winners are resolved by
the server; after conflict the client reloads the profile and relevant lookups before
retry.

## 9. i18n, RTL, accessibility, and responsive behavior

Accounting EN/AR owns purpose/context/status/diagnostic text. Shared logical layout
handles RTL. Dynamic fields and preview outcomes have keyboard/touch focus semantics,
accessible names and linked validation/error messages. Compact Web and phone Mobile
stack profile/context fields and keep diagnostic evidence readable without page-level
horizontal overflow.

## 10. Verification contract

| Layer | Required evidence/test | Critical scenario |
| --- | --- | --- |
| Domain/Application | precedence/specificity/priority/version/effective tests | exactly one winner; zero and ambiguous results are explicit |
| API/transport | typed profile page/mutation/capability/preview contract tests | discriminated preview result + real totals + concurrency token |
| Web | profile list/form and preview component tests | dynamic context fields and structured ambiguous diagnostic |
| Mobile | runtime schema/query/form/preview tests | preview no-match/ambiguous states remain read-only |
| E2E/manual | API-backed profile→resolve-preview journey | supported context resolves; ambiguous/no-match diagnostics, EN/AR and read-only permissions |

## 11. Child exit gate

- [ ] Its boundary is implemented without absorbing sibling workflows.
- [ ] Screen/workspace behavior matches this contract and the approved plan.
- [ ] Reused components and any generic extensions match the reuse audit.
- [ ] Typed transport and server criteria are implemented and verified.
- [ ] Permissions/read-only states and concurrency behavior are verified.
- [ ] i18n/RTL/accessibility/responsive requirements are verified.
- [ ] Required automated/manual evidence above is green.
- [ ] The master slice records this child as complete without implying unfinished sibling features are complete.
