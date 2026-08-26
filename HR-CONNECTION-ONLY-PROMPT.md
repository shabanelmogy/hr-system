# Prompt المرحلة الأولى: ربط ماكينات البصمة وعرض البيانات الخام داخل HR

عدّل القيم التالية قبل التنفيذ:

- مسار مشروع الـHR الهدف: `[ضع المسار هنا]`
- مسار مشروع Attendance Connect المصدر: `[ضع مسار ZK-READER هنا]`
- مسار أو اسم Guide مشروع الـHR: `[ضع المسار أو الاسم هنا]`

أنت تعمل داخل مشروع HR قائم يحتوي وظائف أخرى ما زالت تحت التطوير. المطلوب في هذه المرحلة هو **دمج طبقة الاتصال بماكينات البصمة وعرض البيانات الخام فقط**. لا تنفّذ Business Logic للحضور أو الرواتب أو الورديات الآن.

## تعليمات إلزامية قبل التعديل

1. اقرأ `AGENTS.md` و`CLAUDE.md` و`README.md` والـGuide الخاص بمشروع الـHR كاملًا.
2. افحص التقنيات والإصدارات، قاعدة البيانات، المصادقة والصلاحيات، أسلوب الـAPI، مكونات الواجهة، الترجمة، أوامر التشغيل والاختبارات في مشروع الـHR.
3. افحص `git status` ولا تمسح أو تستبدل تغييرات موجودة لا تخص هذه المهمة.
4. افحص المشروع المصدر `ZK-READER`، خصوصًا:
   - `README.md`
   - `connector/Program.cs`
   - `connector/Models/ConnectorModels.cs`
   - `connector/Services/IDeviceDriver.cs`
   - `connector/Services/DeviceDriverRegistry.cs`
   - `connector/Services/ZkDeviceService.cs`
   - `connector/vendor/README.md`
   - `web/src/lib/device-profiles.ts`
   - `web/src/lib/zk-api.ts`
   - `web/src/components/zk-provider.tsx`
   - `web/src/app/devices/page.tsx`
   - `web/src/app/attendance/page.tsx`
5. اكتب ملخصًا قصيرًا يوضح أين ستوضع طبقة الأجهزة داخل بنية الـHR، ثم نفّذ العمل. لا تنشئ تطبيق HR جديدًا ولا Sidebar أو نظام تصميم موازيًا.

## النطاق المطلوب الآن

نفّذ فقط:

- إضافة وحفظ وتعديل وتعطيل عدة أجهزة.
- تحديد Provider لكل جهاز يدويًا.
- خيار اكتشاف مساعد اختياري للعنوان الذي أدخله المستخدم فقط، دون مسح الشبكة.
- حفظ إعدادات الاتصال غير السرية في قاعدة بيانات الـHR.
- حفظ كلمات المرور وComm Key وTokens مشفرة وفي Backend فقط.
- عرض حالة الـConnector والـSDKs والـProviders المتاحة فعليًا.
- اختبار اتصال الجهاز وعرض معلوماته الأساسية: الاتصال، الرقم التسلسلي، المنصة، Firmware وSDK version عندما تتوفر.
- قراءة مستخدمي الجهاز وعرض بياناتهم الخام عندما يدعم الـProvider ذلك.
- قراءة بصمات الحضور والانصراف الخام وعرضها بالتاريخ والوقت.
- فلتر بكود المستخدم، وفلتر تاريخ من/إلى.
- عرض سجل عمليات السحب وأعداد المقروء والمتخطى والأخطاء.
- تشغيل Backend/Connector تلقائيًا مع بيئة تطوير الـHR.

## خارج النطاق في هذه المرحلة

لا تنفّذ أو تفترض أيًا من التالي:

- تحديد أول حضور وآخر انصراف.
- حساب ساعات العمل أو النقص والزيادة.
- الورديات والإجازات والتأخير والعمل الإضافي.
- ربط كود الماكينة تلقائيًا بموظف HR.
- احتساب الغياب أو الرواتب والجزاءات.
- اعتماد `inOutMode` كقرار حضور أو انصراف نهائي.
- تعديل أو حذف أي بيانات من الماكينة.
- نقل أو مزامنة قوالب البصمات البيومترية افتراضيًا.
- Dashboard أو تقارير إدارية مشتقة من الحركات.
- إعادة تصميم أجزاء أخرى من نظام الـHR.

اعرض البيانات كما جاءت من الجهاز، مع labels توضيحية فقط، واحتفظ بالقيم الخام الأصلية حتى يتم بناء الـBusiness Logic لاحقًا.

## معمارية الاتصال

التزم ببنية مشروع الـHR. المشروع المصدر يستخدم Connector محليًا مبنيًا بـASP.NET Core على Windows:

