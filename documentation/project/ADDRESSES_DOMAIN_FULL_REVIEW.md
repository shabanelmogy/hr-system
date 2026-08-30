# Addresses Domain Full Review

Status: applied domain foundation; owner-management APIs and standalone clients
are intentionally Deferred.

Reviewed: 2026-08-27

## 1. Purpose and boundary

Address is a reusable, company-scoped location/contact record. Its locality and
street text accepts printable Unicode with field-specific length limits; it is
not forced into an English-only or Arabic-only script rule. Geographic display
names use the same shared 2-100 printable-Unicode rule. It is not the
owner of Company, Branch, Employee, Candidate, or Emergency Contact semantics.
Those domains own the relationship to an Address and decide purpose, primary
status, visibility, and effective dating.

The current implementation keeps the existing `/api/v1/addresses` service
surface so current consumers can migrate incrementally. The new domain model
adds explicit owner link entities for Company and Branch and removes the
ambiguous direct `AddressId` fields and Address-level `IsDefault` flag.

## 2. Data model

`Address` contains:

- required `CountryId`;
- optional `StateId`, `DistrictId`, and `City`;
- optional `StreetLine1`, `StreetLine2`, `BuildingNumber`, `Floor`,
  `ApartmentNumber`, `PostalCode`, and `AdditionalInfo`;
- nullable paired `Latitude` and `Longitude`;
- required company-scoped `AddressTypeId`.

`StateId` and `DistrictId` are validated against the selected Country chain.
The database has direct foreign keys for each selected level; cross-level
consistency is enforced by both the request validator and the service's
transactional revalidation.

`CompanyAddress` and `BranchAddress` contain the owning Company/Branch IDs,
`AddressPurpose`, and `IsPrimary`. Their constructors require the company
scope and owner IDs so a future owner-link command cannot create an incomplete
relationship. Filtered unique indexes allow one active primary address per
owner and purpose. No polymorphic `OwnerType/OwnerId` is used.

## 3. API contract

The existing routes remain:

| Method | Route | Decision |
|---|---|---|
| GET | `/api/v1/addresses` | Current company list; retained during migration |
| GET | `/api/v1/addresses/{id}` | Detail |
| GET | `/api/v1/addresses/{id}/details` | Detail with geographic/type relations |
| POST | `/api/v1/addresses` | Creates a flexible address |
| PUT | `/api/v1/addresses` | Updates a flexible address |
| DELETE | `/api/v1/addresses/{id}` | Soft archive/restore toggle during legacy service period |
| GET | `/api/v1/addresses/count` | Active count |

Create/update request fields use the same names as the domain model. `CountryId`
is required; State, District, City, street lines, structured building details,
postal code, and coordinates are nullable. Coordinates must be both null or
both valid.

Owner-link CRUD endpoints are Deferred until Company, Branch, Work Location,
and Employee workflows are implemented together. The link entities are already
part of the persistence model so future APIs do not need to reintroduce
`AddressId` columns or an Address-level default.

## 4. Validation and lifecycle

- Active Country and AddressType are required.
- Optional State must belong to Country.
- Optional District requires State and must belong to the same Country chain.
- All text is trimmed at the service boundary and stored as null when blank.
- Coordinates are range-checked and paired.
- Names in the global Country/State/District catalogs are Unicode data; SQL
  constraints that only permit English or a corrupted Arabic range were removed.
- Address create/update validates the active Country -> optional State ->
  optional District chain inside the transaction that writes the row. Address
  mutations share Country/State/District lifecycle locks with parent archive
  operations, so a parent cannot be archived around an address commit.
- Create, update, and restore also require the selected Country to be in the
  current company's active operating-country scope. Address mutations and scope
  replacement share `company-geographic-scope:{tenantId}:{companyId}`, so an
  address cannot be committed while its Country is concurrently removed from
  that scope.
- Country and State archive also reject active Address references; District
  archive keeps the existing active-Address dependency check.
- Archiving Address is blocked by active owner links. Restore takes a stable
  snapshot, locks AddressType, Country, optional State/District, and company
  scope resources, then revalidates every dependency before activation. The
  current toggle remains available for compatibility; explicit CQRS
  Archive/Restore routes remain a future boundary cleanup.

## 5. Authorization and privacy

Address reads/writes remain tenant/company scoped and permission protected.
Future Employee and Emergency Contact address APIs must not reuse a broad
company-wide list permission for PII. They must apply owner-domain authorization
and audit access to home and emergency addresses.

Company Geographic Scope is a write-time policy for legal entity, Branch, and
Work Location addresses. It is not a restriction on employee nationality or a
candidate's home address.

## 6. Verification evidence

| Area | Source |
|---|---|
| Entity | `api/HrManagementSystem.Domain/GeographicalInformation/Addresses/Entities/Address.cs` |
| Owner links | `CompanyAddress.cs`, `BranchAddress.cs`, `AddressPurpose.cs` |
| Request/response | `api/HrManagementSystem.Application/Features/GeographicalInformation/Addresses/Contracts` |
| Validation | `AddressRequestValidator.cs` and Country/State/District validation queries |
| Persistence | `AddressConfiguration.cs`, `CompanyAddressConfiguration.cs`, `BranchAddressConfiguration.cs` |
| Migration | `RefactorAddressesForGlobalGeography` |
| Current HTTP boundary | `api/HrManagementSystem.Api/Features/GeographicalInformation/Addresses/V1/AddressesController.cs` |

## 7. Client decisions

No standalone Address feature route exists in `web-next` or `mobile-react`.
Standalone Grid, Cards, Import, Report, and CRUD forms are Deferred. The future
Company/Branch/Employee forms must use shared form and list components and the
same request contract; they must not create local address DTOs.

The existing District and AddressType relation views expose nullable structured
address fields and no longer expose the removed Address-level `IsDefault` flag.

## 8. Release gate

Before production, complete owner-link commands, explicit CQRS Archive/Restore,
Employee PII policy, purpose-specific country policies, and cross-platform
forms. For Egypt, Registered Office and Work Location owner-link commands must
require an Egyptian Country, Governorate/State, city/region, street line, and
building number; postal code stays optional, and an ETA tax branch identifier
must not be inferred from the general `BranchCode`. These requirements belong
to the owner purpose, not every reusable Address. The current foundation is
ready for Organizational Structure development only as long as new
Company/Branch address work uses the link entities.
