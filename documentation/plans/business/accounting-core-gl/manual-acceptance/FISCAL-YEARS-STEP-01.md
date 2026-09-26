# سيناريو القبول اليدوي — الخطوة 01: السنوات والفترات المالية / Fiscal Years & Periods

## 1. حالة السيناريو

| البند | القيمة |
| --- | --- |
| الخطة | `accounting-core-gl` |
| الشريحة | `Slice 1 — Ledger setup spine` |
| الخطوة | `Step 01 — Fiscal Years & Periods revalidation` |
| الميزة | `fiscal-years` — السنوات والفترات المالية / Fiscal Years & Periods |
| إصدار السيناريو | `2026-09-25 / Revision 1` |
| الحالة الحالية | `Pending — environment execution and explicit user acceptance required` |
| الخطوة التالية المحجوزة | `Step 02 — العملات / Currency`، ولا تصبح Active قبل قبول المستخدم وإغلاق الخطوة 01 |

هذا السيناريو يقبل الرحلة الحالية فقط: إدارة سنة مالية مملوكة للشركة،
وتوليد الفترات التابعة لها، ودورة حياتها، وعرضها في Web وMobile. لا يقبل قيود
اليومية أو الترحيل أو الإقفال الشهري المستقل أو شجرة الحسابات؛ هذه خطوات لاحقة.

## 2. ما سيجهزه وكيل التنفيذ قبل أن تبدأ

لن يطلب منك بدء الاختبار قبل تسجيل الآتي في نتيجة هذا السيناريو:

- رقم الـcommit/branch ووصف أي تغييرات غير committed مستخدمة في التشغيل؛
- API وWeb ونسخة Mobile متصلة بقاعدة البيانات نفسها؛
- تطبيق migration الخاص بـ`AccountingDbContext` ونجاح فحص عدم وجود model changes
  معلقة؛
- نجاح API health وتسجيل الدخول واختيار Tenant/Company؛
- تشغيل Web على متصفح مدعوم، وتشغيل Mobile على جهاز فعلي مع تسجيل اسم الجهاز
  ونظام التشغيل ونسخة التطبيق؛
- نجاح اختبارات Fiscal Years المركزة، وفحوص Web وMobile والتوثيق، أو فصل أي عطل
  موروث لا يخص الميزة؛
- توافر حسابات الصلاحيات الواردة أدناه وشركتين اختباريتين داخل Tenant واحد؛
- توافر Reporting module و`ViewCrystalReports` لاختبار التقرير. إذا لم يتوفر
  أي متطلب إلزامي تصبح النتيجة `Blocked` ولا تعتبر Pass.

قيم التشغيل المتوقعة محليًا، ما لم تسجل البيئة عناوين مختلفة:

```text
API: https://localhost:7037
Web: https://localhost:3000/finance/ledger-setup/fiscal-years
Mobile route: /finance/ledger-setup/fiscal-years
```

## 3. حسابات الاختبار المطلوبة

لا تكتب كلمات المرور أو tokens في الملف أو الصور.

| الرمز | الصلاحيات/الحالة | النتيجة التي نثبتها |
| --- | --- | --- |
| `FY-FULL` | `FiscalYears:View/Create/Edit/Archive/Restore/Open/BeginClosing/Close/Lock/Reopen` + صلاحية التقرير | الرحلة الإيجابية كاملة |
| `FY-VIEW` | `FiscalYears:View` فقط | العرض يعمل، وكل mutation مخفي أو مرفوض |
| `FY-ARCHIVE` | `FiscalYears:View` + `FiscalYears:Archive` فقط | الأرشفة متاحة والاستعادة وباقي الأفعال مرفوضة |
| `FY-RESTORE` | `FiscalYears:View` + `FiscalYears:Restore` فقط | الاستعادة متاحة والأرشفة وباقي الأفعال مرفوضة |
| `FY-LIFECYCLE-ONE` | `FiscalYears:View` + صلاحية lifecycle واحدة في كل جولة | كل انتقال مستقل ولا تمنح صلاحية انتقال سلطة انتقال آخر |
| `FY-DENIED` | بلا `FiscalYears:View` | القائمة والرابط المباشر وAPI تفشل بصورة آمنة |
| `FY-READONLY` | الصلاحيات موجودة لكن الاشتراك/البيئة Read-only | لا يوجد إنشاء/تعديل/أرشفة/استعادة/تغيير حالة |
| `FY-FULL` في Company B | نفس المستخدم أو مستخدم مماثل في شركة اختبار ثانية | لا تظهر بيانات Company A في Company B |

