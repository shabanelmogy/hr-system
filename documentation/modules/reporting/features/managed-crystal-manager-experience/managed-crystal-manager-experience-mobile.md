# Managed Crystal Report Manager Experience — Expo Disposition

## 1. Scope

Mobile manager administration is Excluded. This child must not add a route,
placeholder screen or mutation client.

## 2. Ownership

Reporting administration remains Web-only. Mobile managed report consumption stays
owned by the later Fiscal Years acceptance child.

## 3. Transport

No Mobile DTO or endpoint client is added for supported metadata or revalidation.

## 4. Navigation

No route, module item, deep link or notification target is introduced.

## 5. List views

Table, Cards, Grid and search/filter administration are Excluded.

## 6. Forms

Create, import, upload and revalidation forms are Excluded.

## 7. Detail

Version/grant/archive administration detail is Excluded.

## 8. Reporting

Report viewing is Deferred to `fiscal-years-managed-crystal-report`; this child
does not claim viewer behavior.

## 9. Lifecycle actions

Publish, grant, archive and revalidate actions are Excluded from Mobile.

## 10. Permissions

No Mobile admin permission mapping/control is added. Existing consumer permissions
remain unchanged.

## 11. Offline

N/A because no Mobile administration surface exists.

## 12. Mock data

N/A because no Mobile administration surface exists.

## 13. i18n and accessibility

No visible Mobile strings or controls are added. Existing report consumers are not
modified in this child.

## 14. Verification

Verified on 2026-09-29: route constants, the administration layout, module
registration and Platform Reporting boundaries contain no manager administration
route or supported-entity/revalidation mutation. Mobile retains only published
report consumption. Focused module-registration and Reporting transport tests
passed 8/8, and the compatibility matrix passed 83 routes, 30 endpoint files and
230 endpoint members.

## 15. Status and handoff

Verified as explicitly Excluded for this feature. Phase 4 reopens only the required Fiscal
Years report-consumption journey, not general Report Manager administration.

### Additive global Angular manager2026-11-01

The requester separately authorized global-crystal-template-management/GCT-1. Its additive global audited tables, exact role/action/entity Edit policy and Angular manager reuse existing native ports/private storage/lifecycle discipline. This existing tenant manager/ACL lifecycle stays unchanged. Global consumption keeps the current opaque envelope with explicit managed shadowing. See the new feature current books and FOLLOW-024; this addition does not close this plan’s pending native/integrated acceptance.
