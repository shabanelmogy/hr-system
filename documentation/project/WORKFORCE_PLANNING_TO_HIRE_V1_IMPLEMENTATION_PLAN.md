# الخطة النهائية من البداية — Workforce Planning to Hire V1.0

> **الحالة:** Pending User Approval  
> **قيد التنفيذ:** ممنوع بدء التنفيذ قبل اعتماد Phase 0.  
> **حالة المستودع عند إعداد الخطة:** نظيفة، ولا توجد تغييرات Git من المحاولة السابقة. تعتبر هذه الخطة تنفيذًا جديدًا بالكامل.

## السلسلة النهائية

`Fiscal Year → Workforce Plan → Workforce Budget → Position Envelope → Staffing Request → Job Requisition → Job Opening/Posting → Candidate/Application → Interview/Evaluation → Job Offer → Hire → Employee + Assignment + Contract`

## 1. القرارات المجمدة

1. الـFeature ID الرسمي هو `workforce-planning`.
2. `FiscalYear` الحالي هو مصدر السنة والفترات الوحيد.
3. V1 يدعم الفترات الحالية فقط: `Monthly` أو `Quarterly`. الفترات المخصصة (`Custom periods`) مستبعدة.
4. إنشاء ومسودة الخطة مسموحان والسنة في حالة `Draft` أو `Open`.
5. اعتماد الخطة والميزانية والحجز مسموح فقط والسنة في حالة `Open`.
6. كل `Requisition` جديد يجب أن يرتبط بـ`Staffing Request` معتمد.
7. السجلات القديمة فقط تحصل على `PlanningSource.Legacy`.
8. `EmergencyUnbudgeted` مستبعد من V1؛ الاستثناء يتم من خلال `Envelope Amendment` رسمي.
9. عملة العرض يجب أن تطابق عملة الميزانية. تحويل العملات `Deferred`.
10. `Payroll Actuals` خارج V1؛ التقرير يسمى `Plan vs Commitment`.
11. اعتماد `Job Offer` في V1 مرحلة واحدة، وليس `Multi-tier`.
12. `Import` و`Export` مؤجلان على Web وMobile.
13. Web Trace مطلوب كشجرة/Timeline مع بديل accessible.
14. Mobile Trace مطلوب كـstep-by-step timeline؛ الرسم الشجري التفاعلي مستبعد.
15. لا يوجد إنشاء يدوي لـ`Position Envelope`.

## 2. التعليمات الصارمة غير القابلة للتفاوض

- ممنوع إنشاء `IWorkforcePlanningService` أو خدمة ضخمة مشابهة.
- كل عملية كتابة تستخدم `MediatR Command` مستقلًا و`FluentValidation`.
- كل قراءة تستخدم `Query` مستقلًا و`read-projection port`.
- الـControllers تحقن `ISender` فقط.
- طبقة Application لا تعتمد على EF Core أو Infrastructure.
- ممنوع استدعاء `apiService` من صفحات أو مكونات UI مباشرة.
- ممنوع إرسال `TenantId` أو `CompanyId` من Web أو Mobile.
- جميع العلاقات تتحقق من Tenant/Company باستخدام composite keys.
- ممنوع تمرير Aggregate إلى Aggregate آخر؛ الـhandler هو من ينسق بينهما.
- ممنوع تغيير أرقام enum موجودة عليها بيانات.
- ممنوع استخدام `Math.Max(0, ...)` لإخفاء أخطاء الميزانية أو الحجز.
- ممنوع أن تصبح السعة أو الميزانية المتاحة سالبة.
- ممنوع إصدار Offer جديد دون اعتماد داخلي.
- ممنوع Hire دون Offer حالته `Accepted`.
- عملية Hire بالكامل يجب أن تتم في transaction واحدة و`SaveChanges` واحدة.
- كل عملية حساسة تستخدم `ExecuteAtomicallyAsync` ومفاتيح resource locks ثابتة.
- ممنوع استخدام `DateTime.UtcNow` داخل Domain؛ يستخدم `TimeProvider` في handlers.
- لا يتم تعديل Migration سبق تطبيقها؛ يتم إنشاء corrective migration.
- ممنوع بدء Runtime قبل اكتمال Phase 0 دون placeholders.
- ممنوع الانتقال بين Phases إذا فشل Gate المرحلة الحالية.
- كل Phase تشمل API وWeb وMobile والتوثيق والاختبارات المناسبة، وليست Backend فقط.
- ممنوع استخدام browser `alert` أو `confirm` أو native validation.
- كل Web form يستخدم `MyForm` والحقول المشتركة وZod.
- كل Mobile form يستخدم `AppForm` ومكونات التصميم المشتركة.
- يظل زر Save/Create مفعّلًا؛ التحقق يحدث عند الإرسال مع focus لأول حقل خاطئ.
- كل النصوص الجديدة يجب أن توجد بالإنجليزية والعربية.
- لا يتم إعلان اكتمال الميزة قبل تطبيق migrations على قاعدة التطوير وتنفيذ UI audit على المنصتين.