## 4. بيانات الاختبار الدقيقة

قبل التنفيذ اختر:

- `<S>` = لاحقة فريدة قصيرة من 6–8 أرقام، مثل `25092501`، مع مراعاة ألا يتجاوز
  الكود 20 حرفًا.
- `<START-DRAFT>` و`<START-LIFE>` = تاريخا بداية لسنتين كاملتين غير متداخلتين
  مع أي سنة فعالة موجودة في Company A. يجب أن يكون تاريخ النهاية المحسوب لكل
  منهما `StartDate + 1 year - 1 day`.
- يفضل استخدام Company A وCompany B اختباريتين أو قاعدة بيانات قابلة لإعادة الضبط.

| Fixture | Code | NameAr | NameEn | Start / End | Frequency | الاستخدام والنهاية |
| --- | --- | --- | --- | --- | --- | --- |
| Draft | `FYD-<S>` | `سنة اختبار مسودة <S>` | `Draft Test Year <S>` | `<START-DRAFT>` / النهاية المحسوبة | Monthly أولًا | إنشاء/تعديل/بحث/أرشفة/استعادة؛ ينتهي مؤرشفًا |
| Lifecycle | `FYL-<S>` | `سنة اختبار دورة <S>` | `Lifecycle Test Year <S>` | `<START-LIFE>` / النهاية المحسوبة | Monthly | Open→Closing→Closed→Locked→Reopen؛ يبقى Open كسجل اختبار موثق |
| Invalid | `!` ثم كود Draft المكرر | اسم عربي/إنجليزي صالحان | اسم عربي/إنجليزي صالحان | تاريخ مدة غير سنة ثم فترة متداخلة | Monthly | يجب ألا يُحفظ أي سجل |
| Conflict | نفس Draft قبل أرشفته | لا تغيير مستقل | لا تغيير مستقل | نفس القيم | Quarterly بعد Session A | Session B يحمل RowVersion قديمًا ويجب أن يتلقى conflict/reload |

أثناء تعديل Draft استخدم:

```text
NameAr: سنة اختبار مسودة معدلة <S>
NameEn: Updated Draft Test Year <S>
Frequency: Quarterly
Expected generated periods: 4, covering the full year with no gaps or overlaps
```

## 5. نموذج تسجيل كل حالة

لكل حالة أدناه سجّل `Pass / Fail / Blocked / Not run`، وصورة أو تسجيلًا يحمل رقم
الحالة، واللغة والمنصة. عند فشل API سجّل request/correlation ID وProblemDetails بعد
إخفاء أي token أو بيانات حساسة.

## 6. رحلة Web — الحساب كامل الصلاحيات

نفّذ أولًا باللغة الإنجليزية LTR على عرض Desktop لا يقل عن `1440px`، ثم أعد حالات
الاتجاه والاستجابة المطلوبة بالعربية RTL وعلى عرض ضيق يقارب `390 × 844`.

### W-01 — الوصول وحالات الشاشة المشتركة

1. سجّل الدخول بحساب `FY-FULL` واختر Company A.
2. افتح Finance → Ledger Setup → Fiscal Years، ثم افتح الرابط المباشر
   `/finance/ledger-setup/fiscal-years`.
3. تحقق من PageHeader، زر الإضافة، Refresh، Filter، ومبدل Grid/Cards/Report عندما
   تكون صلاحية Reporting متاحة.
