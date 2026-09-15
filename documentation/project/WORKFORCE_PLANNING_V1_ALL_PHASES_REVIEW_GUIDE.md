# دليل مراجعة جميع مراحل Workforce Planning to Hire V1.0

> آخر تحديث: 2026-09-07  
> المرجع التنفيذي: `WORKFORCE_PLANNING_TO_HIRE_V1_IMPLEMENTATION_PLAN.md`  
> حالة التنفيذ المحدثة: Phase 0 إلى Phase 6 مكتملة مصدرًا مع migrations مطبقة وفحوص API/Web/Mobile الآلية موثقة أدناه. وصفات Workforce Planning السبعة (Phase 00–06) مولّدة وفحصها feature-scoped ناجح؛ الفحص العام يتبقى فيه stale packet خاص بـ organizational-structure فقط. اختبارات Browser وMobile visual/simulator لم تُشغّل بناءً على طلب المستخدم.

## 1. الغرض من الدليل

يستخدم هذا الملف لمراجعة كل مرحلة بصورة قابلة للإثبات قبل الانتقال إلى المرحلة التالية. لا تعتبر المرحلة ناجحة لمجرد نجاح البناء أو ظهور الشاشة؛ يجب إغلاق اختبارات المصدر، قاعدة البيانات، الصلاحيات، Web، Mobile، والعزل بين الشركات بحسب نطاق المرحلة.

قواعد العبور:

1. لا تبدأ مرحلة Runtime جديدة إذا كان Gate المرحلة السابقة فاشلًا أو غير منفذ.
2. تسجل نتيجة كل فحص كواحدة من: `Pass` أو `Fail` أو `Blocked`، ولا يحسب `Blocked` كنجاح.
3. عند خطأ API، سجل HTTP status و`traceId` والعملية والوقت والمستخدم، من دون نسخ tokens أو كلمات مرور.
4. لا تستخدم نفس المستخدم لاختبار requester وapprover، باستثناء استثناء `admin` المؤقت الموثق صراحة في Phase 1/2.
5. اختبر كل سيناريو داخل نفس Tenant/Company، ثم أعد اختبار محاولة الوصول من Company أخرى.
6. لا تعتمد على بيانات قديمة وحدها؛ أنشئ سلسلة اختبار جديدة يمكن تتبعها من Fiscal Year حتى Employee.

## 2. ورقة نتيجة موحدة

انسخ الجدول التالي لكل تشغيل مراجعة:

| الحقل | القيمة |
|---|---|
| التاريخ والوقت | |
| الفرع/الالتزام | |
| البيئة | Local / Staging / Production-like |
| قاعدة البيانات | الاسم فقط، من دون connection string |
| Tenant / Company | |
| Creator user | |
| Approver user | |
| Admin user | |
| Web viewport | Desktop / Mobile width |
| Mobile target | Android / iOS / Expo Web |
| النتيجة النهائية | Pass / Fail / Blocked |
| الأدلة | screenshots، test output، trace IDs، IDs للكيانات |

## 3. التحقق العام قبل أي مرحلة

نفذ الأوامر من جذر المستودع:

```powershell
git status --short
./documentation/system/Generate-Documentation.ps1 -Check
dotnet build ./api/ErpSystem.Api/ErpSystem.Api.csproj --no-restore
dotnet test ./api/Modules/HR/ErpSystem.Modules.HR.Tests/ErpSystem.Modules.HR.Tests.csproj --no-restore
npm --prefix ./web-next run type-check
npm --prefix ./web-next run check:architecture
npm --prefix ./mobile-react run typecheck
npm --prefix ./mobile-react run check:architecture
```

ثم افحص قاعدة البيانات:

```powershell
dotnet ef migrations list --project ./api/Modules/HR/ErpSystem.Modules.HR.Infrastructure --startup-project ./api/ErpSystem.Api
dotnet ef migrations has-pending-model-changes --project ./api/Modules/HR/ErpSystem.Modules.HR.Infrastructure --startup-project ./api/ErpSystem.Api
```

Gate عام:

- البناء والاختبارات الخاصة بالتغيير ناجحة.
- لا يوجد Pending Model Changes.
- كل migration تخص المرحلة موجودة ومطبقة في البيئة التي ستختبر عليها.
- إخفاقات المستودع الموروثة تسجل منفصلة بالاسم، ولا تنسب للمرحلة الجديدة.
- Web وMobile يستخدمان API يحتوي نفس إصدار الكود والمigrations الجاري مراجعتهما.

### بيئة Smoke محلية معزولة

عند عدم توافر Staging مطابق للكود، استخدم SQL LocalDB بدل قاعدة البيانات المضبوطة خارجيًا. أنشئ قاعدة Hangfire المحلية مرة واحدة:

```powershell
sqlcmd -S '(localdb)\MSSQLLocalDB' -E -Q "IF DB_ID(N'HrmsWorkforcePhaseSmokeHangfire') IS NULL CREATE DATABASE [HrmsWorkforcePhaseSmokeHangfire];"
```

ثم شغّل API في نافذة مستقلة:

```powershell
$env:ConnectionStrings__DefaultConnection='Server=(localdb)\MSSQLLocalDB;Database=HrmsWorkforcePhaseSmoke;Trusted_Connection=True;MultipleActiveResultSets=True;TrustServerCertificate=True'
$env:ConnectionStrings__HangfireConnection='Server=(localdb)\MSSQLLocalDB;Database=HrmsWorkforcePhaseSmokeHangfire;Trusted_Connection=True;MultipleActiveResultSets=True;TrustServerCertificate=True'
$env:DatabaseSettings__ApplyMigrationsOnStartup='true'
$env:DatabaseSettings__SeedOnStartup='true'
$env:ASPNETCORE_ENVIRONMENT='Development'
dotnet run --project ./api/ErpSystem.Api --launch-profile http
```

وشغّل Web عبر HTTPS في نافذة أخرى. يجب أن يكون `BACKEND_URL` جذر الخادم بلا `/api/v1`:

```powershell
$env:BACKEND_URL='http://localhost:5293'
$env:NEXT_PUBLIC_API_URL='http://localhost:5293/api/v1'
npm --prefix ./web-next run dev:https
```

إذا كان Turbopack المحلي يعيد 404 لمسارات Route Handlers الموجودة فعلًا تحت `/api/*`، أوقف خادم Web وأعد تشغيله مؤقتًا باستخدام Webpack:

```powershell
Set-Location ./web-next
$env:BACKEND_URL='http://localhost:5293'
$env:NEXT_PUBLIC_API_URL='http://localhost:5293/api/v1'
npx next dev --webpack --experimental-https --experimental-https-key ./certificates/localhost-key.pem --experimental-https-cert ./certificates/localhost.pem
```

لا تنقل نتيجة LocalDB إلى بيئة أخرى، ولا تعتبر نجاحها بديلًا عن Smoke البيئة المرشحة للإصدار.

## 4. Phase 0 — Discovery & Contract Freeze

### ما يجب مراجعته

- سلسلة الملكية معتمدة: Fiscal Year → Plan → Budget → Envelope → Staffing Request → Requisition → Opening/Application → Offer → Hire → Employee.
- كل حالة lifecycle، transition، permission، error code، وقرار Required/Deferred/Excluded محدد بلا placeholders.
- السياسة المالية مثبتة على `2026-09-V1`، مع `decimal(18,2)` والتقريب النهائي لكل فئة.
- الاستيراد والتصدير والـ Payroll Actuals مصنفة بوضوح ولا توجد شاشات وهمية لها.
- `IMPLEMENTATION-REQUEST.md` و`WORKFORCE_PLANNING-REVIEW-ARTIFACTS.md` متوافقان مع الخطة النهائية.

### دليل النجاح

- لا توجد تغييرات Runtime ضمن Phase 0 نفسها.
- كل finding في review artifact له owner وphase وقرار.
- Gate 0 مسجل `Pass` قبل أول commit Runtime.

## 5. Phase 1 — Workforce Plans Full Stack

### اختبارات آلية

```powershell
dotnet test ./api/Modules/HR/ErpSystem.Modules.HR.Tests/ErpSystem.Modules.HR.Tests.csproj --no-restore --filter "FullyQualifiedName~WorkforcePlan"
npm --prefix ./web-next test -- workforcePlanService.test.ts
npm --prefix ./mobile-react test -- workforce-plan-api.test.ts
```