## 3. نموذج البيانات المجمد

### 3.1 Workforce Plan

#### WorkforcePlan

- `PlanSeriesId`: قيمة `Guid` ثابتة عبر جميع المراجعات.
- `PlanCode`.
- `FiscalYearId`.
- `RevisionNumber`.
- `TitleEn`, `TitleAr`, `Description`.
- `Status`: `Draft`, `Submitted`, `UnderReview`, `Approved`, `Rejected`, `Superseded`.
- `PreviousRevisionId`.
- `SubmittedByEmployeeId`, `SubmittedOn`.
- `ApprovedByEmployeeId`, `ApprovedOn`.
- `ActivatedOn`, `SupersededOn`.
- `RowVersion` وبيانات التدقيق.

#### WorkforcePlanLine

- `PositionId`.
- `TargetBranchId`.
- `DivisionId` و`DepartmentId` يتم اشتقاقهما من Position على السيرفر.
- `BaselineAsOfDate`.
- `BaselineHeadcount` محسوب من Primary Active Assignments.
- `TargetHeadcount`.
- `PlannedNewHireSlots`.
- `PlannedReplacementSlots`.
- `PlannedHiringSlots = NewHire + Replacement`.
- `Justification`.

#### WorkforcePlanLinePeriodTarget

- `FiscalPeriodId`.
- `NewHireSlots`.
- `ReplacementSlots`.
- مجموع الفترات يجب أن يساوي `PlannedHiringSlots`.
- لا يحتوي على بيانات مالية؛ الميزانية هي مصدر المال الوحيد.

### 3.2 Workforce Budget

#### WorkforceBudget

- `BudgetSeriesId`.
- `BudgetCode`.
- `WorkforcePlanId`.
- `FiscalYearId`.
- `RevisionNumber`.
- `CurrencyCode`.
- `Status`: `Draft`, `Submitted`, `Approved`, `Rejected`, `Superseded`, `Closed`.
- بيانات التقديم والاعتماد.
- `ActivatedOn`, `SupersededOn`.
- `RowVersion`.

#### WorkforceBudgetLine

- يرتبط بـ`WorkforcePlanLineId`.
- `AuthorizedHiringSlots` ويجب ألا يتجاوز Planned Slots.
- `AuthorizedFiscalYearSalaryCost`.
- `AuthorizedRecruitmentCost`.
- `OtherAuthorizedCost`.
- لا يقبل Organization IDs مستقلة من العميل.

#### WorkforceBudgetPeriodAllocation

- `FiscalPeriodId`.
- `AuthorizedHiringSlots`.
- `SalaryCost`.
- `RecruitmentCost`.
- مجموع الفترات يجب أن يساوي إجمالي Budget Line بالضبط.

### 3.3 Position Envelope

