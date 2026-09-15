# Enterprise SaaS Core Roadmap

## الهدف

تحويل النظام الحالي من HR application متعدد الشركات إلى Enterprise SaaS جاهز للتشغيل الفعلي، مع الحفاظ على العزل بين العملاء، إدارة حسابات مركزية، قابلية التوسع، والتوافق التشغيلي والأمني.

هذه الوثيقة تفصل التعديلات المطلوبة حسب الأولوية. البنود المصنفة `P0` تمنع إطلاق Enterprise Pilot خارجي قبل إغلاقها.

## حالة التنفيذ

آخر تحديث: 2026-09-12

الحزم الثلاث الأولى من المرحلة 0 اكتملت واختُبرت:

- [x] إضافة `AuthenticationFeatureSettings` بسياسة default-deny.
- [x] إغلاق public self-registration داخل خدمة الـ backend افتراضيًا.
- [x] إغلاق Google auto-provision افتراضيًا مع السماح للمستخدم الموجود مسبقًا.
- [x] الحفاظ على opt-in configuration لاستخدام السلوكين مستقبلًا في منتج آخر.
- [x] إضافة اختبارات policy وarchitecture وinvitation وtenant-role/notification/realtime؛ جميع اختبارات الـ API ناجحة: `174/174`.
- [ ] إضافة service-level tests تستدعي تدفقات التسجيل وGoogle باستخدام dependencies فعلية أو test doubles.
- [x] تنفيذ Invitation / Account Activation Flow للمستخدمين المُدارين في الـ backend والويب والموبايل.
- [ ] تحويل إنشاء أول Tenant Admin إلى invitation ضمن Atomic Tenant Provisioning.
- [x] تنفيذ tenant-scoped roles migration وعزل JWT وnotifications وrealtime.

## الحالة الحالية المختصرة

الأساس الموجود جيد ويشمل:

- عزل بيانات `Tenant` و`Company` في `ApplicationDbContext`.
- Tenant lifecycle يدعم الإنشاء والأرشفة والاستعادة.
- Subscription status وseat limits وread-only mode عند انتهاء الاشتراك.
- RBAC وpermissions وجلسات قابلة للإلغاء وrefresh-token rotation.
- Security audit وcorrelation IDs وrate limiting.
- Hangfire وhealth checks وAPI versioning.
- إدارة Tenants وTenant Admins والمستخدمين والشركات على الويب والموبايل.

أهم ملفات الأساس الحالي:

- `api/Modules/HR/ErpSystem.Modules.HR.Infrastructure/Persistence/ApplicationDbContext.cs`
- `api/Modules/HR/ErpSystem.Modules.HR.Domain/Tenancy/Entities/Tenant.cs`
- `api/Modules/HR/ErpSystem.Modules.HR.Infrastructure/Dependencies/AuthenticationService.cs`
- `api/ErpSystem.Api/Program.cs`

---

## P0 — تعديلات مطلوبة قبل Enterprise Pilot

### 1. إغلاق التسجيل العام من الخادم

تم إغلاق التسجيل المجهول وGoogle auto-provision افتراضيًا من الخادم، مع إبقاء opt-in flags صريحة لاستخدام السلوكين مستقبلًا في منتج آخر.

الأماكن الحالية:

- `api/Modules/HR/ErpSystem.Modules.HR.Presentation/Features/Security/Authentication/V1/AuthController.cs`
- `api/Modules/HR/ErpSystem.Modules.HR.Infrastructure/Features/Security/Authentication/Services/AuthAccountService.cs`
- `api/Modules/HR/ErpSystem.Modules.HR.Infrastructure/Features/Security/Authentication/Services/AuthLoginService.cs`

التعديلات المطلوبة:

- [x] إضافة إعداد Backend واضح باسم `AuthenticationFeatureSettings:PublicSelfRegistrationEnabled` وقيمته الافتراضية `false`.
- [x] منع `RegisterAsync` من إنشاء حساب عندما تكون الخاصية مغلقة، وإرجاع business error ثابت باسم `Authentication.SelfRegistrationDisabled`.
- [x] إضافة `AuthenticationFeatureSettings:GoogleAutoProvisionEnabled` بقيمة افتراضية `false`.
- [x] السماح لـ Google login بالدخول لمستخدم موجود ومسموح فقط، بدون إنشاء مستخدم أو إسناده إلى default tenant تلقائيًا.
- [ ] عدم كشف ما إذا كان البريد مسجلًا أو مؤكدًا من خلال resend/forgot responses.
- [ ] إضافة اختبارات تؤكد أن تعطيل التسجيل يعمل حتى عند استدعاء الـ API مباشرة.
- [ ] إضافة اختبارات تؤكد أن Google user غير الموجود لا يتم إنشاؤه تلقائيًا.

معيار القبول:

- لا يمكن إنشاء أي مستخدم جديد من endpoint مجهول إلا من خلال invitation صالح أو feature flag مقصود ومفعّل صراحة.

### 2. بناء Invitation / Account Activation Flow

بما أن مستخدمي النظام يتم إنشاؤهم بواسطة الإدارة، يجب ألا يحدد الـ Admin كلمة مرور المستخدم أو يشاركها معه.

التعديلات المطلوبة:

- [x] إضافة كيان `UserInvitation` يحتوي على TenantId، البريد، الأدوار، الشركات، inviter، تاريخ الانتهاء والحالة.
- [x] تخزين hash للـ invitation token فقط وعدم تخزين القيمة الخام.
- [x] جعل invitation token قصير العمر، one-time use، وقابلًا للإلغاء وإعادة الإرسال.
- [x] إضافة endpoints للإدارة: create، resend، revoke، get status.
- [x] إضافة endpoint مجهول لقبول الدعوة وتعيين كلمة المرور وتأكيد البريد.
- [ ] إلغاء الدعوات السابقة عند تغيير البريد أو حذف/أرشفة المستخدم.
- [x] تسجيل create/resend/revoke/accept في `SecurityAuditEvent`.
- [x] إضافة migration معزولة لجدول الدعوات وفهارسه وعلاقاته.
- [x] إضافة صفحة قبول الدعوة في `web-next` ومسار App/Universal Link في `mobile-react`.
- [x] إضافة شاشة لإظهار pending/expired invitations وإعادة الإرسال والإلغاء للإدارة.

فجوات الإغلاق قبل الـPilot:

- [ ] تعطيل أو إزالة مسار `Users/Add` القديم الذي يسمح للمسؤول بتحديد كلمة مرور مباشرة، بعد التأكد من عدم وجود عميل قديم يعتمد عليه.
- [ ] نقل إنشاء أول Tenant Admin إلى invitation بدل استقبال كلمة مرور من Super Admin.
- [ ] إضافة اختبارات integration على SQL Server تغطي create/resend/revoke/accept والتزامن وحدود المقاعد.
- [ ] ضبط متغيرات App Links ونشر `assetlinks.json` و`apple-app-site-association` بالقيم الإنتاجية الفعلية.

معيار القبول:

- ينشئ المسؤول المستخدم بدون معرفة كلمة مروره، ويقوم المستخدم بتفعيل حسابه من رابط آمن صالح لمرة واحدة.

### 3. عزل الأدوار والصلاحيات بين الـ Tenants

تم تحويل `ApplicationRole` إلى نموذج system/global أو custom/tenant-owned، وعُزلت التعيينات وJWT والإشعارات والـrealtime. تغييرات الأدوار والصلاحيات أصبحت ذرّية على SQL Server: قفل تطبيق ثابت النطاق، mutation وaudit داخل المعاملة، ثم realtime/session-revocation بعد نجاح الـcommit. يبقى اختبار migration الخاص ببيانات legacy متعددة الـtenants خارج هذا الإغلاق.

الأماكن الحالية:

