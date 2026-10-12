# Managed Crystal Report Manager Experience — Full Review

Status: API and Web Verified; Mobile administration exclusion Verified; integrated live verification Active.

## 1. Scope and outcome

Improve the existing Web-only Report Manager so administrators choose a supported
entity, understand all validation states and can revalidate immutable stored
versions. Preserve strict validation and every current lifecycle/ACL rule.

## 2. Architecture and ownership

Reporting owns report contracts, versions and lifecycle. The embedded registry is
the only entity-contract source. The Crystal runtime remains an SDK adapter. Web
consumes typed public APIs; Mobile administration is Excluded.

## 3. Business lifecycle

Versions remain append-only. Validation is Pending, Valid, Invalid or
NeedsRevalidation. Revalidation verifies the same stored bytes against the current
contract. Publish/render remain limited to current-fingerprint Valid evidence.

## 4. API and consistency

The API exposes a bounded supported-entity query and a version revalidation command. Upload
permission plus report Upload ACL applies. Report locking serializes revalidation;
publish/grants/archive keep their current SQL RowVersion rules.

## 5. Web workspace

The canonical administration route retains the server-paged `MyDataGrid`, detail
tabs, deployment import and lifecycle actions. Entity list/create/import inputs now
use the API-backed selector. Create uses React Hook Form, Zod and the shared
`MyForm` system; version detail shows all four states, evidence/source identity,
recovery guidance and authorized revalidation. Publish is disabled unless the exact
stored version is `Valid` under the current contract.

## 6. Scope, permissions and errors

Tenant/company remain server-derived. Stable deterministic compatibility errors
are actionable; transient inspector/storage failures preserve prior evidence.
Security hardening is explicitly Phase 6, not part of this child.

## 7. Platform disposition

Web Grid/Detail/Import are Required. Cards/Table/Tree/Chart/Export are Excluded.
Report consumption is Deferred to Phase 4. Mobile manager administration is
Excluded with no placeholder screen.

## 8. Deferred and release work

`RISK-008` real designer `.rpt` and PDF acceptance is Deferred to Phase 4/release.
Runtime operations remain Phase 5 and security/dependency work Phase 6. None of
these may weaken or bypass strict validation during development.

## 9. Verification plan

API handler/controller/ACL/state tests passed before Web. Web service/lifecycle/
validation/component tests pass, as do the complete static gate, 666-test suite and
77-page production build. Mobile source/route audit, reporting transport regression
tests and contract matrix confirm that administration remains absent. Authenticated
EN/AR and RTL/LTR browser/API workflow remains the active integrated stage.

## 10. Closure rule

Close only after API → Web → Mobile disposition → integrated verification →
documentation/education complete in order. Phase 4 cannot start before this child
is Verified/Closed.