يُنشأ تلقائيًا عند اعتماد الميزانية، ويحتوي على:

- `WorkforceBudgetLineId`.
- Position/org scope.
- `AuthorizedHeadcount`.
- `ReservedHeadcount`.
- `HiredHeadcount`.
- `AvailableHeadcount = Authorized - Reserved - Hired`.
- `AuthorizedFiscalYearSalaryCost`.
- `ReservedFiscalYearSalaryCost`.
- `ContractedFiscalYearSalaryCost`.
- `AvailableSalaryCost = Authorized - Reserved - Contracted`.
- `RowVersion`.

كل release أو consumption أكبر من المحجوز يرفض بـDomain Error، ولا يتم تصفيره بصمت.

### 3.4 Envelope Amendment

Aggregate مستقل بالقواعد التالية:

- دورة الحالة: `Draft → Submitted → Approved | Rejected`.
- `AdditionalHeadcount`.
- `AdditionalSalaryCost`.
- `Justification`.
- requester/approver/timestamps.
- لا يسمح بـSelf Approval.
- يسمح بالزيادة فقط في V1.
- التخفيض يتم من خلال Budget Revision وليس Amendment سلبيًا.
- عند الاعتماد يوسع Envelope في نفس transaction.

### 3.5 Staffing Request

- `EnvelopeId`.
- `RequestedHeadcount`.
- `EstimatedAnnualSalaryPerSlot`.
- `EstimatedFiscalYearCostPerSlot`.
- `TotalReservedCost`.
- `TargetStartDate`.
- `RequestType`, `Priority`, `Justification`.
- `AllocatedRequisitionPositions`.
- `HiredPositions`.
- `Status`: `Draft`, `Submitted`, `Approved`, `Rejected`, `Closed`.
- `CloseReason`: `Fulfilled`, `Cancelled`, `PartiallyFulfilledCancelled`.
- لا يسمح بـSelf Approval.

#### الحسابات

```text
RemainingAllocatable =
RequestedHeadcount - AllocatedRequisitionPositions

RemainingToHire =
RequestedHeadcount - HiredPositions

Envelope reservation =
RequestedHeadcount + TotalEstimatedFiscalYearCost
```

#### إلغاء الطلب

- ممنوع الإلغاء مع وجود Requisitions فعالة.
- بعد إلغاء/غلق Requisitions يتم تحرير الجزء غير المعين فقط.
- الموظفون الذين تم تعيينهم لا يتم عكسهم أو تحرير تكلفتهم.

### 3.6 Recruitment Integration

تعديلات `JobRequisition`:

- إضافة `StaffingRequestId`.
- إضافة `PlanningSource = Planned | Legacy`.
- القيمة `Planned` تتطلب Staffing Request معتمدًا.
- `Position`, `Branch`, `Department`, و`Division` تُنسخ من Staffing Request بواسطة السيرفر.
- مجموع Requested Positions لكل Requisitions لا يتجاوز request quota.
- عند إلغاء Requisition يتم تحرير الجزء غير المعين إلى Staffing Request.
- `Legacy` يخصص فقط للسجلات الموجودة قبل تفعيل enforcement، ولا يرسله العميل.

### 3.7 Job Offer Governance

أرقام الحالات الحالية لا تتغير:

| الحالة | الرقم |
|---|---:|
| `Draft` | 1 |
| `Issued` | 2 |
| `Accepted` | 3 |
| `Declined` | 4 |
| `Withdrawn` | 5 |
| `Expired` | 6 |
| `PendingApproval` | 7 |
| `Approved` | 8 |

#### دورة الحالة الجديدة

`Draft → PendingApproval → Approved → Issued → Accepted | Declined | Withdrawn | Expired`

