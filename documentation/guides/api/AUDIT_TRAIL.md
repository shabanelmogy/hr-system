# سجل العمليات (Audit Trail)

سجل واحد للنظام كله فيه كل **إضافة / تعديل / حذف / استرجاع** لأي سجل بيانات،
بيتسجل **تلقائيًا** من غير ما أي شاشة تكتب كود تسجيل.

> بيحل محل نظام `EntityChangeLog` / Track Changes القديم (اتشال بالكامل).

## الفكرة ببساطة

1. أي كلاس بيورث `AuditableEntity` (أو بيطبق `IAuditedEntity`) بيتسجل تلقائيًا.
2. عند كل `SaveChanges` فيه "مراقب" واحد مشترك
   (`AuditTrailSaveChangesInterceptor`) بيشوف إيه اللي اتغير ويكتب سطر في جدول
   `AuditTrailEntries` **جوه نفس الموديول ونفس الـ schema** (`ref`, `hr`, `acc` …).
3. السطر بيتحفظ **مع** التغيير نفسه في نفس الـ transaction:
   لو التغيير فشل، السجل مش بيتكتب، والعكس.
4. شاشة "سجل العمليات" في الـ Platform بتجمع السجلات من كل الموديولات
   (من غير ما تقرأ جداول موديول تاني مباشرة) عن طريق `IAuditTrailSource`
   اللي كل موديول بيسجله.

## أنواع العمليات

| العملية | إمتى بتتسجل | التفاصيل اللي بتتحفظ |
| --- | --- | --- |
| `Created` | سجل جديد | كل الحقول بقيمها (بعد ما الـ Id الحقيقي يتولد) |
| `Modified` | تعديل حقل أو أكتر | الحقول اللي اتغيرت بس: قبل ← بعد |
| `Deleted` | حذف فعلي أو أرشفة (`IsDeleted` بقت `true`) | آخر قيم قبل الحذف |
| `Restored` | استرجاع (`IsDeleted` رجعت `false`) | أي حقول اتغيرت مع الاسترجاع |

لو التعديل كان في حقول "إدارية" بس (زي `UpdatedOn`) مش بيتسجل سطر.

## إيه اللي مش بيتسجل

- حقول الإدارة: `CreatedOn/By/ByPc`, `UpdatedOn/By/ByPc`, `DeletedOn/By/ByPc`,
  `IsDeleted`, `RowVersion`, `TenantId`, `CompanyId`.
- أي حقل اسمه فيه `Password`, `Secret`, `Token`, `Hash`, `Salt`, `PrivateKey`.
- حقول Identity الداخلية (`SecurityStamp`, `ConcurrencyStamp`, `Normalized*`, `AccessFailedCount`, `LockoutEnd`).
- أي كلاس أو حقل عليه `[AuditIgnore]`، مثلًا بيانات أجهزة الحضور الخام
  (`RawAttendancePunch`, `RawDeviceUser`, `DevicePullRun`, `DeviceCredential`)،
  جداول التاريخ (`ApplicationStatusHistory`, `JobOfferApprovalHistory`)
  واختيار السنة المالية الشخصي (`FiscalYearUserSelection`).

```csharp
[AuditIgnore]                 // الكلاس كله مش هيتسجل
public sealed class RawAttendancePunch : CompanyAuditableEntity { ... }

public sealed class Employee : CompanyAuditableEntity
{
    [AuditIgnore]             // الحقل ده بس مش هيتسجل
    public string? InternalNotes { get; set; }
}
```

## شكل السطر في الجدول

| العمود | المعنى |
| --- | --- |
| `Id` | رقم السطر جوه الموديول |
| `TenantId`, `CompanyId` | النطاق (الشركة فاضية للبيانات العامة على مستوى المستأجر) |
| `EntityName`, `EntityKey` | نوع السجل ورقمه، مثلًا `Department` و `12` |
| `EntityDisplay` | اسم مقروء (`NameAr` ثم `NameEn` ثم `Name` …) |
| `Action` | `Created` / `Modified` / `Deleted` / `Restored` |
| `UserId`, `OccurredOnUtc`, `CorrelationId` | مين وإمتى ورقم الطلب (`X-Correlation-ID`) |
| `ChangeCount`, `ChangesJson` | عدد الحقول وتفاصيلها `[{ field, oldValue, newValue }]` |