- `api/Modules/HR/ErpSystem.Modules.HR.Infrastructure/Features/Security/Authentication/Entities/ApplicationRole.cs`
- `api/Modules/HR/ErpSystem.Modules.HR.Infrastructure/Features/Security/Authorization/Services/RoleService.cs`
- `api/Modules/HR/ErpSystem.Modules.HR.Presentation/Features/Security/Authorization/V1/RolesController.cs`

التصميم المقترح:

- إبقاء `super_admin` و`admin` و`user` كـ platform roles ثابتة، `TenantId = null`، وغير قابلة للتعديل من Tenant Admin.
- جعل كل custom role مملوكًا لـ Tenant واحد، وليس Company واحدة، مع منع استخدام أسماء platform roles.
- الاحتفاظ بجداول Identity الحالية، مع جعل ملكية `AspNetUserRoles` و`AspNetRoleClaims` مشتقة من `RoleId`.
- استخدام role IDs في user assignments وJWT بدل الاعتماد على أسماء الأدوار عالميًا.

التعديلات المطلوبة:

- [x] تحديد `super_admin` و`admin` و`user` كـ platform roles غير قابلة للتعديل.
- [x] إضافة Tenant ownership للأدوار المخصصة والصلاحيات المرتبطة بها.
- [x] فرض tenant filter على القراءة والإنشاء والتعديل والحذف.
- [x] منع Tenant Admin من تعديل platform roles أو أدوار Tenant آخر.
- [x] إلغاء الجلسات المتأثرة بعد تغيير صلاحيات role.
- [x] تسجيل كل role/permission mutation في Security Audit داخل نفس المعاملة.
- [x] إضافة migration آمنة لتحويل الأدوار الحالية مع fail-fast عند تعذر استنتاج الملكية.
- [x] إضافة اختبارات عدائية تثبت عدم وجود cross-tenant role access.

متطلبات الـ migration:

- [x] إضافة `TenantId nullable` و`IsSystem` إلى `ApplicationRole`.
- [x] استبدال `RoleNameIndex` العالمي بفهرس فريد لأسماء system roles وفهرس فريد مركب `(TenantId, NormalizedName)` للأدوار المخصصة.
- [x] نسخ كل legacy custom role وclaims الخاصة به إلى كل Tenant كان يستخدمه، ثم تحويل user-role assignments إلى النسخة الصحيحة.
- [x] إيقاف migration إذا تعذر تحديد Tenant لدور مخصص أو لأي assignment.
- [ ] إضافة SQL Server integration fixture يتحقق من أعداد النسخ والـ claims والتعيينات على بيانات legacy متعددة الـtenants.
- [ ] تشغيل migration داخل maintenance window وبعد backup مجرب، لأنها لا تملك `Down` يعيد دمج نسخ اختلفت بعد التشغيل بشكل lossless.
- [x] تحديث JWT، notifications وrealtime queries لتقيد الدور بالـ selected Tenant وتتجاهل الدور المخصص المعطل.
- [x] تحديث الويب والموبايل بعقد `isSystem` إلزامي، وجعل system roles للعرض فقط، وإزالة role cache المستمر بين جلسات الويب.
- [x] إلغاء جلسات المستخدمين المتأثرين وتحديث security stamps بعد تغيير الدور أو صلاحياته؛ enqueue يحدث بعد نجاح الـcommit فقط.
- [x] استخدام realtime groups بصيغة `tenant:{tenantId}:permission:{permission}` و`tenant:{tenantId}:role:{roleId}` للأحداث المملوكة للـTenant، مع الإبقاء على audience عامة للأحداث المشتركة المراجعة فقط.

معيار القبول:

- تعديل Role داخل Tenant لا يغير claims أو وصول أي مستخدم تابع لـ Tenant آخر.

### 4. تأمين الأسرار وإعدادات الاتصال

تكوين التشغيل يجب أن يبقى خاليًا من أسرار الإنتاج، مع فشل مبكر عند غياب
إعدادات الإنتاج أو استخدام اتصال SQL غير موثق. القيم الفعلية تأتي من secret
manager أو environment variables، ولا تُكتب في ملفات الإعداد المتتبعة.