- ZKTeco COM يحتاج process بنواة `x86` لأن المكتبة الحالية 32-bit.
- الـConnector يجب أن يبقى Backend/Windows companion service، ولا يتم الاتصال بالـSDK من المتصفح.
- اجعل عنوان الـConnector والمنفذ وCORS في الإعدادات، ولا تفترض أن واجهة HR تعمل على port 3000.
- في التطوير، أضف أمرًا واحدًا موثقًا يشغّل HR والـConnector معًا ويوقفهما معًا.
- في الإنتاج، جهّز طريقة تشغيل مناسبة حسب Guide المشروع، مثل Windows Service، مع health check وrestart policy وسجلات منقحة.
- لا تفتح الـConnector للعامة. استخدم loopback أو شبكة موثوقة وفق مكان Backend الـHR.

Providers الموجودة في الكتالوج:

- `zkteco-com`
- `hikvision`
- `dahua`
- `suprema`
- `anviz`
- `zkteco-zkbio`
- `suprema-biostar`
- `anviz-cloud`
- `matrix-cosec`
- `other`

استخدم interface ثابتًا للـDrivers يتضمن، حسب قدرات كل Provider:

- `getInfo/capabilities`
- `testConnection`
- `pullUsers`
- `pullAttendance`
- `detect` عندما يكون آمنًا ومدعومًا

استخدم Registry/allow-list داخل الكود. لا تحمّل class أو DLL أو executable بناءً على قيمة قادمة من request. احفظ `providerId` مع كل جهاز، ولا تبدله تلقائيًا عند كل اتصال.

قواعد الجاهزية:

- انقل ZKTeco Driver العامل من المشروع المصدر مع الحفاظ على `x86`.
- حزم Dahua وAnviz الموجودة في `connector/vendor` هي SDK assets فقط؛ نفّذ Adapter حقيقي قبل إعلانها متاحة.
- نفّذ Hikvision عبر ISAPI/HTTP عند ملاءمة موديل الجهاز.
- Matrix COSEC Push يحتاج endpoint استقبال بدل اتصال مباشر تقليدي.
- Suprema Device SDK قد يحتاج حسابًا وترخيصًا من المورد.
- Provider يظهر `available=true` فقط عندما ينجح تحميل متطلباته ويكون Adapter منفذًا. أضف حالة منفصلة مثل `configured` و`lastConnectionResult`؛ لا تدّعِ اختبار Hardware لم يحدث.
- أخطاء Provider يجب تحويلها إلى error contract موحد وآمن، مع provider code عند توفره ودون كشف credentials.

## التخزين المرحلي البسيط

استخدم migrations وORM الموجودين في مشروع الـHR، ولا تستخدم `localStorage` كمصدر دائم. المطلوب جداول تقنية فقط، مع تسمية تتبع conventions المشروع:

### Device

- `id`, `name`, `providerId`, `connectionMode`
- `host/ipAddress`, `port`, `timezone`, `enabled`
- `lastSeenAt`, `lastPullAt`, `createdAt`, `updatedAt`

### DeviceCredential

- `deviceId`
- credentials المشفرة المطلوبة حسب الـProvider
- لا تُرجع قيم الأسرار إلى الـFrontend بعد الحفظ

### RawDeviceUser

- `deviceId`
- `externalCode/enrollNumber`
- `name` كما أرسله الجهاز
- الحقول الخام الآمنة التي يدعمها الـProvider
- `pulledAt`

### RawAttendancePunch

- `deviceId`
- `externalCode/enrollNumber`
- الاسم القادم من الجهاز إن توفر
- `occurredAtDeviceLocal`
- `occurredAtUtc` بعد تطبيق timezone الجهاز دون فقد الأصل
- `verifyMode`, `inOutMode`, `workCode`
- `providerEventId` إن توفر
- `rawPayload` منقح من الأسرار إذا سمحت سياسة المشروع
- `pulledAt`
- مفتاح idempotency يمنع تكرار السجل عند إعادة السحب، دون تطبيق أي حكم حضور عليه

### DevicePullRun

- `deviceId`, `operationType`
- `startedAt`, `finishedAt`, `status`
- `from`, `to`
- `readCount`, `insertedCount`, `duplicateCount`, `skippedCount`, `errorCount`
- رسالة خطأ منقحة

هذه الجداول Staging/Integration data وليست نموذج الحضور النهائي. صممها بحيث يستطيع الـBusiness Logic المستقبلي القراءة منها دون إعادة الاتصال بالأجهزة.

## الـAPIs المطلوبة

استخدم naming وauthorization conventions الخاصة بالـHR، مع ما يعادل:

- CRUD وتعطيل الأجهزة.
- تحديث credentials دون إرجاعها.
- قائمة Providers وقدراتها وحالتها.
- Connector health.
- اختبار اتصال جهاز.
- اكتشاف Provider مساعد من host واحد.
- سحب مستخدمي جهاز.
- سحب الحركات الخام بفترة اختيارية.
- جلب Raw Device Users مع pagination والبحث بالكود.
- جلب Raw Attendance Punches مع pagination وفلتر الجهاز والكود ومن/إلى.
- جلب Device Pull Runs وحالة كل عملية.

أضف validation للـhost والـport والفترة والـproviderId، وtimeouts وcancellation. طبق حماية SSRF/allow-list وفق شبكة المؤسسة. استخدم background job الموجود في الـHR لعمليات السحب الطويلة إن توفر، مع progress وretry آمن وidempotency.

