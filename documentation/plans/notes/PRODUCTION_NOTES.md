# Production Notes

Central registry for work that cannot be proven completely by source tests or PR CI
and must be verified against staging/Production.

| ID | Surface | Area | Note | Owner | Status | Release blocker? | Reopen / execute trigger | Evidence / link |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PROD-029 | API | Crystal runtime deployed authentication/version mismatch | Verified2026-11-01 after requester publication:20real hosted missing/wrong/duplicate/valid-key cases pass, health MVID matches current published assembly and canonical fingerprint, exactly5current internal routes and catalog200with2original reports preserved. The earlier VS skipaction incompatibility is corrected through the tested WPP CLI branch. ERP publication/native AR-EN execution remain separately PROD-028/025. | Reporting Runtime + Operations + Security + QA | Verified | Reopen on deployed auth/build/route regression | New runtime deployment or changed key/profile/source package | `documentation/plans/business/managed-crystal-reporting-reliability/PUBLISH_READY_2026-11-01.md` |
| PROD-001 | Web | Observability | Verify real Collector routing, dashboards, retention, and alert destinations. | Deployment/Operations | Open | Yes for external production launch | Production/staging environment is provisioned | `documentation/guides/web/architecture/frontend-architecture-reference.md` |
| PROD-002 | Web | Authentication | Exercise real authenticated Google popup flow. | Web/Platform | Open | Yes when Google auth is enabled for release | Target origin + real OAuth client + test account available | `documentation/guides/web/ERP_FRONTEND_MASTER_PLAN.md` |
| PROD-003 | Web | Realtime | Verify production SignalR negotiation/connect/reconnect through deployed origin. | Web/Platform | Open | Yes when realtime is enabled | Target hub/proxy deployed with valid session | `documentation/guides/web/ERP_FRONTEND_MASTER_PLAN.md` |
| PROD-004 | Web | Reporting | Verify real report/PDF viewers with representative data and CSP. | Reporting/Web | Open | Yes when reporting is enabled | Deployed report services and sample report exist | `documentation/guides/web/ERP_FRONTEND_MASTER_PLAN.md` |
| PROD-005 | Web | Files/Media | Verify upload/download/range-stream/media viewers in deployed environment. | Platform/Web | Open | Yes when file features are enabled | Production-like storage/provider is connected | `documentation/guides/web/WEB_API_READINESS_REVIEW.md` |
| PROD-006 | Web | Background jobs | Verify deployed Hangfire access/session/CSP behavior. | Platform/Operations | Open | Yes when Hangfire UI is exposed | Deployed Hangfire endpoint exists | `documentation/guides/web/ERP_FRONTEND_MASTER_PLAN.md` |
| PROD-007 | Web | External frames | Verify each configured external-tool frame against final CSP. | Platform/Web | Open | Conditional | A configured external frame exists in target environment | `documentation/guides/web/ERP_FRONTEND_MASTER_PLAN.md` |
| PROD-008 | Cross-platform | Demo Login | Demo Login is intentionally allowed in Production under current product policy. Production demo identities must be provisioned deliberately; the API preview bootstrap task remains disabled for a real Production deployment. | Product/Platform/Web | Accepted | No | Explicit future product decision changes the policy | `documentation/guides/web/ERP_FRONTEND_MASTER_PLAN.md`; `documentation/guides/api/Operational_Foundation.md` |
| PROD-009 | Mobile | EAS artifacts/signing | Build, sign, install, and record real Android/iOS preview/store artifacts. On 2026-10-28 the requester authorizes a new ERP EAS project: `@shabanelmogy/erp-system-mobile`, ID `27312add-bc4e-4cfe-b196-63ad6fb50495`. Authentication, preview environment, managed Android keystore and inspected source archive are verified. Android preview build `32f6f9a6-7779-4077-a42d-8d1309f32015` finishes at 11:07:06 UTC with a signed APK (1.0.0/code 1); the canonical runbook records its download/file evidence. Installed-device, iOS and store evidence remain pending. Local SDK/JDK/adb configuration is unavailable in this session. | Mobile release | Open | Yes for remaining installed-device/store acceptance | Physical Android device or authorized iOS/store candidate is available | `documentation/guides/mobile/MOBILE_API_READINESS_REVIEW.md`; `MOBILE_RELEASE_RUNBOOK.md` |
| PROD-010 | Cross-platform | Hosted authenticated device E2E | Run authenticated device journeys against the deployed API for auth, tenant/company, permissions, offline, files, and reports. | QA + API + Mobile | Open | Yes for external tester/release | External tester build or relevant API change | `documentation/guides/mobile/MOBILE_API_READINESS_REVIEW.md`; `MOBILE_RELEASE_RUNBOOK.md` |
| PROD-011 | Cross-platform | Swagger/API drift | Compare hosted API description against the mobile contract and run authenticated smoke after endpoint/version changes. | API + Mobile | Open | Yes after relevant API contract change | Endpoint or API version changes | `documentation/guides/mobile/MOBILE_API_READINESS_REVIEW.md`; `MOBILE_RELEASE_RUNBOOK.md` |
| PROD-012 | Mobile | App/Universal Links | Publish final Android/iOS association configuration and verify links on physical devices. On 2026-10-28 the requester selects `shabanhrms.runasp.net` for preview app links; the EAS preview environment uses this host with Android package `com.erpsystem.mobile`. Unauthenticated checks of `/.well-known/assetlinks.json` and `/.well-known/apple-app-site-association` both return HTTP 401. Public association-file publication, signing fingerprints and physical-device link verification remain pending. | Platform release | Open | Yes when links are part of release | Final host/package/signing fingerprint is available | `documentation/guides/mobile/MOBILE_API_READINESS_REVIEW.md`; `MOBILE_RELEASE_RUNBOOK.md` |
| PROD-013 | Mobile | Observe/source maps | Prove symbolicated crash delivery and redaction using a real EAS artifact. | Observability | Open | Yes when production crash telemetry is claimed | First real EAS artifact exists | `documentation/guides/mobile/MOBILE_API_READINESS_REVIEW.md`; `MOBILE_RELEASE_RUNBOOK.md` |
| PROD-014 | Mobile | Physical UX/accessibility | Complete phone/tablet LTR/RTL, light/dark, keyboard, font-scale, and screen-reader evidence. | UX + QA | Open | Yes before public preview/store | Public preview/store is planned | `documentation/guides/mobile/MOBILE_UI_EVIDENCE_MATRIX.md`; `MOBILE_RELEASE_RUNBOOK.md` |
| PROD-015 | Mobile | Performance budgets | Measure installed-release p95 startup/resume/navigation/search/memory/file budgets on recorded devices. | Mobile performance | Open | Yes before public preview/store | Preview release artifact and device are available | `documentation/guides/mobile/MOBILE_PERFORMANCE_BUDGETS.md` |
| PROD-016 | API | Production database migrations | Preview module migration discovery/order, then execute the approved module-owned Production migration command before startup writes. | API/Deployment | Open | Yes | Production deployment targets a schema change | `documentation/guides/api/Operational_Foundation.md` |
| PROD-017 | API | Production configuration/secrets | Current development publishes include git-ignored appsettings.json with strict readiness deferred. Before an actual production launch, publish with PublishAppSettings=false, supply production-owned JWT/database/mail/OTel settings, restore strict readiness, configure persistent certificate-protected Data Protection, and enable valid ClamAV scanning for Platform-managed uploads. | API/Operations/Security | Open | Yes for actual production launch | Development hosting is promoted to production | `documentation/guides/api/Operational_Foundation.md`; `documentation/guides/api/PRODUCTION_DEPLOYMENT_RUNBOOK.md` |
| PROD-018 | API | Workforce authenticated smoke | Run authenticated Workforce Planning smoke for lifecycle transitions, filters, tenancy, denial, and concurrency against the configured environment. | API + QA | Open | Conditional release gate for Workforce Planning | Workforce Planning is included in deployment candidate | `documentation/modules/hr/features/workforce-planning/workforce-planning-api.md` |
| PROD-019 | Web | Core authenticated release checklist | Current Angular/Grid web catalog is 6c3bd907be5bbfdf9245a9a3c84d1cc813d4fbab6fb0f2d74173ff14024c8041 (21 sources/7269 entries, including shared field counter/Grid/context-menu/selection/Boolean and Countries command/dependency captions). This supersedes the earlier S3-A0 7204-entry catalog; no hosted publication occurred in the generic Grid work. Deploy the matching generated API catalog resource with both Web clients and verify permitted SQL overrides before claiming hosted localization compatibility; strict version matching remains. Technical collection browser checks make no host-deployment claim. Verify the current visibility-revalidation correction on the host: returning focus with an unchanged session must preserve rows without loading, while actual scope/permission changes and logout still quarantine old data. Run the deployed authenticated baseline: login/refresh/logout, allow/deny RBAC, tenant/company switch, shared error states, file flows, and a real 409 concurrency response. Angular test-host handoff 2026-10-29: requester selected https://shabanhrms.runasp.net; tracked client .env now selects host/local (default host). After requester-reported publication, hosted health/CSRF200 and real trusted Chrome Angular4210 login200/apps/logout204 passed. Root/swagger401 was consistent with disabled Swagger; requester explicitly approved test-host Swagger, now enabled in local publish settings and verified locally in Production mode (Swagger/OpenAPI200, protected API401); hosted republish remains pending. API correction has exact HTTPS4210 and explicit Secure SameSite=None; prior S2-A6 report records successful hosted reload/refresh/logout; repeat against the new catalog and complete remaining scope/RBAC/files/concurrency release acceptance. See web-angular-migration/RESUME.md and platform-browser-authentication/verification/HOSTED_CONFIGURATION_REPAIR.md. | Web + API + QA | Open | Yes for external Web release | A staging/Production origin with representative account/data is available | `documentation/guides/web/WEB_API_READINESS_REVIEW.md` |
| PROD-020 | Cross-platform | Managed Crystal publication | A managed report view is not release-ready from an `.rpt` file alone; publish a compatible version and grant intended roles/users `Run` access. | Reporting + Release owner | Open | Conditional — managed Crystal report enabled for release | A feature report is included in the deployment candidate | `documentation/modules/reference-data/features/address-types/address-types-evidence.md`; `documentation/modules/reference-data/features/districts/districts-evidence.md` |
| PROD-021 | Cross-platform | Address Type company-expansion migration | For an existing environment, drain old Address Type jobs, back up, review generated SQL, apply the company-expansion/remap migration in a maintenance window, then require re-login/company switch. | ReferenceData + Release owner | Open | Conditional — deployment crosses the global-to-company Address Type transition | Existing environment requires the Address Type company expansion | `documentation/modules/reference-data/features/address-types/address-types-evidence.md` |
| PROD-022 | Infrastructure | Release approvals and artifact trust | Add dev/staging/Production approval gates and image signing/provenance once the registry and hosting platform are selected. | DevOps/Security | Open | Yes for Production Scale | Deployment registry/platform is selected | `documentation/plans/product/ENTERPRISE_SAAS_CORE_ROADMAP.md` |
| PROD-023 | Infrastructure | Backup and disaster recovery | Schedule/encrypt backups, run restore drills, define measurable RPO/RTO, and maintain the disaster-recovery runbook. | Operations/Security | Open | Yes for Production Scale | External production data is accepted | `documentation/plans/product/ENTERPRISE_SAAS_CORE_ROADMAP.md` |
| PROD-024 | Infrastructure | Production observability and SLOs | Provide centralized error tracking, dashboards, alerts, end-to-end correlation, SLO/error budgets, and log redaction/retention policy. | Operations/Observability | Open | Yes for Production Scale | Production-scale launch or SLO commitment | `documentation/plans/product/ENTERPRISE_SAAS_CORE_ROADMAP.md` |
| PROD-025 | Cross-platform | Managed Crystal runtime deployment | Prove that Reporting and the Crystal runtime deploy the same managed-entity contract fingerprint, the intended physical report catalog/source policy, a supported installed Crystal runtime, topology-aware native concurrency limits, and a real authenticated AR/EN render with bounded memory and correlation. | Reporting + Runtime + Operations + QA | Open | Yes when managed Crystal reporting is enabled | A staging/Production deployment candidate includes managed Crystal reports | `documentation/plans/business/managed-crystal-reporting-reliability/PLAN.md`; `documentation/plans/business/managed-crystal-reporting-reliability/IMPLEMENTATION-ROADMAP.md` |
| PROD-026 | Mobile | Company administration and Error Logs native acceptance | User authorized implementation and automated checks for both features on 2026-10-17 and will perform device testing later. Verify permission create/edit/view, company isolation, stale session, translation edit/reset/default, EN/AR RTL, keyboard, phone/tablet and mock journeys on Android/iOS. Also verify company Message Logs filter/detail/redacted HTML/XLSX sharing and per-company cleanup choices/concurrency. Also verify company email template Table/Cards/filter/read-only sample HTML preview, landscape/RTL and external-navigation blocking. Also verify Error Logs Table/Cards, sanitized company/system detail, XLSX sharing/cleanup, retention validation and conflict recovery, runtime/network capture, scope switching, theme/orientation and safe areas for Error Logs V1. No SDK/adb is available in this workspace. | Product owner + QA | Open | Yes before claiming native acceptance/release; does not block authorized automated implementation of S2 or Error Logs V1 | Device/emulator becomes available | `documentation/plans/business/platform-user-permissions-and-company-localization/PLAN.md`; `documentation/plans/business/platform-error-logs/PLAN.md` ; `documentation/plans/business/company-email-templates/PLAN.md` |
| PROD-027 | Cross-platform | Company account email provider/client acceptance | Before production mail rollout, send approved confirmation/reset/invitation samples through the configured SMTP provider to explicitly approved test recipients and verify received EN/AR HTML/plain-text, action URLs, single recipient, spam/deliverability and Outlook/Gmail/mobile-client layout, plus company Message Logs truthful SMTP status and secret-free snapshot. Development acceptance captures MIME and server sample previews only; no external test email was authorized or sent. | Platform + QA + Operations | Open | Yes before production mail rollout; does not block authorized development implementation | Production SMTP and approved recipients/client accounts are available | `documentation/plans/business/company-email-templates/PLAN.md` |

