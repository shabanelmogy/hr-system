# <Child Feature> — Screen / Workflow Contract

> **Template version: 2.0**
>
> Use this contract for one executable feature unit, whether the master plan is
> marked `Single feature`, `Decompose`, or a legacy feature is being revalidated.
> Store it under the owning business plan:
> `documentation/plans/business/<plan-id>/decomposition/<feature-id>.md`.
>
> A contract is an execution authority for one feature only. It does not grant
> permission to start a sibling feature. The roadmap owns order and status; this
> file owns the feature's API → Web → Mobile → integrated verification →
> documentation/closure evidence.

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `<plan-id>` |
| Authorized slice | `<exact slice id/name>` |
| Child Feature ID | `<kebab-case-feature-id>` |
| Child feature name | `<name>` |
| Owner | `<bounded context/module>` |
| Depends on | `<feature IDs / shared foundation / N/A>` |
| Execution status | `<Queued, Active, Verified, Closed, or Blocked>` |
| Status evidence | `<roadmap row or evidence path>` |

## 1. Child boundary and outcome

Business workflow owned by this child:
<one coherent domain workflow>

Independent acceptance outcome:
<what can be verified complete without claiming sibling workflows are complete>

Explicitly outside this child:
<sibling workflows / Deferred / Excluded work>

## 2. UI Pattern Gate (mandatory before implementation)

Complete the product-wide Permission Action Matrix from
`../system/PERMISSION_MODEL.md` alongside this gate. Every Screen ID below must map
its buttons, menus, gestures, row actions, bulk actions, reports/imports, and direct
handlers to matrix rows; a broad `Manage` permission is not an acceptable value.

Every screen or route in this feature has one row for **each platform**. Do not
write “reuse shared components” as a substitute for a pattern decision. The exact
source paths below must be inspected before runtime work starts.

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `<screen-id>` | `Web` or `Mobile` | `<canonical route>` | `<job>` | `<collection/tree/aggregate/workflow/report>` | `P-001/P-002/P-003/Approved P-###/Candidate` | `<sectioned/stacked/tabs/master-detail/etc.>` | `<exact file/component path>` | `Implemented/Adapted/Deferred/Excluded` | `<explicit R/D/E for every applicable view>` | `<explicit state contract>` | `<online authoritative / offline read / queued sync / N/A>` | `<local valid draft / N/A>` | `<permission + tenant/company/global scope>` | `<breakpoints, RTL, focus, screen-reader/touch>` | `<N/A or precise difference>` |

### UI Pattern decision rules

1. Choose an `Active` pattern from
   `documentation/project/SCREEN_PATTERN_CATALOG.md` only after checking the
   current Web and Mobile references and shared primitives.
2. A `Candidate` pattern **blocks UI implementation**. Register it in the catalog,
   add a real reference and verification evidence, and review it before changing
   the row to an active `P-###` pattern.
3. `Required`, `Deferred`, and `Excluded` must be recorded separately for Web and
   Mobile. A platform adaptation may change ergonomics, but it cannot silently
   remove a business capability or validation rule.
4. A compact form remains one form contract. Use P-003 only when multiple sections
   reduce a real navigation cost; record `stacked` on Mobile when tabs are not
   useful. Child previews, reports, and read-only panels do not become separate
   CRUD features without their own boundary and contract.

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| `<reviewed feature/reference>` | `<path>` | `<structure/behavior>` | `<domain-specific difference>` |

Do not cite a reference name alone. Record the exact source/screen that was inspected
and the concrete behavior reused.

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| `<page/workspace/header/form/grid/tree/detail/...>` | `<exact path/component>` | `<reuse, generic extension, or feature-specific composition>` | `<how it is used>` |

A generic renderer name by itself is insufficient. The table must identify the
actual reusable pieces and how they compose the child workflow.

## 5. Screen and workspace contract

Define the actual information architecture and interaction surfaces for this child.

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| List/Grid/Table/Cards | | | |
| Tree/Hierarchy | | | |
| Detail/View | | | |
| Create/Edit | | | |
| Report/Import/Export/Chart | | | |
| Other workflow-specific surface | | | |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | `<DTO/schema/query/mutation>` |
| Canonical routes | `<API and client routes>` |
| Server search/filter/sort | `<criteria and allow-lists>` |
| Paging/limits | `<server contract>` |
| Domain errors / ProblemDetails | `<stable errors/problem contract>` |
| Permission and tenant/company scope | `<server-authoritative rule>` |
| Cross-module contract | `<contract/event or N/A>` |
| Persistence/schema/migration | `<DbContext, schema, migration or N/A>` |

