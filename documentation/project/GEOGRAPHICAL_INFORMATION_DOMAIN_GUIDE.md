# Geographical Information Domain Guide

Status: canonical domain map and integration guide.

This guide is the starting point for geographical work before building
Organizational Structure, Employee, Attendance, Payroll, or Recruitment. It
records ownership boundaries and cross-domain contracts; feature-specific
behavior remains in the linked books.

## Domain map

```text
Global Platform catalog
  Country
    State (optional administrative level)
      District (optional lower administrative level)

Company-scoped classification
  AddressType

Legal-entity geography
  Company.RegistrationCountryId -> one global Country
  CompanyCountry                -> enabled operating Countries + one default

Company-scoped reusable address
  Address
    CompanyAddress      -> Company + purpose + primary flag
    BranchAddress       -> Branch + purpose + primary flag
    EmployeeAddress     -> future Employee-owned link
```

## Ownership decisions

| Entity | Owner | Scope | Rule |
|---|---|---|---|
| Country | Platform | Global | Managed by `super_admin`; never copied per company |
| State | Platform | Global | Must have an active Country; represents a country-specific administrative level |
| District | Platform | Global | Must have an active State; optional for addresses and not universal worldwide |
| AddressType | Company | Tenant/company | Classifies business usage; stable codes should be added before finance/payroll depends on it |
| Address | Company | Tenant/company | Stores the reusable physical/contact location; no global default flag |
| CompanyAddress | Company domain | Tenant/company | Owns primary/purpose semantics for a company |
| BranchAddress | Branch/Organization domain | Tenant/company | Owns primary/purpose semantics for a branch or work location |
| CompanyCountry | Organizational Structure | Tenant/company | Selects operating countries; it is not a copy of Country |
| Company.RegistrationCountryId | Company/legal entity | Tenant/company | Identifies the legal country of registration; it is not the default operating Country |

## Odoo comparison

