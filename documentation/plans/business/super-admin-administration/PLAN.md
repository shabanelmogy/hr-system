# Super Admin administration — Master plan

## 0. Plan metadata
| Field | Value |
| --- | --- |
| Plan ID | super-admin-administration |
| Owning module | Platform |
| Status | Closed |
| Planning method version | 2.0 |
| Primary owner | Product owner + Platform |
| Last reviewed | 2026-10-19 |

Authorization: requester explicitly approves editing only texts for sections the Super Admin may access, and all reviewed Super Admin administration corrections. This supersedes the earlier exclusion of a global UI editor. Existing experimental development database/migration authorization and physical native deferral PROD-026 persist. No additional production deployment is authorized.

## Outcome and approved scope
Two ordered features extend Platform, no new module. S1 corrects global administration access/navigation using existing screens: system audit, Hangfire, authenticated system health and environment-available API docs; existing tenants/geography keep their entries. S2 adds permission-filtered en/ar UI text editing/reset and runtime application to Super Admin sessions through Administration > Settings. Company text/defaults and business permissions remain independent.

## Ownership, rules and impacts
- Platform owns global audit access, settings and global text overrides. Reuse existing audit CQRS and UI; add SystemAuditTrail:View and a SuperAdmin-only read endpoint instead of reclassifying tenant AuditTrail:View.
- Operations menu entries require their own existing/global exact permission and SuperAdmin role. Health/API docs use SystemHealth:View/SystemApiDocs:View. Swagger availability follows configured host environment; unavailable tools have explicit existing feedback.
- Global text view/edit/reset require SystemUiTexts:View/Edit/Reset and SuperAdmin. Each key is also authorized against its owning screen's view authority, using an explicit server allowlist. Unknown/private company domains fail closed in settings, query, write, reset and runtime. Never authorize by client prefix or submitted permission.
- The global UI bundle applies only to SuperAdmin sessions; shared control captions may be edited for this global experience without overriding company resources. System-scoped global geography and tenant management are included only when their screen is accessible. Companies continue using shipped resources plus their own overrides.
- Registered shipped keys only, source/client/namespace exact; en/ar only; length/placeholder contracts reuse existing company policy. No arbitrary key creation or filesystem rewriting. Missing/removed or incompatible entries remain dormant.
- Global singleton revision, serialized transaction, unique override key, bounded 5000 entries, audit with old/new values. No-op does not increment revision; stale writes return 409 and preserve drafts through shared forms. Reset removes override. Runtime fetches initially, after own edit, periodically/reconnect; auth/permission/resource loading changes clear/reapply authorized layers safely.
- Persistence is Platform-owned and migrates before verification. No company scope dummy IDs or simulated company session. API/clients expose honest global contracts.

## Existing-system relationship review
Verified: ICompanyUiCatalog has immutable web/mobile en/ar sources and scope metadata; CompanyLocalizationStore validates company scope and excludes system entries; UI editor composes shared MyDataGrid/MyForm and native AppListScreen/AppForm. Global editor is currently absent. AuditTrailReadScope supports SuperAdmin but permission metadata blocks it; Hangfire is already GlobalOperations. Client allowlists currently exclude global tools. Reuse these capabilities and extend clear ownership; never bypass TenantMember.

## Edge, security and verification matrix
| Concern | Decision / acceptance |
| --- | --- |
| Foreign/unknown key | Deny at store boundary, even with editor grants |
| Permission loss / spoofed request | Target authorization checked per request/runtime; no client authority |
| Company isolation | Company endpoints reject global actor; global endpoints reject company actor |
| Concurrent initial/write/reset | SQL singleton lock + expected revision + atomic audit |
| Placeholders / blank / oversized | Field validation and authoritative rejection |
| Partial availability | No placeholder link for unimplemented business feature; docs availability feedback |
| UI parity | Real edits, resets, server filters/paging, read-only, conflict/dirty on both clients |
| Migration / live | Standard module script + real configured schema, authenticated acceptance |
| Release limits | Existing PROD-026 physical native and RISK-009 bundle gate remain owned; no invented production prerequisites |

### Feature Decomposition Gate
| Slice | Decision | Feature ID | Screen/Workflow Contract | Boundary |
| --- | --- | --- | --- | --- |
| S1 Global administration access | Single feature | system-administration-access | documentation/plans/business/super-admin-administration/decomposition/system-administration-access.md | Correct authorization and entry to existing global operations viewers. |
| S2 Authorized global UI texts | Single feature | system-ui-localization | documentation/plans/business/super-admin-administration/decomposition/system-ui-localization.md | One global text view/edit/reset and runtime workflow filtered by screen authority. |

## Gates and release classification
G0 pass: explicit actor/scope and user-approved additions. G1 pass: Platform ownership, exact target/screen permissions, company/global isolation, UI references. G2 pass: singleton/override invariants, honest contracts, revision/audit/lock and catalog-driven allowlist. G3 pass: shared screen patterns, both clients, executable denial/concurrency/runtime matrix. G4 pass for authorized development/automated scope: concrete sources and tests identified; production release gates and physical device checks retain existing central IDs rather than being called passed. No discovery unknown blocks this bounded scope; product/design/privacy/commercial reviewed: diagnostic/UI configuration only, no billing/UGC/third-party transmission.

## Canonical roadmap
**ACTIVE_FEATURE_STEP:** None
| Order | Feature ID | Status | Contract |
| --- | --- | --- | --- |
| 1 | system-administration-access | Closed | decomposition/system-administration-access.md |
| 2 | system-ui-localization | Closed | decomposition/system-ui-localization.md |

## Delivery and acceptance
Execute API > Web > Mobile > integrated live verification > documentation/education/closure for each feature; no sibling runtime until predecessor closure. Applied books/manifests/recipes own source evidence. Automated scope must pass focused/full required API checks, client checks, browser journeys, native compatibility/export and live schema. Known inherited failures stay separate. Customer guide explains scopes, exact menu path, reset, conflicts and runtime propagation.

Final development closure: S1 and S2 Closed after ordered API/Web/Mobile/integrated verification and customer education. No production deployment or physical native acceptance is claimed; existing release constraints retain their central IDs.