### سيناريو Web وMobile

1. أنشئ Fiscal Year مفتوحة.
2. أنشئ Workforce Plan بفترة صحيحة وخط واحد على الأقل.
3. تحقق أن baseline محسوب من الخادم وأن total = baseline + new positions + replacements.
4. عدل Draft ثم أرسله؛ يجب أن يصبح `Submitted` ثم `UnderReview` حسب الإجراء.
5. حاول اعتماد الخطة بنفس المستخدم غير الإداري؛ يجب رفض العملية برسالة self-approval مفهومة.
6. اعتمدها بمستخدم آخر لديه الصلاحية؛ يجب أن تصبح `Approved`.
7. اختبر استثناء دور `admin` المؤقت منفصلًا؛ إذا كان العقد الحالي يسمح به فيجب أن ينجح ويظهر في سجل التدقيق.
8. افتح Grid وCards والتفاصيل في EN وAR، وتحقق من RTL والصفحات والبحث وحالات loading/empty/error.

### Gate 1

- لا يمكن إنشاء خطة فعالة ثانية متعارضة لنفس النطاق والفترة.
- `RowVersion` قديم يرجع conflict ولا يكتب فوق بيانات أحدث.
- المستخدم لا يرسل TenantId/CompanyId كسلطة ملكية.
- Web وMobile يقدمان create/edit/view/list والإجراءات نفسها دون فقد حقول.
- migration الخاصة بالمرحلة مطبقة وEF model نظيف.

## 6. Phase 2 — Budgets & Position Envelopes Full Stack

### اختبارات آلية

```powershell
dotnet test ./api/Modules/HR/ErpSystem.Modules.HR.Tests/ErpSystem.Modules.HR.Tests.csproj --no-restore --filter "FullyQualifiedName~WorkforceBudget"
dotnet test ./api/Modules/HR/ErpSystem.Modules.HR.Tests/ErpSystem.Modules.HR.Tests.csproj --no-restore --filter "FullyQualifiedName~Workforce"
npm --prefix ./web-next test -- workforceBudgetService.test.ts
npm --prefix ./mobile-react test -- workforce-budget-api.test.ts
```

### سيناريو Smoke المطلوب لإغلاق المرحلة

1. سجل الدخول بمستخدم يملك `WorkforceBudgets:View/Manage` وبخطة Approved من Phase 1.
2. افتح `/workforce-planning/budgets`. يجب ألا تظهر رسالة `An unexpected error occurred`.
3. تحقق أن قائمة source plans لا تعرض إلا الخطط Approved الصالحة للشركة الحالية.
4. أنشئ Budget واختر العملة، وتحقق من حساب الخطوط والإجماليات من الخادم.
5. عدل Draft، ثم Submit، ثم Reject بسبب واضح، ثم أعد التعديل وSubmit.
6. حاول Approve بمستخدم غير `admin` حتى لو كان يملك Manage؛ يجب الرفض وفق القرار المؤقت.
7. اعتمد Budget بدور `admin`؛ يجب أن تنشأ Position Envelopes مرة واحدة فقط.
8. أعد إرسال Approve أو request مكرر؛ يجب ألا تتكرر envelopes أو الأرقام.
9. افتح `/workforce-planning/position-envelopes` وتحقق من headcount، salary budget، المتاح، العملة، والفترة.
10. جرّب page size كبيرًا وتحقق أن الخادم يقيده إلى الحد المسموح بدل رمي exception.
11. كرر العرض في Cards/Grid وعلى عرض ضيق، ثم نفذ نفس القراءة الأساسية على Mobile.

### Gate 2

- قائمة Budgets وPosition Envelopes تعمل دون 500 أو trace غير معالج.
- المصدر Approved فقط، والحسابات قابلة للمصالحة مع plan lines.
- اعتماد Budget ذري ولا ينتج envelopes جزئية.
- `20260906204810_create-workflow-budget` مطبقة وEF لا يكتشف pending changes.
- Browser وMobile visual/simulator smoke لم تُشغّل بناءً على طلب المستخدم؛ الحالة موثقة `Not Run` ولا تُحتسب Pass.