### Permission Action Matrix

| Actor | Resource | User action | API endpoint / message | Exact permission | Scope | Read-only behavior | Web control + direct guard | Mobile control + direct guard | EN label | AR label | Denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `<actor>` | `<resource>` | `<one independently grantable action>` | `<route/message>` | `<Resource:Action>` | `<scope>` | `<behavior>` | `<evidence/target>` | `<evidence/target>` | `<label>` | `<label>` | `<test>` |

Archive, Restore, and irreversible Delete require separate rows and permissions.
Named lifecycle transitions such as Submit, Review, Publish, Lock, Reopen, Revoke,
or ResetPassword also require their own rows.

Client-only filtering or state must not replace required server criteria.

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create | | | | |
| Edit | | | | |
| View/detail/preview | | | | |
| Archive/restore/other lifecycle | | | | |

Cover create, edit, view, lifecycle/domain actions, and read-only/forbidden states
that apply to this child.

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | `<explicit behavior>` |
| Permission / forbidden / read-only | `<server rule and UI behavior>` |
| Archived / locked | `<behavior>` |
| Unsaved changes / destructive confirmation | `<shared component and recovery>` |
| Offline / stale / conflict | `<policy; use N/A with reason only when inapplicable>` |
| Mock data | `<local draft only, authoritative prerequisites, no fabricated identity/scope/concurrency, or N/A>` |

## 9. Concurrency, transactions, and consistency

State RowVersion/expected-version behavior, stale refresh/reload behavior, duplicate
submission handling, transaction boundaries, and any cross-screen consistency
requirement. Use `N/A — reason` only when concurrency truly cannot affect this child.

## 10. i18n, RTL, accessibility, and responsive behavior

Record translation ownership, RTL behavior, keyboard/focus/accessibility behavior,
small/large viewport layout, internal scrolling, and any platform-specific
Required/Deferred/Excluded differences.

## 11. Vertical execution ledger (strict one-active-step gate)

Complete the rows in order. A row is not complete because its code exists; it is
complete only when its evidence is recorded. The next row remains blocked until the
previous row is `Verified`.

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | `<Queued, Active, or Verified>` | `<feature boundary and server contract approved>` | `<typed contracts, tests, migration/schema, permissions>` | `<path>` |
| 2 | Web | `<Queued, Active, or Verified>` | `<API stage Verified>` | `<API-backed Web journey, states, pattern fidelity, tests>` | `<path>` |
| 3 | Mobile | `<Queued, Active, or Verified>` | `<Web stage Verified>` | `<API-backed Mobile/device journey, states, pattern fidelity, tests>` | `<path>` |
| 4 | Integrated live verification | `<Queued, Active, or Verified>` | `<API, Web, and Mobile stages Verified>` | `<authenticated API + Web + actual Mobile/device journey>` | `<path>` |
| 5 | Documentation and closure | `<Queued, Active, Verified, or Closed>` | `<integrated live verification Verified>` | `<canonical docs, manifest/recipe, education when required>` | `<path>` |

**Next-step rule:** no sibling feature may become `Active` until this feature's
Integrated live verification is `Verified` and Documentation and closure is
`Closed`. A feature with any stage `Active`, `Blocked`, or `Pending evidence` keeps
all later roadmap rows `Queued` or `Blocked`.

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | | | |
| API/transport | | | |
| Persistence/migration | | | |
| Web | | | |
| Mobile | | | |
| E2E/manual/live | | | |

## 13. Child exit gate

This child is complete only when:

- [ ] Contract version is current and every screen/platform row passes the UI Pattern Gate.
- [ ] No `Candidate` pattern remains; any new pattern is registered and reviewed.
- [ ] Its boundary is implemented without absorbing sibling workflows.
- [ ] Screen/workspace behavior matches the approved pattern and plan.
- [ ] Reused components and any generic extensions match the reuse audit.
- [ ] Typed transport, server criteria, permissions, and persistence are verified.
- [ ] API → Web → Mobile → integrated live verification evidence is recorded in order.
- [ ] i18n/RTL/accessibility/responsive and offline/mock-data requirements are verified.
- [ ] Documentation/manifest/recipe and required customer education are reconciled.
- [ ] The roadmap records this feature `Verified`/`Closed` before the next feature becomes `Active`.
