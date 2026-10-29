# Angular theme foundation - implementation request

Exact scope: S1-A1 — Shared theme and action control. Continuation of the approved
Angular migration; one Platform technical owner. Previous localization technical
feature is Verified/documentation Closed. This is a client port over existing
shared design values, not new business/domain/API/native behavior.

## Existing-System Relationship Review

Reuse @app/tokens public compiled package/CSS, five palettes, scales, font assets,
Next runtime-preferences and shared MyButton behavior. Angular shared library has
localization only, so a generic shared action adapter is required. No feature-local
look-alike, new palette catalog or business wrapper. Runtime locale API/SQL intact.

## Business Rules Matrix

| Rule | Owner | Outcome | Verification |
| --- | --- | --- | --- |
| Design values remain canonical | @app/tokens | Same colors/scales for retained apps and Angular | Ten theme mappings, contrast/dist/sync |
| Existing palette/mode identity | Angular theme service | Validated currentMode/themePalette Cookies; no auth storage | Invalid/default/switch/reload tests |
| PrimeNG mapping | Single theme adapter | Deliberate primary/status/quiet surfaces, not default green | Computed browser styles/contrast |
| Shared action semantics | Shared action control | Native type/accessibility, busy/disabled duplicate guard | Two test compositions and keyboard |
| License configuration | Current owner/local config | Use requester-owned Community key, never synthesize/bypass | No key in tracked source/logs; actual browser status |

## Edge Cases & Validation Matrix

Unknown palette/mode and absent Cookies fall back to green/light. Null/defaults,
repeated mode/palette changes, document direction, long bilingual captions,
keyboard/focus, submit type and busy/disabled transitions are Required. No browser
native validation feedback. No new domain entity/money/UOM/date/workflow, save
transaction, API scope/query/mutation, file/import/report or audit ownership exists:
all N/A for this technical slice. Absent business controls are not placeholders.
Local key is ignored; license notices are never removed. Configuration absent means
license verification is pending, not a source test proving entitlement.

## Impact Matrix

API/DB/native: unchanged. Shared token values/build outputs: unchanged. Token app
sync/CI consumer coverage: extend for Angular. Angular theme/PrimeNG/shared action,
scoped tests and technical development harness: add. Translations: reuse current
generated catalog captions; no catalog fingerprint/schema change. Login/shell,
forms/table/dialog and actual consumer acceptance remain later contracts.

Phase 00 applied books/current manifest/recipes precede runtime. Exact G0-G3 and
remaining release-only PROD-017/019 are in the canonical contract. Required tests,
strict build, token checks and browser evidence determine Phase 06; no full S1 claim.