## 7. Phase 3 — Staffing Requests & Envelope Amendments

### اختبارات آلية بعد التنفيذ

```powershell
dotnet test ./api/Modules/HR/ErpSystem.Modules.HR.Tests/ErpSystem.Modules.HR.Tests.csproj --no-restore --filter "FullyQualifiedName~StaffingRequest|FullyQualifiedName~EnvelopeAmendment"
npm --prefix ./web-next test -- staffingRequest envelopeAmendment
npm --prefix ./mobile-react test -- staffing-request envelope-amendment
```

### سيناريو Envelope Amendment

1. افتح Envelope معتمدة وأنشئ Amendment بقيمة headcount أو salary موجبة.
2. تحقق أن zero/negative delta مرفوض برسالة تحت الحقل في Web وMobile.
3. Submit بالمُنشئ، ثم حاول Approve بنفس المستخدم؛ يجب رفض self-approval.
4. Approve بمستخدم آخر لديه `EnvelopeAmendments:Approve`.
5. تحقق أن capacity الأصلية + delta = capacity الجديدة، وأن العملية سجلت requester/approver/timestamps.
6. اختبر Reject ثم إعادة التعديل والإرسال بحسب lifecycle المعتمد.
7. أرسل Approve متزامنًا مرتين؛ يجب تطبيق delta مرة واحدة فقط.

### سيناريو Staffing Request

1. أنشئ Request على Envelope بسعة تكفي headcount والتكلفة المالية.
2. تحقق أن `EstimatedFiscalYearCostPerSlot` مطابق لتاريخ البدء ونهاية السنة المالية والسياسة `2026-09-V1`.
3. Submit ثم Approve بمستخدم آخر.
4. تحقق من حجز headcount وsalary atomically ومن ظهور `RemainingAllocatable` و`RemainingToHire`.
5. أنشئ طلبين متزامنين يتنافسان على آخر سعة؛ يجب نجاح واحد فقط وعدم ظهور capacity سالبة.
6. Cancel/Close طلبًا جزئي الاستخدام؛ يجب تحرير الجزء غير المخصص/غير المعين فقط.
7. كرر create/edit/view/list/approve/cancel في Web وMobile، مع Grid/Cards والفلترة والترجمة.

### Gate 3

- لا negative capacity ولا double consumption.
- لا تجاوز لسعة Envelope من دون Amendment معتمد سابقًا.
- الحجز المالي والرأسي يحدثان أو يفشلان معًا.
- migration `AddStaffingRequestsAndEnvelopeAmendments` مطبقة.
- العزل والصلاحيات وconcurrency tests ناجحة.

## 8. Phase 4 — Recruitment Requisition Bridge

### اختبارات آلية بعد التنفيذ

```powershell
dotnet test ./api/Modules/HR/ErpSystem.Modules.HR.Tests/ErpSystem.Modules.HR.Tests.csproj --no-restore --filter "FullyQualifiedName~Recruitment|FullyQualifiedName~StaffingRequest"
npm --prefix ./web-next test -- recruitment
npm --prefix ./mobile-react test -- recruitment
```

### السيناريو الوظيفي

1. تحقق أن السجلات القديمة backfilled إلى `PlanningSource=Legacy` من دون كسرها.
2. في وضع rollout غير الإلزامي، افتح Legacy record وتأكد من badge واضح ومنع ادعاء أنه Planned.
3. أنشئ Job Requisition جديدة واختر Approved Staffing Request فقط.
4. تحقق أن position/branch/department/division منسوخة من الخادم وتظهر read-only، ولا يقبل API قيمًا مزورة من العميل.
5. خصص جزءًا من `RemainingAllocatable` ثم أنشئ Requisition ثانية حتى حد الحصة.
6. حاول تجاوز الحصة أو التكلفة؛ يجب رفض العملية بلا counters جزئية.
7. Cancel Requisition غير مستخدمة جزئيًا؛ يجب تحرير remainder الصحيح فقط.
8. فعّل enforcement flag في بيئة الاختبار، ثم تحقق أن requisitions الجديدة لا تقبل Legacy path.
9. قارن headcount summary مع Envelope/Staffing Request، وليس Position.TargetHeadcount القديم.

