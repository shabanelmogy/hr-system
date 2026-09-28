> Imported 2026-09-28 from the School Management repository (`docs/API_BACKEND_COMPARISON.md`) as evidence for plan `erp-platform-template`. Not maintained here; decisions in `../DECISIONS.md` override it.

# مقارنة الـ Backend: HR API مقابل School/Standard API — وقرار أساس الـ Template

**التاريخ:** 2026-09-28

**المصادر:**
- `G:\test\hr-system\hr-system\api` (ErpSystem، modular monolith)
- `full-stack-school/api` + `templates/api/content/standard`

**النطاق في الـ HR API:** اتقرأ:
- الهيكل كامل: BuildingBlocks، و9 modules، والـ host، والاختبارات، والسكربتات
- `AGENTS.md`، و`Directory.Build.props`، و`Directory.Packages.props`، و`Program.cs`، وسجل الـ modules، و`IModule`، و`ModuleDefinition`، والـ pipeline، و`Result`، والـ entities الأساسية
- الـ Platform: auth orchestration، والـ Tenant، والـ Identity entities، والـ session validation، والـ audit، والـ notifications، والـ read-only middleware، والـ permissions
- `CountriesController` (feature مرجعي)، وسكربت `New-ErpModule.ps1`، و`CONFIGURATION.md`، وmُتحقق إعدادات النشر

**خارج النطاق:** تفاصيل modules الـ HR والمحاسبة، ومعظم الـ handlers، والـ Identity adapters (40KB)، والاختبارات من الداخل، ووثائق `../documentation`.

---

## 1. القرار المقترح

> **الـ HR API يبقى أساس الـ API في الـ template**، وننقل له أقوى أجزاء School/Standard. ومشروع المدرسة يتحول لاحقًا لـ **module** فوق نفس الأساس.

**ليه:**
1. الـ HR API **أوسع بكتير في الأساسيات** اللي حددناها للـ template.
2. **معمارية modular monolith جاهزة**: كل module ليه DbContext وmigrations وschema خاصة، وكتالوج modules بـ entitlements.
3. **تطبيق الموبايل مبني عليه بالفعل**، فمفيش إعادة كتابة للـ auth في الموبايل.

وفيه نقاط في School/Standard **أقوى** ولازم تتنقل (§4).

---

## 2. المقارنة