التعديلات المطلوبة:

- [ ] تدوير database وSMTP credentials الحالية.
- [x] إزالة القيم السرية من ملفات الإعداد واستبدالها بقيم فارغة أو placeholders.
- [x] استخدام environment variables أو secret manager في البيئات المستضافة.
- [ ] فحص Git history بحثًا عن أسرار سابقة واتخاذ قرار تنظيف التاريخ عند الحاجة.
- [x] تفعيل التحقق الصحيح من شهادة SQL وإلغاء `TrustServerCertificate=true` في الإنتاج.
- [x] تقييد `AllowedHosts` وCORS إلى النطاقات الفعلية.
- [x] إضافة secret scanning إلى CI.

تم تطبيق فحص Gitleaks على checkout الحالي في
`.github/workflows/api-ci.yml` باستخدام الإصدار المثبت `v8.29.1` وقائمة
استثناءات تقتصر على build/cache/vendor/binary outputs. فحص تاريخ Git السابق
وجد خمس نتائج legacy (إعدادات API قديمة، ملف `.env` للويب، وملف private-key
قديم). لم يُعاد كتابة التاريخ تلقائيًا؛ تدوير الاعتمادات ومراجعة purge معتمد
للتاريخ ما زالا شرط إصدار قبل اعتبار المستودع خاليًا من الأسرار التاريخية.

`HostDeploymentConfigurationValidator` يفشل تشغيل Production قبل تسجيل
الخدمات عند غياب اتصال فعلي لأي Module أو Hangfire، أو عند استخدام wildcard
hosts/CORS غير آمن، أو secrets placeholder، أو startup migrations/seeding.

معيار القبول:

- يمكن مشاركة المستودع بدون كشف أي secret، ويفشل التشغيل مبكرًا إذا غابت إعدادات الإنتاج المطلوبة.

### 5. Atomic Tenant Provisioning

إنشاء Tenant يجب أن يكون use case واحدًا، وليس خطوات يدوية منفصلة قد تترك Tenant ناقصًا.

أُغلقت طبقة الأساس الحالية داخل مسار إنشاء الـTenant: فحص الحالة والـentitlements
قبل الكتابة، وقفل SQL Server ثابت مشتق من identifier، ومعاملة واحدة تنشئ الـTenant
والـDEFAULT Company والـentitlements وسجل `TenantCreated` ثم تحفظ مرة واحدة. يتم
إرسال realtime بعد نجاح الـcommit وبشكل best-effort مع تسجيل الفشل، لذلك لا يحوّل
تعطل SignalR أو Hangfire عملية مكتملة إلى استجابة فاشلة.

التدفق المطلوب:

`Tenant → Default Company → Admin Invitation → Default Roles/Policies → Tenant Settings → Audit`

التعديلات المطلوبة:

- [ ] إنشاء `TenantProvisioningService` أو use case مستقل.
- [x] تنفيذ خطوات قاعدة البيانات داخل transaction واحدة.
- [x] إنشاء default company تلقائيًا بالرمز `DEFAULT` والقيم الأساسية الحالية.
- [x] تسجيل `TenantCreated` ضمن نفس عملية الحفظ.
- [x] تنفيذ realtime post-commit بشكل best-effort بعد نجاح الحفظ.
- [ ] إنشاء baseline tenant settings تلقائيًا.
- [ ] إنشاء invitation للـ initial tenant admin بدل استقبال كلمة مرور منه.
- [ ] إضافة idempotency key لمنع تكرار Tenant عند إعادة الطلب.
- [ ] إضافة provisioning status واضح: pending، ready، failed.
- [ ] إرسال البريد والعمليات الخارجية بعد نجاح transaction فقط.
- [ ] توفير recovery/retry آمن عند فشل إرسال الدعوة.

معيار القبول:

- إما أن يصبح الـ Tenant جاهزًا بالكامل، أو لا تُحفظ أي حالة جزئية غير قابلة للاستكمال.

---

## P1 — HR Core المطلوب للمنتج الأساسي