### Gate 4

- Planned requisitions مرتبطة بطلب Approved وحقيقي في نفس Tenant/Company.
- لا spoofing تنظيمي من Web أو Mobile.
- allocation/release ذريان ومتوافقان مع counters.
- rollout يعمل قبل وبعد enforcement مع بقاء legacy data قابلة للقراءة.
- migration `LinkStaffingRequestsToJobRequisitions` مطبقة.

## 9. Phase 5 — Job Offer Approval & Atomic Hire

### اختبارات آلية بعد التنفيذ

```powershell
dotnet test ./api/Modules/HR/ErpSystem.Modules.HR.Tests/ErpSystem.Modules.HR.Tests.csproj --no-restore --filter "FullyQualifiedName~JobOffer|FullyQualifiedName~Hire|FullyQualifiedName~RecruitmentLifecycle"
npm --prefix ./web-next test -- recruitment offer hire
npm --prefix ./mobile-react test -- recruitment offer hire
```

### سيناريو Job Offer

1. أنشئ Offer؛ يجب أن يبدأ `Draft` ولا يصدر تلقائيًا.
2. Submit فيصبح `PendingApproval=7`.
3. حاول approval بواسطة المنشئ؛ يجب رفض self-approval.
4. Approve بواسطة مستخدم `JobOffers:Approve` فيصبح `Approved=8` ويضاف history append-only.
5. Issue بعد Approved فقط؛ محاولة Issue من Draft أو PendingApproval يجب أن تفشل.
6. اختبر Reject مع reason ثم تعديل/إعادة إرسال وفق العقد.
7. تحقق أن uniqueness للحالات النشطة تشمل `1,2,3,7,8`.
8. تحقق من salary/currency/cost snapshot وعدم تجاوز reservation المتبقي.

### سيناريو Atomic Hire

1. استخدم Application لها Offer بالحالة `Accepted` فقط.
2. نفذ Hire مع idempotency key ثابت وصلاحية `Employees:Hire`.
3. تحقق في نفس النتيجة من إنشاء Employee وAssignment وContract وتحديث Application/Opening/Requisition/StaffingRequest/Envelope counters.
4. أعد نفس الطلب؛ يجب إرجاع نفس Employee وعدم إنشاء سجل ثانٍ.
5. حقن failure قبل الحفظ النهائي؛ يجب ألا يبقى أي Employee أو counter جزئي.
6. نفذ محاولتين متزامنتين لنفس Application/employee number؛ يجب نجاح واحدة فقط ونتيجة idempotent للأخرى.
7. تحقق أن Issued غير Accepted لا يمكن تعيينه، ولا يحدث auto-transition خفي.

### Gate 5

- Hire transaction واحدة، وSaveChanges واحدة في مسار النجاح.
- locks مرتبة وثابتة لكل الموارد المشتركة.
- retry وfault injection وconcurrency موثقة.
- Web وMobile لا يقومان auto-issue أو auto-hire.
- migration `AddJobOfferApprovalGovernance` مطبقة وEF model نظيف.

## 10. Phase 6 — Trace & Plan vs Commitment

### اختبارات آلية بعد التنفيذ

```powershell
dotnet test ./api/Modules/HR/ErpSystem.Modules.HR.Tests/ErpSystem.Modules.HR.Tests.csproj --no-restore --filter "FullyQualifiedName~WorkforceTrace|FullyQualifiedName~PlanCommitment"
npm --prefix ./web-next test -- workforce trace commitment
npm --prefix ./mobile-react test -- workforce trace commitment
```

### سيناريو Trace

1. افتح trace من Plan ثم Budget وEnvelope وStaffing Request وRequisition وOffer وHire.
2. تحقق أن كل node يشير إلى entity حقيقي وأن الروابط typed وليست نصوصًا حرة.
3. جرّب IDs وأنواعًا غير allow-listed؛ يجب رفضها.
4. اختبر حد nodes/page؛ يجب pagination أو bounded response من دون N+1.
5. بحساب بلا `WorkforcePlanning:ViewFinancials` يجب إخفاء salary/cost تمامًا من response، لا من UI فقط.
6. بحساب يملك الصلاحية يجب إظهار القيم ومصالحتها.
7. حاول فتح trace لشركة أخرى؛ يجب NotFound/Forbidden بلا تسريب أسماء أو أرقام.
8. في Web تحقق من framer-motion tree ومن البديل accessible list/modal ولوحة المفاتيح.
9. في Mobile تحقق من timeline الزمني وقراءة الخطوات على الهاتف والتابلت وRTL.