4. أثناء التحميل يجب ظهور loading مشترك، وأثناء refresh يجب بقاء المحتوى مع مؤشر
   background loading، لا شاشة فارغة أو قفزة غير مبررة.
5. استخدم بحثًا لا يعيد نتائج. يجب ظهور filtered-empty state قابل للمسح/reset، ثم
   أعد الفلاتر وتأكد من رجوع البيانات.
6. تحقق أن Grid/Cards لهما paging حقيقي من الخادم، وأن تغيير page/page size/sort
   لا يطبق على الصفحة الحالية فقط.

النتيجة المتوقعة: تركيب P-001 المشترك ظاهر، ولا توجد أزرار Import أو Export أو
Chart، ولا `alert/confirm` أصلي من المتصفح.

### W-02 — Validation قبل الإنشاء

1. اضغط Add/Create واترك الحقول فارغة ثم اضغط Create؛ يجب أن يظل الزر متاحًا قبل
   الضغط، وبعده تظهر رسالة محددة أسفل كل حقل غير صالح وينتقل التركيز لأول خطأ.
2. أدخل Code=`!`؛ يجب ظهور خطأ صيغة الكود.
3. أدخل اسمًا عربيًا واترك English Name فارغًا، ثم اعكس التجربة؛ يجب رفض كل حالة
   تحت الحقل الناقص دون نافذة validation أصلية.
4. أدخل Start Date ثم حاول تغيير End Date. يجب أن يكون End Date محسوبًا وغير قابل
   للتحرير، ويساوي سنة كاملة ناقص يوم.
5. غيّر Frequency بين Monthly وQuarterly وتحقق من preview: 12 مقابل 4 فترات،
   تغطي التاريخ بالكامل بلا فجوات أو تداخل.
6. غيّر قيمة صحيحة، أغلق النموذج، واختر البقاء عند ظهور dirty confirmation؛ ثم
   أغلق ثانية واختر discard. يجب استخدام confirmation المشترك.

النتيجة المتوقعة: لا تُنشأ أي بيانات من هذه الحالة، والرسائل مترجمة بحسب اللغة.

### W-03 — الإنشاء الثنائي اللغة والعرض

1. أنشئ Fixture `Draft` بالقيم الدقيقة أعلاه وبـMonthly.
2. تحقق من success message ومن ظهور السجل مرة واحدة في Grid.
3. افتح Cards؛ تحقق من Code، الاسمَين العربي والإنجليزي، Start/End، Draft، Monthly،
   وعدد الفترات `12` دون اختلاف عن Grid.
4. افتح View/Detail؛ تحقق من كل حقول السنة ومن 12 فترة مرتبة، أولها يبدأ مع Start
   وآخرها ينتهي مع End، بلا تحكم تعديل مستقل للفترات.
5. Refresh كامل للصفحة ثم أعد فتح Detail. يجب بقاء الاسمين والقيم والفترات كما هي.

النتيجة المتوقعة: Create يعيد سجل Draft authoritative وRowVersion، ولا يرسل العميل
TenantId أو CompanyId في body.

### W-04 — البحث والفرز والتصفية

1. ابحث بحقل `NameAr` عن `سنة اختبار مسودة <S>` وتحقق أن السجل يظهر وحده.
2. ابحث بحقل `NameEn` عن `Draft Test Year <S>` وكرر النتيجة.
3. ابحث بالكود بحالات الحروف المختلفة؛ يجب أن يبقى الكود محفوظًا uppercase.
4. جرّب Contains وEquals وStarts with، ثم lifecycle=`Draft` وrecord status=`Active`.
5. بدّل sort بين Start Date وNameAr وNameEn صعودًا وهبوطًا، ثم Reset.

النتيجة المتوقعة: كل criteria تنفذ من الخادم وتعود paging metadata صحيحة، ولا يضيع
أحد الاسمين أو يستبدل بالآخر.

### W-05 — التعديل والتزامن

