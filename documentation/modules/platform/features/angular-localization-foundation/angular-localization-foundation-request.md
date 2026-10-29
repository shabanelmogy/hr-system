# Angular localization foundation - implementation request

Scope: S1-A0 — Angular toolchain and localization runtime. Platform owner, one
active feature. User authorized continuing frontend and explicitly reaffirmed
SQL-persisted translation. Canonical contract: decomposition/angular-localization-foundation.md
under web-angular-migration; LOCALIZATION_PARITY freezes current requirements.

Primary relationship: port the current Web runtime over existing Platform API/SQL,
not rebuild the domain. Reuse catalog schema/version/keys/policies, company/system
DTOs and current i18next semantics. API and native remain unchanged. Angular adds
strict standalone/zoneless CLI project, generated resources, runtime state/pipe,
typed service, tests and architecture/catalog check. No empty business modules,
visual feature shells, login/Settings editor, PrimeNG theme parity, native rewrite,
new API/table/migration/permission/queue or custom universal engine.

## Business Rules Matrix

| Rule | Owner | Outcome | Test |
| --- | --- | --- | --- |
| Exact existing catalog and registered keys | Generator/API/runtime | Same persisted override identity | Catalog and schema/fingerprint |
| Layer order and lazy registration | Runtime | Overlay survives namespace load/reset restores baseline | Layer/lazy tests |
| Identity/permission generation | Session caller/runtime | Old context cleared; late response ignored | Scope race |
| Explicit language > company default | Runtime | lang/dir en/ar | Preference/default |
| Save/reset/default revision | Existing API; typed service | Original DTO/revision, no blind retry | HTTP wire/409 |
| Authority/placeholder/audit | Existing server | Existing denials/transactions, no domain change | Canonical source/retained checks |

## Edge Cases & Validation

Input/null/shape/unsafe keys, duplicate/lazy keys, catalog removed/mismatched,
company/global identity mismatch, disabled/changed authority, replay/late response,
logout/company switch, failure/timeout/cancellation, stale revision/no-op/reset,
placeholder preservation, cache/reconnect/expiry: runtime/service tests or existing
server owner. Existing permission and tenant/company scope remains authoritative.
Money/UOM/date-only/domain periods, archive/restore/delete entity, bulk/import/file,
external delivery/notifications/idempotency storage, database uniqueness/transaction
changes: N/A no new domain/write owner; current server rules reused. Runtime UTC
cache freshness/generation and bounded refresh remain client concerns. No offline
writes, fake identity, manual JSON form, automatic missing-key write or force merge.

## Impact Matrix

Domain/schema/API/permissions/audit/native: Reuse unchanged. Angular CLI/config/
localization adapter/resources/tests: Add. Generator exports: Extend for another
web catalog consumer without changing the existing schema or web fingerprint.
Documentation/manifest/recipes: Add. Shared UI/forms/screens/reports/import/export/
mock data/jobs/realtime handlers: Excluded here; later actual screen owner.

G0-G3 exact slice pass on recorded current source/toolchain metadata, G4 remaining
production origins/hosting release-only. Phase 00 documents/manifest/packets must
pass before runtime. Runtime exit: focused tests, strict types/build, catalog and
architecture checks, canonical evidence; actual SQL save+Angular reload is later
login/Settings acceptance. No source path registered before it exists.