كيانات HR الأساسية موجودة في Domain، لكنها مستبعدة حاليًا من EF ولا توجد لها Application/Infrastructure features مكتملة.

الدليل:

- `api/Modules/HR/ErpSystem.Modules.HR.Infrastructure/Persistence/ApplicationDbContext.cs`
- `api/Modules/HR/ErpSystem.Modules.HR.Domain/Employees/Entities/Employee.cs`
- `api/Modules/HR/ErpSystem.Modules.HR.Domain/OrganizationalStructure/Entities/Department.cs`
- `api/Modules/HR/ErpSystem.Modules.HR.Domain/OrganizationalStructure/Entities/Position.cs`
- `api/Modules/HR/ErpSystem.Modules.HR.Domain/Employees/Entities/EmployeeContract.cs`

### 6. Organizational Structure

- [ ] Persist Company, Branch, Division, Department, Job Title, Job Level وPosition.
- [ ] إضافة EF configurations، indexes، foreign keys وmigrations.
- [ ] فرض Tenant/Company ownership على كل علاقة.
- [ ] دعم effective dates للتغييرات التنظيمية المهمة.
- [ ] إضافة CRUD/use cases والواجهات المطلوبة.
- [ ] بناء organization tree قابل للبحث والتصفية.

### 7. Employee Master

- [ ] Persist `Employee` وربطه بحساب المستخدم اختياريًا.
- [ ] تعريف employee number كـ business key داخل Tenant/Company.
- [ ] تخزين البيانات الشخصية والوظيفية مع فصل الحقول الحساسة.
- [ ] دعم archive/restore وعدم الحذف المباشر للسجلات المرتبطة.
- [ ] إضافة document attachments مع access policies.
- [ ] إضافة history للتعيين الوظيفي والمدير والقسم والموقع.
- [ ] إضافة bulk import مع validation وpreview وerror report.

### 8. Employee Lifecycle

- [ ] Onboarding checklist وقوالب قابلة للتخصيص لكل Tenant.
- [ ] Employee assignment وcontract lifecycle.
- [ ] Transfers، promotions، contract renewal وtermination.
- [ ] Offboarding checklist وإلغاء الوصول والجلسات عند الحاجة.
- [ ] Approval workflow للأحداث التي تحتاج اعتمادًا.
- [ ] إشعارات وتصعيد للمهام المتأخرة.

### 9. Leave and Approvals MVP

- [ ] Leave types وسياسات الاستحقاق.
- [ ] Leave balances وopening balances.
- [ ] طلب إجازة مع validation للتعارض والرصيد.
- [ ] multi-step approval قابل للتخصيص.
- [ ] delegation وescalation وaudit history.
- [ ] تقويم فريق مع تطبيق صلاحيات الوصول.

ملاحظة نطاق:

- Attendance، Payroll وBenefits مراحل مستقلة؛ لا يفضل ضمها إلى أول HR MVP قبل تحديد الدول والقواعد القانونية المستهدفة.

---

## P1 — Enterprise Identity and Access

### 10. MFA and Session Governance

- [ ] TOTP authenticator مع recovery codes.
- [ ] MFA policy على مستوى Tenant ودعم enforcement حسب الدور.
- [ ] step-up authentication للعمليات الحساسة.
- [ ] صفحة active sessions/devices وإلغاء جلسة محددة أو جميع الجلسات.
- [ ] تنبيه المستخدم عند تسجيل دخول أو تغيير أمني حساس.
- [ ] configurable password وlockout policies لكل Tenant ضمن حدود آمنة.

### 11. Enterprise SSO

- [ ] دعم OIDC كخيار أول.
- [ ] إضافة SAML عند وجود عميل يحتاجه تعاقديًا.
- [ ] ربط domain/issuer بالـ Tenant بشكل صريح.
- [ ] منع Just-In-Time provisioning افتراضيًا، أو تقييده بسياسة Tenant واضحة.
- [ ] تعريف سلوك المستخدم عند تعطيل IdP أو حذف حسابه.
- [ ] إضافة SCIM provisioning عندما يصبح مطلبًا تعاقديًا.