1. افتح السجل Draft في Session A وSession B (نافذتان/متصفحان أو Web + Mobile)
   قبل أي تعديل.
2. في Session A غيّر الاسمين إلى القيم المعدلة وحوّل Frequency إلى Quarterly ثم
   احفظ.
3. تحقق من ظهور 4 فترات فقط ومن استمرار تغطية السنة كاملة، ثم أعد فتح Detail.
4. في Session B حاول حفظ النسخة القديمة أو تنفيذ Action قديم بالـRowVersion القديم.

النتيجة المتوقعة: Session A ينجح مرة واحدة. Session B يتلقى `409
ConcurrencyConflict`، يعرض رسالة conflict/reloaded، يغلق الـdialog عند تصميم Web
الحالي، ويعيد القائمة/التفصيل من الخادم دون success كاذب أو overwrite.

### W-06 — قواعد التكرار والتداخل

1. حاول إنشاء سنة جديدة بنفس Code الخاص بـDraft ولكن بتواريخ غير متداخلة.
2. حاول إنشاء Code مختلف بفترة تتداخل يومًا واحدًا على الأقل مع Draft.
3. أدخل مدة لا تساوي سنة كاملة ناقص يوم إذا أمكن عبر network/API inspection؛ UI
   يجب أن يحسب النهاية الصحيحة، والخادم يجب أن يرفض payload غير الصحيح.

النتيجة المتوقعة: أخطاء stable ومفهومة، لا partial write، وعدد السجلات لا يتغير.

### W-07 — الأرشفة والاستعادة

1. على Draft المعدل اضغط Archive، تحقق من نص confirmation والكود ثم Cancel؛ يجب ألا
   تتغير البيانات.
2. كرر وConfirm. يجب اختفاؤه من Active وظهوره في Archived/All فقط.
3. افتح Archived وتحقق أن Edit/Open غير متاحين وأن Restore متاح للصلاحية المناسبة.
4. Restore ثم تحقق من عودته Draft مع 4 فترات والأسماء المعدلة.
5. Archive مرة أخيرة ليكون هذا هو Final cleanup للسجل.

النتيجة المتوقعة: Archive/Restore يستخدمان أحدث RowVersion، ولا يمكن أرشفة سنة غير
Draft، والكود يظل محجوزًا حتى عند الأرشفة.

### W-08 — دورة الحياة الكاملة

1. أنشئ Fixture `Lifecycle` وتحقق من Draft و12 فترة.
2. نفّذ بالتسلسل مع confirmation في كل مرة: `Open` ثم `Begin closing` ثم `Close`
   ثم `Lock` ثم `Reopen`.
3. بعد كل Action تحقق من status chip في Grid وCards وDetail ومن Refresh authoritative.
4. أثناء Open/Closing/Closed/Locked تحقق أن Edit وArchive غير متاحين.
5. قبل Reopen تحقق أن Closed/Locked read-only. بعد Reopen يجب أن تصبح السنة والفترات
   `Open`، لكن حقول التقويم لا تعود قابلة للتعديل.
6. جرّب Action خارج الترتيب (مثل Close على Open) من API inspection أو stale UI؛ يجب
   أن يفشل بـstable business error دون تغيير الحالة.

النتيجة المتوقعة: السلسلة الوحيدة المقبولة مطابقة للعقد، ولا ينتج التكرار على target
state audit/realtime noise جديد. احتفظ بالسجل Open مع prefix الاختبار؛ لا تحذفه.

### W-09 — التقرير

1. بحساب يملك `ViewCrystalReports` ومع Reporting module افتح Report view.
2. تحقق أن التقرير يستخدم dataset الشركة الحالية ويعرض السنة/الفترات بالأسماء
   والحالات الصحيحة.
3. بدّل Company ثم أعد التقرير؛ يجب ألا تظهر بيانات Company A.
4. بحساب بلا entitlement يجب ألا يظهر Report view. إذا كان catalog بلا report
   مثبت، يجب ظهور unavailable/empty state مترجمة وليست crash أو تقريرًا مزيفًا.

