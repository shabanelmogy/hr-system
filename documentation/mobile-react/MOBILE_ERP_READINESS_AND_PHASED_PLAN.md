# مراجعة جاهزية ERP Mobile وخطة التنفيذ

تاريخ المراجعة: 2026-09-19. الحالة: **مراجعة وخطة تنفيذ؛ لم تُنفّذ إصلاحات runtime في هذه المهمة**.

## 1. الحكم التنفيذي وحدود الأدلة

التطبيق لديه أساس قابل للاستمرار: Expo Router، طبقات core/platform/modules/shared/shell، حدود dependencies، React Query، Zod، مكونات مشتركة، SQLite مشفّر، Outbox، سياسات offline، وفحوص CI. لا أوصي بإعادة كتابته أو باستبدال هذه البنية.

لكن **لا يصح وصفه حالياً بأنه أساس ERP مغلق وجاهز للتوسع دون معالجة الملاحظات أدناه**. أهم الأسباب: اختلاف ملكية الموديولات والصلاحيات عن الـAPI الحالي، تعارض حماية المسارات مع تشغيل offline بعد إغلاق التطبيق، ونواقص مثبتة في القوائم والنماذج.

المراجعة شملت بنية المشروع، bootstrap، الجلسات، الاتصال، RBAC، entitlements، التخزين، المزامنة، المكونات المشتركة، عينات من دورات العمل، إعدادات native وCI، ومقارنة العقود وكتالوج الموديولات مع مصدر الـAPI الحالي. استخدمت Graphify للتوجيه ثم تحققت من المصدر الفعلي؛ الخريطة ليست دليلاً بديلاً عن الكود.

ليست هذه شهادة تشغيل على أجهزة: لم أشغّل Android/iOS device journeys أو أختبر API منشوراً بحسابات حقيقية. لم تتم مقارنة مرئية لكل شاشة أو إثبات الأداء على هاتف محدود الموارد. نتائج المصدر مميزة عن متطلبات التحقق العملي. نجاح اختبارات mocks لا يثبت تطابق الكتالوج الفعلي أو SQLCipher على جهاز.

الأولويات: **P1** خلل مؤثر يلزم إغلاقه قبل الاعتماد على المسار المتأثر؛ **P2** معالجة لازمة قبل إعلان جاهزية الأساس؛ **R** متطلب إصدار/دليل عملي؛ **D** قرار منتج يحتاج تحديداً صريحاً. لم تثبت المراجعة حادثة تسرب بيانات فعلية ولا تدّعي ذلك.

## 2. ما يجب الحفاظ عليه

| الجانب | الموجود فعلياً | ما لا يثبته وحده |
|---|---|---|
| البنية | feature domain/application/data/presentation/composition وواجهات public | صحة ملكية كل feature مقارنة بالخادم |
| النقل | Axios مركزي، timeout، refresh مشترك، ProblemDetails | سلامة كل تداخل زمني عند تبديل الجلسة |
| عزل السياق | إلغاء سياق الطلبات ومسح QueryClient عند تبديل الشركة/المستخدم | تغطية جميع callbacks والطلبات المتأخرة |
| الحماية | RouteGuard، deny للسياسات غير المعروفة، read-only في UI والنقل | توافق module requirements مع الكتالوج الحالي |
| البيانات المحلية | SQLCipher، مفتاح SecureStore، partition بالمستخدم/tenant/company | ترقية قاعدة محلية تحتوي مسودات حقيقية دون فقد |
| offline | Countries cached-read، WorkforcePlan draft pilot، replay مع rowVersion/reconciliation | أن كل التطبيق offline-first أو أن التشغيل البارد offline يعمل كاملاً |
| النماذج | AppForm، useZodForm، حماية تغييرات، مكونات structured editors | التزام كل نموذج بها أو عرض جميع أخطاء API تحت الحقول |
| الترجمة | EN/AR، theme tokens، direction provider، parity gate | جودة RTL وTalkBack/VoiceOver على الأجهزة |
| التشغيل | CI، Android prebuild check، export smoke، Observe | APK/IPA يعملان مع API حقيقي أو نشر متجر مجرّب |

## 3. سجل الملاحظات المرتبط بالمصدر

### M01 — P1: ملكية الموديولات واشتراطات المسارات قديمة

- **الدليل:** `src/platform/auth/presentation/rbac/route-access.ts:21-26` يربط كل `/basic-data` بـ`hr/basic-data`، والإدارة وextras بـ`hr/administration`، وبعض الأدوات بـ`hr/analytics`.
- `src/modules/hr/moduleDefinition.ts` ما زال يعرّف administration/analytics/collaboration؛ `src/shell/module-registration.ts:8-9` يسجل HR وAccounting فقط.
- الـAPI الحالي يعرّف HR basic-data/recruitment/workforce/attendance فقط في `api/Modules/HR/ErpSystem.Modules.HR/HrModuleDefinition.cs`. الجغرافيا تتبع `reference-data/geography`، والمواعيد `crm/appointments`، والإدارة Platform.
- `RouteGuard` يقارن هذه الاشتراطات حرفياً مع كتالوج الخادم؛ المستخدم الذي لديه صلاحية صحيحة يمكن منعه بسبب submodule لم يعد موجوداً. ReferenceData وCRM لا يدخلان تقاطع mobile registry أصلاً.
- **الإصلاح:** جرد routes → owner → API permission → entitlement، نقل features عبر كل طبقاتها للمالك الصحيح، واستخدام تعريف موحد لاشتراطات التنقل والحماية. لا تُستبدل هذه المعالجة بتجاوز RouteGuard أو منح admin صلاحيات مطلقة.
- **القبول:** مستخدم ReferenceData يعمل دون شراء HR؛ إدارة المستخدمين لا تتطلب `hr:administration`؛ الكتالوج الصادر من API ينجح في اختبارات mobile contract.

