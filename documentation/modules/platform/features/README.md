# Platform feature catalog

This is the module-owned feature index. Keep one entry per vertical slice and
link to its reviewed API, web, mobile, and cross-project evidence. Do not copy
the shared phase rules or generated packets; use documentation/system/ as the
single source for the documentation workflow.

| Feature | Status | Evidence |
| --- | --- | --- |
| User Administration | Implemented | Platform `UsersController`, CQRS user queries/commands, scoped persistence stores, Web users route, Mobile Administration screen, and cross-client response-contract tests |
| Role Administration and Permissions | Implemented | Platform role CQRS/controllers and module-catalog ownership metadata, Web module-first P-006 editor, Mobile responsive module selector plus screen cards, and API/Web/Mobile contract/presentation tests |
| Company Geographic Scope | Implemented | [review](company-geographic-scope/company-geographic-scope-review.md) · [API](company-geographic-scope/company-geographic-scope-api.md) · [web](company-geographic-scope/company-geographic-scope-web.md) · [mobile](company-geographic-scope/company-geographic-scope-mobile.md) |

Add further entries only when the corresponding runtime and verification evidence
exists, and mark future ideas as Planned or Deferred.

## Feature folders

Every file of a feature lives in its folder. Generated phase packets are
never edited by hand.

| Feature | Files |
| --- | --- |
| `company-geographic-scope` | [Review](company-geographic-scope/company-geographic-scope-review.md) · [API](company-geographic-scope/company-geographic-scope-api.md) · [Web](company-geographic-scope/company-geographic-scope-web.md) · [Mobile](company-geographic-scope/company-geographic-scope-mobile.md) · [Request](company-geographic-scope/company-geographic-scope-request.md) · [Evidence](company-geographic-scope/company-geographic-scope-evidence.md) · packets: [00](company-geographic-scope/generated/PHASE-00-discovery-evidence.md) [01](company-geographic-scope/generated/PHASE-01-domain-api.md) [02](company-geographic-scope/generated/PHASE-02-web-client.md) [03](company-geographic-scope/generated/PHASE-03-mobile-client.md) [04](company-geographic-scope/generated/PHASE-04-domain-actions.md) [05](company-geographic-scope/generated/PHASE-05-integration-runtime.md) [06](company-geographic-scope/generated/PHASE-06-final-reconciliation.md) |
| `tenant-module-entitlements` | [Review](tenant-module-entitlements/tenant-module-entitlements-review.md) · [API](tenant-module-entitlements/tenant-module-entitlements-api.md) · [Web](tenant-module-entitlements/tenant-module-entitlements-web.md) · [Mobile](tenant-module-entitlements/tenant-module-entitlements-mobile.md) · [Request](tenant-module-entitlements/tenant-module-entitlements-request.md) · [Evidence](tenant-module-entitlements/tenant-module-entitlements-evidence.md) · packets: [00](tenant-module-entitlements/generated/PHASE-00-discovery-evidence.md) [01](tenant-module-entitlements/generated/PHASE-01-domain-api.md) [02](tenant-module-entitlements/generated/PHASE-02-web-client.md) [03](tenant-module-entitlements/generated/PHASE-03-mobile-client.md) [04](tenant-module-entitlements/generated/PHASE-04-domain-actions.md) [05](tenant-module-entitlements/generated/PHASE-05-integration-runtime.md) [06](tenant-module-entitlements/generated/PHASE-06-final-reconciliation.md) |
