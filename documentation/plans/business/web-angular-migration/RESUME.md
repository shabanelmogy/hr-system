# آخر نقطة لاستكمال انتقال Angular

آخر تحديث: **2026-10-29 — Africa/Cairo**. ROADMAP يملك حالة التنفيذ، والتقارير تملك أدلة القبول.

## آخر شريحة مكتملة

**S2-A6 / angular-module-context-navigation أصبحت Verified/Closed.** القائمة المشتركة في الشريط تعرض التطبيقات المسموحة والنظرة العامة، وتتابع المسار والرجوع والتحديث. تشترك مع الصفحة في كتالوج واحد، وتخفي النتائج القديمة أثناء تغيير السياق. مكونات الحالة داخل AuthenticatedApplication تُتلف عند مغادرة الهيكل. طُبق طلب PrimeNG لكل عناصر التحكم المشتركة، وتحسين ScrollArea، وإظهار النص كاملًا على الكمبيوتر والأيقونات فقط على المساحات الصغيرة مع Tooltip.

- [تقرير التنفيذ](../../../modules/platform/features/angular-module-context-navigation/IMPLEMENTATION_REPORT.md).
- [دليل الاستخدام والتدريب](education/angular-module-context-navigation.md).
- الفحص الكامل لـAngular:25 ملفًا /109 اختبارات وحدة،9 فحوص معمارية،4 اختبارات إعداد، والأنواع والترجمة والألوان والخطوط والبناء نجحت.434.41 kB أولي /116.17 kB نقل تقديري.
-24 حالة متصفح للإضافة؛ تراجع التطبيقات14 والشركة14 والسنة15 والهيكل24 واللغة20 نجح. النماذج المشتركة40 حالة نجحت على سيرفر التطوير لأن dev/forms مستبعد من الإنتاج. Next:3 ملفات/13 اختبارًا؛ Native:3 مجموعات/7 اختبارات نجحت.
- تجربة فعلية بمتصفح Chrome موثوق، Angular4210 والـAPI المستضاف: طلب كتالوج200 واحد مشترك، التبديل والعودة، التحديث، refresh200 ثم تحديث آخر وlogout204. لا تُنقل هذه النتائج إلى ادعاء نجاح كل بوابات الإصدار.

الشرائح السابقة مغلقة: مصادقة Cookies، تأسيس Angular والترجمة والثيم والنماذج، ثم S2-A0 إلى S2-A5 للدخول والهيكل والتطبيقات والبداية والشركة وسنة العمل. شاشات ERP كلها لم تُنقل بعد والخطة الشاملة ما زالت Draft.

## نقطة الاستكمال الوحيدة

**angular-collection-foundation / S1-A3 — Shared collection foundation** هي الشريحة النشطة الجديدة للتحضير فقط.

[عقد التحضير](decomposition/angular-collection-foundation.md) يبدأ بمراجعة MyDataGrid وشريط البحث/الفلاتر والفرز والصفحات والتذييل والتنقل بين السجلات وCards وحالات العرض، ثم تجميد أصغر عقد مشترك مناسب لـAngular قبل Countries. لا يوجد تصريح بتنفيذ جداول أو شاشات أعمال قبل Phase00 واكتمال العقود. لم يبدأ كود هذه الشريحة. لا تفتح أكثر من Feature واحدة.

تقدم التحضير: تمت مراجعة MyDataGrid وCountries ومراجعة التوثيق الرسمي وواجهات
PrimeNG22.1.4 المثبتة بناءً على طلب المستخدم معرفة أقصى الخيارات. النتيجة في
[مراجعة إمكانيات Table](PRIMENG_TABLE_CAPABILITY_REVIEW.md). Table متاح؛ منتجا
DataGrid PRO وSheet ما زالا Roadmap وفق المصدر الرسمي وقت المراجعة. فرز وفلاتر
Countries الحالية أبسط من أقصى إمكانيات Table؛ لا يُفعّل أي خيار غير مدعوم من
عقد الخادم. سكافولد أدلة Phase00 مبدئي وغير مسجل؛ الخطوة القادمة تجميد نطاق
المكونات والخيارات المتوافقة ثم إكمال Phase00 قبل runtime. لا يوجد ادعاء قبول
Grid جديد أو اختبارات متصفح جديدة لهذه المراجعة.

المتبقي: FOLLOW-012 لمحرر الترجمات وحفظها/إعادة ضبطها/التعارض؛ FOLLOW-014 لحقول الأعمال وحماية المسودات؛ FOLLOW-015 لباقي الهيكل والشاشات والبحث/الإشعارات/الملف. تم إقفال جزء تبديل التطبيق فقط من FOLLOW-015.

## إعدادات المحلي والهوست

