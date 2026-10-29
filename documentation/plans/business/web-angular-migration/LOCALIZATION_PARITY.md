# Database-backed UI translation — Angular parity contract

Date: 2026-10-28. Requester explicitly reaffirmed persisted UI translations while
authorizing Angular foundation. This capability was already Required in PLAN
section 11/ANGULAR_ARCHITECTURE section 7; this file makes its execution explicit.

## Verified current owners

Platform `CompanyLocalizationStore` loads CompanyLocalizationSettings/Overrides
from PlatformDbContext; ApplyAsync commits settings and old/new security audit
inside the existing transaction/lock with expectedRevision. SystemLocalizationStore
owns the separate global SystemLocalizationSettings singleton. Both existing
features have canonical API/Web/Mobile books under Platform. The older advanced
tools `LocalizationApi` editor is a separate API-message/resource contract and
must not be mistaken for these database-backed UI overrides.

Shipped en/ar resources register stable namespaces/keys. The schema-3 catalog
generator exports an embedded API catalog plus matching web/mobile fingerprints
and scope/permission policies. Runtime queries use client=web and that exact web
catalog version. Angular is another web consumer of these keys, not a new client
identifier/table/catalog fork. Export matching baseline/policy/version artifacts
from the existing embedded catalog; changing a key requires the existing catalog
pipeline and coordinated API/client update. No missing-key auto-write or bulk
re-seed is authorized.

## Required behavior

1. Preserve shipped fallback -> authorized global override -> company override
   order. Current actual sessions load company runtime for normal company actors
   and global runtime for super_admin. Reapply an accepted overlay to lazy-loaded
   namespaces without overwriting it with later shipped resources.
2. Company runtime must match user/tenant/company/catalog; global runtime must
   match identity/permission signature/catalog and is super_admin-only. Keep
   separate honest DTOs: no fake tenant/company IDs for global configuration.
3. Scope change/logout/permission change clears old overlays synchronously and
   increments request generation before exposing the next context. Late responses
   cannot restore previous-company or previous-authority text. Failure falls back
   to shipped text; credentials/permissions remain server authoritative.
4. Preserve explicit user language preference over company default language;
   otherwise company default selects en/ar. Keep document lang/dir synchronized.
   Overrides must be registered/allowed keys, preserve placeholders, and must not
   inject HTML/prototype keys. Client filtering reinforces, never replaces, API checks.
5. Existing PUT text and POST reset use source/language/key/expectedRevision
   (plus value for text). Existing company PUT default is retained. Stale revision
   409 preserves the edit draft; no blind replay/forced overwrite. Existing
   CompanyLocalizations:View/Edit/Reset/SetDefault and SystemUiTexts:View/Edit/Reset,
   super_admin/target screen authority, read-only policy and audit remain unchanged.
6. Refresh after own accepted mutation, reconnect, permission change, and bounded
   polling (current baseline: 30-second freshness/60-second polling). Context owner
   cancels/fences outstanding requests. No infinite startup wait or stale cache
   identity. Screens/editors remain their own later feature; foundation provides
   runtime and typed service first, not a local look-alike editor.

## Delivery and proof

S1-A0 Angular toolchain/localization foundation must include runtime/service tests
for layer order, lazy scopes, generation, language preference, catalog mismatch,
permission/company isolation and typed save/reset wire. The existing stored UI
overrides must remain visible through the same registered keys. Later real Angular
login/context/settings feature acceptance must save a permitted UI translation
through the real API, reload Angular, observe its persisted value, switch companies,
verify isolation, test stale revision/placeholder denial and Reset restoration.
No manual production text is changed for a fixture; restore any live test caption.
The actual consumer acceptance is centrally tracked as **FOLLOW-012**, Required
when S2 login/context and S4 Settings are implemented. It is not closed by the
foundation's mocked HTTP/runtime tests.

Current reference paths:

- `web-next/src/lib/localization/companyUiResources.ts`
- `web-next/src/platform/company-localizations/runtime/CompanyLocalizationBridge.tsx`
- `web-next/src/platform/company-localizations/hooks/useCompanyLocalization.ts`
- `web-next/src/platform/company-localizations/services/{companyLocalizationService,systemLocalizationService}.ts`
- `api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Features/{CompanyLocalization/CompanyLocalizationStore,SystemLocalization/SystemLocalizationStore}.cs`
- `scripts/export-company-ui-catalog.mjs` and its policy generators.

This is a client port over existing business capability, not a translation DB
migration, new translation service, or replacement for canonical feature books.
