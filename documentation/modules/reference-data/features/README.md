# ReferenceData feature catalog

This is the module-owned index of implemented and deferred vertical slices. The
linked feature books own behavior and decisions; required-file manifests define
the current evidence surface. Generated phase packets are navigation aids and
must not be used as proof on their own.

| Feature | Scope and status | Canonical evidence |
| --- | --- | --- |
| Countries | Global Platform catalog; API/Web/Mobile applied | [Master](../../../project/COUNTRIES_FEATURE_FULL_REVIEW.md) · [API](../../../api/Countries_API_Implementation_Profile.md) · [Web](../../../web-next/features/countries-frontend-reference.md) · [Mobile](../../../mobile-react/countries-mobile-reference.md) · [Manifest](../../../system/features/countries/required-files.json) |
| States | Global child of Country; API/Web/Mobile applied | [Master](../../../project/STATES_FEATURE_FULL_REVIEW.md) · [API](../../../api/States_API_Implementation_Profile.md) · [Web](../../../web-next/features/states-frontend-reference.md) · [Mobile](../../../mobile-react/states-mobile-reference.md) · [Manifest](../../../system/features/states/required-files.json) |
| Districts | Global child of State; API/Web/Mobile applied | [Master](../../../project/DISTRICTS_FEATURE_FULL_REVIEW.md) · [API](../../../api/Districts_API_Implementation_Profile.md) · [Web](../../../web-next/features/districts-frontend-reference.md) · [Mobile](../../../mobile-react/districts-mobile-reference.md) · [Manifest](../../../system/features/districts/required-files.json) |
| Address Types | Company-scoped tenant capability; API/Web/Mobile applied | [Master](../../../project/ADDRESS_TYPES_FEATURE_FULL_REVIEW.md) · [API](../../../api/AddressTypes_API_Implementation_Profile.md) · [Web](../../../web-next/features/address-types-frontend-reference.md) · [Mobile](../../../mobile-react/address-types-mobile-reference.md) · [Manifest](../../../system/features/address-types/required-files.json) |
| Addresses | Company-scoped core CQRS/API and persistence applied; owner links and standalone clients deferred | [Master](../../../project/ADDRESSES_DOMAIN_FULL_REVIEW.md) · [API](../../../api/Addresses_API_Implementation_Profile.md) · [Web](../../../web-next/features/addresses-frontend-reference.md) · [Mobile](../../../mobile-react/addresses-mobile-reference.md) · [Manifest](../../../system/features/addresses/required-files.json) |

When a feature changes, update its master review and affected API, Web, and
Mobile profiles together. Record a platform surface as Required, Deferred, or
Excluded explicitly; do not infer it from another platform. Update the
required-file manifest when the evidence surface changes, then regenerate or
check the documentation system through its scripts rather than editing generated
packets directly.