- `Issue()` يقبل `Approved` فقط.
- لا يسمح بـSelf Approval.
- إضافة `JobOfferApprovalHistory` كسجل append-only.
- عند الاعتماد يحسب السيرفر التكلفة السنوية وتكلفة السنة المالية.
- العملة يجب أن تطابق Budget Currency.
- إذا كانت التكلفة أعلى من المحجوز، يفشل الاعتماد حتى تتم زيادة Envelope/Reservation.
- إذا كانت التكلفة أقل، يسجل الفرق ليتم تحريره عند Hire.

### 3.8 Atomic Hire

تستخدم العملية `ExecuteAtomicallyAsync` مع locks على:

- Application.
- Job Offer.
- Job Opening.
- Job Requisition.
- Staffing Request.
- Position Envelope.
- Employee Number.

داخل transaction واحدة:

1. التأكد أن Application ليست `Hired` مسبقًا.
2. التأكد أن Offer موجود وحالته `Accepted`.
3. التحقق من RowVersions والسعة المحجوزة.
4. حساب Cost Snapshot النهائي.
5. إنشاء Employee.
6. إنشاء EmployeeAssignment.
7. إنشاء EmployeeContract.
8. تحديث Application إلى `Hired`.
9. زيادة Opening `HiredCount`.
10. تحديث Requisition fulfillment.
11. استهلاك Envelope reservation.
12. تحديث Staffing Request hired count.
13. استدعاء `SaveChangesAsync` مرة واحدة.
14. تنفيذ Commit.
15. إرسال Audit/Notifications/Realtime بعد الـcommit.

إعادة نفس الطلب يجب أن تعيد الموظف الموجود بنجاح ولا تنشئ موظفًا مكررًا.

## 4. مراحل التنفيذ

### Phase 0 — Discovery & Contract Freeze

**الهدف:** إغلاق جميع القرارات قبل كتابة Runtime.

#### المطلوب

1. تشغيل فحص التوثيق:

   ```powershell
   ./documentation/system/Generate-Documentation.ps1 -Check
   ```