## 7. رحلة Mobile على جهاز فعلي

سجّل: نوع الجهاز، OS، نسخة التطبيق/Expo، حجم الشاشة، الاتصال، ووقت الاختبار. نفّذ
على الجهاز الفعلي بالإنجليزية LTR والعربية RTL، وفي Light/Dark إذا كان التطبيق
يدعمهما.

### M-01 — المسار والقائمة والـviews

1. سجّل الدخول بحساب `FY-FULL` واختر Company A، ثم افتح Finance → Ledger Setup →
   Fiscal Years والمسار `/finance/ledger-setup/fiscal-years`.
2. تحقق من loading ثم Table، وابحث عن Fixtures بالاسم العربي ثم الإنجليزي.
3. بدّل إلى Cards وتحقق من نفس البيانات وعدد الفترات والحالة.
4. جرّب server pagination بأحجام 3 و5 و10، والفرز والفلاتر وpull-to-refresh.
5. افتح Report إذا كان متاحًا وتحقق من نفس قواعد الصلاحية والشركة في W-09.

### M-02 — النموذج والـkeyboard والاتجاه

1. افتح Create واضغط Create فارغًا. يجب ظهور رسالة تحت كل حقل وتركيز/scroll لأول
   خطأ، من دون تعطيل زر Create بسبب عدم اكتمال القيم قبل الضغط.
2. اكتب نصًا عربيًا وإنجليزيًا طويلًا ضمن الحد، وافتح keyboard في آخر حقل؛ يجب ألا
   يغطي الحقل أو زر الإجراء، وأن يعمل scroll داخل full-screen form.
3. جرّب mock-data action؛ يجب أن يملأ local draft واقعيًا فقط، لا يرسل أو ينشئ سجلًا.
4. غيّر قيمة، ثم استخدم device Back/gesture. يجب ظهور dirty protection؛ اختر Stay
   ثم Discard في المحاولة التالية.
5. تحقق من safe areas، touch targets، وعدم قص النص في Portrait وLandscape.

### M-03 — التكامل بين Web وMobile

1. افتح Fixture `Lifecycle` في Mobile ثم غيّر حالته من Web.
2. نفّذ pull-to-refresh أو انتظر realtime المطلوب؛ يجب ظهور الحالة authoritative.
3. افتح Draft restored قبل أرشفته في Web وMobile، عدّله في أحدهما، ثم حاول Action
   من الآخر بالنسخة القديمة.

النتيجة المتوقعة: conflict واضح وإعادة تحميل، بلا overwrite أو success محلي كاذب.

### M-04 — الشبكة والسياسة المالية

1. افتح القائمة متصلًا، ثم افصل الشبكة.
2. إذا ظهرت cache فيجب تمييزها كحالة قديمة وفق shell؛ حاول create/edit/lifecycle.
3. يجب أن تفشل mutation بوضوح، وألا تدخل outbox أو تُعرض كنجاح محلي.
4. أعد الشبكة ونفّذ retry/refetch؛ يجب أن تعود الحقيقة من الخادم بلا تكرار mutation.

### M-05 — الرحلة الوظيفية على Mobile

أنشئ Fixture إضافيًا فقط إذا كانت بيئة الاختبار disposable؛ وإلا استخدم سجلاً Draft
مخصصًا متفقًا عليه. نفّذ Create → View 12 periods → Edit to Quarterly → View 4
periods → Archive → Archived filter → Restore، ثم اتركه Archived. كرر تحقق الاسمين
في Table/Cards/Detail قبل وبعد كل mutation.

## 8. الصلاحيات والعزل وحالة Read-only

### S-01 — View-only

1. في Web وMobile ادخل بحساب `FY-VIEW`.
2. يجب أن تعمل القائمة وGrid/Table/Cards/Detail فقط.
3. يجب ألا تظهر Add/Edit/Archive/Restore/Lifecycle.
4. محاولة direct API لكل mutation يجب أن تعيد `403` ولا تغير البيانات.

