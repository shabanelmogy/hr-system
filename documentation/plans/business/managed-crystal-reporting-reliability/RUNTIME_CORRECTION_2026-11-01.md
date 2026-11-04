# Authorized runtime correction — 2026-11-01

Requester: fix all observations from RUNTIME_REVIEW_2026-11-01.md. Classification:
corrective maintenance of existing Reporting/runtime integration; no new business
capability, domain, persistence, UI or roadmap-child activation. The existing
managed-crystal-manager-experience remains the plan's active business feature.

## Ownership / existing-system relationship

Extend the existing CrystalReportCatalogService, InternalApiKeyAttribute,
WebApiConfig, runtime health and Reporting deployment-source client. Reporting
continues to own catalog contracts/queries/ACL; runtime owns physical templates,
native execution and service authentication. Preserve global Countries and current
tenant/company report contracts. Public browser routes, providers, database schema,
transactions, entity permissions and Web/Mobile UI are unchanged. EF migration N/A.

## Frozen corrective rules and verification

| Rule | Owner | Required evidence |
| --- | --- | --- |
| Discoverable rejected entries with valid canonical identity may carry original oversize metadata; cannot become importable/downloadable/renderable | Runtime + Reporting client | Mixed good/rejected catalog keeps valid reports; importable oversize remains rejected |
| Non-addressable filenames cannot produce malformed wire descriptors | Runtime catalog | Non-normalizable filenames omitted; valid/rejected addressable descriptors retained |
| Null/malformed entries and malformed JSON still fail closed | Reporting client | Null item, invalid identity/path/size/importable hash negative tests |
| Internal key is required globally before controller/body processing | Runtime authorization filter/configuration | Actual in-memory Web API missing/wrong/duplicate/unconfigured key cases and valid-key415 control |
| Empty environment key falls back consistently to configured key | Runtime key resolver | Scoped environment/config tests; no committed/default Swagger key |
| Readiness includes readable deployment catalog root and build identity, without native initialization | Runtime health | Missing catalog503, safe build identity and native-free checks |
| Deployment owns Reports/App_Data and matching secrets/settings | Package/profile | Offline-safe publication; preserve remote templates; staged runtime/ERP config enabled with matching private key; artifact/route verification |

Input/identity/range/size/duplicate/malformed/cancellation and transport failure
cases above are Required. No new actor permissions, tenancy decisions, lifecycle,
money/dates, uniqueness race, transactions, write retries, database migration or
offline behavior; those categories are N/A because this is read/config/native
boundary maintenance. Existing report scope and command semantics are retained.

Impact: Runtime/Reporting client/tests/docs/configuration affected. API consumers
retain compatible fields and only importable approved descriptors. Web/Mobile
runtime changes Excluded; their existing shared report/error UI stays authoritative.
No generated documentation is edited directly. Run full ERP restore/build/test,
runtime Release x64 + boundary harness, actual catalog interoperability, package
validation and planning/documentation gates. Real host publication/auth/catalog/
AR-EN native rendering remains separately recorded under PROD-028/029/025 until
its actual successful receipts exist; do not infer deployment from source tests.
