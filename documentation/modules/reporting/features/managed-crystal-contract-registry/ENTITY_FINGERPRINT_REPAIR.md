# Entity-scoped validation fingerprint repair — 2026-11-07

Classification: corrective change inside the approved managed reporting capability.
Requester authorizes fixing the reproduced unrelated-report invalidation. This is
not a new report engine, permission, screen, schema or deployment authorization.

## Evidence and cause

The hosted Countries report has published version3 with Valid inspection evidence,
but its stored whole-artifact fingerprint differs from the current contract.
Adding system-error-logs changed that artifact while leaving Countries unchanged.
GetGlobalCrystalReports filters through IsValidFor, so the catalog becomes empty.
The registry hashes raw artifact bytes; it currently conflates deployment identity
with the validation identity of an individual entity.

## Existing-system relationship and rules

Reporting Contracts owns the immutable artifact and portable fingerprint algorithm;
Infrastructure loaders own validated profiles; existing Application handlers own
upload/inspect/publish/catalog/source/render orchestration. The independent Crystal
runtime links the same algorithm and artifact. Keep the whole-artifact fingerprint
for deployment health/parity. Add a deterministic entity definition fingerprint
covering schema version, entity/scope/table/limit, ordered columns, filters and all
managed-parameter rules. Formatting and unrelated entities must not affect it.

Preserve valid published historical versions without DB rewrites: only packaged,
reviewed historical artifacts can supply legacy whole-artifact aliases, and only
when the relevant entity's semantic definition still exactly matches the current
one. Unknown fingerprints and genuinely changed entities remain stale. Never
accept every old fingerprint or infer compatibility merely from Valid status.
Publish continues to validate domain evidence; source IDs/tokens and all access
checks remain enforced. New-runtime inspections and explicit revalidation store
the entity fingerprint; approved older-runtime evidence can remain historical
during coordinated rollout. Return an
additive server-derived current-contract flag while preserving the original stored
fingerprint for audit; clients consume it with old-server fallback.

## Impact and validation matrix

| Area | Decision | Required evidence |
| --- | --- | --- |
| Database/domain | Reuse existing entities/64-character field; no schema or migration | Read-only acceptance; no evidence rewrite |
| API/Crystal | Extend existing loaders/inspection/handlers; same routes and grants | Entity isolation, own-schema rejection, legacy proof, runtime parity |
| Angular/Next | Preserve shared UI; consume additive compatibility flag | Current/stale versions and safe old-server fallback |
| Mobile | Retain current consumers; no new native management UI | Additive API and unchanged permission boundary |
| Security | Preserve strict schema/source/parameter/version/ACL checks | Unknown legacy hash and changed-profile denials |
| Release | Coordinated API/Crystal/client publication remains PROD-028 | No hosted publication or native RPT success inferred locally |

## Execution and verification plan

1. Reproduce unrelated-entity invalidation with a failing registry test.
2. Implement shared deterministic entity hashing and bounded historical compatibility.
3. Update existing inspection, persistence, lifecycle and query paths consistently;
   preserve global artifact health/parity and original historical evidence.
4. Verify effective client status and full source/token/publish behavior. Run API
   solution gates, native-runtime build/contract harness and applicable client gates.
5. Update canonical profiles/manifests/packets and PROD-028 with exact executed and
   pending release evidence. Do not close real native/hosted acceptance prematurely.

Research: RFC8785 explains why hash input needs an invariant representation.
This implementation will use an explicitly versioned length-framed field sequence,
not claim general RFC8785 JSON canonicalization compliance or introduce a package.
Source: https://www.rfc-editor.org/rfc/rfc8785.html

## Executed acceptance

The unrelated-entity test failed before the repair and passed afterward. Own
table/column/nullability/limit/filter changes reject the prior evidence, while
States remains compatible. Formatting and entity order are invariant. Curated
legacy LF/CRLF aliases are accepted only for unchanged entity definitions; unknown
hashes are rejected. A real catalog query test preserves publication, source ID
and entity-based token across the unrelated addition without rewriting evidence.

Full API1341passed/3existing opt-in browser skips; focused Reporting262passed after
the last newline-portability test adjustment. Release build has0errors and101
warnings in its final incremental run (the broader rebuild had425analyzer
warnings). Full Angular997tests/195files and32architecture checks pass; final
format check passes. Initial581.99kB retains RISK-020 without raising budgets.
Actual Visual Studio18 .NET Framework Crystal and harness builds pass. The harness
reflects the freshly built runtime DLL and agrees with modern Reporting on all6
entity vectors;16HTTP authorization and14direction/geometry cases are retained.
This is SDK-adapter contract proof, not native RPT/database/PDF acceptance.

Production-asset Chromium12cases cover legacy-compatible published templates,
reader permissions, denied ACL, stale token and wrong identity, plus EN/AR,
Light/Dark390/1440. Business mutations are intercepted fixtures. A separate real
hosted read-only session confirms that version3's fingerprint is exactly the
pre-error-log CRLF artifact; original report data and source bytes are not saved.

Portable counts, logs, browser receipts, source hashes and exact legacy matching:
[verification receipt](verification/entity-fingerprint/verification.json).

## خطوات التطبيق على الاستضافة

التصحيح موجود في المصدر المحلي؛ لم تُنشر هذه التعديلات على الاستضافة ضمن هذا
العمل. انشر API وCrystal وAngular من النسخ المتوافقة، ثم أعد فتح شاشة الدول
لتحديث الكتالوج ورمز الإصدار. تقرير الدول المنشور بالإصدار3 يطابق تعريفًا
تاريخيًا معروفًا لم تتغير فيه مواصفات الدول؛ لذلك لا يحتاج إلى تعديل قاعدة
البيانات أو رفعRPTأو إعادةPublishلمجرد إضافة تقرير سجل الأخطاء.

تحقق بعد النشر من ظهور التقرير وتشغيلPDFبالعربية والإنجليزية. استجابة503في
اكتشاف قوالبCrystalتظل فحص تشغيل مستقلًا تحتPROD-028. أي اختلاف حقيقي في
أعمدة التقرير أو قواعده يظل يحتاج إلى تحقق أصلي صالح. النسخ ذات البصمات
المجهولة لا تتحول تلقائيًا إلىValid.