## PROD-028 — Hosted Countries report catalog unavailable

- Source/context: S3-A8 hosted read-only acceptance on 2026-10-31. Country reads, authorized SignalR connection/reload/logout, normal-user403 and anonymous401 passed. Global Crystal catalog returns503 with code CrystalReport.CatalogUnavailable; shared error is visible and no PDF render is claimed.
- Owner: Reporting runtime + Operations + Angular QA.
- Status: Blocked.
- Impact: complete managed-report/hosted pilot acceptance cannot pass; business route remains development-only.
- Reason not implemented here: requires hosted Reporting runtime configuration/service/log access. No Reporting runtime deployment change is part of the authorized Angular acceptance; isolated Country test writes were separately exercised and archived2026-11-01.
- Reopening trigger: hosted operator supplies a reachable configured Crystal runtime and catalog, then QA reruns the real authenticated catalog and representative AR/EN PDF rendering.
- Target milestone: before complete S3-A8 acceptance and report-enabled deployment.
- Investigation: GetGlobalCrystalReportsQueryHandler maps a null deployment-source catalog to this503. CrystalReportDeploymentSourceClient calls internal/reports/catalog; disabled/missing runtime URL, downstream failures/timeouts or invalid response can produce null. Verify CrystalReports RuntimeEnabled/RuntimeBaseUrl and RuntimeApiKey (or CRYSTAL_REPORT_INTERNAL_API_KEY) securely with hosted logs. Repository defaults are not proof of hosted configuration or a unique root cause.
- Canonical evidence: documentation/modules/platform/features/angular-countries-pilot-acceptance/verification/hosted-read-security.json; API Reporting GlobalCrystalReportsController, CrystalReportQueryHandlers and CrystalReportDeploymentSourceClient. Related production runtime gate PROD-025.
- Closure evidence: fresh2026-11-01 hosted read/security still returns catalog503 CrystalReport.CatalogUnavailable; verification/final/hosted-read-security.json and verification/FINAL_ACCEPTANCE.md are current proof. All other current Countries pilot exits are Verified, including7real hosted write/realtime cases. Actual catalog and authenticated AR/EN render remain pending;40successful synthetic report-UI cases do not close this note.

