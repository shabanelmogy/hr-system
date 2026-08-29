# Addresses Review Artifacts

Status: applied domain foundation review.

## Verified source

- `api/HrManagementSystem.Domain/GeographicalInformation/Addresses/Entities/Address.cs`
- `api/HrManagementSystem.Domain/GeographicalInformation/Addresses/Entities/CompanyAddress.cs`
- `api/HrManagementSystem.Domain/GeographicalInformation/Addresses/Entities/BranchAddress.cs`
- `api/HrManagementSystem.Infrastructure/Features/GeographicalInformation/Addresses/Persistence/AddressConfiguration.cs`
- `api/HrManagementSystem.Infrastructure/Persistence/Configurations/OrganizationalStructure/CompanyAddressConfiguration.cs`
- `api/HrManagementSystem.Infrastructure/Persistence/Configurations/OrganizationalStructure/BranchAddressConfiguration.cs`
- `api/HrManagementSystem.Application/Features/GeographicalInformation/Addresses/Contracts/AddressRequestValidator.cs`
- `api/HrManagementSystem.Application/Features/GeographicalInformation/Validation/PrintableTextRules.cs`
- `api/HrManagementSystem.Application/Features/GeographicalInformation/Validation/GeographicalNameRules.cs`
- `api/HrManagementSystem.Infrastructure/Features/GeographicalInformation/Addresses/Services/AddressService.cs`

## Decisions

| Decision | Status | Evidence |
|---|---|---|
| Country direct FK | Required | Address entity/configuration/request validator |
| State/District optional | Required | Nullable entity fields and optional FKs |
| Flexible street/city fields | Required | Address entity/configuration |
| Nullable paired coordinates | Required | Validator and three SQL checks |
| Owner-specific primary status | Required foundation | CompanyAddress/BranchAddress + filtered indexes |
| Employee/Emergency Contact links | Deferred | Employee domain and privacy policy not yet implemented |
| Standalone web/mobile Address screens | Deferred | Platform references |
| Country-specific address format | Deferred | Requires Country policy contract |

## Findings resolved

- Address no longer requires District, floor, apartment, postal code, or
  coordinates for every use case.
- Address no longer carries a company-wide `IsDefault` flag.
- Company and Branch no longer use isolated scalar `AddressId` fields.
- State/District/AddressType script-only and corrupted Arabic SQL checks were
  removed.
- All geographical display names now share one printable-Unicode rule: spaces,
  digits, punctuation, and mixed scripts are allowed; control characters and
  line breaks are rejected. Address free-text fields use the same printable
  boundary with field-specific lengths.
- State and District relation configuration now agrees that their parent is
  required, while Address relations are optional.
- Country/State/District lifecycle checks now protect active Address references,
  and the compatibility Address toggle blocks active owner links.
- Company/Branch link constructors now require the company scope and owner IDs,
  preventing incomplete owner relationships before owner-link commands exist.

## Remaining findings

- The existing Address HTTP surface is still a compatibility service rather
  than the full CQRS owner-link API.
- Company/Branch owner-link commands and UI are deferred until those domains are
  implemented.
- Country ISO code validation is intentionally strict and currency remains an
  optional ISO integration value. A Currency master entity is deferred to the
  Finance/Payroll domain so Geography does not own a duplicate financial
  catalog.

## Verification record

| Gate | Result |
|---|---|
| API build | Passed |
| API tests | Passed: 349/349 |
| web-next type-check | Passed |
| web-next lint | Passed |
| web-next architecture | Passed |
| web-next tests | Passed: 86 files, 300 tests |
| web-next production build | Passed |
| mobile typecheck/lint/architecture | Passed |
| mobile tests | Passed: 41 suites, 120 tests |
| Documentation generation check | Passed: 49 recipes |
| Local Markdown-link scan | Passed |
| `git diff --check` | Passed |