### M02 — P1: صلاحية Appointments مختلفة عن الخادم

- **الدليل:** `route-manifest.ts:113` يستخدم `ViewUsers` للمواعيد. لا توجد Appointments permissions في كتالوج الموبايل الحالي.
- الخادم في `api/Modules/CRM/ErpSystem.Modules.CRM.Presentation/Features/Appointments/V1/AppointmentsController.cs` يستخدم `Appointments:View/Create/Edit/Delete`.
- **الأثر:** مستخدم CRM صحيح قد لا يرى الصفحة؛ ومستخدم Users قد يراها ثم يحصل على 403. حماية API تظل المرجع، لكن تجربة المستخدم غير متوافقة.
- **الإصلاح والقبول:** نقل appointments إلى CRM وتطبيق الصلاحية الدقيقة لكل فعل، مع حالات view-only/create-only/edit-only/delete-only والصلاحيات المسحوبة أثناء جلسة مفتوحة.

### M03 — P1: حماية الموديولات تمنع تشغيل offline من بداية جديدة

- **الدليل:** `platform/modules/data/repositories/default-module-repository.ts:10` يرفض القراءة بدون اتصال. `useAccessibleModules` يجلب الكتالوج من الشبكة؛ و`RouteGuard.tsx:28` يعرض AccessDenied عند فشل الاستعلام أو غياب البيانات.
- توجد offline session lease وقاعدة محلية، لكن لا يوجد snapshot دائم مصرح به لكتالوج الموديولات يسمح لهذه الحماية بالعمل بعد إنهاء process وإعادة فتحه offline.
- **الأثر:** بيانات ومسودات محفوظة قد تصبح غير قابلة للوصول من المسار المصرح به؛ فقد الشبكة يُعرض كأنه نقص صلاحيات.
- **الإصلاح:** entitlement snapshot مشفّر ومحدد بالمستخدم/tenant/company/version/expiry ومقيّد بـsession lease والسياسة. فصل unavailable/offline عن forbidden. لا تسمح البيانات القديمة بعمليات تتطلب سلطة الخادم.
- **القبول:** authenticate → تحميل بيانات → تفعيل سياسة → airplane mode → kill/relaunch → الوصول للمحتوى المسموح فقط؛ انتهاء lease أو snapshot يمنع الوصول دون حذف المسودات.

### M04 — P1: انتهاء offline lease غير مطبق على الجلسة الموجودة في الذاكرة

- **الدليل:** `auth/data/local/offline-session-lease.ts` يتحقق من سقف 24 ساعة عند `load`، ثم يعيد `SessionResponse` فقط في السطر 83. `AuthProvider` يحتفظ بـ`authority: offline-lease` دون validUntil أو مؤقت انتهاء. foreground offline لا يعيد التحقق.
- **الأثر:** جلسة تم تحميلها قبل انتهاء الـlease يمكن أن تظل تعرض صلاحياتها بعد الموعد أثناء استمرار process. هذا وصف لسلطة العميل المحلية، وليس إثبات تجاوز تحقق الخادم.
- **الإصلاح:** إبقاء metadata في auth state، clock قابل للاختبار، انتهاء فعلي في الذاكرة وعند foreground، ومنع استخدام server authority قديمة لتصريف الطابور بعد reconnect قبل التحقق.
- **القبول:** اختبارات fake clock قبل/بعد 24 ساعة، استمرار التطبيق، resume بدون شبكة، وتراجع ساعة الجهاز. يحتفظ المستخدم بالمسودات مع حجب الأفعال غير المصرح بها.

### M05 — P1: retry محفوظ دون مجدول يوقظ المزامنة عند موعده

- **الدليل:** `core/offline/outbox.ts` يحفظ `next_attempt_at` مع backoff. `shell/offline/OfflineSyncCoordinator.tsx` يشغل المزامنة عند تغيّر dependencies وforeground؛ لا يستمع لوقت أقرب retry أو حدث إدخال command. انتهاء run لا يبرمج wake-up.
- **الأثر:** فشل مؤقت مع بقاء التطبيق مفتوحاً والاتصال ثابتاً قد يترك الأمر في failed حتى trigger آخر. انتهاء مدة backoff وحده لا يشغّل شيئاً. shell مربوط مباشرة بـWorkforcePlan pilot، فلا يمثل تسجيل replay عام لكل الموديولات.
- **الإصلاح:** coordinator مسجل مركزياً بمزوّدي commands، إشعار عند enqueue، timer لأقرب retry أثناء foreground، إعادة فحص scope/authority/policy قبل replay، وإظهار نتيجة أو خطأ run. استمرار headless maintenance فقط قرار مقبول، لكنه يجب أن يكون واضحاً.
- **القبول:** أمر يفشل ثم ينجح بعد backoff دون تنقل أو restart؛ لا replay للشركة السابقة؛ kill أثناء الإرسال → uncertain → reconcile؛ لا تكرار أثر اقتصادي عند timeout.