PROD-028 investigation2026-11-01: requester explicitly reviewed the independent
CrystalReportGeneratorApi. The actual current ERP deployment-source client reads
two compatible Countries descriptors from the published runtime destination when
enabled/configured on this workstation. This narrows the investigation toward
the hosted ERP's effective integration settings/target/egress/version, without
proving a unique cause. Local safe defaults are disabled/blank; hosted overrides
remain unverified. PROD-029 owns confirmed published auth/route mismatch;
FOLLOW-023 owns independently reproduced rejected-descriptor interoperability.
Neither is silently declared the current503 cause. Full sanitized review/evidence:
documentation/plans/business/managed-crystal-reporting-reliability/RUNTIME_REVIEW_2026-11-01.md.

PROD-028/029 corrective progress2026-11-01: requester authorized all reviewed fixes.
FOLLOW-023 source/interoperability Verified; runtime auth/root/build/package
corrections pass15in-memory/20real IIS HTTP cases. Full ERP gate1167passed/3existing
browser skips with explicit isolated local SQL;134Reporting tests pass. Private
runtime/ERP folders and matching enabled integration patch prepared; no secret
committed. Both saved publish credentials fail DPAPI decryption, so no remote
publication/host setting change/native PDF claim. Concrete report and deployment
handoff: documentation/plans/business/managed-crystal-reporting-reliability/RUNTIME_CORRECTION_RESULT_2026-11-01.md. Keep both production notes Open until actual host receipts.

