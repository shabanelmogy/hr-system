# Ledger Setup Posting Profiles — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `accounting-core-gl` |
| Authorized slice | `Slice 1 — Ledger setup spine` |
| Child Feature ID | `ledger-setup-posting-profiles` |
| Child feature name | Posting Profiles and Resolve Preview |
| Owner | Accounting |
| Depends on | `ledger-setup-books-journals`, `ledger-setup-coa-hierarchy`, `ledger-setup-link-accounts` capabilities |
| Execution status | `Queued` after Link Accounts closure |
| Status evidence | `SLICE-01-LEDGER-SETUP-EXECUTION.md`; current generic UI is compatibility evidence only |

## 1. Child boundary and outcome

This child owns effective/versioned `PostingProfile` configuration with separate
Arabic and English stored names, plus a read-only deterministic resolution preview.
Independent acceptance proves explicit priority/specificity/version rules and typed
resolved/no-match/ambiguous diagnostics without posting or mutating configuration.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ledger-setup-posting-profiles | Web | `/finance/ledger-setup/account-determination` Posting Profiles view | Manage rules and run read-only resolution preview | server-managed profiles plus diagnostic sub-surface | P-001 | Grid and typed `MyForm`; feature-specific read-only preview dialog/panel within the route | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | Adapted | Grid Required; Detail Required; Table Cards Tree Report Import Export Chart Excluded | profile/capability/lookup loading, empty/no-results, error/retry, forbidden/read-only, dirty, effective/concurrency conflict; preview loading/no-match/ambiguous/error | online authoritative | profile draft uses real Book/Account/capabilities; preview input may be local but result is never fabricated | `AccountingSetup:View/Manage`; current company; preview requires View | bounded grid/panel, stacked compact fields, RTL, keyboard/error/result announcement | Preview is a read-only sub-pattern, not a second CRUD feature; generic renderer is not target authority |
| ledger-setup-posting-profiles | Mobile | `/finance/ledger-setup/account-determination` Posting Profiles segment | Manage rules and run read-only resolution preview | native profiles plus diagnostic sub-surface | P-001 | Table/Cards and typed `AppForm`; `AccountResolutionPreview` read-only modal/sheet | `mobile-react/src/modules/accounting/ledger-setup/presentation/components/AccountResolutionPreview.tsx` | Adapted | Table Required; Cards Required; Detail Required; Grid Tree Report Import Export Chart Excluded | profile/capability/lookup loading, empty/no-results, error/retry, forbidden/read-only, dirty, effective/concurrency conflict; preview loading/no-match/ambiguous/error | online authoritative | profile draft uses authoritative dependencies; preview result is never locally invented | `AccountingSetup:View/Manage`; current company; preview requires View | phone/tablet cards/sheet, RTL, touch/screen-reader result announcement and validation focus | Target profile layers become typed; current preview supplies interaction evidence only |

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| P-001 managed collection | registered Accounting/Countries sources in `documentation/project/SCREEN_PATTERN_CATALOG.md` | list, form, state and lifecycle discipline | effective profile/context/priority rules remain Accounting-owned |
| Current preview | Web `AccountResolutionPreview` composition in `LedgerSetupResourcePage.tsx` and Mobile component named above | read-only input→diagnostic interaction | structured typed diagnostics replace generic alert/record assumptions |
| Link Accounts | `documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-link-accounts.md` | capability and dependency vocabulary | profiles add conditional precedence/version rules, not direct mapping semantics |

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web list/form | shared PageHeader/grid/list-state/MyForm/select/date/number/feedback/confirmation components | reuse | typed profile collection and editor with bilingual fields |
| Web preview | shared dialog/panel/form/feedback primitives | feature-specific composition | typed resolved/no-match/ambiguous result; never native alert |
| Mobile list/form/preview | `AppListScreen`, `AppDataTable`, `AppDataCard`, `AppForm`, shared fields/feedback/modal primitives | reuse/compose | native typed profiles plus diagnostic preview |
| Dependencies | active Book/Account lookups and capability catalog | reuse owned contracts | only server-supported context fields and references |

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| Profile collection/detail/form | Required | P-001 list/form | manage code, `NameAr`, `NameEn`, purpose, context, account, priority, version and effective period |
| Resolve Preview | Required | clearly separated read-only panel/dialog/sheet | enter supported context and inspect typed diagnostic |
| Journal posting | Excluded | no posting controls | preview never posts or changes setup |
| Tree/Report/Import/Export/Chart | Excluded | outside this child | none |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | PostingProfile detail/page/mutation/lifecycle with `NameAr`/`NameEn`, plus discriminated resolve-preview request/result for resolved/no-match/ambiguous |
| Canonical routes | Accounting Posting Profile/capability/preview APIs plus Account Determination client route |
| Server search/filter/sort | Book, purpose, context capability, Arabic/English name, Account, effective/status and approved allow-list |
| Paging/limits | authoritative totals; preview candidate evidence has an explicit bound |
| Domain errors / ProblemDetails | missing bilingual name, unsupported context, inactive dependency, duplicate/effective/version/priority conflict, ambiguity and concurrency |
| Permission and tenant/company scope | View reads/previews; Manage mutates; server-enforced current company |
| Cross-module contract | context/source appears only through a stable validating owner contract/projection |
| Persistence/schema/migration | Accounting profile/effective/priority indexes and constraints; live database update required |