### M06 — P1: بيانات Recruitment تُقص من القوائم

- **الدليل:** `RecruitmentScreen.tsx:92-100` يطلب openings/requisitions دون state للتنقل بين الصفحات، ويثبت applications على page 1 وحجم 100. pagination الظاهر مخصص للعروض.
- **الأثر:** عناصر بعد الحد لا يمكن الوصول إليها، وفلترة pipeline المحلية تعمل على الجزء المحمل فقط. هذه فجوة وظيفية قبل أن تكون مشكلة أداء.
- **الإصلاح:** controlled server-list لكل تبويب، paging/filter/sort على API، debounce للبحث، تشغيل استعلام التبويب النشط، وعرض error مستقل عن empty.
- **القبول:** بيانات تتجاوز 100 application وعدة صفحات requisitions/openings، والوصول لكل النتائج عبر بحث وpaging، دون تحميل كل الداتا كحل بديل.

### M07 — P1: اختيار Position Envelope محدود بأول 50

- **الدليل:** `StaffingRequestForm.tsx:16-17` يطلب أول 50 envelope ثم يفلتر المتاح محلياً.
- **الأثر:** envelope صالح بعد أول صفحة لا يمكن اختياره؛ قد يظهر الاختيار فارغاً رغم وجود capacity صالحة خارج الصفحة.
- **الإصلاح:** shared searchable server selector، query contract يفلتر eligibility على الخادم، وتحميل selected value بالـID حتى لو خارج نتائج البحث.
- **القبول:** أكثر من 50 envelope، بما فيها أول 50 ممتلئة، مع اختيار عنصر لاحق وعرض العنصر الحالي في view mode.

### M08 — P1: فشل تحميل تفاصيل Staffing Request يحول العرض إلى نموذج إنشاء

- **الدليل:** `StaffingRequestsScreen.tsx:47` يمرر `detail.data ?? null` في view mode. `StaffingRequestForm.tsx:14` يستنتج readOnly من `Boolean(item)` ويعرض create إن لم يصل item. لا توجد detail error boundary قبل النموذج.
- **الأثر:** بعد فشل التفاصيل يُعرض نموذج إنشاء وزر Create بدل خطأ عرض، وقد يرسل المستخدم إنشاء غير مقصود إذا كان مخولاً.
- **الإصلاح:** mode صريح مستقل عن item، وحالات loading/error/not-found، وعدم ربط view بفعل create.
- **القبول:** فشل/403/404/timeout في detail لا يعرض Create، وإعادة المحاولة تبقى في وضع العرض.

### M09 — P2: أخطاء API لا تصل للحقول في بعض النماذج

- **الدليل:** `StaffingRequestsScreen.tsx:29` يلتقط الخطأ ويعرض toast ثم ينهي promise بنجاح؛ النموذج لا يتلقى `ProblemDetails.errors` رغم توفرها في `core/api/api-error.ts`.
- **الإصلاح:** توحيد adapter لأخطاء الحقول يدعم nested paths، إبقاء submit failure واضحاً، التركيز على أول خطأ من shared form. مراجعة نماذج Recruitment اليدوية واستخدام المكونات المعتمدة عندما تغطي السلوك.
- **القبول:** server validation يظهر تحت الحقول العربية/الإنجليزية بما فيها عناصر collections؛ تظل القيم المدخلة محفوظة؛ لا تُعرض رسالة نجاح وهمية.

### M10 — P2: مؤقت الاشتراك الطويل قد يعلن الانتهاء مبكراً

- **الدليل:** `TenantAccessProvider.tsx:65-67` يستخدم `Math.min(remaining, 2147000000)` ثم ينفذ `setSubscriptionEnded(true)` مباشرة.
- **الأثر:** إذا بقي الاشتراك أطول من نحو 24.8 يوم واستمر process دون إعادة تركيب هذا المكوّن، ينتهي المؤقت المقصوص قبل الاشتراك الحقيقي. تأكيد الاشتراك لا يتم عند callback.
- **الإصلاح:** مؤقت يعيد حساب الموعد وإعادة الجدولة، وفحص تاريخ حقيقي عند foreground.
- **القبول:** fake clock لاشتراك 90 يوماً؛ لا read-only قبل النهاية؛ يحدث عند النهاية الفعلية.

### M11 — P2 قبل الاعتماد على بيانات محلية: ترقية SQLite الحالية destructive