2. إنشاء scaffold:

   ```powershell
   ./documentation/system/New-FeatureDocumentation.ps1 `
     -FeatureId workforce-planning `
     -FeatureName "Workforce Planning" `
     -ReferenceFeature states
   ```

3. إكمال `IMPLEMENTATION-REQUEST.md` وreview artifact دون أي `<placeholder>`.
4. توثيق كل الحقول والحالات والمعادلات والصلاحيات وAPI envelopes.
5. توثيق `Required`/`Deferred`/`Excluded` لكل view على Web وMobile.
6. فحص migrations الحالية و`__EFMigrationsHistory`.
7. توثيق rollout policy للسجلات القديمة.
8. تحديد Cost Calculation Policy وإصدارها `CalculationPolicyVersion`.

#### Gate

- لا توجد placeholders.
- Documentation check ناجح.
- لا توجد Runtime changes.
- موافقة المستخدم على العقد المجمد.

### Phase 1 — Workforce Plans Full Stack

#### المطلوب

- Domain: Plan، Lines، Period Targets، revisions.
- CQRS Commands/Queries/Validators.
- Infrastructure read/write stores.
- Thin controller باستخدام `ISender`.
- Migration: `AddWorkforcePlanningPlans`.
- Web Plans page: Grid + Cards + create/edit/view/revision/approval.
- Mobile Plans screen: Table/Cards + full-screen create/edit/view.
- Dynamic period target builder على المنصتين.
- Permissions، routes، navigation، Arabic/English، realtime.
- Mock data generator.
- Domain/API/Web/Mobile tests.

#### Gate

- لا يمكن اعتماد خطة لسنة غير `Open`.
- لا يسمح بـSelf Approval لغير المدير؛ يُسمح مؤقتًا لدور `admin` باعتماد الخطة التي أنشأها حتى تطبيق صلاحيات اعتماد وفصل مهام مخصصة.
- Period totals متطابقة.
- Cross-company IDs مرفوضة.
- إنشاء Revision لا يلغي الخطة الحالية.
- جميع اختبارات المرحلة ناجحة.

### Phase 2 — Budgets & Position Envelopes Full Stack

#### المطلوب

- Budget aggregate، lines، period allocations.
- Currency and cost-basis enforcement.
- Budget approval CQRS.
- إنشاء Envelopes تلقائيًا داخل transaction.
- تفعيل Plan وBudget معًا.
- Supersede للإصدار السابق في نفس transaction.
- Unique filtered indexes على السجلات الفعالة باستخدام `ActivatedOn`/`SupersededOn` وليس رقم enum مبهمًا.
- Migration: `AddWorkforceBudgetsAndPositionEnvelopes`.
- Web/Mobile Budget builders وEnvelope dashboards.
- اختبارات reconciliation وconcurrent approval.

#### قاعدة V1 للمراجعات

- إذا كانت الميزانية القديمة لا تحتوي على downstream activity، يمكن استبدالها.
- إذا وجدت reservations أو requisitions أو hires، يمنع silent rebase.
- التعديلات أثناء التشغيل تتم عبر Envelope Amendments.
- لا يتم نقل الطلبات بين Envelopes تلقائيًا.

#### Gate

- Budget slots لا تتجاوز Plan slots.
- Period money totals تطابق line totals.
- توجد خطة وميزانية فعالتان واحدة فقط لكل FY/Company.
- فشل إنشاء أي Envelope يلغي اعتماد الميزانية بالكامل.

### Phase 3 — Staffing Requests & Amendments Full Stack

#### المطلوب

- Envelope Amendment lifecycle.
- Staffing Request lifecycle.
- Dual reservation للـheadcount والمال.
- Partial fulfillment counters.
- CQRS + controllers + permissions.
- Migration: `AddStaffingRequestsAndEnvelopeAmendments`.
- Web/Mobile forms، approvals، capacity indicators.
- Concurrency tests بطلبين متزامنين على نفس Envelope.

#### Gate

- لا توجد negative capacity.
- لا يسمح بـSelf Approval.
- Amendment مطلوب قبل أي تجاوز.
- طلبان متزامنان لا يستطيعان استهلاك نفس السعة.
- Cancel يحرر الجزء المتبقي فقط.

### Phase 4 — Recruitment Requisition Bridge

#### المطلوب

- إضافة nullable `StaffingRequestId`.
- إضافة `PlanningSource`.
- Migration: `LinkStaffingRequestsToJobRequisitions`.
- جميع البيانات القديمة تُعلّم `Legacy`.
- Web/Mobile requisition forms تعرض approved requests المتاحة فقط.
- اختيار Staffing Request إجباري بعد تفعيل enforcement.
- Organization fields تملأ تلقائيًا وغير قابلة للتلاعب.
- Quota allocation/release داخل transaction.
- تحديث headcount summary ليستخدم Envelope بدل `Position.TargetHeadcount` للطلبات المخططة.

#### Rollout

1. تطبيق schema المتوافقة.
2. نشر API بقراءة الحقول الجديدة.
3. نشر Web وMobile.
4. تفعيل `WorkforcePlanningEnforcementEnabled`.
5. بعد التفعيل، لا يسمح بإنشاء Legacy records جديدة.

#### Gate

- لا يوجد Requisition جديد بلا Staffing Request.
- لا يوجد تجاوز للـquota.
- الإلغاء يعيد unfilled quota.
- السجلات القديمة ما زالت قابلة للعرض دون تاريخ مزيف.

### Phase 5 — Job Offer Approval & Atomic Hire

#### المطلوب

- إضافة الحالتين 7 و8 دون تغيير الحالات 1–6.
- Approval history.
- Commands: Submit، Approve، Reject Approval، Issue.
- تعديل Web/Mobile offer actions.
- Migration: `AddJobOfferApprovalGovernance`.
- إعادة بناء Hire كـCQRS Command ذري.
- إضافة idempotency وunique constraints.
- Fault-injection integration tests.

#### Gate

- العروض القديمة لا تتغير حالتها.
- لا يسمح بـIssue من `Draft`.
- لا يسمح بـHire من `Issued`؛ الحالة المطلوبة هي `Accepted` فقط.
- فشل أي خطوة يعيد قاعدة البيانات بالكامل.
- Retry لا ينشئ Employee ثانيًا.
- التكلفة الأعلى من الحجز تفشل برسالة واضحة.

### Phase 6 — Trace & Plan vs Commitment

#### المطلوب

- Trace projection فقط؛ لا Aggregate ضخم أو N+1 queries.
- Endpoints صريحة لكل نوع، وليس `entityType` حرًا.
- Paginated Fiscal Year summary.
- `TraceNodeDto` و`TraceEdgeDto`.
- إخفاء الرواتب دون صلاحية `WorkforcePlanning:ViewFinancials`.
- Web framer-motion tree مع accessible list/modal.
- Mobile chronological step timeline.
- Plan vs Commitment tables.
- تظل Payroll Actuals في حالة `Deferred`.

#### Gate

- Trace لا يكشف بيانات شركة أخرى.
- لا يوجد PII أو salary leakage.
- Query bounded ومصفحة.
- كل node يعود إلى source entity حقيقي.

### Phase 7 — Final Documentation, Database & Release Reconciliation

#### المطلوب

- إنشاء الكتب الأربعة:
  - `documentation/project/WORKFORCE_PLANNING_FEATURE_FULL_REVIEW.md`
  - `documentation/api/WorkforcePlanning_API_Implementation_Profile.md`
  - `documentation/web-next/features/workforce-planning-frontend-reference.md`
  - `documentation/mobile-react/workforce-planning-mobile-reference.md`
- إكمال `required-files.json`.
- تسجيل recipes.
- توليد الملفات الرسمية:
  - `PHASE-00-discovery-evidence.md`
  - `PHASE-01-domain-api.md`
  - `PHASE-02-web-client.md`
  - `PHASE-03-mobile-client.md`
  - `PHASE-04-domain-actions.md`
  - `PHASE-05-integration-runtime.md`
  - `PHASE-06-final-reconciliation.md`
- تطبيق جميع migrations على SQL Server Development.
- التأكد من عدم وجود pending model changes.
- تنفيذ authenticated smoke test على Web وMobile.
- تنفيذ UI audit الخماسي على المنصتين.

#### الأوامر النهائية

```powershell
dotnet test api/HrManagementSystem.Tests/HrManagementSystem.Tests.csproj