### S-02 — Denied

1. بحساب `FY-DENIED` تحقق من غياب عنصر الملاحة.
2. افتح المسار المباشر على Web وMobile؛ يجب أن يظهر forbidden/route guard، لا تسريب
   قائمة أو detail.
3. GET list/detail/lookup من API يجب أن تفشل بالصلاحية المناسبة.

### S-03 — Read-only subscription

1. بحساب `FY-READONLY` تحقق أن القراءة متاحة إذا كانت الصلاحية موجودة.
2. كل mutation يجب أن تكون مخفية/blocked من client، وأي direct API attempt مرفوض.
3. لا success toast ولا optimistic change ولا queued mutation.

### S-04 — Company isolation

1. في Company A ابحث عن Codes `FYD-<S>` و`FYL-<S>` وتأكد من وجود الحالة المتوقعة.
2. بدّل إلى Company B بنفس Tenant وابحث بالكود والاسمين في list/lookup/report.
3. حاول فتح detail بالـID المعروف من Company A.

النتيجة المتوقعة: لا نتائج أو detail أو report أو realtime event من Company A،
ولا يستطيع client إرسال CompanyId لتجاوز current-company context.

### S-05 — فصل صلاحيات الإجراء

نفّذ هذه المصفوفة على Web وMobile ثم كرر الطلب مباشرة على API. في كل صف يجب أن
يظهر وينجح الإجراء الممنوح فقط، بينما تختفي الإجراءات الأخرى وتعيد محاولاتها
المباشرة `403` بلا أي تغيير في RowVersion أو الحالة:

| الحساب/الجولة | الصلاحية المفردة بجانب View | يجب أن ينجح | يجب أن يفشل |
| --- | --- | --- | --- |
| `FY-ARCHIVE` | `FiscalYears:Archive` | Archive لسجل Draft صالح | Restore/Create/Edit وكل lifecycle |
| `FY-RESTORE` | `FiscalYears:Restore` | Restore لسجل Draft مؤرشف صالح | Archive/Create/Edit وكل lifecycle |
| `FY-LIFECYCLE-ONE` الجولة 1 | `FiscalYears:Open` | Draft → Open | BeginClosing/Close/Lock/Reopen |
| الجولة 2 | `FiscalYears:BeginClosing` | Open → Closing | Open/Close/Lock/Reopen |
| الجولة 3 | `FiscalYears:Close` | Closing → Closed | Open/BeginClosing/Lock/Reopen |
| الجولة 4 | `FiscalYears:Lock` | Closed → Locked | Open/BeginClosing/Close/Reopen |
| الجولة 5 | `FiscalYears:Reopen` | Closed/Locked → Open وفق السياسة | Open/BeginClosing/Close/Lock |

افحص أيضًا شاشة إعداد الدور باللغتين: يجب أن تظهر تسميات مستقلة مثل
`Archive fiscal year / أرشفة سنة مالية` و`Restore fiscal year / استعادة سنة مالية`؛
لا يجوز أن يظهر Claim تقني باسم `Manage` حتى لو وفرت الواجهة preset باسم
`Manage / إدارة` لاختيار مجموعة صلاحيات.

## 9. العربية والإنجليزية وRTL/LTR

نفّذ في Web وMobile:

1. بالإنجليزية: العناوين، الحقول، الحالات، confirmations، validation، empty/error،
   report labels كلها English وLTR.
2. بالعربية: العناصر نفسها مترجمة وRTL، وترتيب layout/action/filter طبيعي من دون
   CSS left/right مكسور أو نص مقصوص.
3. ابحث بالاسم العربي ثم الإنجليزي، وافتح Grid/Table/Cards/Detail/Report.
4. تحقق أن `NameAr` و`NameEn` يظلان مختلفين ومحفوظين بعد edit/archive/restore وكل
   transition، وأن locale لا يكتب قيمة فوق الأخرى.