PROD-028 latest2026-11-01: requester published CrystalReportGeneratorApi only.
Runtime hosted authorization/build/current-routes/catalog acceptance now passes
and PROD-029 is Verified. Next requester action is ErpSystem.Api publication using
site84639-WebDeploy; its actual profile output has matching key, enabled integration
and runtime URL without overwriting existing appsettings. Complete ERP report/PDF
acceptance remains Open. Angular explicitly stopped by requester; do not restart
for dependent browser checks until requested. Current handoff: documentation/plans/business/managed-crystal-reporting-reliability/PUBLISH_READY_2026-11-01.md.

### PROD-028 latest render evidence — 2026-11-01

The requester now reaches global render and receives400 RenderUnsupported. Actual
authenticated current-runtime source download/inspection proves both deployed
Countries templates reject database connection metadata. Current canonical cause,
source-only taxonomy correction and remaining template/native verification are in
documentation/plans/business/managed-crystal-reporting-reliability/RENDER_REJECTION_2026-11-01.md.
Earlier503/catalog and authentication evidence remains historical; neither actual
AR/EN PDF nor full pilot acceptance is Verified. Publish corrected ERP/runtime to
receive specific errors; the existing RPT sources were not changed. PROD-029 remains
verified for the preceding deployment's auth/version check, not this unpublished build.