- **الدليل:** `core/offline/database.ts:68-77` يحذف جداول records/outbox/scopes في الترقية إلى v3؛ تعليق الكود يوضح أنها cache تطوير قديمة. اسم DB versioned أيضاً.
- هذا مقبول فقط لبيانات التطوير غير المعتمدة الحالية؛ **ليس مسار ترقية للمستخدمين بعد اعتماد offline drafts**.
- **الإصلاح:** migrations متسلسلة transactional، اختبار ترقية نسخة سابقة تحتوي pending/conflict/uncertain/protected drafts، سياسة downgrade/key-loss/corruption ومسار recovery يحفظ عمل المستخدم. لا reset تلقائي عند فشل decrypt.
- **القبول:** kill أثناء الترقية وإعادة الفتح دون فقد commands؛ رفض downgrade برسالة آمنة؛ التعامل مع disk-full وkey-unavailable على native build.

### M12 — P2: تعافي startup لا يغطي providers الخارجية

- **الدليل:** `app/_layout.tsx:40-41` يضع `AppErrorBoundary` داخل `AppProviders`، بينما `SQLiteProvider` والتهيئة في `AppProviders → OfflineFoundationProvider` خارجه.
- **الأثر:** فشل تهيئة DB/key/schema لا يصل إلى شاشة التعافي المحلية الموجودة؛ ObserveRoot للتتبع ليس بديلاً عن UX recovery مصمم.
- **الإصلاح:** bootstrap boundary مستقل عن theme/i18n المتعطلين، تشخيص محلي آمن، Retry مناسب دون حذف بيانات. معالجة rejected async startup بصورة صريحة؛ ErrorBoundary وحده لا يلتقط كل Promise rejection.
- **القبول:** fault injection لـDB initialization/SecureStore، وشاشة قابلة للاسترداد دون دورة crash.

### M13 — P2: بوابة Expo غير خضراء حالياً

- **الدليل التنفيذي:** `npm run check:expo` أعاد 20/21؛ 10 patch mismatches في Expo/Asset/BackgroundTask/Constants/ImageManipulator/ImagePicker/Observe/Router/Sharing/TaskManager.
- المتوقع وقت المراجعة: expo `~57.0.24` مقابل المثبت `57.0.22`؛ باقي التفاصيل في خرج Expo Doctor. ليست النتيجة دليلاً أن كل الحزم تسبب runtime crash.
- **الإصلاح:** تحديث متوافق داخل SDK 57 باستخدام Expo، تثبيت lockfile والتحقق من `npm ci` وDoctor وnative/export. لا downgrade ولا تعطيل doctor لإخفاء الفرق.

### M14 — R: فجوة إثبات end-to-end وiOS والإصدار

- **الدليل:** `.github/workflows/mobile-ci.yml` يحتوي unit/static/native-config/Android export؛ لم أجد suite Maestro/Detox/E2E للموبايل بالمستودع. يوجد 142 ملف اختبار وحدة/مكونات، لكنها لا تمثل جهازاً متصلاً بالـAPI.
- **الإصلاح:** Android preview APK وiOS build على بيئة macOS/EAS، suite device للاستخدام الحرج، matrix صلاحيات من الـAPI الحقيقي، ودليل إصدار يعرض commit/build/API version/device والنتائج.
- **القبول:** sign-in/switch-company/revoke-session/CRUD/conflict/offline-kill-restart/deep-links/RTL/keyboard/notifications/report/file flows على أجهزة. توقيع المتجر وفحوص Apple/Google بوابة نشر، لا سبب لإيقاف التطوير المحلي.

### M15 — P2: الأداء ودورة حياة Query تحتاج قياساً وتوحيداً

- يوجد onlineManager مربوط بـNetInfo؛ لم أجد focusManager مربوطاً بـAppState، و`query-client.ts` يعطل focus refetch. SignalR يعوض جزءاً من التحديث عند reconnect، لكنه ليس ضماناً لكل query أو لكل عطل شبكة.
- `AppSelectField.tsx:146` يرسم جميع options؛ جدول AppDataTable يستخدم pageRows.map، وهو مقبول للصفحات الصغيرة، وليس دليلاً على بطء مثبت. المخاطرة أكبر مع lookup ضخم، diagrams وملفات/Excel كبيرة.
- **الإصلاح:** سياسة foreground refresh صريحة بحسب حساسية البيانات، search/paging للـlookups، cancellation يحترم scope وcaller معاً، تصنيف 4xx/429/retry، وميزانية فعلية للذاكرة وزمن startup والتنقل.
- **القبول:** baseline على جهاز متوسط وضعيف؛ أهداف عددية تعتمد بعد القياس؛ لا وصف «سريع» أو «جاهز» دون نتائج.

### M16 — D/P2: نطاق ERP المستقبلي غير معلن كعقود منتج للموبايل