Set-Location web-next
npm run check
npm run test
npm run build

Set-Location ../mobile-react
npm run check

Set-Location ..
./documentation/system/Generate-Documentation.ps1 -Check
git diff --check
```

أي failure موروث من المستودع يسجل منفصلًا، لكنه لا يبرر فشل اختبار متعلق بالميزة.

## 5. Definition of Done النهائي

لا تعتبر الميزة مكتملة إلا إذا تحققت جميع الشروط التالية:

- السلسلة كاملة من Fiscal Year إلى Employee.
- كل Requisition جديد له Staffing Request.
- كل Staffing Request له Envelope وBudget وPlan وFiscal Year.
- لا توجد negative headcount أو salary capacity.
- لا يوجد self approval، باستثناء السماح المؤقت لدور `admin` باعتماد خطة القوى العاملة التي أنشأها حتى تطبيق صلاحيات اعتماد وفصل مهام مخصصة.
- لا يوجد enum data corruption.
- Hire ذرية وidempotent.
- API يستخدم CQRS بالكامل.
- Web وMobile يدعمان Creation/Edit/View/List/Filter/Mock Data.
- Arabic/English وRTL يعملان.
- Migrations مطبقة ومتحققة.
- الاختبارات والـarchitecture gates ناجحة.
- الكتب الأربعة وPhases 00–06 مكتملة.
- لا توجد placeholders أو Deferred UI مخفية على هيئة زر غير عامل.
