# S1-A10 shared multiline text — implementation and acceptance

Phase06: **Verified**2026-10-30. Bounded existing web-angular-migration technical

kit;349 recipes/planning Phase00 checks before runtime. Overall plan Draft.

Source main a2c56412 with preserved local edits; no commit/push/deploy.

## Delivered behavior

Extended existing TextField with multiline(defaultfalse), rows(default3; integer

1..20, invalid config falls back3). Same text-field.html branches to actual PrimeNG

pTextarea for plain text or existing pInputText. Reuses FormFieldControl/CVA/IME,

FormContainer/summary/focus/error chrome and counter/clear, without a parallel field.

NumericField shares exact template but always stays single input. Email/password

also stay single input. Added only adopted AuraTextarea to current token adapter.

Enter inserts newline without saving; string values retain whitespace/Arabic/emoji/

literal markup. Browser textarea normalizes DOM line endings per HTML; Shared does

not trim, parse or render markup. UTF16 counter/maxLength behavior inherited; owner

Validators.maxLength validates programmatic values. No business validation rules.

Silent write/reset/swap preserve owner values and validators. Focus resolves the

current branch, server errors clear on real edit, IME buffers until compositionend.

Readonly/disabled block stale clear as well as edits without touching owner state.

Manual vertical resize capped24rem with internal scrolling, logical RTL styling,

floating/default appearance, shared enabled Save and under-field validation errors.

## Source review and verification finding

Graphify/current TextField/NumericField, Next MyTextField multiline/rows and native

AppTextField reviewed. Next/native behavior retained. Existing core keys cover the

neutral harness: no new UI defaults, catalog/resource/hash/SQL change. Translation

continues through SQL-backed LocalizationRuntime; current hash remains

cba7ae1870dceb9a239811ecd0f9a4be1126577a32dfa1c748c94eb639fa0dc6 (7200 entries).

First compile caught unbound showCounter boolean in the new harness/test; corrected

to explicit boolean binding after Angular input documentation review. An initial

browser run saw one summary badge after a clear in a dark/Arabic case; independent

state/DOM probe showed correct two-field validation. Driver now explicitly awaits

the cleared owner value and empty name before Save. Full40 and focused8 pass; no

runtime workaround or weakened badge assertion. Primary Playwright input/CVA docs

guided the synchronization check. No unresolved feature regression at acceptance.

## Verification

| Check | Actual result |

| --- | --- |

| Angular full check |40files/206unit;8 new multiline tests |

| Architecture/config |10architecture/4configuration passed |

| Types/catalog/tokens/fonts | Strict app/spec, catalog, tokens and14fonts pass |

| Production build |473.71kB initial/124.26kB estimated transfer;500kB unchanged, no warning |

| Multiline browser |40 cases plus focused8 complete flows |

| Fresh retained browser |Form40/numeric8/boolean8/reference8/date8/login10/language20 |

| Date timezone |10 timezone/locale cases passed by retained driver |

| API/catalog ownership |S1-A9 API43/catalog7 retained; unchanged resource, not rerun |

| Documentation entry |349recipes/planning passed before bounded runtime |

| Generator repair |Actual read-only memory map test; exact unchanged packet bytes/timestamp preserved |

Portable JSON/four PNG captures under verification/. EN1440 and AR390 forms/errors

reviewed. Preview/dev/multiline excluded from production route composition. Form40

used existing4210 client; feature/retained field drivers isolated4220; login uses

intercepted hosted origin and language verification isolated4220. No live mutations.

No business CRUD/structured editor/list/chart/report/import/export/files/offline

store/new native/API/domain/schema/permissions added. Domain five-point/EF audit

N/A technical kit. AutoResize/real multiline consumers stay FOLLOW-014. Inherited

RISK-012 Next install drift/date vendor NG0956 and release PROD-002/017/019/RISK-018

remain. Full API/Next/native suites not repeated for this Shared-only extension.

## Reproduction and primary references

```powershell

npm --prefix web-angular run check

$env:ANGULAR_PREVIEW_ORIGIN='https://localhost:4220'

$env:ANGULAR_API_ORIGIN='https://shabanhrms.runasp.net'

npm --prefix web-angular run verify:multiline-browser

npm --prefix web-angular run verify:multiline-browser -- --focused

./documentation/system/tests/Generation.Unchanged.Tests.ps1

./documentation/system/Generate-Documentation.ps1 -Check

./documentation/plans/Check-Planning.ps1

```

- https://primeng.dev/textarea — actual directive/rows/manual versus auto resizing.

- https://angular.dev/api/forms/ControlValueAccessor — write/change/touch contract.

- https://angular.dev/guide/components/inputs — typed boolean property binding.

- https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element — DOM newline/readonly/rows.

- https://playwright.dev/docs/input — fill sends input; explicit owner-state synchronization.

- https://learn.microsoft.com/en-us/dotnet/api/system.io.file.writealltext — existing target truncation; unchanged generator packets now skipped.

Final visual repair: AuraTextarea initially inherited unset form-field padding in the slim preset. Added the same adopted padding/font/radius/shadow token mapping as InputText. Browser now asserts inline padding>=12px/block>=9px. Fresh full40/focused8 and full206unit/build checks passed after repair; four final captures replaced. Primary evidence: installed AuraTextarea root tokens and https://primeng.dev/textarea .