- HR به ميزات فعلية، Accounting تعريف فارغ؛ لا توجد modules مسجلة لـInventory/POS/Contacts/CRM/ReferenceData رغم وجود بعض ميزاتها في ملكيات قديمة. غياب business features المستقبلية ليس bug مطلوباً بناؤه داخل مهمة تأسيس.
- يجب تحديد Required/Deferred/Excluded لكل capability ولكل منصة: approvals inbox، push notifications، search، barcode، printer، POS device identity، attachments، reporting، import/export، biometrics، deep links، tablet، accessibility.
- الإشعارات الحالية in-app/SignalR/polling؛ لا توجد dependency لـexpo-notifications، فلا تُوصف بأنها push عند إغلاق التطبيق.
- يجب اعتماد قواعد المال (precision/rounding/currency)، الكميات والوحدات، date-only مقابل UTC/timezone، ids، rowVersion، وidempotency قبل تصميم Accounting/POS. لا تُنقل قرارات الترحيل المحاسبي وحجز المخزون إلى الجهاز.

## 4. هيكل مستهدف وحدود المسؤولية

```text
app/                              # route adapters + guards فقط
src/core/                         # HTTP/storage/query/theme/i18n/offline runtime
src/platform/                     # auth/companies/tenancy/RBAC/entitlements
                                  # notifications/files/technical operations
src/modules/
  reference-data/                  # geography/address-types/addresses بحسب عقد API
  hr/                             # organization/recruitment/workforce/attendance
  crm/                            # appointments والميزات المعتمدة
  accounting/                     # definition الآن؛ features عند اعتماد عقودها
  contacts/ inventory/ point-of-sale/ reporting/
                                  # تُنشأ مع capabilities حقيقية مقررة، لا شاشات وهمية
src/shared/                       # forms/selectors/lists/feedback/layout فقط
src/shell/                        # registration/bootstrap/navigation/sync composition
```

- تطابق ownership مع API لا يعني تطابق اسم route بصرياً؛ يمكن إبقاء `/basic-data/...` عنواناً مستقراً مع نقل المالك الفعلي.
- كل feature يحتفظ بـdomain/application/data/presentation/composition. repository بواجهة متخصصة مفيد للـoffline/mapping؛ لا تنشئ GenericRepository عاماً يفرض CRUD على approvals وfinancial workflows.
- لا business imports من platform/core/shared. cross-module عبر public API، والتسجيل في shell. لا تنقل geography لـHR لأن شاشة HR تستخدمها.
- API authority للـpermissions والـentitlements والـbusiness invariants. local registry يعلن دعم التطبيق فقط.
- كل pending operation له owner، scope، schemaVersion، commandId، baseVersion/idempotency ودورة حالة واضحة. لا queued writes عامة لكل HTTP request.

## 5. خطة التنفيذ على مراحل

Phase 00 دخل التنفيذ. ما تم إثباته موضح كـ **Implemented/Verified** في سجله،
وكل ما لم يُتحقق منه يظل **Pending verification**. المراحل 01–08 أدناه ما زالت
**Planned**؛ ترتيبها dependency order وليس تصريحاً بإغلاق أي فجوة معروفة.

| المرحلة | النتيجة المطلوبة | ترتبط بالملاحظات | تعتمد على |
|---|---|---|---|
| Phase 00 | baseline قابل لإعادة التنفيذ ومصفوفة العقود | M13/M14/M16 | لا شيء |
| Phase 01 | فصل الملكيات وتوحيد catalog/routes/permissions | M01/M02 | 00 |
| Phase 02 | جلسة وسياق شركة وتفويض offline محدود العمر | M03/M04/M10 | 01 |
| Phase 03 | دورة offline/sync/recovery كاملة | M05/M11/M12 | 02 |
| Phase 04 | قوائم وlookups ونماذج صالحة لبيانات ERP | M06/M07/M08/M09 | 01؛ و03 للـoffline |
| Phase 05 | أساس UI موحد وتجربة mobile/tablet/RTL | M09/M15/M16 | 04 |
| Phase 06 | عقود ERP والأداء والمراقبة وcapabilities | M15/M16 | 02–05 |
| Phase 07 | اختبارات تكامل وتراجع آلية تمنع عودة الخلل | كل الملاحظات | تراكمياً مع 01–06 |
| Phase 08 | Android/iOS release evidence وإغلاق جاهزية الأساس | M14 | 00–07 |

### Phase 00 — baseline ومصفوفة التوافق — Implemented / verified for Phase 00 gates

1. **Implemented:** حفظ snapshot لـcommit/worktree/Node/npm/lockfile ونتائج البوابات
   في [MOBILE_PHASE00_BASELINE.md](MOBILE_PHASE00_BASELINE.md)، مع الحفاظ على
   تغييرات الويب الحالية.
2. **Implemented/Verified:** تحديث مواصفات Expo SDK 57 patch والـlockfile؛ نجح
   `npm ci` و`npx expo install --check` وExpo Doctor (21/21).
3. **Implemented/Verified:** جرد 74 route و25 endpoint source وكل member في
   [MOBILE_API_COMPATIBILITY_MATRIX.json](MOBILE_API_COMPATIBILITY_MATRIX.json)،
   مع owner/scope/permission boundary/offline policy/status لكل إدخال.
4. **Recorded:** Countries وStates هما مراجع اختيارية للقراءة والتوثيق؛ لم تُنقل
   ملكية HR aggregates إلى قواعد geography في هذه المرحلة.
