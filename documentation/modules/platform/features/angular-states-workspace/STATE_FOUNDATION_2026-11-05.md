# States transport and read foundation — 2026-11-05

## Current implemented checkpoint

This is a partial implementation checkpoint inside the sole Active States feature,
not complete States or Super Admin acceptance. Phase00 passed before coding:
468recipe generation/check and the planning gate, with two unrelated inherited
version2 contract migration warnings.

Implemented under the States owner:

- Exact query/detail/list/lookup DTOs, current GET filters and page metadata
  validation; requested parent/status/hasDistricts consistency and duplicate-ID
  checks. Default sorting matches Next createdOn descending.
- Four-field Signal Form schema: printable NFC names2-100, required uppercase
  alphanumeric/hyphen code2-10 and positive Int32 Country. Dirty keys accept empty
  drafts; detail conversion explicitly projects only the four form fields.
- Optional native reactive parent-eligibility validation composes the schema with
  Angular apply. Lookup signals can invalidate/revalidate a chosen Country while
  Save remains available for actionable validation feedback.
- Cookie/CSRF command transport, exact create/update/lifecycle status and identity
  fencing, atomic bulk-create count, indexed field errors and uncertain dispatched
  outcomes. Atomic bulk archive is idempotent and may return0..requested; it must
  not be incorrectly required to equal the requested count.
- Actor-scoped page/detail state with cancellation, denied-actor fencing, server
  paging/clamp, debounced search, explicit parent/dependency criteria and safe
  realtime coalescing. State, Country and District changes refresh authoritative
  State captions/counts; no optimistic local rewriting or automatic write replay.
- Independent active-Country lookup owner under Countries, exposed through its
  narrow lookup.public-api.ts. The States parent controller checks Countries:View
  independently, separates forbidden/loading/empty/error, searches authorized
  lookup rows and retains unavailable detail parents as disabled display options.

Shared createScopedRead, native Signal Forms, the existing mutation security and
failure classifier are reused. No Form Engine, CRUD base, dependency upgrade,
API/domain/schema change or native Mobile implementation is introduced.

## Verification scope

The root's19read/parent tests and the transport/native-form13tests cover current
actor cancellation/denial, remote parent filters, lookup captions, related-resource
reconciliation, typed responses and mutation outcomes. Final npm run check passed:
607tests in105files,30architecture/dependency tests, format/lint/configuration/
tokens/fonts/catalog, strict application/spec types and production build. Initial
bundle remains574.50kB with the existing RISK-020 warning; no component-style budget
warning remains. Independent source review found no actionable findings within
this checkpoint after the root integration fixes. Portable receipt/source hashes:
verification/STATE_FOUNDATION_2026-11-05.json; full output:
verification/state-foundation-2026-11-05/angular-check.txt.

There is no States browser proof yet because its
customer workspace has not been wired. The separately verified shared Grid
header-selection maintenance is documented by angular-collection-foundation.

## Required next implementation

1. Compose the State editor with the existing form/dialog/close guard, errors,
   first-invalid focus, four fields, active parent selection and realistic dev
   drafts. Keep permissions/read-only checks in its owner state.
2. Implement exact lifecycle/selection/confirmation state and all five Shared
   Grid/Cards/Chart/managed Report/Import views with focused component folders.
   Reuse compact SpreadsheetImportPanel; resolve ambiguous Country names safely.
3. Complete workspace-level realtime refresh of the active-Country dependency
   through the existing owner lease, without adding a competing global store.
4. Wire canonical routes/navigation only with the real feature, then verify
   complete EN/AR, RTL, compact/wide, keyboard, permission, dirty and uncertain
   journeys. Register actual sources as they are created.
5. Record Phase06 Verified only after the required feature proof, then education
   and closure; Districts remains Queued until then. PROD-019/028/RISK-020 retain
   their separate release scope.