| الجانب | HR (ErpSystem) | School / Standard | الأفضل |
|---|---|---|---|
| المعمارية | Modular monolith: `BuildingBlocks` + `Modules/*` (Contracts/Domain/Application/Infrastructure/Presentation/Tests) + host | Clean Architecture طبقات (مشروع واحد لكل طبقة) | **HR** (أنسب لـ SaaS بـ modules) |
| تسجيل الـ Modules | `IModule` + `ErpModuleRegistry` صريح + dependencies + ترتيب إقلاع + فحص pending migrations لكل module | لا يوجد | **HR** |
| Entitlements | لكل module و**submodule** + `PermissionAccessMode` (TenantEntitlement / Tenant / Global) | entitlements على مستوى الـ permissions | **HR** |
| Tenancy | Tenant (lifecycle: active/archived/purge، subscription، max users/admins) + **Company** جوه الـ tenant (عملة، **TimeZoneId**، لوجو، شركة أم) | ManagedTenant + subscription + entitlements. مفيش company | **HR** |
| Read-only tenant | `TenantReadOnlyMiddleware` (اشتراك منتهي معناه قراءة بس) | الـ tenant المنتهي بيترفض | **HR** (تجربة أحسن للعميل) |
| Auth flow | login واحد بيرجع: `authenticated` أو `tenant-selection` أو `company-selection`، + switch company، + external login | select-token ثم access-token، + switch-token | **HR** (أبسط، ومتوافق مع الموبايل) |
| Session validation | security stamp + session id + tenant/company eligibility + refresh session نشط | session_version hash + revalidation كل request | متكافئين (بيتدمجوا) |
| Refresh rotation | rotation + grace 30 ثانية + تاريخ tokens | rotation + replay grace | متكافئين |
| Account self-service | register (flag)، وforgot/reset، وconfirm email، و**invitations** (entity + flow)، وemail sender (MailKit) | ناقص | **HR** |
| RBAC | roles لكل tenant (المستخدم ليه **أكتر من دور**) + permissions `Resource:Action` دقيقة (ممنوع `Manage`) + **فحص live كل request** للصلاحية + **ceiling** = entitlement الـ module/submodule للـ tenant + architecture tests + parity مع الويب والموبايل | multi-role + ceiling على مستوى كل permission + member type | **HR** (الـ ceiling بمستوى module/submodule أنسب لخطط SaaS) |
| Row-level scope | عزل **tenant + company** كامل (query filters + حماية في `SaveChanges` + composite FKs) + عمود Scope في مصفوفة الصلاحيات. **مفيش abstraction عامة للنطاق حسب العلاقة** ("سجلاتي"، "المسند لي"، "طلاب فصولي") | نطاق حسب العلاقة (teacher/parent/student) + IDOR 404 | **HR** للعزل، و**School** للنطاق حسب العلاقة |
| DB-level tenant integrity | **موجود وأقوى**: alternate keys `(TenantId, CompanyId, Id)` + composite FKs بين الـ entities + unique indexes جوه tenant/company | composite tenant FKs + check constraints (tenant بس) | **HR** |
| Business audit | `EntityChangeLogService` (diff قبل/بعد لكل entity) + شاشة في الموبايل | security audit بس (Standard) | **HR** |
| Notifications | inbox (قراءة/تصنيف/خطورة/مفاتيح ترجمة/dedup/action URL) + publisher + policy | لا يوجد | **HR** |
| Realtime | SignalR `GeneralHub` + groups + Redis backplane + dispatch بعد الـ commit | لا يوجد | **HR** |
| Background jobs | Hangfire + dashboard محمي + health check | لا يوجد | **HR** |
| الملفات | رفع + تحقق (حجم، نوع، اسم، signatures محظورة) + **ClamAV** + policy تخزين | لا يوجد | **HR** |
| Integration events | outbox/inbox interfaces + in-process publisher | لا يوجد | **HR** |
| Localization | resources + API لإدارة الترجمات + بيانات ثنائية اللغة (`NameAr/NameEn`) | JSON en/ar | **HR** (أغنى) |
| Offline policy | policy للعمليات المسموحة offline (للموبايل) | لا يوجد | **HR** |
| Soft delete / lifecycle | archive/restore/bulk archive (Countries) + حقول `IsDeleted` | restrict delete | **HR** |
| Concurrency | rowversion | rowversion + serializable guard لحالات السعة | متكافئين |
| CQRS | MediatR 12.5 + pipeline (logging + telemetry + validation) | Mediator source-generated (martinothamar) | **School** (ترخيص وأداء، §3) |
| إعدادات النشر | `HostDeploymentConfigurationValidator` (حوالي 17KB): أسرار، hosts، origins، HTTPS، ملفات، data protection، ممنوع seed/migrate في prod | AllowedHosts + بعض الفحوص | **HR** |
| Observability | Serilog + OpenTelemetry + metrics للـ CQRS + correlation | OpenTelemetry hook + correlation | **HR** |
| Package management | Central Package Management + global.json + TreatWarningsAsErrors + analyzers | مش في School (موجود في Standard) | **HR** |
| الاختبارات | tests لكل module (مثلًا Platform حوالي 320KB) + Architecture + Integration + BuildingBlocks | Unit + Architecture + Integration محدود | **HR** |
| Generators | `New-ErpModule.ps1` (module كامل) + `New-FeatureDocumentation.ps1` + تطبيق migrations + فحص model drift. **مفيش generator لمنتج/workspace جديد** | workspace generator (API + Web) + profiles + post-generation checks + CI | **HR** للـ module والـ feature docs، و**School** للـ workspace |
| نظام التخطيط | **كامل وأنضج**: `documentation/plans` (discovery interview، وevidence audit، وspec، وbusiness plan، وquality gates، وregistry، و`New-BusinessPlan.ps1`، و`Check-Planning.ps1`) + `documentation/system` (وثائق feature بـ 8 مراحل من 00 لـ 07 تغطي API وويب وموبايل + recipe manifest + generator) | `templates/planning` (tool-agnostic، ومربوط بالـ manifest والـ generators) | **HR** كأساس، ومن School الـ router العام والربط بالـ generators |
| Web BFF | **موجود وأشمل** (`web-next`): `app/api/[...path]` + منع path traversal + رفض cross-site (Sec-Fetch-Site + Origin) + allowlist للـ headers + حد لحجم الـ body + cookies HttpOnly/Secure/Lax + timeouts + refresh + telemetry + CSP report + proxy لـ SignalR و Hangfire | BFF آمن + CSP nonce + prefix allowlist | **HR** (والـ prefix allowlist والـ nonce CSP من Standard إضافات صغيرة) |

---

## 3. مشاكل في الـ HR API لازم تتصلح قبل ما يبقى template