---

## P1 — Plans, Entitlements and Commercial Control

الحالة الحالية تعتمد على `PlanName` نصي، تواريخ الاشتراك، وحدود المستخدمين. المطلوب فصل الخطة عن صلاحيات المستخدم.

التعديلات المطلوبة:

- [ ] إضافة `Plan`, `Feature`, `PlanFeature` و`TenantEntitlement`.
- [ ] إضافة limits/quotas قابلة للقياس بدل الاكتفاء بعدد المستخدمين.
- [ ] إنشاء authorization policy أو feature gate مركزي للـ backend.
- [ ] إرسال entitlements اللازمة للواجهات بدون الاعتماد على إخفاء عناصر UI فقط.
- [ ] تعريف behavior واضح لحالات trial، active، past due، expired وcancelled.
- [ ] تعريف downgrade policy وما يحدث للبيانات التي تتجاوز الخطة الجديدة.
- [ ] إضافة usage metering للخصائص القابلة للفوترة.

ملاحظة:

- Billing automation وpayment provider ليسا شرطًا إذا كانت العقود والفواتير تتم يدويًا، لكن entitlement enforcement داخل النظام شرط أساسي.

---

## P1 — Audit, Compliance and Data Governance

### 12. Audit Completeness

- [x] تسجيل تغييرات roles وpermissions في `SecurityAuditEvent`؛ تبقى تغييرات API keys ضمن بند مستقل.
- [x] ضمان أن audit record وbusiness change لتغييرات RBAC ينجحان أو يفشلان بصورة متسقة داخل transaction واحدة.
- [x] منع تسجيل change log أو إرسال realtime/session-revocation لعملية RBAC فشلت لاحقًا.
- [ ] إضافة filters، export وصلاحيات مستقلة لعرض الـ audit.
- [ ] إضافة actor، tenant، company، IP، correlation ID وreason عند العمليات الحساسة.
- [ ] منع تعديل أو حذف سجلات التدقيق من التطبيق.

### 13. Retention, Privacy and Tenant Exit

- [ ] سياسات retention للـ audit، notifications، sessions، Hangfire، الملفات والبيانات الشخصية.
- [ ] تنفيذ purge job فعلي لـ `PurgeScheduledOn` بدل بقائه كحالة فقط.
- [ ] legal hold يمنع الحذف عند الحاجة.
- [ ] Tenant data export موثق قبل الإغلاق.
- [ ] deletion/anonymization workflow للبيانات الشخصية.
- [ ] تسجيل وإثبات تنفيذ purge/export.
- [ ] تحديد data residency وRPO/RTO حسب بيئة الاستضافة.

---

## P1 — Reliability and Integrations

### 14. Outbox and Idempotency

- [ ] استخدام transactional outbox للأحداث التي يؤدي فقدها إلى أثر تجاري أو أمني.
- [x] تطبيق transactional outbox لمسار Contacts Party إلى Accounting مع commit ذري داخل الموديول.
- [x] إبقاء realtime refresh غير الحرج بعد commit وعلى Hangfire عند ملاءمته.
- [ ] إضافة idempotency layer لطلبات create الحرجة والـ webhooks.
- [x] إضافة Inbox receipt idempotent داخل Accounting للأحداث المستهلكة الحالية.
- [ ] إضافة deduplication keys للرسائل الخارجية عند إضافة broker/webhooks.
- [x] تنفيذ bounded retry وdead-letter وstale-processing recovery ومراقبة readiness لمسار Contacts الحالي.

### 15. API Keys and Integration Platform

إدارة API keys موجودة، لكن لا يوجد authentication handler يستخدمها كطريقة دخول فعلية.

- [ ] إضافة API key authentication scheme.
- [ ] ربط كل key بـ Tenant/Company وscopes محددة.
- [ ] دعم expiry، rotation، revoke وlast-used information.
- [ ] إضافة rate limits مستقلة لكل key.
- [ ] تسجيل الاستخدام والفشل في Security Audit بدون تسجيل السر نفسه.
- [ ] إضافة webhook subscriptions مع signing secret وdelivery logs.

