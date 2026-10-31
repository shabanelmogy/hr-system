# Frozen shared multiline text contract

S1-A10 Platform Shared technical extension only. G0-G3 frozen for this exact kit;
349 recipes/planning and current-only Phase00 before runtime. G4 PROD-002/017/019/
RISK-018 release-only. Overall migration Draft; no business/API/schema/native work.

## Existing-System Relationship Review and reuse

Graphify and current source inspected. TextField already owns CVA/IME/clear/focus/
error/counter and exact text-field.html reused by NumericField. Next MyTextField
passes multiline/rows to shared MUI field; native AppTextField preserves Enter
when multiline. Extend Angular TextField rather than introducing another field.
Reuse FormFieldControl/FormContainer/summary/field-chrome. Actual installed
PrimeNG22.1.4 Textarea directive pTextarea, autoResize=false, same token adapter;
add only adopted AuraTextarea preset. No second shell or vendor package patch.

## Exact API and value contract

Add multiline boolean(default false), rows number(default3). Multiline only for
plain text type; email/password remain single input. NumericField overrides
isMultiline false even with inherited inputs. rows integer1..20; invalid UI config
uses3. No autoResize API; manual vertical resize bounded by24rem and viewport.
One template branch input pInputText or textarea pTextarea, one id/registered field.
No rich text/HTML/Markdown editor or business structured collections.

Plain string value: preserve whitespace/newlines/Arabic/emoji; browser textarea
normalizes its DOM line endings according to HTML, Shared performs no trim/parse/
markup rendering. Owner controls/validators/server remain authoritative. Existing
counter/maxLength use JavaScript UTF-16 length, not grapheme count. Native maxlength
is an input affordance; owner Validators.maxLength must validate programmatic data.
No new visible defaults/captions; preview uses existing SQL-backed core keys, no
catalog/resource/hash change or live SQL publication claim.

## Business Rules Matrix

| Rule | Owner | Outcome | Proof |
| --- | --- | --- | --- |
| Plain multiline preserves input | Shared TextField | one string edit; Enter newline, no auto-submit | actual DOM/browser |
| Required/length/business validation | Caller/server | enabled Save; under-field errors/shared first focus | mixed shared form |
| Silent write/reset/swap | CVA/Shared | no false valueChanges or dirty | unit/browser |
| IME composition | Shared TextField | buffer until compositionend, one edit | unit/browser |
| Readonly/disabled | Shared/native control | no edit/clear callbacks when locked | direct and keyboard |
| Numeric/email/password | Owning shared field | stay single input | unit/browser regressions |

## Edge Cases & Validation Matrix

Required empty/newline-only caller decisions; no Shared trim. Long/emoji/Arabic/
literal markup/newlines retain plain value. Write/reset and textarea↔input preserve
owner data/validators/server errors; single input DOM may normalize line breaks
without rewriting owner model. Summary resolves current branch input after swap.
rows invalid fallback, maxLength owner authority, counter and help/error ARIA.
Readonly remains focusable; disabled actual textarea disabled; stale callback/clear
must not emit or touch. Mixed input/numeric/boolean form ordering and enabled Save.
No network/offline/transactions/race writes; concurrency N/A except live DOM branch.

## Impact Matrix and optional scope

Extend TextField/template/styles generically; NumericField imports same directive
and enforces no multiline; theme adds onlyTextarea preset. Reuse form lifecycle,
summary/UI keys; add focused unit/browser/dev preview. Retain Next/native/API.
Web P-001/C-01 neutral /dev/multiline form Required. Business CRUD/Grid/Cards/Chart/
Report/Import/Export/files/offline store/new native views Excluded independently.
No domain mock generator, permission changes, migrations or EF/five-point audit
for this technical kit. Real multiline consumers/autoResize remain FOLLOW-014.

## Verification and acceptance

Actual pTextarea, label/Enter/Tab/clear/focus/errors/locks/swap/IME/newline/JSON/
literal markup/long text; five palettes/modes/EN-AR390/1440 browser40+focused8.
Full Angular unit/types/architecture/catalog/tokens/fonts/build; form40/numeric8/
boolean8/reference8/date8/login10/language20 affected regressions. Unchanged API
resource uses S1-A9 API43/catalog7 evidence, explicitly not rerun.349recipe/planning
and diff checks before Phase06 Verified/education. No live SQL/business acceptance.

## Primary references

- https://primeng.dev/textarea — pTextarea, rows, autoResize, readonly/disabled.
- https://angular.dev/api/forms/ControlValueAccessor — writeValue/change/touched.
- https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element — newline/rows/readonly behavior.
- Current installed primeng-textarea.mjs and existing TextField/NumericField sources.
