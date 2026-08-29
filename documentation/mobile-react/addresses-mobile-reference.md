# Addresses Expo Mobile Reference

Status: Deferred standalone feature; owner-form integration contract is
defined.

## 1. Current boundary

There is currently no standalone Address screen in `mobile-react`. Address will
be composed inside Company, Branch/Work Location, Employee, and Emergency
Contact workflows. A native list, import, report, or independent CRUD screen is
not part of the current release.

## 2. Native form contract

Future forms must use the shared design-system fields and full-screen form shell,
runtime Zod validation, dependent Country → State → District selectors, safe
area and keyboard handling, EN/AR translation parity, and RTL-safe layouts.
Nullable API values must remain nullable; missing coordinates must not become
`0,0`. Primary status belongs to the owner link and must not be modeled as an
Address property.

## 3. Privacy and release gate

Employee and emergency addresses require owner-domain permissions and privacy
redaction. A generic company-wide Address list must not be reused for PII.
Mobile implementation remains deferred until the owning workflow and its scoped
navigation/permission contract are ready.