### 16. Distributed Runtime Readiness

- [x] تفعيل forwarded headers اختياريًا بقوائم trusted proxies/networks صريحة قبل الاعتماد على client IP، مع رفض المصادر غير الموثوقة وشبكات `/0`.
- [ ] استخدام distributed rate limiting أو gateway عند تعدد instances.
- [x] إضافة Redis SignalR backplane اختياري مع channel prefix وعقد session affinity للتوسع الأفقي.
- [ ] نقل الملفات إلى object storage مشترك مع encryption وbackup.
- [x] إضافة Platform-owned content validation لمسارات الرفع الحالية قبل أي binary/metadata write، مع
  extension/content-type/signature checks وClamAV `INSTREAM` اختياري fail-closed.
- [x] دعم Redis distributed cache اختياريًا مع بقاء الذاكرة المحلية هي الوضع الافتراضي للـ single instance.

---

## P1 — Production Operations

### 17. CI/CD and Migrations

- [x] إضافة CI للـ API والويب والموبايل.
- [x] إضافة API CI يبني ويختبر Release وينتج publish artifact ويتحقق من بناء صورة الإنتاج بدون push.
- [x] إضافة Web CI لتشغيل architecture وlint وtype checks العادية وstrict والاختبارات وNext production build دون أسرار.
- [x] إضافة Mobile CI لتشغيل typecheck وlint وarchitecture والاختبارات، دون EAS أو نشر.
- [x] إضافة فحص ثغرات NuGet المباشرة والمتعدية وSPDX SBOM مُتحقق منه كـCI artifacts.
- [x] إضافة secret scanning للـ current tree باستخدام Gitleaks.
- [x] فحص EF migration model drift لكل Module DbContext حالي.
- [x] تنفيذ migrations كخطوة deployment محكومة بدل الاعتماد على startup migration في الإنتاج.
- [ ] إضافة approval gates وبيئات dev/staging/production.
- [ ] إضافة image signing وprovenance attestation عند اختيار registry ومنصة النشر.
- [x] توثيق rollout وrollback/forward-fix strategy للـ API.

### 18. Backups and Disaster Recovery

- [ ] backups مجدولة لقاعدة البيانات وHangfire/file storage.
- [ ] تشفير النسخ الاحتياطية وتقييد الوصول إليها.
- [ ] restore drills دورية وليست مجرد وجود backup.
- [ ] تحديد RPO وRTO قابلين للقياس.
- [ ] توثيق disaster recovery runbook.

### 19. Observability and SLOs

- [x] إضافة OpenTelemetry traces وmetrics عبر OTLP مع spans/metrics داخل CQRS، مع الإبقاء على Serilog للـ structured logs.
- [ ] error tracking مركزي.
- [ ] dashboards للـ API latency/error rate، SQL، Hangfire queues والـ email failures.
- [ ] alerts للـ failed jobs، readiness failures، ارتفاع 5xx وارتفاع latency.
- [ ] correlation بين web proxy والـ API والـ background jobs.
- [ ] تعريف SLOs وerror budgets للخدمات الأساسية.
- [ ] سياسة redaction وretention للـ logs تمنع تسريب PII أو credentials.

---

## Frontend and Mobile Direction

### 20. Web

- [ ] Tenant setup wizard: الشركة، الفروع، الهيكل، الـ admin invitation والإعدادات الأساسية.
- [x] Invitation management UI.
- [ ] MFA enrollment وsession management.
- [ ] Entitlement-aware navigation مع enforcement فعلي من الخادم.
- [ ] Audit viewer مع filtering/export.
- [ ] Bulk employee import workflow مع preview وvalidation report.
- [ ] Accessibility audit باستخدام automated checks واختبارات keyboard/screen reader.

### 21. Mobile