- المستخدم اختار API التجربة https://shabanhrms.runasp.net. ملف web-angular/.env العام متتبع في Git ويختار host/local؛ الافتراضي host. أوامر start:local/start:host وbuild:local/build:host متاحة؛ يلزم إعادة تشغيل/بناء عند التغيير. [الدليل](../../../guides/web/ANGULAR_ENVIRONMENT.md).
- خطأ BrowserOriginDenied السابق لم يعد يمنع الدخول في الفحص اللاحق: csrf/login/catalog/refresh/logout الفعلية نجحت. PROD-017/019 يحتفظان بباقي تحقق الاستضافة والإصدار.
- المستخدم طلب Swagger على هوست التجربة: إعداد النشر المحلي SwaggerSettings.Enabled=true، وبروفايل WebDeploy يفتح HTTPS/Swagger. الحزمة محليًا ببيئة Production أعادت root302 وSwagger/OpenAPI200، وبقيت مسارات الأعمال401 لغير المسجل. لم ينفذ الوكيل نشرًا عن بُعد؛ تطبيق الإعداد على الموقع يحتاج Publish/Restart إن لم يكن المستخدم نفذه. [سجل الإصلاح](../../../modules/platform/features/platform-browser-authentication/verification/HOSTED_CONFIGURATION_REPAIR.md).
- لا BFF أو رموز جلسة في JavaScript أو مخزن NgRx عالمي إلزامي. نفس سياسة Signals والمكونات المشتركة و@app/tokens محفوظة.

## جهاز آخر ومزامنة الملفات

اقرأ AGENTS.md وهذا الملخص وROADMAP والعقد الحالي، وافحص المصدر قبل الاعتماد على نتائج جهاز سابق. التطبيق في web-angular/. شهادات HTTPS ومفتاح PrimeUI داخل إعدادات محلية متجاهلة ولا تنتقل تلقائيًا. .env.local والأسرار خارج Git.

توجد تغييرات معدلة وغير متتبعة، و.env فقط أضيف للـstaging بطلب المستخدم السابق. لم ينشأ commit/push في جلسة التنفيذ هذه. الحفظ على القرص لا يزامن جهازًا آخر؛ يلزم نقل التغييرات أو تسجيلها ومزامنتها عبر Git. لا تنقل Cookies أو كلمات مرور أو سجلات خام. السيرفر المحلي4210 كان موجودًا ويظل مملوكًا للمستخدم؛ معاينة4220 المؤقتة تُوقف بعد التحقق.

## خطوات البدء على الجهاز الآخر

1. زامن كود المشروع والتوثيق والملفات الجديدة معًا. قبل الانتقال تأكد أن
   التعديلات المطلوبة أُضيفت إلى commit ثم رُفعت، وعلى الجهاز الآخر اعمل pull
   للفرع والـcommit نفسيهما. مجرد وجود remote أو staging لا ينقل التغييرات.
2. اقرأ بالترتيب: AGENTS.md، هذا الملف، ROADMAP.md، ثم
   decomposition/angular-collection-foundation.md وPRIMENG_TABLE_CAPABILITY_REVIEW.md.
3. الشريحة الوحيدة الحالية S1-A3 للتحضير. استكمل مسودة أدلة Phase00 الموجودة
   تحت documentation/modules/platform/features/angular-collection-foundation/؛
   لا تعِد السكافولد فوقها. لم تُسجل مسودتا manifest/recipes بعد، ولم يبدأ
   runtime الجداول. جمّد عقد الخيارات والملكية والتوافق، ثم أكمل الكتب الأربعة
   والـmanifest/recipes والفحوص قبل التنفيذ. توفر خيار في PrimeNG لا يعني
   اعتماده أو أن API الحالي يدعمه.
4. استخدم إصدار Node المطابق لـengines في web-angular/package.json. الألوان
   المشتركة packages/tokens/dist متتبعة في Git؛ لا تنسخ node_modules أو dist
   الخاص بتطبيق Angular من الجهاز القديم. ثبّت اعتماديات Angular من lockfile.
5. أعد إعداد PRIMEUI_LICENSE_KEY محليًا في web-angular/.env.local، وجهّز
   شهادات HTTPS موثوقة للجهاز في web-next/certificates/localhost.pem و
   localhost-key.pem حسب أمر start. هذه الإعدادات متجاهلة في Git وتحتاج تجهيزًا
   مستقلًا. ملف web-angular/.env العام يملك URL واختيار host/local.
6. من جذر المستودع، بعد تجهيز البيئة، شغّل:

   ```powershell
   npm --prefix web-angular ci
   npm --prefix web-angular run check
   npm --prefix web-angular run start:host
   ```

   للاختبار على API محلي استخدم start:local بعد تشغيله وإعداد الأصل المسموح؛
   start:host يستخدم API التجربة المستضاف. تثبيت المتصفح والشهادات المحلية لازم
   قبل اختبارات Chrome؛ لا تعتبر أدلة الجهاز السابق إعادة تحقق على الجهاز الجديد.
7. حدّث هذا الملف وROADMAP بعد كل مرحلة مكتملة، مع Feature واحدة نشطة فقط.

نص تسليم جاهز للمحادثة الجديدة:

> استكمل خطة web-angular-migration من RESUME.md وROADMAP.md. آخر شريحة مكتملة
> S2-A6. الشريحة الحالية الوحيدة S1-A3 / angular-collection-foundation في Phase00؛
> استكمل عقد المكونات المشتركة بعد PRIMENG_TABLE_CAPABILITY_REVIEW.md ثم نفذ وفق
> بوابات الخطة. حافظ على PrimeNG عبر Shared، ومكتبة @app/tokens، وNext كما هو،
> وسياسة Signals دون BFF أو مخزن عالمي إلزامي. افحص المصدر والبيئة ولا تفترض
> انتقال التعديلات المحلية أو نجاح اختبارات الجهاز السابق على الجهاز الجديد.
