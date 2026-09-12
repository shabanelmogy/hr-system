# HR module

HR is the employee, organization, and workforce bounded context in the ERP
System modular monolith. This package is its ownership index. Shared workflow
rules live in [`../../system/README.md`](../../system/README.md); they are not
copied here.

## Verified foundation

- The runtime module is under `api/Modules/HR` and follows the canonical
  Contracts, Domain, Application, Infrastructure, Presentation, and bootstrap
  shape.
- The module owns the `hr` SQL schema, its DbContext, migrations history, and
  schema bootstrap.
- Host composition is explicit through `ErpModuleRegistry` and `HRModule`.

## Canonical feature books

HR feature evidence currently remains at the established paths so the existing
recipe manifest and generated packets keep their fingerprints:

- Cross-project reviews: [`../../project/COUNTRIES_FEATURE_FULL_REVIEW.md`](../../project/COUNTRIES_FEATURE_FULL_REVIEW.md),
  [`../../project/STATES_FEATURE_FULL_REVIEW.md`](../../project/STATES_FEATURE_FULL_REVIEW.md),
  and [`../../project/ADDRESSES_DOMAIN_FULL_REVIEW.md`](../../project/ADDRESSES_DOMAIN_FULL_REVIEW.md).
- API profiles: [`../../api/Countries_API_Implementation_Profile.md`](../../api/Countries_API_Implementation_Profile.md),
  [`../../api/States_API_Implementation_Profile.md`](../../api/States_API_Implementation_Profile.md),
  and [`../../api/Addresses_API_Implementation_Profile.md`](../../api/Addresses_API_Implementation_Profile.md).
- Web/mobile profiles remain in the existing [`../../web-next/`](../../web-next/)
  and [`../../mobile-react/`](../../mobile-react/) books.

These links are a catalog, not a claim that every HR capability is implemented
on every platform. Check each book and its required-file manifest for evidence.

Start with [ARCHITECTURE.md](ARCHITECTURE.md), [DELIVERY-ROADMAP.md](DELIVERY-ROADMAP.md),
the platform notes under `api/`, `web-next/`, and `mobile-react/`, and the
[phase index](phases/README.md).