| # | المشكلة | الخطورة | الحل |
|---|---|---|---|
| 1 | **MediatR 12.5**. آخر نسخة مجانية، والإصدارات الأحدث بترخيص تجاري | عالي (مستقبلي) | إما تثبيت 12.5 وتوثيقه، أو الانتقال لـ `Mediator` source-generated زي المدرسة. الـ handlers شكلها قريب، فالنقل ميكانيكي |
| 2 | **مكتبات بترخيص تجاري أو خاص** في الـ Packages: `Syncfusion.Blazor.SfPdfViewer`، و`EFCore.BulkExtensions` (dual license)، وCrystal Reports | عالي | برّه الـ template core. تبقى في modules اختيارية بتوضيح الترخيص |
| 3 | بقايا legacy: فولدرات `HrManagementSystem.*` (bin/obj بس)، و`CrystalReportGeneratorApi.rar` (14MB) في الريبو، و`packages/` (NuGet قديم لـ .NET Framework)، ومفتاح correlation باسم `HrManagementSystem.CorrelationId` | متوسط | تنظيف قبل الاستخلاص |
| 4 | الـ Identity tables لسه ملك "legacy adapter" (التعليقات بتقول كده)، والـ Platform فيه adapters كبيرة (حوالي 40KB و32KB) | متوسط | إكمال نقل ملكية الـ Identity للـ Platform قبل ما يتعمم |
| 5 | `System.Data.SqlClient` (deprecated) و`Newtonsoft.Json` جنب `System.Text.Json` | متوسط | `Microsoft.Data.SqlClient` + System.Text.Json بس |
| 6 | `System.Linq.Dynamic.Core` للفرز بـ `ColumnName` نصي | متوسط | allowlist لأعمدة الفرز لكل query (محتاج تحقق إن ده موجود) |
| 7 | `AuditableEntity` بـ public setters + `CreatedByPc` (أسلوب desktop ERP) | منخفض | base entity بـ setters محمية، والـ audit يتملّى من interceptor، ونشيل `*ByPc` |
| 8 | سياسة الـ refresh (14 يوم) ثوابت في الكود | منخفض | options من الإعدادات |
| 9 | Asp.Versioning 8.1 (School على 10) | منخفض | ترقية |
| 10 | الوثائق خارج الـ api (`../documentation`) + نظام توليد وثائق خاص | متوسط | جوه الـ template + نظام التخطيط |
| 11 | النطاق حسب العلاقة (own/assigned/related) مش موجود كـ abstraction عامة | متوسط | abstraction عامة في الـ BuildingBlocks (من نمط المدرسة) |

---

## 4. اللي يتنقل من School/Standard للأساس الجديد (بعد التحقق)

> **تصحيح:** النسخة الأولى من الوثيقة دي اتكتبت قبل ما أقدر أوصل لـ `web-next` و`documentation`. بعد التحقق من الكود، طلع إن الـ HR فيه بالفعل أغلب النقاط اللي كنت محسوبها على المدرسة، وغالبًا بشكل أنضج:
>
> | النقطة | موجودة في الـ HR؟ | الدليل |
> |---|---|---|
> | عزل الـ tenant على مستوى الـ DB | ✅ وأقوى (tenant + company) | `EmployeeConfiguration`، و`DepartmentConfiguration`، و`PositionConfiguration`: `HasAlternateKey(TenantId, CompanyId, Id)` + composite FKs. و`ApplicationDbContext`: query filters + حماية `SaveChanges` |
> | Multi-role + permission ceiling | ✅ | `IPlatformAuthorizationSource.GetUserRoleIdsAsync` (أكتر من دور)، و`PermissionAuthorizationHandler`: claim + فحص live للصلاحية + entitlement الـ module/submodule |
> | Web BFF آمن | ✅ وأشمل | `web-next/src/app/api/[...path]/route.ts`، و`lib/api/proxy-security.ts`، و`lib/auth/cookies.ts` |
> | نظام التخطيط | ✅ وأنضج | `documentation/plans/*` + `documentation/system/*` |
> | صلاحيات على مستوى الصف حسب العلاقة | ⚠️ جزئي | العزل tenant/company موجود. النطاق حسب العلاقة ("سجلاتي/المسند لي") مش موجود كـ abstraction عامة |
> | Workspace generator | ❌ | موجود `New-ErpModule` بس، مش generator لمنتج جديد |

اللي فعلًا يتنقل من School/Standard:

1. **Workspace generator**: توليد منتج جديد (API + Web + Mobile) من template، مع profiles وpost-generation checks وCI.
2. **Relationship-based resource scope**: abstraction عامة (`IResourceScope`: own / assigned / related-through) + IDOR 404 + اختبارات. تتضاف للـ BuildingBlocks. وmodule المدرسة هيحتاجها أكيد.
3. **Mediator source-generated** بدل MediatR (لو اتقرر، §3 بند 1).
4. **إضافات صغيرة للـ BFF**: prefix allowlist للمسارات المسموحة، وnonce-based CSP (لو مش موجود، محتاج تحقق من `next.config.ts`).
5. **من `templates/planning`**: الـ router العام (`AGENTS.md` + `START_HERE`) علشان أي أداة AI تشتغل عليه، والربط بين الخطة والـ manifest والـ generators. والباقي يتدمج في نظام التخطيط بتاع الـ HR بدل ما يبقى فيه نظامين.