- [ ] تحديد نطاق الموبايل رسميًا كـ employee/manager self-service أو admin app.
- [ ] إذا كان Employee Self-Service: profile، leave، approvals، notifications وdocuments هي الأولوية.
- [ ] عدم محاولة نسخ كل شاشات إدارة الويب بدون احتياج منتج واضح.
- [x] دعم invitation/activation.
- [ ] دعم MFA وsession management.
- [ ] دعم push notifications مع preference center.
- [ ] توثيق السلوك عند offline والتعارضات وإعادة المحاولة.

---

## P2 — تحسينات بعد استقرار الأساس

- [ ] Custom branding وcustom domains لكل Tenant.
- [ ] Notification preferences، digests وescalations.
- [ ] Delegated administration وsupport impersonation مع audit صارم.
- [ ] Saved views وshared reports وusage analytics.
- [ ] SIEM export وtamper-evident audit storage.
- [ ] Data residency حسب المنطقة.
- [ ] Localization workflow للعملات والتوقيتات والتنسيقات، وليس ترجمة النصوص فقط.
- [ ] Public API documentation، SDKs، sandbox وintegration monitoring.
- [ ] Payroll، attendance وbenefits حسب الدولة والنطاق التجاري.

---

## ترتيب التنفيذ المقترح

### المرحلة 0 — Security Closure

1. إغلاق server-side registration وGoogle auto-provision.
2. تدوير وإخراج الأسرار من المستودع.
3. حماية platform roles وعزل tenant roles.

### المرحلة 1 — Provisioning Foundation

1. User invitation/activation.
2. Atomic tenant provisioning.
3. Tenant setup wizard.
4. اختبارات عزل حقيقية باستخدام SQL Server.

### المرحلة 2 — HR MVP

1. Organizational structure persistence.
2. Employee master.
3. Assignments/contracts.
4. Onboarding/offboarding.
5. Leave and approvals.

### المرحلة 3 — Enterprise Access

1. MFA.
2. OIDC SSO.
3. Session/device governance.
4. SCIM حسب متطلبات العملاء.

### المرحلة 4 — Commercial and Compliance

1. Entitlements and quotas.
2. Audit completeness.
3. Retention، export وtenant purge.
4. Billing integration إذا كان نموذج البيع self-service.

### المرحلة 5 — Production Scale

1. CI/CD وcontrolled migrations.
2. Backups وrestore drills.
3. Observability وalerts وSLOs.
4. Object storage، outbox وidempotency.

---

## قرارات منتج مطلوبة قبل توسيع التنفيذ

- [ ] هل أول HR MVP يشمل Leave فقط أم Attendance أيضًا؟
- [ ] هل Payroll جزء من المنتج أم integration مع مزود خارجي؟
- [ ] هل البيع بعقود Enterprise يدوية أم self-service billing؟
- [ ] هل الموبايل Employee Self-Service أم يجب أن يحتوي على الإدارة الكاملة؟
- [ ] ما موفر الـ SSO المستهدف أولًا: Microsoft Entra ID أم مزود عام OIDC؟
- [ ] ما الدول ومتطلبات data residency والاحتفاظ القانونية المستهدفة؟

## Definition of Done للـ Enterprise Foundation

يعتبر الجزء الأساسي جاهزًا عندما تتحقق الشروط التالية:

- لا يوجد إنشاء مستخدم غير مقصود من أي public endpoint أو external login.
- كل عمليات roles والبيانات معزولة ومختبرة بين Tenants.
- إنشاء Tenant ينتج بيئة مكتملة وقابلة للاستخدام بدون خطوات يدوية غير موثقة.
- المستخدم يفعّل حسابه من invitation ولا يعرف المسؤول كلمة مروره.
- لا توجد أسرار إنتاج داخل Git.
- HR MVP المتفق عليه persisted ومغطى باختبارات عزل وتكامل.
- كل feature مدفوعة enforced من الخادم بواسطة entitlements.
- توجد backups مجربة، CI/CD، migration process، monitoring وalerts.
- توجد سياسات audit، retention، export وtenant termination قابلة للتنفيذ والإثبات.