5. تحقق من أسماء الفترات المولدة بالعربية والإنجليزية في detail.

## 10. تدقيق UI patterns والخمس رحلات

سجّل نتيجة مستقلة لـWeb وMobile:

| البند | Web | Mobile | معيار النجاح |
| --- | --- | --- | --- |
| Creation Journey | Pending | Pending | كل حقول السنة لها controls واضحة، والفترات preview وليست JSON يدويًا |
| Editing Journey | Pending | Pending | Draft يحمل القيم الحالية ويغيّر 12↔4 بلا فقد الاسمين أو period corruption |
| Viewing Journey | Pending | Pending | detail read-only يعرض السنة والفترات والحالات بصورة منظمة |
| Listing & Filtering | Pending | Pending | P-001 Grid/Cards وTable/Cards مع server criteria والحالة والعدد |
| Mock Data Generator | Pending | Pending | local bilingual valid draft فقط، بلا submit أو scope/identity مزيف |

قارن Web بمصدر Fiscal Years/Countries المراجع عند Desktop وعرض ضيق، وMobile بمصدر
Countries على نفس الجهاز. أي اختلاف غير موثق في PageHeader، toolbar، grid/table،
cards، pagination، loading/empty/error، form shell أو confirmation يعتبر regression.

## 11. التنظيف

- Fixture `Draft`: اتركه `Archived` في نهاية W-07/M-05 وسجل ID/Code.
- Fixture `Lifecycle`: يبقى `Open` لأنه تاريخ مالي اختباري لا يجوز حذفه يدويًا؛
  استخدم شركة/قاعدة اختبار disposable أو احتفظ به بالـprefix المسجل.
- محاولات Invalid لا يجب أن تترك صفوفًا أو فترات أو audit/outbox جزئيًا.
- لا تستخدم SQL delete لتنظيف سجل مالي في قاعدة مشتركة. Reset قاعدة disposable
  يكون إجراء بيئة منفصلًا وبعد حفظ الأدلة المطلوبة.

## 12. سجل النتيجة والأدلة

| مجموعة الحالات | Passed | Failed | Blocked | Not run | دليل/ملاحظات |
| --- | ---: | ---: | ---: | ---: | --- |
| W-01..W-09 | 0 | 0 | 0 | 9 | Pending |
| M-01..M-05 | 0 | 0 | 0 | 5 | Pending |
| S-01..S-04 | 0 | 0 | 0 | 4 | Pending |
| i18n/UI audit | 0 | 0 | 0 | 1 | Pending |

كل Fail يسجل: رقم الحالة، المنصة/اللغة، القيم المستخدمة، المتوقع، الفعلي، صورة أو
request ID، وخطوات إعادة الإنتاج. تظل الخطوة Active حتى الإصلاح وإرسال Revision
جديد يحدد حالات إعادة الاختبار وحالات regression المتأثرة.

## 13. قرارك الصريح بعد التنفيذ

بعد اكتمال جميع الحالات، أرسل إحدى الرسائل التالية؛ لا يكفي قول «تمام» أثناء
التنفيذ ولا يستنتج الوكيل القبول من الصور:

```text
أوافق على إغلاق الخطوة 01 — السنوات والفترات المالية / Fiscal Years & Periods
والانتقال إلى الخطوة 02 — العملات / Currency.
```

أو:

```text
أرفض إغلاق الخطوة 01. الحالات الفاشلة هي: <W/M/S-case IDs>، والنتيجة الفعلية:
<الوصف>. مطلوب الإصلاح وإرسال سيناريو إعادة اختبار.
```

أو:

```text
الخطوة 01 محجوبة بسبب: <المتطلب غير المتاح>. لا تنتقل إلى الخطوة 02.
```

حتى تصل رسالة القبول الأولى حرفيًا أو بما يعادلها بوضوح، تظل Fiscal Years
`Active` وتظل Currency `Queued`، ولا تسجل Phase 06 على أنها `Verified`.