5. **Recorded:** فصلنا في التوثيق بين إغلاق الأساس وبين جاهزية الإصدار؛ لا يدّعي
   Phase 00 إغلاق M01–M16 أو جاهزية business workflows.

**الملفات:** `mobile-react/package.json` وlockfile، scripts/check-*، `documentation/mobile-react/MOBILE_ARCHITECTURE.md` و`MOBILE_API_READINESS_REVIEW.md`، مصفوفة contracts جديدة في نفس مجلد التوثيق.

**شرط الخروج:** تثبيت قابل للتكرار بعد clean install، نتائج الفحوص مؤكدة، كل
route له owner وعقد واضح، ولا يُستخدم تقرير readiness سابق دليلاً على الحالة
الحالية. بوابات Phase 00 الأساسية مكتملة؛ parent review ما زال يشغّل `npm run
check` الكامل وباقي gates كتحقق تكاملي قبل بدء Phase 01.

### Phase 01 — Ownership + API parity + RBAC

1. نقل Countries/States/Districts/AddressTypes وما يلزم Addresses إلى ReferenceData بكل الطبقات والاختبارات.
2. نقل Appointments إلى CRM؛ إبقاء Users/Roles/Invitations/tenancy والأدوات التقنية تحت Platform.
3. تصحيح registry وroute-manifest وmodule requirements، حذف تعريفات HR القديمة، وتحديث realtime keys والتوثيق.
4. اعتماد مصدر موحد لمتطلبات route؛ اختبار تقاطع mobile registry مع catalog fixture مولّد من الخادم.
5. مطابقة صلاحيات الأفعال؛ super-admin يدير platform/global data وفق عقد الخادم دون خلطه بمستخدم شركة.

**الملفات:** `src/shell/module-registration.ts`، `src/modules/*/moduleDefinition.ts`، `src/platform/auth/presentation/rbac/*`، `src/platform/modules/registry/*`، `scripts/module-boundaries.mjs`، feature public exports و`app/`، كتب الموديولات المتأثرة.

**شرط الخروج:** لا 403 ناتج عن module قديم في matrix؛ لا imports من ملكية قديمة أو forwarding legacy wrappers؛ APIs والـroutes الحالية تستمر وفق العقد المتفق عليه.

### Phase 02 — Session/tenant/company lifecycle

1. الاحتفاظ بوقت انتهاء lease والتفويض المحلي في state، والتحقق عند deadline وresume/reconnect.
2. entitlement snapshot دائم scoped ومؤقت يتيح cold-start offline ضمن المسموح فقط.
3. generation guard لجميع نتائج sign-in/refresh/session/switch/logout؛ اختبار overlapping transitions وطلبات 401 المتأخرة، وعدم افتراض أن abort وحده يكفي.
4. إعادة التحقق من سلطة الخادم قبل sync، مع حالات unavailable/re-auth/forbidden مميزة؛ الحفاظ على مسودات المستخدم.
5. إصلاح مؤقت الاشتراك، مراجعة خيارات SecureStore لكل أنواع الأسرار، واختبار failure أثناء clear/setTokens. لا يُضاف biometric كبديل لتفويض الخادم.

**الملفات:** `AuthProvider.tsx`، auth lease/contracts/tests، `core/api/axios-client.ts`، `core/storage/secure-storage.ts`، module repository/query/RouteGuard، `TenantAccessProvider.tsx`.

**شرط الخروج:** مصفوفة مستخدمين × tenants × شركات × offline × read-only تمر؛ late responses لا تغيّر session الجديدة؛ expiry يعمل دون restart؛ لا replay بسلطة offline lease.

### Phase 03 — Offline runtime ودورة البيانات المحلية

1. تسجيل sync handlers من shell مع ports مستقلة عن HR، وتشغيل enqueue/retry due/manual/foreground/reconnect.
2. إلغاء/إعادة فحص scope بين الأوامر ورفض stale policy؛ مراقبة nextAttemptAt دون polling عدواني.
3. شاشة Sync Center مشتركة: pending/failed/conflict/uncertain/dead-letter، آخر نجاح، retry/discard صريحان، وتفاصيل لا تكشف secrets.
4. migration registry محلي آمن، transaction/rollback، recovery من key/DB failures وbootstrap error UI.
5. تثبيت سياسة لكل capability؛ Countries remote-first مع cache fallback حالياً، وليس local-first عاماً. اختيار local-first feature-by-feature فقط إذا كان مطلوباً.
6. أي offline writes جديدة تحتاج API idempotency/rowVersion وإثبات reconciliation. approvals/posting/payments/stock reservation تظل online-authoritative حتى اعتماد بروتوكولها.

**الملفات:** `core/offline/*`، `core/offline-policy/*`، `shell/offline/OfflineSyncCoordinator.tsx`، WorkforcePlan pilot/local store، platform offline-policy وsync UI، root bootstrap.

**شرط الخروج:** restart/timeouts/double-submit/kill-during-sync/cross-company/clock-shift/disk-full تجتاز الاختبارات؛ المسودات لا تضيع أو تُرسل باسم شركة أخرى؛ foreground retry يستأنف وحده.