## 5. عقد الـ Auth الموحّد (القرار)

| البند | القرار |
|---|---|
| الدخول | `POST /auth/login` بيرجع **واحدة من 3**: `authenticated` أو `requiresTenantSelection` أو `requiresCompanySelection` (نمط HR، والموبايل شغال عليه بالفعل) |
| الاختيار | `POST /auth/select-tenant` و `POST /auth/select-company` بـ selection token قصير العمر |
| التبديل | `POST /auth/switch-company`. ويتضاف `switch-tenant` (موجود في Standard) |
| Single-tenant / single-company | لو فيه tenant واحد وcompany واحدة، الدخول مباشر. والـ Company **optional**: لو الـ module "Organization units" مش مفعّل، بتتعمل company افتراضية واحدة لكل tenant ومش بتظهر في الـ UI |
| الجلسات | refresh rotation + grace، وsession validation (HR) + session version (Standard)، و**جلسات لكل جهاز** مع audience منفصل للويب والموبايل |
| الويب | عن طريق الـ BFF (cookies). والموبايل: مباشرة (SecureStore) |
| Self-service | register (flag)، وforgot/reset، وconfirm email، وinvitations. وكلها بـ deep links (موجودة في الموبايل) |
| أسماء الـ permissions | **`Resource:Action`** (نمط HR، وعليه اختبار parity في الموبايل)، والويب يتحول ليه |

---

## 6. شكل الـ API في الـ template

```text
apps/api/
├── BuildingBlocks/            Domain · Application (pipeline, Result, pagination, realtime) · Context
│                              Authorization · Messaging (outbox/inbox) · Modularity · Presentation
├── Modules/
│   ├── Platform/              Identity · Auth · Tenancy · Companies (optional) · RBAC · Entitlements
│   │                          Invitations · Sessions · Audit (change log + security) · Localization
│   ├── Notifications/         inbox + email + push (Expo) + realtime   (يتفصل من Platform)
│   ├── Files/                 upload + inspection + storage providers (+ ClamAV optional)
│   ├── Jobs/                  Hangfire + dashboard (optional)
│   └── Sample/                feature مرجعي على نمط Countries (list/lookup/create/bulk/archive/restore/audit/realtime)
├── Host/                      Program + deployment validator + observability + health
├── Tests/                     Architecture · Integration (Testcontainers SQL) · لكل module
└── scripts/                   New-Module · New-Feature · Apply-Migrations · Test-ModelDrift
```

---

## 7. مشروع المدرسة بعد القرار

| الخيار | المعنى | التقييم |
|---|---|---|
| (أ) المدرسة تبقى reference منفصل زي ما هي | مفيش تكلفة، بس الـ drift يرجع | مش موصى بيه على المدى الطويل |
| (ب) **المدرسة تتحول لـ `Modules/School`** فوق الأساس الجديد | الـ domain (طلاب، فصول، دروس، نتائج…) بيتنقل، والـ platform بتاعها بيتشال | **موصى بيه**. بيثبت إن الـ template شغال على domain تاني غير HR |
| (ج) نقل جزئي | الـ entities والـ rules بس، والشاشات بعدين | خطوة وسطى لو الوقت ضيق |

الترتيب المقترح: الأساس الأول (§3 و§4)، بعدين المدرسة كـ module، وفي الأثناء الويب بيتكيف على عقد الـ auth الجديد.

---

## 8. الخطوات الجاية

| # | الخطوة | الناتج |
|---|---|---|
| 1 | ✅ composite FKs (موجودة). والمتبقي: الـ sort allowlist، ومكان الـ Identity tables، والـ CSP في `web-next` | تأكيد القرار |
| 2 | قرار MediatR أو Mediator + قائمة المكتبات المسموحة في الـ core | Decision |
| 3 | تنظيف الـ HR API (البقايا، والمكتبات التجارية، و`SqlClient`، وNewtonsoft) | أساس نظيف |
| 4 | استخراج `apps/api` template: BuildingBlocks + Platform + Sample module + host + scripts | API template |
| 5 | إضافة resource scope + composite FKs + ceiling/multi-role من School/Standard | دمج أفضل ما في الاتنين |
| 6 | تكييف الويب BFF على عقد الـ auth الموحّد | ويب + موبايل على نفس العقد |
| 7 | `New-Feature` generator على نمط Countries (API) + الشاشات (ويب/موبايل) | "أمر واحد" |
| 8 | نقل المدرسة لـ `Modules/School` | إثبات على domain تاني |
