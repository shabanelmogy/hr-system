# Attendance Devices Expo Implementation Profile

## 1. Exact Source Inventory
No mobile runtime source exists in phase one.

## 2. Product Decision
Mobile is Deferred; reopen after API/web workflow hardware verification.

## 3. Route and Authorization
No placeholder mobile route, drawer item, or permission is added.

## 4. Runtime Schema Contract
Future mobile client validates exact device, raw-user, raw-punch, run, provider, branch and page contracts.

## 5. Endpoint Contract
Use authenticated HR API only; never call the x86 connector or store CommKey.

## 6. Server List State
Use server paging, sorting and filters only.

## 7. Device View Contract
Future native UI supports device selection, test, credentials and raw pulls with shared components.

## 8. Raw Users Contract
Show code/name/safe metadata only.

## 9. Raw Punches Contract
Preserve local time, UTC and raw mode codes; never derive attendance.

## 10. Pull Runs Contract
Show status/count/error code without claiming device success.

## 11. Credentials and Branches
Credentials stay write-only. Branch is optional same-company selection, not token claim.

## 12. Localization and Accessibility
Use shared EN/AR, RTL, safe-area and native accessibility patterns.

## 13. Realtime
Subscribe to HR query invalidations then refetch bounded queries.

## 14. Reopening Trigger
Implement after real provider/device matrix approval and mobile filters cover required criteria.

## 15. Verification
Require schemas, serialization, permissions, stale selection, RTL and manual workflow tests before support.
