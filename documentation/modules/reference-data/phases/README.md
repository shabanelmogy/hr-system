# ReferenceData delivery phases

ReferenceData no longer has an empty scaffold phase. Delivery is tracked per
feature because global geography, company-scoped Address Types, and reusable
Addresses have different ownership and platform requirements.

| Feature | Current phase outcome |
| --- | --- |
| Countries | Applied API/Web/Mobile reference with canonical evidence |
| States | Applied dependent global-reference slice |
| Districts | Applied dependent global-reference slice |
| Address Types | Applied company-scoped API/Web/Mobile slice |
| Addresses | Applied API/domain foundation; owner-link and standalone client work deferred |

Use the [feature catalog](../features/README.md) to open each feature's canonical
books and required-file manifest. The documentation recipe system under
`documentation/system/` owns shared phase rules and generated packets; this
module index must not duplicate them.

For new work, record a reuse inventory and complete the authorized plan and
Phase 00 preflight before runtime implementation. Extend manifests only with
evidence that exists, classify every Web/Mobile surface as Required, Deferred,
or Excluded, and run the documentation checks after authored sources change.
