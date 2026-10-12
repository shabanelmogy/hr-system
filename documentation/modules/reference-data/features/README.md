# ReferenceData feature catalog

This is the module-owned index of implemented and deferred vertical slices. The
linked feature books own behavior and decisions; required-file manifests define
the current evidence surface. Generated phase packets are navigation aids and
must not be used as proof on their own.

| Feature | Scope and status | Canonical evidence |
| --- | --- | --- |
| Countries | Global Platform catalog; API/Web/Mobile applied | [Master](countries/countries-review.md) · [API](countries/countries-api.md) · [Web](countries/countries-web.md) · [Mobile](countries/countries-mobile.md) · [Manifest](countries/required-files.json) |
| States | Global child of Country; API/Web/Mobile applied | [Master](states/states-review.md) · [API](states/states-api.md) · [Web](states/states-web.md) · [Mobile](states/states-mobile.md) · [Manifest](states/required-files.json) |
| Districts | Global child of State; API/Web/Mobile applied | [Master](districts/districts-review.md) · [API](districts/districts-api.md) · [Web](districts/districts-web.md) · [Mobile](districts/districts-mobile.md) · [Manifest](districts/required-files.json) |
| Address Types | Company-scoped tenant capability; API/Web/Mobile applied | [Master](address-types/address-types-review.md) · [API](address-types/address-types-api.md) · [Web](address-types/address-types-web.md) · [Mobile](address-types/address-types-mobile.md) · [Manifest](address-types/required-files.json) |
| Addresses | Company-scoped core CQRS/API and persistence applied; owner links and standalone clients deferred | [Master](addresses/addresses-review.md) · [API](addresses/addresses-api.md) · [Web](addresses/addresses-web.md) · [Mobile](addresses/addresses-mobile.md) · [Manifest](addresses/required-files.json) |

When a feature changes, update its master review and affected API, Web, and
Mobile profiles together. Record a platform surface as Required, Deferred, or
Excluded explicitly; do not infer it from another platform. Update the
required-file manifest when the evidence surface changes, then regenerate or
check the documentation system through its scripts rather than editing generated
packets directly.

## Feature folders

Every file of a feature lives in its folder. Generated phase packets are
never edited by hand.

| Feature | Files |
| --- | --- |
| `address-types` | [Review](address-types/address-types-review.md) · [API](address-types/address-types-api.md) · [Web](address-types/address-types-web.md) · [Mobile](address-types/address-types-mobile.md) · [Request](address-types/address-types-request.md) · [Evidence](address-types/address-types-evidence.md) · packets: [00](address-types/generated/PHASE-00-discovery-evidence.md) [01](address-types/generated/PHASE-01-domain-api.md) [02](address-types/generated/PHASE-02-web-client.md) [03](address-types/generated/PHASE-03-mobile-client.md) [04](address-types/generated/PHASE-04-domain-actions.md) [05](address-types/generated/PHASE-05-integration-runtime.md) [06](address-types/generated/PHASE-06-final-reconciliation.md) |
| `addresses` | [Review](addresses/addresses-review.md) · [API](addresses/addresses-api.md) · [Web](addresses/addresses-web.md) · [Mobile](addresses/addresses-mobile.md) · [Evidence](addresses/addresses-evidence.md) · packets: [00](addresses/generated/PHASE-00-discovery-evidence.md) [01](addresses/generated/PHASE-01-domain-api.md) [02](addresses/generated/PHASE-02-web-client.md) [03](addresses/generated/PHASE-03-mobile-client.md) [04](addresses/generated/PHASE-04-domain-actions.md) [05](addresses/generated/PHASE-05-integration-runtime.md) [06](addresses/generated/PHASE-06-final-reconciliation.md) |
| `countries` | [Review](countries/countries-review.md) · [API](countries/countries-api.md) · [API contract](countries/countries-api-contract.md) · [Web](countries/countries-web.md) · [Mobile](countries/countries-mobile.md) · [Evidence](countries/countries-evidence.md) · packets: [00](countries/generated/PHASE-00-discovery-evidence.md) [01](countries/generated/PHASE-01-domain-api.md) [02](countries/generated/PHASE-02-web-client.md) [03](countries/generated/PHASE-03-mobile-client.md) [04](countries/generated/PHASE-04-domain-actions.md) [05](countries/generated/PHASE-05-integration-runtime.md) [06](countries/generated/PHASE-06-final-reconciliation.md) |
| `districts` | [Review](districts/districts-review.md) · [API](districts/districts-api.md) · [API contract](districts/districts-api-contract.md) · [Web](districts/districts-web.md) · [Mobile](districts/districts-mobile.md) · [Request](districts/districts-request.md) · [Evidence](districts/districts-evidence.md) · packets: [00](districts/generated/PHASE-00-discovery-evidence.md) [01](districts/generated/PHASE-01-domain-api.md) [02](districts/generated/PHASE-02-web-client.md) [03](districts/generated/PHASE-03-mobile-client.md) [04](districts/generated/PHASE-04-domain-actions.md) [05](districts/generated/PHASE-05-integration-runtime.md) [06](districts/generated/PHASE-06-final-reconciliation.md) |
| `states` | [Review](states/states-review.md) · [API](states/states-api.md) · [API contract](states/states-api-contract.md) · [Web](states/states-web.md) · [Mobile](states/states-mobile.md) · [Evidence](states/states-evidence.md) · packets: [00](states/generated/PHASE-00-discovery-evidence.md) [01](states/generated/PHASE-01-domain-api.md) [02](states/generated/PHASE-02-web-client.md) [03](states/generated/PHASE-03-mobile-client.md) [04](states/generated/PHASE-04-domain-actions.md) [05](states/generated/PHASE-05-integration-runtime.md) [06](states/generated/PHASE-06-final-reconciliation.md) |
