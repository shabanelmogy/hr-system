# برمجة Verify Database لتقارير Crystal

عند تنفيذ **Verify Database** من Report Manager، يقرأ النظام نسخة الـRPT
المخزنة، ويرسلها إلى `CrystalReportGeneratorApi` الداخلي. خدمة Crystal تفتح
النسخة، تستدعي `ReportDocument.VerifyDatabase()`، تحفظ نسخة RPT معدّلة في مساحة
مؤقتة، ثم تعيدها إلى Reporting.

لا ينزّل المستخدم الملف ولا يفتحه يدويًا. بعد نجاح التحقق، يخزن Reporting النسخة
المعدّلة كإصدار جديد، ويفحصها مرة أخرى بالعقد الحالي، ثم ينشرها تلقائيًا. الإصدار
القديم لا يُحذف؛ يبقى محفوظًا في سجل الإصدارات.

Verify Database يحدّث تعريف مصدر البيانات داخل RPT ويجعل الحقول الجديدة متاحة
وفق سلوك Crystal، لكنه لا يضع الحقول الجديدة تلقائيًا داخل Details أو Group أو
Header ولا يختار عرض العمود أو عنوانه أو تنسيقه. ذلك يحتاج مصمم Crystal أو مسار
تصميم جدولي ديناميكي مستقل.

صلاحية العملية تتطلب Upload وPublish، ونطاق Report Manager المعتاد، وحقوق التقرير
عند الكيانات التي تعتمد Role Grants. تفشل العملية بأمان إذا تعذر Crystal runtime
أو الفحص الثاني أو الحفظ الذري، ويُحذف الملف المؤقت دون تغيير الإصدار المنشور.

```text
Report Manager action
  -> POST /global-crystal-reports/manage/{id}/versions/{versionId}/verify-database
  -> load and hash-verify immutable stored RPT
  -> internal Crystal multipart /internal/reports/verify-database
  -> ReportDocument.VerifyDatabase()
  -> SaveAs temporary verified RPT
  -> inspect verified bytes against current managed contract
  -> store immutable new version
  -> publish new version atomically
```

النقطة الداخلية لا تقبل مسارات ملفات أو بيانات اتصال بقاعدة البيانات أو مفاتيح
من العميل، وتحتفظ بحدود الحجم وقفل تنفيذ Crystal الحالي.

التحقق المحلي الحالي: بناء Reporting وحل ERP Release يمران؛ اختبارات Reporting
252 واختبارات حل ERP 1331 تمر مع 3 اختبارات متصفح اختيارية متخطاة. بناء مضيف
Crystal نجح باستخدام MSBuild الخاص بـVisual Studio المثبت، ونجح ContractTests
على الـDLL الجديد. الفشل السابق بـMSB4019 كان خاصًا باستخدام dotnet msbuild؛
أداة Visual Studio الأصلية وجدت WebApplication.targets دون تثبيت أو تغيير إعدادات.

مرجع السلوك الرسمي:
[SAP Crystal Reports Verify Database](https://help.sap.com/docs/SAP_CRYSTAL_REPORTS/dfc124becfa845ffa91b1e717b20e3ec/47413acf6e041014910aba7db0e91070.html?locale=en-US&state=PRODUCTION&version=2025).

## حدود التنفيذ والتحقق الحالي

نجحت اختبارات Reporting الكاملة: 252 اختبارًا، ومنها ست حالات جديدة لمسار
إنشاء الإصدار والنشر التلقائي، حفظ الإصدار السابق، رفض العملية بدون الصلاحيتين،
عدم تغيير النشر عند تعذر الخدمة، تعويض الملف بعد الأرشفة، والاحتفاظ بأخطاء الفحص المحددة.
يقارن المعالج schema/fingerprint مع العقد الحالي قبل الدخول في معاملة النشر؛
الملف المرفوض يُحذف ولا يتغير الإصدار المنشور.

الاختبار الحالي للعقد يغطي بصمة JSON الأصلية وستة مصادر معتمدة، 14 حالة
اتجاه/هندسة، 16 حالة مصادقة HTTP، وفحص multipart لنقطة verify-database.
تم تصحيح افتراض الاختبار التاريخي بخمسة مصادر ليتوافق مع إضافة system-error-logs.
الـDLL القديم بتاريخ سبتمبر فشل عند تجربته لأنه لا يمثل المصدر الحالي؛ تم
بناء المصدر الحالي إلى .codex-tmp/crystal-verify-build ونجح بدلًا منه.

بحسب توثيق ReportDocument.VerifyDatabase، العملية تحتاج اتصالًا صالحًا بمصدر
التصميم وقد تفشل بـLogOnException. التشغيل المعتاد بالبيانات المدفوعة من API
لا يثبت إتاحة اتصال Verify Database. الكود لا يضيف اتصالات أو بيانات دخول من
العميل ولا يتجاوز عقد الحقول؛ يلزم اختبار RPT حقيقي على المضيف المجهز قبل اعتماد
التحقق native. لا تعني إضافة عمود في SQL أن عقد Reporting أو تصميم العمود
المرئي تغيّر تلقائيًا.

[توثيق VerifyDatabase الرسمي](https://learn.microsoft.com/en-us/previous-versions/ms226073%28v%3Dvs.90%29).
تبقى المتابعة ضمن FOLLOW-024 وPROD-028؛ لا نشر على الاستضافة ولا تعديل RPT حقيقي هنا.

مهلة Angular لهذه العملية 180 ثانية لتغطية التحقق الداخلي (120 ثانية) والفحص اللاحق قبل النشر؛ بقية عمليات المدير تحتفظ بمهلتها الحالية.

رسالة تعذر التحقق مترجمة بالعربية والإنجليزية ضمن موارد API الحالية؛ توضح مراجعة
خدمة Crystal واتصال مصدر التصميم وأن الإصدار المنشور لم يتغير. بعد إضافتها نجح
بناء ERP Release مجددًا (0 أخطاء، 78 تحذير تحليل)، ومرّت اختبارات الحل الـ1331
مع 3 اختبارات متصفح اختيارية متخطاة. إيصال التحقق النهائي المشترك متاح في
[نتائج 2026-11-07](../../../platform/features/angular-super-admin-settings/verification/language-translation/verification-2026-11-07.json).

## Concurrency correction — 2026-11-09

The management POST now requires JSON `{ "rowVersion": "<current token>" }`.
The report token is checked before native work and again under the final report
lock, then applied as the persistence concurrency token. A late verification
cannot replace another administrator's publication; its staged source is removed.
See MANAGER_REVIEW_CORRECTIONS_2026-11-09.md and the current regression receipt.
