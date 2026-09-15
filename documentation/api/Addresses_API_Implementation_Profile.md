# Addresses API Implementation Profile

Status: domain foundation applied; owner-link CQRS endpoints are Deferred.

## 1. Boundary

The current versioned controller is a tenant/company permission boundary over
the reusable Address entity. It is a thin `ISender` adapter over Application-owned
CQRS commands/queries; persistence is exposed through `IAddressReadStore` and
`IAddressWriteStore` and implemented in ReferenceData Infrastructure.
Future owner-link APIs must be thin controllers over CQRS commands and queries,
with Company, Branch, Employee, and Work Location ownership kept in their own
feature slices.

## 2. Request shape

```json
{
  "id": 0,
  "countryId": 65,
  "stateId": 7,
  "districtId": 22,
  "city": "Cairo",
  "streetLine1": "Tahrir Street",
  "streetLine2": null,
  "buildingNumber": "10",
  "floor": null,
  "apartmentNumber": null,
  "postalCode": "11511",
  "additionalInfo": null,
  "latitude": null,
  "longitude": null,
  "addressTypeId": 3
}
```

`countryId` and `addressTypeId` are positive active references. State and
District are optional, but a supplied District requires a matching State and
Country. Latitude and longitude are nullable as a pair. Optional locality,
street, building, postal, and notes fields accept printable Unicode text with
their field-specific length limits; control characters and line breaks are
rejected.

## 3. Persistence

`AddressConfiguration` stores nullable structured fields, direct Country/State/
District foreign keys, range and paired-coordinate constraints, and a composite
tenant/company/ID alternate key. `CompanyAddressConfiguration` and
`BranchAddressConfiguration` enforce owner-scoped primary-purpose uniqueness.

`CompanyAddress` and `BranchAddress` use `AddressPurpose` and `IsPrimary`; the
old Company/Branch scalar `AddressId` columns and Address-level `IsDefault` are
removed by `RefactorAddressesForGlobalGeography`.

## 4. Side effects and security

The current Address change job remains post-commit and permission-scoped. It
uses a safe display fallback when BuildingNumber is absent. Company filters and
tenant filters remain authoritative. Employee address consumers must add
privacy-specific permissions before exposing home or emergency addresses.

## 5. Lifecycle and integration rules

The Address command handlers validate active Country/State/District and
AddressType references inside the transaction and acquire the corresponding
geographical lifecycle resources before writing. Country and State archive
commands reject active Address references; District archive does the same. This
prevents a valid address from being committed concurrently with an archived
parent. Create, update, and restore also require the selected Country to remain
inside the trusted current tenant/company operating scope through
`ICompanyGeographySource`. They share the current company's geographic-scope
lock with scope replacement. Update/restore snapshot the current lifecycle
references, lock the relevant old/new resources, re-read, and retry when the
snapshot changed while locks were acquired. Non-transactional change scheduling
occurs only after the owning transaction completes successfully.

## 6. Required future work

The Address CQRS read/write migration is complete. Remaining work is to add
owner-link commands with transaction locks for one-primary-per-owner-purpose.
Every owner-link mutation must retain the operating-country validation already
enforced by the Address write boundary and add its purpose-specific policy. In
the Egypt profile, Registered Office and Work Location require governorate,
city/region, street, and building number; postal code is optional and the ETA
branch identifier is a separate tax field. Publish cache and realtime
invalidation only after commit.