### سيناريو Plan vs Commitment

- اختر Fiscal Year وتحقق من totals لكل Plan/Budget/Envelope/Reserved/Allocated/Hired.
- طابق الإجماليات مع السجلات المصدرية لعينة كاملة.
- اختبر paging/filtering وempty/error/loading.
- لا تعرض Payroll Actuals؛ حالتها Deferred في V1.

### Gate 6

- projection محدود ومقروء من read store مخصص، ولا يحمل aggregates أو ينفذ query لكل node.
- لا PII أو salary leakage.
- كل totals قابلة للمصالحة مع المصدر.
- Web وMobile يقدمان تمثيلًا usable وaccessible.

## 11. Phase 7 — Final Documentation, Database & Release Reconciliation

### توثيق وم manifests

- حدّث الكتب الأربعة: master، API، Web، Mobile لتعكس المصدر النهائي.
- تم تحويل `required-files.draft.json` إلى `required-files.json` بعد تحقق كل المسارات المعلنة.
- تم دمج تسجيلات `recipe-registration.draft.json` في `recipe-manifest.json` بعد اكتمال الكتب الأربعة.
- ولّد حزم phase 00–06 من المصادر المعتمدة؛ لا تعدل `generated/` يدويًا.
- شغّل `Generate-Documentation.ps1 -Check` حتى ينجح، مع فصل أي failure موروث.

### Database وrelease

```powershell
dotnet ef database update --project ./api/Modules/HR/ErpSystem.Modules.HR.Infrastructure --startup-project ./api/ErpSystem.Api
dotnet ef migrations list --project ./api/Modules/HR/ErpSystem.Modules.HR.Infrastructure --startup-project ./api/ErpSystem.Api
dotnet ef migrations has-pending-model-changes --project ./api/Modules/HR/ErpSystem.Modules.HR.Infrastructure --startup-project ./api/ErpSystem.Api
dotnet build ./api/ErpSystem.Api/ErpSystem.Api.csproj --no-restore
dotnet test ./api/Modules/HR/ErpSystem.Modules.HR.Tests/ErpSystem.Modules.HR.Tests.csproj --no-restore
npm --prefix ./web-next run test
npm --prefix ./web-next run lint
npm --prefix ./web-next run type-check
npm --prefix ./web-next run check:architecture
npm --prefix ./mobile-react run test
npm --prefix ./mobile-react run lint
npm --prefix ./mobile-react run typecheck
npm --prefix ./mobile-react run check:architecture
```

### الرحلة النهائية End-to-End

أنشئ سلسلة جديدة كاملة وسجل IDs:

`Fiscal Year → Approved Plan → Approved Budget → Envelope → Approved Staffing Request → Planned Requisition → Opening → Application → Approved/Issued/Accepted Offer → Hire → Employee + Assignment + Contract`

ثم نفذ مراجعة UI الخماسية على Web وMobile:

1. Creation Journey: كل البيانات الجديدة لها controls واضحة.
2. Editing Journey: المجموعات والحقول المنظمة تحمل وتعدل دون فقد.
3. Viewing Journey: التفاصيل تعرض badges/tables/accordions مناسبة.
4. Listing & Filtering: الحالات والأعلام الجديدة موجودة في Grid وCards والفلاتر.
5. Mock Data Generator: يولد سلسلة واقعية متوافقة مع القيود.

### Gate 7 النهائي

- جميع Gates 0–6 موثقة `Pass`.
- لا migration غير مطبقة ولا pending model changes.
- Smoke مصادق عليه في Web وMobile بحسابات صلاحيات مختلفة.
- لا finding مفتوح من نوع correctness/security/data-loss/concurrency.
- تسجل الإخفاقات الموروثة والمخاطر المتبقية وفحوص الإصدار اليدوية كل منها في قسم منفصل.

