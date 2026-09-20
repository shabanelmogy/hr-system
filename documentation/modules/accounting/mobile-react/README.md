# Accounting mobile documentation

Accounting has an active Expo/React Native Fiscal Years slice under
`mobile-react/src/modules/accounting/fiscal-years`, registered through the
Accounting module definition and protected by the Fiscal Years permission set.
It includes server-managed list/table/card behavior, create/edit/view forms,
lifecycle actions, read-only enforcement, and shared-state/error/confirmation
components. This does **not** imply that broader Accounting is implemented.

Future Accounting capabilities follow their approved feature plan. Write flows,
including Core GL where Required, must define online/offline authority, ambiguous
retry reconciliation, idempotency, permissions, accessibility, localization, and
audit feedback independently from the Web layout while reusing the shared mobile
design system first.
