# Addresses API Implementation Profile

Status: domain foundation applied; owner-link CQRS endpoints are Deferred.

## 1. Boundary

The current versioned controller is a tenant/company permission boundary over
the reusable Address entity. It uses the existing service for compatibility.
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

The compatibility service validates active Country/State/District references
again inside its transaction and acquires the corresponding geographical
lifecycle resources before writing. Country and State archive commands reject
active Address references; District archive does the same. This prevents a
valid address from being committed concurrently with an archived parent.

## 6. Required future work

Replace the compatibility service with Address CQRS reads/writes, then add
owner-link commands with transaction locks for one-primary-per-owner-purpose.
Every owner-link mutation must validate Company Geographic Scope where the
owning domain requires an operating-country restriction and must publish cache
and realtime invalidation only after commit.