Odoo 19 models Country with required unique ISO-2 code, optional ISO-3 and a
currency relation, and country-specific address metadata such as address format,
state requirement, and ZIP requirement. See the official [Odoo country and
state model](https://github.com/odoo/odoo/blob/19.0/odoo/addons/base/models/res_country.py).

Odoo keeps partner addresses flexible: street, city, state, country, and ZIP are
optional according to the country, while an optional extension can register
cities. See [Odoo partner addresses](https://github.com/odoo/odoo/blob/19.0/odoo/addons/base/models/res_partner.py)
and [the optional city extension](https://github.com/odoo/odoo/blob/19.0/addons/base_address_extended/models/res_partner.py).

This project intentionally keeps stronger global lifecycle governance,
bilingual fields, District master data, and Company Geographic Scope. It adopts
Odoo's flexible address composition and owner-specific address usage without
copying Odoo's partner model.

## SAP SuccessFactors comparison

SAP Employee Central separates the Legal Entity, which is registered in one
Country, from Location, which represents a physical office where employees work.
See the official [SAP Foundation Objects guide](https://learning.sap.com/courses/sap-successfactors-employee-central-core-administration/introducing-foundation-objects)
and [Foundation Object association examples](https://help.sap.com/docs/successfactors-employee-central/implementing-employee-central-core/examples-of-foundation-object-associations).

This project follows that boundary without copying SAP's configuration engine:
`Company.RegistrationCountryId` is the legal country, `CompanyCountry` is the
operating-country allowlist, Branch is an organizational unit, and the physical
address remains a separate Address/owner-link concern. Employee nationality,
residence, work country, payroll country, and legal registration country are
independent concepts even when some initially share the same value.

## Integration rules

- Company and legal-entity addresses use `CompanyAddress` with purposes such as
  `RegisteredOffice`, `Mailing`, and `Billing`.
- `Company.RegistrationCountryId` is required by the Company Geographic Scope
  write contract, must reference an active selected operating Country, and must
  never be inferred at runtime from currency, timezone, address, nationality, or
  `CompanyCountry.IsDefault`.
- Branch and Work Location addresses use `BranchAddress` with `WorkLocation` as
  the normal purpose. A Branch timezone remains an explicit Branch property;
  Country must not be used as a timezone substitute.
- Employee home, mailing, and emergency addresses are PII. Employee-owned link
  tables must provide their own permissions, audit policy, and effective dates.
- Recruitment candidate addresses may be outside Company Geographic Scope and
  should not be forced into the company's operating-country list.
- Attendance geofencing may use a Work Location address only when coordinates
  are verified. Missing coordinates mean “not geocoded”, never `0,0`.
- Payroll and tax workflows select the legal entity and applicable country from
  their own effective-dated rules; an address is supporting data, not the sole
  source of tax jurisdiction.

## Required versus deferred

Required now:

- Company legal registration Country is stored independently from the default
  operating Country. Existing rows may remain temporarily null only when an
  additive migration cannot defensibly backfill them; the first successful scope
  save must supply it.
- Country is required on every Address.
- State and District are nullable and must belong to the selected parent chain.
- City/locality and street lines are supported.
- Postal details, building details, and coordinates are optional.
- Latitude and longitude are nullable as a pair and range-checked.
- `IsPrimary` belongs on owner links, not Address.
- Display names (`NameAr`, `NameEn`, and Address Type names) are required,
  trimmed, 2-100 characters, and may contain any printable Unicode script,
  spaces, digits, and punctuation. Control characters, tabs, and line breaks
  are rejected consistently by API, browser, and mobile validation.
- Technical identifiers keep their own rules: State/District codes are 2-10
  ASCII letters, digits, or hyphens; ISO alpha and currency codes are fixed
  ASCII letters; phone codes are an optional `+` followed by digits.

Deferred by design:

- A standalone Work Location foundation entity. Until employee assignment,
  working-hours, capacity, attendance, or geofencing requires its own lifecycle,
  Branch remains the organizational unit and `BranchAddress` with
  `AddressPurpose.WorkLocation` supplies the physical location.
- Branch/location target-population authorization and `UserBranchAccess`. Add it
  with the first branch-restricted workflow; do not put `BranchId` in the token.
- Effective dating for operating-country, BranchAddress, and future Work Location
  assignments. Branch already owns `OpenedOn`/`ClosedOn`; other dates are added
  to the relationship that actually needs historical truth, not to Country master.
- EmployeeAddress and EmergencyContactAddress APIs.
- CompanyAddress and BranchAddress command/query endpoints.
- Country-specific postal-code patterns and address-format rendering.
- A Currency master entity and financial currency relationships are owned by
  Finance/Payroll, not Geography. Until that bounded context exists,
  `Country.CurrencyCode` is an optional normalized ISO integration value only;
  introduce `CurrencyId`/foreign keys as part of the reviewed Finance/Payroll
  migration rather than creating a duplicate or incomplete geography entity.
- External address autocomplete/geocoding provider integration.

## Geographical name validation checklist

This checklist is the release gate for the name-rule change requested during
geographical development. It prevents a client or an old database constraint
from silently reintroducing the English-only/Arabic-only rule.

| Check | Status | Evidence |
|---|---|---|
| API has one shared printable-Unicode name rule | Done | `GeographicalNameRules.GeographicalName` |
| Countries validators use the shared rule | Done | `CountryMutationValidator` |
| States validators use the shared rule | Done | `StateMutationValidator`, `StateRequestValidator` |
| Districts validators use the shared rule | Done | `DistrictMutationValidator`, `DistrictRequestValidator` |
| Address Type validators use the shared rule | Done | `AddressTypeMutationValidator`, `AddressTypeRequestValidator` |
| Names accept spaces, digits, punctuation, Arabic and English text | Done | `GeographicalNameRulesTests` plus web/mobile schemas |
| Control characters, tabs and line breaks are rejected | Done | `GeographicalNameRulesTests` plus web/mobile schemas |
| Legacy geographical SQL check constraints are removed by migration | Done | `RefactorAddressesForGlobalGeography` migration `Up` |
| API deployment includes the changed assembly and pending migration | Pending deployment | Required for `https://shabanhrms.runasp.net` |
| Hosted API smoke test creates a name such as `New Cairo 2` | Pending deployment | Run after publishing API and applying migrations |

`EnglishLetterOnly` and `ArabicLetterOnly` remain valid messages for unrelated
Catalog/Reporting validators. They must not be referenced by geographical
names. The browser and mobile applications may be tested locally, but the
current `web-next/.env` points to the hosted API; a hosted smoke test cannot
pass until that API is rebuilt/published and its pending migration is applied.

## Development mock-data policy

The four geographical data-entry screens (Countries, States, Districts, and
Address Types) expose a shared development-only `Generate Mock Data` action in
their existing web `MyForm` and mobile `AppForm` shells. It fills schema-valid,
feature-owned values, marks the form dirty for review, and never submits or
persists a record. State and District samples bind to an active loaded parent;
the action stays disabled until that lookup is available. The first version is
local and deterministic enough for repeatable testing; it does not call an AI
service, create an API endpoint, or seed production data. A future AI provider
must be introduced behind an explicit adapter, permission boundary, validation
pass, and environment/feature flag without changing the form contract.

## Linked canonical books

- [Countries review](COUNTRIES_FEATURE_FULL_REVIEW.md)
- [States review](STATES_FEATURE_FULL_REVIEW.md)
- [Districts review](DISTRICTS_FEATURE_FULL_REVIEW.md)
- [Address Types review](ADDRESS_TYPES_FEATURE_FULL_REVIEW.md)
- [Company Geographic Scope review](COMPANY_GEOGRAPHIC_SCOPE_FEATURE_FULL_REVIEW.md)
- [Addresses review](ADDRESSES_DOMAIN_FULL_REVIEW.md)

Every future change to one of these domains must update the affected book and
the applicable API, browser, mobile, and documentation-system evidence in the
same change.
