# Attendance Devices Next.js Implementation Profile

## 1. Review Manifest
Browser implementation of phase-one raw attendance integration.

## 2. Source Map and Ownership
Feature boundary is src/features/attendance-devices; App Router entries are thin under app/(main)/attendance-devices.

## 3. HTTP Contract
Use only config/api/attendanceDevices.ts. Types/services follow exact API DTOs;
credentials and Agent enrollment tokens are write-only. The browser never calls a
local connector, receives a device Comm Key, or supplies a private-network address
to the hosted API for immediate connection.

## 4. Read Path
Use query hooks and shared server list state. Never local-filter/page or derive attendance values.

## 5. View Contract
Devices use vertical master/detail. Users, punches and runs use existing server grid/pagination.

## 6. Device Form and Branches
Create/edit state is separate. Branch is optional and loaded from same-company lookup; no token-based branch assumption.

## 7. Lifecycle Actions
Actions support Agent assignment, edit/enable, CommKey, test, pull users, and
editable From/To raw-punch pull. A pull becomes a durable queued run; the assigned
local Agent performs it and the UI polls/realtime-invalidates the authoritative run
status. Clear stale result when selection changes.

## 8. Permissions and Read-only
Use shared permission matrix; no mutation affordance for read-only actors.

## 9. Raw Lists and Filters
Users search code/name; punches filter device/code/date period; runs filter device/status/operation. Preserve raw code/modes.

## 10. Shared Components
Reuse FeatureModuleLayout, PageHeader, MyDataGrid, toolbar/filter modal, GridFooter, server-list, feedback, icons and theme. Do not create substitutes.

## 11. Localization, RTL and Accessibility
All visible text is EN/AR translation key driven with logical CSS, accessible controls and RTL grids.

## 12. Realtime and Freshness
Invalidate attendance query families and poll pending/leased/running runs. Show the
assigned Agent's freshness and SDK status, never a browser-local SDK assumption. Do
not show a prior device result after selection changes.

## 13. Verification
Run type-check, strict type-check, lint, focused tests and manual EN/AR LTR/RTL responsive review.

## 14. Final Reconciliation
Cards/charts/reports/import/export are excluded; mobile remains deferred. API shape changes require matching type/service/query tests.
