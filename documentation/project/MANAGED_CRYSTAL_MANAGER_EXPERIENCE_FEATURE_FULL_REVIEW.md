# Managed Crystal Report Manager Experience — Full Review

Status: Phase 00 target contract; runtime stages are not yet claimed.

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

Add a bounded supported-entity query and a version revalidation command. Upload
permission plus report Upload ACL applies. Report locking serializes revalidation;
publish/grants/archive keep their current SQL RowVersion rules.

## 5. Web workspace

Retain the canonical administration route, server-paged `MyDataGrid`, detail tabs,
deployment import and lifecycle actions. Replace free-text entity input with an
API-backed selector and raw create UI with the shared form-dialog system.

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

API handler/controller/ACL/state tests precede Web. Web requires service parser,
component journey, EN/AR, RTL/LTR, focus and responsive evidence. Then verify the
Mobile exclusion, authenticated integrated manager workflow and documentation.

## 10. Closure rule

Close only after API → Web → Mobile disposition → integrated verification →
documentation/education complete in order. Phase 4 cannot start before this child
is Verified/Closed.