## 12. مصفوفة التوقيع النهائي

| المرحلة | Source | Tests | DB | Web Smoke | Mobile Smoke | Security/Isolation | النتيجة |
|---|---|---|---|---|---|---|---|
| Phase 0 | Pass | Pass | N/A | Not Run | Not Run | Pass | Source complete |
| Phase 1 | Pass | Pass | Applied / no pending model | Not Run | Not Run | Pass | Source/database complete; visual smoke deferred |
| Phase 2 | Pass | Pass | Applied / no pending model | Not Run | Not Run | Pass | Source/database complete; visual smoke deferred |
| Phase 3 | Pass | Focused pass | Applied | Not Run | Not Run | Pass | Source complete |
| Phase 4 | Pass | Focused pass | Applied | Not Run | Not Run | Pass | Source complete |
| Phase 5 | Pass | Recruitment/Workforce focused pass | Applied / no pending model | Not Run | Not Run | Pass | Governance + atomic hire complete |
| Phase 6 | Pass | Trace/API focused pass | Applied / no pending model | Not Run | Not Run | Pass | Bounded trace/report complete |
| Phase 7 | Pass | Checks recorded below | Applied | Not Run | Not Run | Pass | Generator uses the consolidated baseline migration; visual smoke remains intentionally not run |

## 13. نموذج تسجيل عيب

```text
Phase:
Environment:
Tenant / Company:
User role and relevant permissions:
Entity IDs:
Expected:
Actual:
HTTP status:
traceId:
Timestamp with timezone:
Reproduction steps:
Screenshot or test output:
Regression / inherited / environment blocker:
```

## 14. Current implementation handoff (2026-09-07)

The current source pass covers Phases 3–6 and the Phase 7 documentation handoff. Browser and mobile-simulator checks are intentionally excluded by the user request; do not mark those manual gates as passed. Reviewers should run the following static/runtime checks and record the result beside the relevant gate:

```powershell
dotnet build ./api/ErpSystem.Api/ErpSystem.Api.csproj --no-restore
dotnet test ./api/Modules/HR/ErpSystem.Modules.HR.Tests/ErpSystem.Modules.HR.Tests.csproj --no-restore --filter "FullyQualifiedName~Recruitment"
dotnet test ./api/Modules/HR/ErpSystem.Modules.HR.Tests/ErpSystem.Modules.HR.Tests.csproj --no-restore --filter "FullyQualifiedName~Workforce"
dotnet ef migrations list --project ./api/Modules/HR/ErpSystem.Modules.HR.Infrastructure --startup-project ./api/ErpSystem.Api
dotnet ef migrations has-pending-model-changes --project ./api/Modules/HR/ErpSystem.Modules.HR.Infrastructure --startup-project ./api/ErpSystem.Api
npm --prefix ./web-next run type-check
npm --prefix ./web-next run check:architecture
npm --prefix ./mobile-react run typecheck
npm --prefix ./mobile-react run check:architecture
./documentation/system/Generate-Documentation.ps1 -Check
git diff --check
```

Phase 5 reviewers must verify `Draft -> PendingApproval -> Approved -> Issued -> Accepted`, reject creator self-approval, and repeat Hire with the same idempotency key. The successful Hire must create Employee, Assignment, and Contract in one transaction while incrementing Opening/Requisition/Staffing/Envelope counters once; `Issued` or non-accepted applications must fail without mutation.

Phase 6 reviewers must use only the explicit application/offer/employee trace routes and the paginated plan-commitment route. Cross-company roots must return not-found/forbidden, a caller without `WorkforcePlanning:ViewFinancials` must receive null salary/currency fields, and the Web accessible timeline/Mobile chronological timeline must remain usable without a diagram interaction.

Phase 7 status is `Source Complete / Database Applied / Browser-Mobile Smoke Not Run / Documentation Generator Registered`. The consolidated baseline `api/Modules/HR/ErpSystem.Modules.HR.Infrastructure/Migrations/20260906112413_create-database.cs` contains the global geography transition. Any full-suite or lint findings are recorded separately as inherited.