### PROD-028 — registration/native metadata evidence2026-11-02

Existing-file rejection correction2026-11-02: the current hosted RPTs have valid OLE signatures and matching hashes, but native inspection rejects database connection metadata. Read-only Crystal10 RDC metadata confirms Command tables/crdb_ado.dll and no Language parameter; the first report also lacks State schema fields. Inspection/storage now preserve SourceRejected, including exact legacy-message compatibility, with no private-file/report/version side effects. Full ERP1223tests pass (188Reporting,70architecture),3existing browser skips; independent Crystal build/contract harness pass. No schema, permission or source-policy change. Original RPTs unchanged; requester installs Crystal2013 before further designer work. FOLLOW-024/native acceptance remains Open. Public error correction is ready for requester publication; no remote deployment performed. Error classification alone does not make either RPT compatible.


### PROD-028 — manual View binding revision2026-11-02

The active GCT-1 now includes manually entered global SQL View binding, metadata-only drafts and designer preparation. Reporting migration20261102120604 was applied and its actual configured schema inspected; full ERP1239passed/3existing skips, Reporting203/architecture70, Angular504tests/90files and8production-build fixture browser cases pass. Source: documentation/plans/business/global-crystal-template-management/MANUAL_VIEW_IMPLEMENTATION_2026-11-02.md. Existing real hosted/native acceptance remains open; requester publishes API/Angular. View Builder is DEF-027. No actual native-valid RPT/PDF or production View creation is claimed.


