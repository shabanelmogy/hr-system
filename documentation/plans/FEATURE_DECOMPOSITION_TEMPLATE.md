# <Child Feature> — Screen / Workflow Contract

> Use this template only when a master-plan slice is marked `Decompose` by the
> Feature Decomposition Gate. Store the completed contract under the owning business
> plan, for example
> `documentation/plans/business/<plan-id>/decomposition/<feature-id>.md`.

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Plan ID | `<plan-id>` |
| Authorized slice | `<exact slice id/name>` |
| Child Feature ID | `<kebab-case-feature-id>` |
| Child feature name | `<name>` |
| Owner | `<bounded context/module>` |
| Depends on | `<feature IDs / shared foundation / N/A>` |

## 1. Child boundary and outcome

Business workflow owned by this child:
<one coherent domain workflow>

Independent acceptance outcome:
<what can be verified complete without claiming sibling workflows are complete>

Explicitly outside this child:
<sibling workflows / Deferred / Excluded work>

## 2. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| `<reviewed feature/reference>` | `<path>` | `<structure/behavior>` | `<domain-specific difference>` |

Do not cite a reference name alone. Record the exact source/screen that was inspected
and the concrete behavior reused.

## 3. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| `<page/workspace/header/form/grid/tree/detail/...>` | `<exact path/component>` | `reuse | generic extension | feature-specific composition` | `<how it is used>` |

A generic renderer name by itself is insufficient. The table must identify the
actual reusable pieces and how they compose the child workflow.

## 4. Screen and workspace contract

Define the actual information architecture and interaction surfaces for this child.

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| List/Grid | | | |
| Tree/Hierarchy | | | |
| Detail/View | | | |
| Create/Edit | | | |
| Other workflow-specific surface | | | |

## 5. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |

Cover create, edit, view, lifecycle/domain actions, and read-only/forbidden states
that apply to this child.

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | `<DTO/schema/query/mutation>` |
| Server search/filter/sort | `<criteria and allow-lists>` |
| Paging/limits | `<server contract>` |
| Domain errors | `<stable errors/problem contract>` |
| Cross-module contract | `<contract/event or N/A>` |

Client-only filtering or state must not replace required server criteria.

## 7. UX states, permissions, and read-only behavior

| Concern | Contract |
| --- | --- |
| Loading / empty / error | |
| Permission / forbidden | |
| Read-only / archived / locked | |
| Unsaved changes / destructive confirmation | |
| Offline/stale behavior when applicable | |

## 8. Concurrency and consistency

State RowVersion/expected-version behavior, stale refresh/reload behavior, duplicate
submission handling, and any cross-screen consistency requirement. Use
`N/A — reason` only when concurrency truly cannot affect this child.

## 9. i18n, RTL, accessibility, and responsive behavior

Record translation ownership, RTL behavior, keyboard/focus/accessibility behavior,
small/large viewport layout, internal scrolling, and any platform-specific
Required/Deferred/Excluded differences.

## 10. Verification contract

| Layer | Required evidence/test | Critical scenario |
| --- | --- | --- |
| Domain/Application | | |
| API/transport | | |
| Web | | |
| Mobile | | |
| E2E/manual | | |

## 11. Child exit gate

This child is complete only when:

- [ ] Its boundary is implemented without absorbing sibling workflows.
- [ ] Screen/workspace behavior matches this contract and the approved plan.
- [ ] Reused components and any generic extensions match the reuse audit.
- [ ] Typed transport and server criteria are implemented and verified.
- [ ] Permissions/read-only states and concurrency behavior are verified.
- [ ] i18n/RTL/accessibility/responsive requirements are verified.
- [ ] Required automated/manual evidence above is green.
- [ ] The master slice records this child as complete without implying unfinished
      sibling features are complete.
