# S3-A0 managed Crystal/PDF minimum — implementation and acceptance

Phase06: **Verified**2026-10-30 for the bounded GLOBAL_PDF_CONTRACT only.
381recipe/planning Phase00 passed before runtime. Overall migration Draft; this
technical minimum does not complete Countries or the managed Crystal manager.
Source main a2c56412 plus preserved local changes. No commit/push/deploy/migration.

## Requester decision and scope

DEC-028 cancels Angular ActiveReports viewer/designer/authoring/SDK/license work.
No ActiveReports package, wrapper, placeholder or alternative license was added.
Existing Next/API/native behavior is retained as source evidence only. The
implemented path calls the existing Reporting global Crystal API for Countries.
Tenant report management/upload/publish/version CRUD belongs to later slices.

## Delivered behavior

Shared PdfDocument accepts bounded application/pdf bytes with a %PDF- signature;
URLs and HTML are not inputs. PdfViewer owns trusted local object URLs, masks old
leases synchronously and revokes on replacement/null/destroy. It always offers
Open PDF and Download, with a translated fallback if inline support is absent.
ReportWorkspace owns responsive criteria/document layout, without domain policy.

Reporting owns unknown-to-typed catalog parsing, exact global super_admin plus
GlobalCrystalReports:View authority, filters, selected source/hash/language and
request lifetime. It reuses createScopedRead, shared ReferenceField/TextField,
FormContainer validation badges/under-field errors/focus, PageHeader/actions and
feedback. Criteria drafts apply only on Search; language/selection reuse applied
criteria. Reset renders once. Inputs accept up to200 UTF-16 units as in the API.

Catalog GET sends cookies, entityKey=countries and a10second timeout. Binary POST
uses fresh existing browser CSRF, cookies, selected expectedSha256 and a120second
timeout. The security bridge's optional renewal preserves existing caller defaults.
Cancellation while minting CSRF suppresses a later POST; replacement/destruction
cancels HTTP and ignores late validation. Permission/identity changes mask old PDF
immediately.403 latches per identity;409 clears PDF and requires catalog reload,
with no blind replay. Bounded Blob ProblemDetails map only owned nameAr/nameEn
fields; unknown/HTML data is never rendered as server markup.

Authenticated /dev/reports is development-only; no production Countries route or
permission is invented. No new dependencies, API business/schema or native rewrite.

## Verification and measured results

- Full Angular check passed:48files/295unit,10architecture,4config,14fonts,
  strict app/spec types, catalog/tokens and production build.
- Initial build473.99kB /124.21kB transfer, below500kB. Production excludes the dev route.
- New31unit cases include PDF parser/lease, transport credentials/CSRF/cancel/errors,
  permission/source/hash/filter boundaries, state epochs and shared-form composition.
- Reporting40visual +8focused lifecycle cases passed; portable JSON/screenshots in
  verification/. Browser viewport390 and forced PDF capability fallback are tested.
- Fresh login10/language20/application-context24 regressions passed.
- Focused Reporting API17, localization API43 and canonical catalog scope/access7
  passed. Existing analyzer warnings CA1307/CA1716/CA1848/CA1859 are inherited;
  no API C# was changed, and this is not a full API-suite result.
-381recipe/planning passed at entry and after runtime registration; final closure
  checks are recorded by the final handoff. Existing planning warnings for
  education-module/erp-platform-template are inherited.

## Localization, release and physical proof

4bilingual reports.* captions were generated from canonical Web core resources.
21sources/7204entries; Web fingerprint
18508f727a911a54bbd521601ced5663a7a0215e96e2b65265d10b4b8ea2c4cc.
Native catalog fingerprint unchanged. Existing SQL-backed overrides, scope and
strict resource matching remain. PROD-019 requires matching API resource deployment
and permitted override checks before claiming hosted compatibility; no deployment.

Mock PDFs are complete synthetic one-page files; downloaded bytes match exactly.
Chrome plugin screenshots are layout evidence and may show a blank native surface.
No iframe load, signature check, mock result or viewport establishes a live engine,
physical-device rendering or production CSP/cookie acceptance. RISK-008/RISK-017
and PROD-002/017/019/RISK-018 retain those release/other-slice obligations. Existing
FOLLOW-012 owns localization editor persistence and FOLLOW-017 actual business
lookup/watch acceptance. ActiveReports licensing is no longer a blocker.

## Research used to resolve verification failures

TypeScript documented control-flow narrowing explained the redundant idle check;
it was ordered before correlated source identity narrowing. Async HTTP tests now
wait for the actual dependent POST instead of counting promise turns. Browser
render transitions wait for a new object URL, rather than accepting a still-visible
old link. These are test/type corrections; no relaxed validation or timing sleep.

Primary references: [TypeScript narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing),
[Angular HTTP testing](https://angular.dev/guide/http/testing),
[Vitest waitFor](https://vitest.dev/api/vi#vi-waitfor),
[Playwright downloads](https://playwright.dev/docs/api/class-download),
[MDN window focus](https://developer.mozilla.org/en-US/docs/Web/API/Window/focus_event).

Canonical closure:381recipe checks and planning passed, with inherited planning warnings only; whitespace diff clean. Phase07 technical education followed Phase06 Verified. Own4220/PID23988 stopped; user4210/PID15376 retained. S3-A1 Countries source-only preparation is the sole Active feature. verification/CHECK_RESULTS.md records final gates.
