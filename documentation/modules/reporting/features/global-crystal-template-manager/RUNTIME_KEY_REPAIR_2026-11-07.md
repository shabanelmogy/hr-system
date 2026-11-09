# Crystal render503 and SignalR transport404 — 2026-11-07

Classification: corrective deployment/hosting repair in existing Reporting and
Platform transport owners. No new business feature, schema, permission, dependency
or real report publication. The requester supplied the failed render503 and Hub404.

## Verified causes

The current hosted Countries catalog contains one published version; the earlier
entity fingerprint repair is active on ERP. Both EN and AR render requests now
return503 with ProblemDetails errors.CrystalReport.RuntimeUnavailable. Independently,
the configured runtime URL's /internal/reports/health and /catalog return503 with
code crystal_runtime_api_key_not_configured. The runtime root page is200. This is
direct evidence of missing internal runtime authentication configuration, not a
missing Countries template, CORS origin failure or native PDF result.

Current local Publish profiles had no private-transform selection; their private
key/transform files were absent. A current unconfigured package similarly had
RuntimeEnabled=false/blank URL and no ANCM Crystal environment overrides. The
existing scripts already own safe configuration: Prepare-CrystalReportDeployment
and Configure-CrystalReportPublish. Reuse them rather than remove authentication.
Configure now explicitly retains Release/x64 for the native Crystal profile.

SignalR is a separate problem. Fresh real browser tokens have about300seconds
remaining; WebSockets/SSE fail while LongPolling and automatic fallback connect.
Synthetic unauthenticated requests reproduce the IIS boundary: a short query
reaches ASP.NET and returns401 with exact CORS; the long query returns404 HTML
without CORS before managed authentication. The provided valid JWT plus id/query
keys exceeds the standard2048-byte IIS query envelope. Do not blame expiry solely
because a token is expired when a pasted log is read later. The earlier chat/PROD-003
expiry conclusion was not established and is superseded by this controlled proof.

## Owning changes and invariants

| Owner | Repair | Preserved boundary |
| --- | --- | --- |
| Existing Publish scripts | Restore matching private key and both profile transforms; Release/x64 native profile | Secrets ignored by Git and user-restricted; no key printed or remote publish |
| ERP IIS web.config |24576-byte maxQueryString/maxUrl only under hubs/company | Other request-filter limits inherited; JWT/session/role/permission/CORS unchanged |
| Read-only verification harness | Read error dictionary codes and correlation ID | No response bodies, JWT, Cookies or report bytes persisted |
| Reporting/Platform clients | Existing file/render and automatic transport fallback retained | No forced LongPolling, no removed claims or ACL checks |

Crystal uses a shared internal key, independently of the browser login/JWT. Its
published Web.config must contain the configured key without a dependency on the
developer's local App_Data file. ERP's published ANCM environment must enable
integration, select the correct HTTPS runtime and carry the same key. Configure
preserves Reports/ReportsLogo/App_Data and cleans only obsolete runtime bin files.

## Local verification

Generated private packages and configuration stay beneath the ignored
.codex-tmp/crystal-repair-20261107 directory. The actual Visual Studio/WPP runtime
profile staging and actual SDK ERP profile FileSystem publish were run locally,
with deployment disabled. Resulting Web.config files have matching nonempty keys,
integration enabled, correct runtime URL and the Hub-only query envelope. Original
profile destinations/passwords are retained. No secrets are in canonical evidence.

The regression test failed before ERP web.config existed and passed afterward.
An actual local IIS Express static transport fixture reuses the same hub filtering
location: ordinary small query200, ordinary2200-character query404, Hub2200query200,
and oversized25000-character query rejected414by the HTTP/IIS stack. The fixture
has no ERP authentication/business services, and is not a native report proof.
It was stopped after the bounded test. The first fixture attempt used forward
slashes in its IIS physical path and returned404.0; corrected native Windows path
passed. This setup failure is not counted as an application regression.

The first local final publish without RID restore failed NETSDK1047; the final
publish restored win-x64 assets and succeeded. No runtime workaround was added.
Full solution/check counts and portable logs are recorded under
verification/runtime-key-repair-2026-11-07/ after final gates.

## النشر المطلوب من Visual Studio

تم تجهيز الإعدادات المحلية بالفعل. انشر بنفس البروفايلات الحالية بهذا الترتيب:

1. مشروعCrystalReportGeneratorApiببروفايلsite38634-WebDeploy، واختيارRelease/x64.
2. مشروعErpSystem.Apiببروفايلsite84639-WebDeploy.
3. أعد تشغيل الموقعين إذا طلبت الاستضافة ذلك، ثم افتح الدول وشغّل التقرير.

لا تحتاج رفعRPTجديد أو تغيير قاعدة البيانات لحل هذين العطلين. لا تعِد استيراد
Publish profileبعد التجهيز لأنه قد يلغي اختيار التحويل الخاص؛ عند الاستيراد
مجدّدًا أعد تشغيلConfigure-CrystalReportPublishباستخدام ملف الإعداد الخاص
الموجود على هذا الجهاز، ولا تضع المفتاح في المحادثة أوGit.

بعد النشر يجب أن ينتقل طلبCrystalبلا مفتاح من503إلى401، ثم ينجح healthبالمفتاح
الصحيح. اختبر توليدPDFبالعربية والإنجليزية، وSignalRبتوكن جديد. نجاح تجهيز
النشر لا يثبت تنفيذCrystalالأصلي؛ أي خطأ لاحق سيحتاج كوده وسجل الخدمة المرتبط.
النشر والقبول الحقيقي ما زالاPROD-028/PROD-029وPROD-003.

Primary references:
- https://learn.microsoft.com/en-us/iis/configuration/system.webServer/security/requestFiltering/requestLimits/
- https://learn.microsoft.com/en-us/aspnet/core/signalr/troubleshoot?view=aspnetcore-10.0
- https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/transform-webconfig