Resolution precedence, specificity, priority, date and version are server authority;
clients display diagnostics and never reproduce the resolver.

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create profile | Manage plus dependencies | code, `NameAr`, `NameEn`, purpose, supported context, Account, priority/version/effective range | create profile | list/detail refresh with both names |
| Edit/version profile | current detail/token | change authorized fields | update/version | conflict reloads authoritative profile |
| View/lifecycle | View or valid Manage action | inspect or confirm permitted end/archive/version | read or lifecycle mutation | history and both names remain inspectable |
| Resolve preview | View plus documented inputs | enter context and run | read-only resolve query | structured resolved/no-match/ambiguous result; no write |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | collection, capability/reference and preview states remain independent |
| Permission / forbidden / read-only | View includes preview; Manage controls writes; global read-only keeps history/preview |
| Archived / locked | history remains inspectable; ineligible dependencies cannot be newly selected |
| Unsaved changes / destructive confirmation | shared dirty guard; effective/lifecycle action uses confirmation |
| Offline / stale / conflict | online-authoritative; failed preview is not guessed; conflict reloads profile/lookups |
| Mock data | local profile draft includes valid Arabic/English names and real dependencies; preview result/identity/scope/version is never fabricated |

## 9. Concurrency, transactions, and consistency

Protected profile actions use current RowVersion/version token. Dependency and
capability changes invalidate selectors and preview inputs. Server/database own
effective/version and competing-winner races; both names commit transactionally.

## 10. i18n, RTL, accessibility, and responsive behavior

Profile create/edit/view/list exposes persisted `NameAr` and `NameEn`. Purpose,
context, status and diagnostics use EN/AR catalogs; linked names come from owners.
Web and Mobile stack dynamic fields safely, preserve RTL, focus first invalid field,
announce preview results, and keep diagnostic evidence readable without page-level
overflow.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Queued | Link Accounts closed and contract approved | typed bilingual profiles/resolver, migrations, permissions and precedence tests | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 2 | Web | Queued | API Verified | typed P-001 management plus structured preview and tests | `documentation/web-next/features/accounting-ledger-setup-frontend-reference.md` |
| 3 | Mobile | Queued | Web Verified | typed clean layers, schemas, native management/preview and tests | `documentation/mobile-react/accounting-ledger-setup-mobile-reference.md` |
| 4 | Integrated live verification + user acceptance | Queued | prior stages Verified | agent sends detailed authenticated profile→preview resolved/no-match/ambiguous API/Web/actual-Mobile scenario with live-schema checks; user runs or supervises it and explicitly accepts | `SLICE-01-LEDGER-SETUP-EXECUTION.md` |
| 5 | Documentation and closure | Queued | integrated verification Verified and explicit user acceptance recorded | canonical docs, manifest/recipes and education reconciled | `documentation/system/features/accounting-ledger-setup/required-files.json` |

**Manual acceptance protocol.** The central
`../MANUAL_ACCEPTANCE_SCENARIO_TEMPLATE.md` format is mandatory:
prerequisites, roles/permissions, exact profile/context/priority data, Web and
actual-device steps, EN/AR and RTL/LTR checks, expected outcomes, resolved/no-match/
ambiguous/read-only/conflict cases, cleanup and evidence. The feature remains Active
until explicit user acceptance.

**Next-step rule:** no sibling feature may become `Active` until this feature's
Integrated live verification is `Verified` and Documentation and closure is
`Closed` in the roadmap, with explicit user acceptance recorded.

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | bilingual, precedence, specificity, priority, version/effective tests | one winner; zero/ambiguous explicit | Queued |
| API/transport | page/mutation/capability/preview contract tests | discriminated result, both names, totals and token | Queued |
| Persistence/migration | apply current Accounting migration | effective/priority/version indexes and name columns | Queued |
| Web | profile and preview tests | dynamic context, both names and structured ambiguous diagnostic | Queued |
| Mobile | schema/query/form/preview tests | no-match/ambiguous remain read-only | Queued |
| E2E/manual/live | authenticated profile→preview journey | resolved/no-match/ambiguous, EN/AR and read-only | Queued |

## 13. Child exit gate

- [x] Contract version is current and every screen/platform row passes the UI Pattern Gate.
- [x] No `Candidate` pattern remains; P-001 plus a feature-specific read-only diagnostic sub-surface is approved.
- [ ] Generic profile evidence is replaced by typed profile/resolver ownership.
- [ ] Arabic/English profile names are verified in create/edit/view/list on both clients.
- [ ] Precedence, diagnostics, permissions, conflicts and live schema are verified.
- [ ] Integrated live verification is green in roadmap order.
- [ ] Detailed manual scenario/results are sent to the user and explicit acceptance is recorded.
- [ ] Documentation/manifest/recipes and education are reconciled.
- [ ] Roadmap closure is recorded before Integration Verification becomes Active.
