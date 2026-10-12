# Managed Crystal Template Validation Next.js Implementation Profile

## 1. Boundary

No Next.js runtime implementation is authorized in this child. The existing Report
Manager is a downstream consumer whose validation-state UX belongs to the next
feature.

## 2. Route and transport

Existing manager routes and create/add/import/publish request bodies remain stable.
Version responses gain additive validation schema-version/fingerprint fields; the
current client may ignore them until the manager child.

## 3. Server list

Deferred. Search, filters, sort, paging and status vocabulary are unchanged.

## 4. Grid

Deferred. The next child must reuse the shared grid/toolbar/status components and
surface compatibility states without local filtering.

## 5. Cards and chart

Excluded in this child. No new view is authorized.

## 6. Forms and lifecycle

Deferred. Current upload/import/publish controls remain; the next child will add a
supported-entity selector, precise validation feedback and recovery/revalidation
behavior through the shared form/dialog system.

## 7. Import

Server `.rpt` import remains available with the existing request. No spreadsheet
import or client parsing is introduced.

## 8. Report

No report-view change. API render now fails closed on stale validation evidence;
user-facing mapping is verified in later manager/Fiscal Years children.

## 9. Localization and access

No visible text or permission change. Existing server permissions and report ACL
remain authoritative. Security redesign remains the final phase.

## 10. Realtime and cache

Excluded. No new event or invalidation is introduced.

## 11. Offline and mock data

Excluded. Template validation is online/server authoritative and cannot be mocked
as final business evidence.

## 12. Tests

No Web source test is required for this no-change child. Phase 06 records a scoped
diff/no-contract-break review. The next manager child owns focused UI/service tests.

## 13. Accessibility, RTL and responsive behavior

Unchanged. Later visible state/error work must be bilingual, RTL/LTR aware,
keyboard/focus accessible and responsive using shared components.

## 14. Release disposition

Web is Deferred, not silently complete. This child may close with no Web edit only
after API/runtime verification and explicit downstream handoff evidence.

