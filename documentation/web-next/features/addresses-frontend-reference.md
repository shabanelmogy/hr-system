# Addresses Next.js Frontend Reference

Status: Deferred standalone feature; shared-form integration contract is
defined.

## 1. Current boundary

There is currently no standalone Address route in `web-next`. Address is a
reusable domain component consumed by Company, Branch/Work Location, Employee,
and future Emergency Contact forms. A standalone Grid, Cards, Report, Import,
or address CRUD page must not be created until the owning workflow and privacy
permissions are defined.

## 2. Shared form contract

When implemented, the feature must use the shared `MyForm`/`FormContainer`
system, shared address fields, dependent Country → State → District lookups,
server validation, and the API contract in
`documentation/api/Addresses_API_Implementation_Profile.md`. Country and State
selectors must not locally filter or invent hierarchy relationships. City,
street lines, building details, postal code, and coordinates must preserve the
API nullability. `IsPrimary` belongs to the owner link form, not the Address
form.

## 3. Web-specific requirements

Web-specific requirements are EN/AR translation keys, RTL-safe layout, keyboard
focus/error handling from the shared form system, read-only/permission guards,
and owner-specific list visibility. Any future list must keep paging/search on
the server and must not expose employee PII through a generic Address list.

## 4. Lifecycle and release gate

The browser must surface server hierarchy errors and must not locally invent
Country/State/District relationships. Owner-link forms own `IsPrimary` and
purpose; the Address form does not. Standalone UI remains deferred until the
owning Company, Branch, Work Location, or Employee workflow defines its
permission boundary.
