# Managed Crystal Template Validation Expo Implementation Profile

## 1. Boundary

No Expo runtime implementation is authorized. Mobile report administration is
Excluded; report consumption remains a later business-acceptance concern.

## 2. Route and authorization

Existing guarded routes and permissions remain unchanged. The server continues to
own tenant/company and Run ACL decisions.

## 3. API/schema contract

Existing report-list/render requests remain. Internal inspector and version
fingerprint evidence are not a Mobile input. Any later consumed additive field must
be added to runtime schemas in its owning child.

## 4. Query ownership

Excluded. No key, cache, invalidation or company-switch behavior changes.

## 5. Server list

Excluded. No manager list exists on Mobile.

## 6. Table and cards

Excluded. No validation-state presentation is added.

## 7. Chart

Excluded.

## 8. Form

Excluded. Mobile does not upload or import managed `.rpt` templates.

## 9. Lifecycle

Excluded for administration. Publication/revalidation is server/Web admin work.

## 10. Import

Excluded. Mobile spreadsheet/file import is unrelated to deployment `.rpt` import.

## 11. Report

Existing consumers keep stable entity keys, including tenant/company-scoped
`fiscalyears`. Reports do not depend on the selected/current fiscal year. Actual
PDF/error acceptance is Deferred to the Fiscal Years child.

## 12. Notifications and navigation

Excluded. No event/deep link is introduced.

## 13. Offline and mock data

Offline render and authoritative mock validation are Excluded. A live API/runtime
and current-valid published version are required.

## 14. Tests

No Mobile source test is required for this no-change child. Phase 06 records scoped
diff review; the later report child owns device and schema tests.

## 15. Accessibility and release disposition

No visible accessibility/RTL/layout change. Mobile remains explicitly Deferred for
report acceptance and Excluded for manager administration; this is not evidence of
end-to-end business completion.