### Phase 04 — اكتمال القوائم والنماذج

1. Recruitment paging/search/filter لكل تبويب، وعدم قص pipeline أو استخدام تحميل كل rows كحل.
2. server-backed selectors عامة مع search/debounce/loading/empty/error/load-more/selected-item hydration. استخدام endpoints lookup عندما يملكها الخادم أو إضافة العقد في مالكه.
3. mode صريح للنماذج create/edit/view، وdetail loading/error مستقل.
4. ربط ProblemDetails.errors بـshared fields، nested collection validation/focus، وعدم ابتلاع reject في save callback.
5. مراجعة creation/edit/view/list/mock لكل feature موجودة، بما فيها structured Job Descriptions وWorkforce planning. وجود type جديد لا يثبت وجود control مناسب.

**الملفات:** Recruitment screens/queries، Staffing forms/screens، `shared/components/controls/AppSelectField.tsx` وما يلزم من extension عام، `shared/components/forms/AppForm.tsx`، `core/validation/*`، EN/AR والاختبارات.

**شرط الخروج:** datasets تتجاوز 100/50، view لا يتحول إلى create، كل field error ظاهر؛ حفظ collections دون فقد؛ keyboard وback/discard يعملان.

### Phase 05 — UX موحد للموبايل وtablet

1. جرد shared library قبل أي component جديد؛ توحيد AppScreen/AppListScreen/AppForm وتخفيف النماذج اليدوية المكررة.
2. cards كعرض مناسب للهاتف حيث يلزم، وجداول محدودة الصفحات على tablet؛ لا تفرض نسخة شاشة الويب حرفياً.
3. access states وoffline indicators وsync status وread-only reasons واضحة ومترجمة.
4. اختبار العربية/الإنجليزية وRTL وfont scaling وscreen readers وtouch targets والـkeyboard/safe areas، والتنقل العميق والعودة للنموذج.
5. حفظ تفضيلات العرض محلياً بمفاتيح مناسبة؛ لا تضمين بيانات أعمال حساسة في AsyncStorage.

**الملفات:** shared controls/forms/lists/navigation، theme tokens، localization، shell/module layouts، مكونات الميزات المخالفة فقط.

**شرط الخروج:** evidence matrix على phone/tablet وLTR/RTL وlight/dark؛ اختلاف مقصود عن Countries/States موثق؛ لا نسخ متوازية لنفس shared behavior.

### Phase 06 — عقود ERP والأداء والمراقبة

1. اعتماد money/decimal/currency/rounding وdate-only/UTC/timezone وquantity/unit DTO conventions؛ الخادم يحسب القيم المالية النهائية.
2. قياس release build: startup/navigation/search/large tree/long forms/file preview/import والذاكرة؛ تعيين budgets بعد baseline.
3. lifecycle Query على AppState/connectivity وسياسة retry حسب status، مع scope-aware cancellation وinvalidation.
4. Observe metrics للـstartup/crash/API correlation/sync backlog age/conflicts؛ redaction وعدم إرسال tokens أو payloads مالية وشخصية كاملة.
5. مصفوفة capabilities: push وapprovals inbox وbarcode/printing وbiometrics وglobal search وattachments وreporting. لكل منها Required أو Deferred مع owner وtrigger أو Excluded مع سبب. القرار جزء من التأسيس؛ تنفيذ business لاحق لا يُسمى خللاً مغلقاً الآن.

**الملفات:** core API/query/runtime/config، reporting/file/notification adapters، shared selectors/formatting، feature contracts، documentation/mobile-react؛ إنشاء connectors الجديدة فقط إذا Required.

**شرط الخروج:** budgets وmeasurements مسجلة، contracts مستخدمة في feature حقيقية، وقرارات capabilities محسومة؛ لا ادعاء دعم POS offline/payments أو push قبل تنفيذه واختباره.

### Phase 07 — منع التراجع واختبارات التكامل

تبدأ الاختبارات المصاحبة من Phase 01؛ هذه المرحلة تجمع gates ولا تؤجل كتابة الاختبارات حتى النهاية.

- unit: policies/normalization/scope/expiry/conflict/retry/monetary-date adapters.
- component: guards/forms/field errors/view loading/empty/error/paging/search/permissions.
- contract: catalog + permissions + response fixtures مصدرها API الحالي، وتشغيل roles واقعية (super-admin/admin/limited/read-only/no-entitlement).
- native data: SQLite/SQLCipher حقيقي، transaction rollback، migration/retention/protected draft وprocess death.
- device E2E: sign-in/company switch/revocation/CRUD/deep links/kill/restart/airplane mode/reconcile/RTL. استخدام Maestro أو ما يعادله بعد قرار الفريق.
- performance: release build budgets؛ production dependency audit وExpo Doctor وAndroid/iOS build evidence.

**الملفات:** الاختبارات بجوار runtime، suite device خارج `app/`، `.github/workflows/mobile-ci.yml`، scripts verification وتقارير fixtures.

**شرط الخروج:** إعادة إنتاج M01–M12 كاختبارات ثم نجاحها؛ كل failure مصنف implementation/inherited/environment/manual؛ لا تمرير gate بتحويل assertion إلى mock يطابق الخطأ.