## الواجهة المطلوبة

أضف قسمًا داخل Sidebar الحالي باسم مناسب مثل «أجهزة الحضور»، وبنفس تصميم وصلاحيات المشروع.

أنشئ الصفحات التالية فقط:

1. **الأجهزة:** قائمة أجهزة رأسية بجانب Sidebar. المساحة المتبقية مقسومة إلى قسم بيانات الاتصال وقسم حالة الجهاز وإجراءات الاختبار والسحب.
2. **مستخدمو الأجهزة:** جدول خام يعرض الجهاز، كود المستخدم، الاسم والحقول المتاحة، مع بحث بالكود وpagination.
3. **حركات الأجهزة:** جدول خام يعرض الجهاز، كود المستخدم، الاسم، التاريخ والوقت، `verifyMode`، `inOutMode` و`workCode`، مع فلتر جهاز وكود وفترة من/إلى وpagination.
4. **عمليات السحب:** حالة العملية والجهاز والفترة والأعداد والأخطاء.

متطلبات الواجهة:

- RTL وعربية، مع إعادة استخدام مكونات وتصميم الـHR الحالي.
- حالات loading/empty/error واضحة.
- لا تعرض نتيجة الجهاز السابق بعد تغيير الجهاز الحالي.
- بطاقة الفترة نفسها تحتوي حقلي «من» و«إلى» ويمكن تعديلها مباشرة.
- لا تضف أعمدة أول حضور/آخر انصراف أو ساعات العمل أو صافي +/- في هذه المرحلة.
- احتفظ بالأكواد والأرقام الخام إلى جانب labels المقروءة حتى لا نفقد معنى بيانات المورد.
- استخدم server-side filtering وpagination للبيانات الكبيرة.

## الأمن

- صلاحيات منفصلة لعرض الأجهزة، إدارة الأجهزة، تحديث credentials، تشغيل السحب وعرض البيانات الخام.
- لا تحفظ credentials في browser storage أو logs أو response payloads.
- لا تحفظ biometric templates الآن.
- جميع عمليات الاتصال قراءة فقط.
- Audit log لإضافة/تعديل/تعطيل جهاز، تحديث credentials، اختبار الاتصال وتشغيل السحب.
- لا تشغّل SDK demos أو executables تلقائيًا.
- لا تستخدم شهادات أو مفاتيح الاختبار المرفقة مع Vendor SDKs في الإنتاج.
- حافظ على vendor binaries خارج compilation وطبّق سياسة المشروع في Git/artifact storage، مع source رسمي وSHA-256.

## الاختبارات المطلوبة

أضف اختبارات باستخدام fake drivers حتى لا يحتاج CI إلى ماكينة حقيقية:

- Registry يرفض Provider غير مسجل.
- حفظ جهاز والتحقق من validation للـhost والـport.
- credentials لا تظهر في API أو logs.
- test connection success/failure/timeout/cancellation.
- تحويل نتائج Provider المختلفة إلى DTO خام موحد دون فقد القيم الأصلية.
- فلتر كود المستخدم والجهاز ومن/إلى مع pagination.
- timezone مع الاحتفاظ بوقت الجهاز الأصلي.
- idempotency عند سحب نفس الحركات مرتين.
- authorization لكل endpoint.
- واجهة تغير الجهاز ولا تعرض نتيجة قديمة.

اختبارات الأجهزة الحقيقية تكون manual/hardware tests منفصلة، ويُسجل فيها موديل الجهاز وFirmware والـProvider المستخدم. لا تدّعِ نجاح اتصال فعلي لم يتم تنفيذه.

## خطة التنفيذ وشروط القبول

نفّذ بالترتيب:

1. Mapping بين بنية المصدر ومشروع HR.
2. جداول التكامل وmigrations والصلاحيات.
3. Provider interface والRegistry ونقل ZKTeco Driver.
4. APIs والـDTOs والـhealth والـtimeouts.
5. صفحات الأجهزة والمستخدمين والحركات وعمليات السحب.
6. تشغيل HR والـConnector بأمر تطوير واحد دون hard-coded port.
7. fake drivers والاختبارات.
8. تشغيل lint/typecheck/tests/build وإصلاح أخطاء المهمة.
9. توثيق الإعداد، متغيرات البيئة، إضافة Provider جديد وخطوات اختبار ماكينة حقيقية.

اعتبر المهمة مكتملة عندما يمكن إدارة أكثر من جهاز، اختبار الاتصال، سحب المستخدمين والحركات الخام وعرضها بالفلاتر، مع تخزين آمن ومنع تكرار وتشغيل تلقائي للـConnector، دون إضافة أي Business Logic للحضور.

في النهاية أعطني: الملفات والمigrations التي أضيفت، أوامر التشغيل، الـProviders العاملة فعليًا، ما تم اختباره آليًا، وما يحتاج جهازًا أو حساب مورد. لا تبدأ المرحلة الثانية ولا تنفذ حسابات الحضور إلا بطلب جديد.