### PROD-028 — Command push-data2026-11-03

Requester retains the RPT Command; GCT-1 now accepts design connection metadata and
binds one named table explicitly to API-supplied rows, retaining exact fields and
parameters. Current scope/build/harness/ERP evidence is COMMAND_PUSH_DATA_2026-11-03.md
in the global-crystal-template-management plan. Status remains Open: local native
ReportDocument initialization fails, and no real current RPT/PDF or zero-database-call
proof was obtained. After requester publication, verify known/filtered/empty API
rows with the design database unavailable. A successful upload alone is insufficient.
DEF-028 and DEF-027 stay Deferred; no remote deployment or RPT conversion performed.


### PROD-028 — complete connection-ignore2026-11-03

Requester explicitly supersedes the retained password check. GCT-1 ignores all
connection properties; its current technical evidence/user-file diagnosis is
CONNECTION_IGNORE_2026-11-03.md in global-crystal-template-management. The deployed
previous Command-support build is confirmed, but the complete-ignore revision has
not been deployed by this work. Exact Countries.1.rpt has no table in read-only
Crystal10 metadata and fails native single-source validation; Countries.test.rpt
fails native saved-data validation. Known Command fixture passes source/schema but
lacks Language. Original files unchanged; no actual PDF acceptance. Status remains
Open pending requester publication and valid designed-report rendering. DEF-028/
DEF-027 remain Deferred. Runtime code and framework tests cannot close native proof.


### PROD-028 — API-data container2026-11-03

Requester removes connection and saved-data admission gates; earlier instructions
to clear cached rows or rebind XSD are superseded. Current GCT-1 scope,1250-test
serial full-suite proof and native limits are CONTAINER_DATA_2026-11-03.md and
verification/container-data/. User publishes Crystal/ERP, then verifies original
Countries.tests.rpt with known/filtered/empty API rows and unavailable design DB.
No native PDF/cache/zero-SQL claim or remote deploy. Status remains Open; RISK-019
records that original source downloads retain original cached contents. DEF-028/
DEF-027 remain Deferred.


### PROD-028 — optional RPT Language2026-11-03