### Phase 08 — إصدار تجريبي موثوق وإغلاق الأساس

1. preview/production EAS environments واضحة، API version/build metadata وproject identity وsource maps دون أسرار داخل EXPO_PUBLIC.
2. Android APK وiOS internal build يعملان مع hosted test API وبيانات تجريبية معزولة.
3. app/universal links association وinvitation/reset/confirmation على الجهاز، والتنبيهات والتقارير/المرفقات المطلوبة.
4. سياسة versioning/minimum supported client/API compatibility/rollback وترقية قاعدة محلية. OTA إذا تقرر مطلوباً يحتاج runtime compatibility؛ ليس شرطاً افتراضياً لبداية business.
5. privacy/signing/store assets وbackup/device policies قبل نشر المتجر، مع runbook incident/recovery لا يحذف pending work.
6. تحديث readiness book بالحالة المقاسة، توقيع قبول features الأساسية، ومصفوفة القرارات المتبقية والمالكين.

**الملفات:** app.config.ts/app.json/eas.json، CI، release runbook تحت documentation/mobile-react، linking assets في مالك host إن لزم.

**شرط الخروج:** نتائج device journeys مسجلة مع build/API/commit، لا P1 مفتوح في الأساس، والفحوص العامة خضراء. يجوز بعدها التركيز على business داخل حدود الأساس المعتمدة؛ لا يعني ذلك اكتمال ERP business كله.

## 6. أوامر التحقق ونتائج هذه المراجعة

من `mobile-react`:

```powershell
npm run check
npm run check:dependencies
npm audit --omit=dev --audit-level=moderate
npm run check:expo
npm run check:native-config
npm run check:export
```

من جذر المشروع:

```powershell
./documentation/system/Generate-Documentation.ps1 -Check
```

تم تنفيذ تحديث Expo patch والـlockfile في Phase 00. يظل `npm ci` في بيئة
تحقق نظيفة و`eas build` خارج نطاق هذا التنفيذ؛ Android export هو bundle smoke
وليس APK build.

| الفحص | نتيجة تشغيل هذه المراجعة |
|---|---|
| TypeScript | نجح ضمن npm run check |
| ESLint / architecture / i18n | نجحت جميعها ضمن npm run check |
| Jest | نجح: 142 suite و425 test، بدون snapshots |
| dependency compatibility | نجح |
| production npm audit | نجح، 0 vulnerabilities وقت الفحص |
| Expo Doctor (pre-Phase baseline) | فشل: 20/21، عشر حزم patch غير متوافقة مع المتوقع |
| Expo Doctor (Phase 00) | نجح: 21/21 بعد clean install وتحديث patch |
| Android native config | نجح: SQLCipher وbackup وlocal/EAS Observe configuration |
| Android export | نجح: 2876 modules، Hermes bundle نحو 9.3MB؛ هذا حجم bundle وليس قياس startup أو حجم APK |
| documentation check | نجح: 77 recipe |
| device Android/iOS / hosted API journeys | لم يُنفّذ في هذه المراجعة |
| Contract matrix | نجح: 74 routes و25 endpoint files؛ كل member مسجل |

## 7. قواعد إغلاق المراحل وتحديث التوثيق

1. لكل phase سجل: scope، affected files، acceptance scenarios، نتائج فعلية، findings مغلقة ومفتوحة. كلمة Done تتطلب جميع شروط الخروج.
2. كل domain/contract change يحدث كتاب مالكه وAPI/Web/Mobile profiles وrequired-files والrecipes في نفس التغيير؛ المنصة الغائبة تصنّف صراحة.
3. لا تعديل يدوي لـdocumentation/system/generated؛ تعدّل canonical source ثم regenerate وCheck.
4. كل feature جديد يحدد owner/permission/entitlement/scope/offline/concurrency/retention قبل UI. المولد لا يقرر business rules.
5. كل mobile capability خارج release الحالي لها Required/Deferred/Excluded وowner وreopening trigger؛ لا placeholders runtime توحي بأنها متاحة.
6. يبقى هذا التقرير baseline تاريخياً؛ يسجل تنفيذ المراحل بأدلته ولا يُمحى finding لمجرد نجاح build.

## 8. المصادر الرسمية المستخدمة لتقييد التوصيات

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/): توافق SDK مع React Native/React/Node؛ تحديثات patch تُحسم من Doctor وقت التنفيذ.
- [Expo BackgroundTask](https://docs.expo.dev/versions/latest/sdk/background-task/): التنفيذ تحكمه قيود النظام، فلا تُبنى ضمانات ترحيل ERP على توقيت background دقيق.
- [TanStack Query على React Native](https://tanstack.com/query/latest/docs/framework/react/react-native): ربط online/focus بدورة حياة الشبكة والتطبيق.

هذه المصادر تشرح سلوك الأدوات؛ دليل كل خلل في هذه المراجعة هو مسار الكود المحدد أو الفحص المنفذ، وليس تطبيق best practices عامة دون ربطها بالمشروع.