## الـ API

كلها محتاجة صلاحية `AuditTrail:View` (`PlatformPermissions.ViewAuditTrail`).

| الطلب | الاستخدام |
| --- | --- |
| `GET /api/v1/audit-trail` | القائمة: الأحدث الأول. فلاتر: `moduleCode`, `entityName`, `entityKey`, `action`, `userId`, `fromUtc`, `toUtc`, `pageSize` (حد أقصى 100), `cursor` |
| `GET /api/v1/audit-trail/filters` | الموديولات وأنواع السجلات الموجودة (للقوائم المنسدلة) |
| `GET /api/v1/audit-trail/{moduleCode}/{id}` | تفاصيل سطر واحد: كل حقل قبل ← بعد |

- **التاريخ الخاص بسجل واحد**: نفس القائمة مع `moduleCode` + `entityName` + `entityKey`.
- **الصفحات**: الرد فيه `nextCursor`؛ ابعته في الطلب الجاي عشان تجيب الصفحة اللي بعدها.
- **النطاق**: المستخدم العادي بيشوف المستأجر والشركة بتوعه بس (+ السجلات العامة
  على مستوى المستأجر). الـ `super_admin` يقدر يشوف كل المستأجرين أو يحدد `tenantId`.

## الشاشات

- **الويب**: الأدوات المتقدمة ← سجل العمليات (`/advanced-tools/audit-trail`)،
  ومن شاشات الهيكل التنظيمي زرار "سجل التعديلات" بيفتح تاريخ السجل.
- **الموبايل**: الأدوات المتقدمة ← سجل العمليات، ونفس الزرار في الهيكل التنظيمي.
- الضغط على أي سطر بيفتح التفاصيل.

## موديول جديد

لما تعمل موديول جديد اعمل 3 حاجات بس:

```csharp
// 1) في OnModelCreating بعد HasDefaultSchema
modelBuilder.HasDefaultSchema(Schema);
modelBuilder.ApplyAuditTrail();

// 2) في تسجيل الـ DbContext
services.AddDbContext<MyDbContext>((provider, options) =>
    options.UseErpAuditTrail(provider, "my-module").UseSqlServer(...));

// 3) نشر السجل لشاشة الـ Platform
services.AddErpAuditTrailSource<MyDbContext>("my-module");
```

وبعدها: `Add-ErpModuleMigrations.ps1 -Name AddAuditTrail -Apply`
(شوف [MIGRATIONS_COMMANDS_AR.md](MIGRATIONS_COMMANDS_AR.md)).

## الأماكن في الكود

| الحاجة | المكان |
| --- | --- |
| العقود المحايدة (`AuditAction`, `IAuditTrailSource` …) | `api/BuildingBlocks/ErpSystem.BuildingBlocks.Application/Abstractions/AuditTrail/` |
| `IAuditedEntity`, `[AuditIgnore]` | `api/BuildingBlocks/ErpSystem.BuildingBlocks.Domain/Common/Auditing/` |
| الجدول والـ interceptor والقراءة | `api/BuildingBlocks/ErpSystem.BuildingBlocks.Persistence/AuditTrail/` |
| الـ API | `Platform.Application/Features/Platform/AuditTrail/`, `Platform.Presentation/Features/Platform/AuditTrail/V1/AuditTrailController.cs` |
| الويب | `web-next/src/platform/audit-trail/` |
| الموبايل | `mobile-react/src/platform/tools/audit-trail/` |
| الاختبارات | `api/Tests/ErpSystem.BuildingBlocks.Tests/AuditTrailTests.cs`, `Platform.Tests/AuditTrailQueryTests.cs`, `Accounting.Tests/FiscalYearCompanyIsolationTests.cs` |

2026-10-17 verification repair: Web AuditTrailDetailsDialog is dynamically imported and mounted only for a selected entry, restoring the existing interaction-only architecture gate.