GCT-1 now allows zero RPT parameters and conditionally sets Language if present.
Render input ar/en, fields and canonical fingerprint stay unchanged. Native build/
harness covers all5 no-Language profiles and parameter compatibility. No ERP/client
rerun or successful new native inspection/PDF is claimed. Requester publishes only
Crystal for this revision. Current scope/evidence: OPTIONAL_RPT_LANGUAGE_2026-11-03.md
and verification/optional-rpt-language/. Status remains Open, Phase06 Not Verified.


### PROD-028 — first user-confirmed display2026-11-03

Requester confirmed successful report display with data. Canonical evidence and
limits: FIRST_REPORT_DISPLAY_2026-11-03.md / feature section28. This positive outcome
is user-reported; no independent PDF/cache/empty/filter/ACL/locale acceptance or exact
version/hash was captured in the confirmation turn. Basic display is no longer an
unachieved user outcome. Overall status remains Open and Phase06 Not Verified for
the broader acceptance. DEF-028/DEF-027 remain Deferred, not automatically resumed.


### PROD-028 — explicit viewer publication2026-11-03

GCT-1 removes implicit publication/rendering of unmanaged deployment files for
Super Admin. Viewer consumption now requires a valid active managed published
version; company grants remain separate. Draft/archived manager visibility and
existing-file registration are preserved. Canonical scope and current technical
evidence: global-crystal-template-management/PUBLISHED_VIEWER_CATALOG_2026-11-03.md
and feature section29 / verification/published-viewer-catalog/. Requester publishes
ErpSystem.Api and verifies the hosted selector; no remote deployment performed.
Status remains Open for the broader acceptance matrix and Phase06 Not Verified.

PROD-028: requester now confirms the selector displays published reports only.
Full ERP1251tests passed with3existing opt-in browser skips;34existing Angular
report tests passed for the language follow-up. No independent hosted/native
acceptance expansion. Current receipt: verification/published-viewer-catalog/.


### PROD-028 — restored native direction2026-11-03

Requester-authorized restoration of the historical API direction stage: Arabic
basis retained, English coordinates mirrored, centered field/text alignment,
legacy horizontal/vertical/diagonal line policy and drawing bounds. Summary Info
Title(ar)/Subject(en) labels already work and are verified separately in Angular.
Canonical scope/evidence: RESTORE_DIRECTION_2026-11-03.md / feature section30 /
verification/restore-direction/. Publish CrystalReportGeneratorApi; compare actual
AR/EN PDFs with fields, images, charts and rules. Automated geometry/call-order
checks are not native visual proof. Status remains Open and Phase06 Not Verified.


### PROD-028 — selector Summary Info diagnosis2026-11-03

Requester confirms direction changed; selector name remains the reported issue.
Hosted native inspection and independent OLE properties agree the local
Countries.tests.rpt candidate has no Title/Subject. The current published-source
match is unconfirmed. Exact evidence and non-destructive upload/publish workflow:
SUMMARY_NAMES_2026-11-03.md / feature section31 / verification/summary-names/.
No runtime change, test rerun or full native shape acceptance claim. Remains Open.

PROD-028 update: actual authenticated published catalog is now observed directly;
countries-tests version1 has null summaryTitle/summarySubject and the English
selector shows the Countries.tests fallback. The requester no longer needs to
copy Network. No runtime/data/preference change. Source byte equality remains
unverified; persisted-name emptiness is verified. See current section31 receipt.


### PROD-028 — confirmed duplicate replacement2026-11-04

GCT-1 now implements the approved filename/entity duplicate warning and one atomic
replacement/publication, retaining original versions/ACLs/View. SQL rollback and
fixture-based EN/AR browser evidence are recorded under feature section32 and
verification/duplicate-replacement/. Publish ErpSystem.Api and Angular assets;
then verify a real duplicate/cancel/replacement, updated Summary Info selector,
old source download and native AR/EN PDFs with the intended authorized roles.
These hosted writes were not performed by the agent. Status remains Open; Phase06
Not Verified, Phase07 not started and DEF-027/028 remain Deferred.
