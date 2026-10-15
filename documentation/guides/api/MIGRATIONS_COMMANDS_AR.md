# أوامر الـ Migrations — مرجع سريع

كل الأوامر دي بتتشغّل من فولدر `api` في PowerShell:

```powershell
cd G:\test\ERPSYSTEM\ERPSYSTEM\api
```

الـ connection string بيتقري لوحده من `ErpSystem.Api\appsettings.json`، وفي بيئة Development بيتقري بعده `appsettings.Development.json` لو فيه connection string بيغيّره. للإنتاج زوّد `-Environment Production` على أمر `Apply-ErpModuleMigrations.ps1`.

---

## 1. عدّلت في كيان (Entity) وعايز تحدّث الداتابيز

ده الأمر اللي هتستخدمه أغلب الوقت. بيضيف الـ migration ويطبّقه على الداتابيز في خطوة واحدة:

```powershell
.\scripts\Add-ErpModuleMigrations.ps1 -Name AddCountryNotes -Apply
```

- `-Name`: اسم يوصف التعديل اللي عملته. لازم يبدأ بحرف، ومن غير مسافات (مثلاً `AddCountryNotes` أو `RemoveOldColumn`).
- `-Apply`: يطبّق على الداتابيز على طول.
- السكربت بيضيف الـ migration للموديولات اللي اتغيّرت بس، ويسيب الباقي.

**مثال:** ضفت `public string? Notes { get; private set; }` في `Country.cs`، وشغّلت الأمر اللي فوق. النتيجة: migration جديد في موديول ReferenceData بس، وعمود `Notes` اتضاف في الداتابيز.

---

## 2. عايز تراجع الـ migration قبل ما يتطبّق

**أ. اعمل الـ migration من غير ما تطبّقه** (شيل `-Apply`):

```powershell
.\scripts\Add-ErpModuleMigrations.ps1 -Name AddCountryNotes
```

**ب. راجع الملف الجديد** في `Modules\<Module>\ErpSystem.Modules.<Module>.Infrastructure\Migrations\`.

**ج. طبّقه لما تطمّن:**

```powershell
.\scripts\Apply-ErpModuleMigrations.ps1
```

---

## 3. عايز تطبّق migrations موجودة بس

مثلاً بعد `git pull`، أو على داتابيز جديدة فاضية:

```powershell
.\scripts\Apply-ErpModuleMigrations.ps1
```

بيطبّق كل الـ migrations اللي لسه ما اتطبّقتش، لكل الموديولات، بالترتيب الصح.

---

## 4. عايز تلغي migration لسه ما اتطبّقش

```powershell
dotnet ef migrations remove `
  --project Modules\ReferenceData\ErpSystem.Modules.ReferenceData.Infrastructure `
  --context ReferenceDataDbContext
```

غيّر اسم الموديول والـ context حسب الموديول:

| الموديول | الـ Context |
| --- | --- |
| Platform | `PlatformDbContext` |
| ReferenceData (البيانات العامة) | `ReferenceDataDbContext` |
| Contacts | `ContactsDbContext` |
| Accounting | `AccountingDbContext` |
| HR | `HrDbContext` |
| CRM | `CrmDbContext` |
| Inventory | `InventoryDbContext` |
| PointOfSale | `PointOfSaleDbContext` |
| Reporting | `ReportingDbContext` |

⚠️ لو الـ migration اتطبّق على الداتابيز خلاص، ماتمسحهوش. اعمل migration جديد يرجّع التعديل.

---

## 5. عايز تتأكد إن مفيش تعديلات ناسي تعملها migration

```powershell
.\scripts\Test-ErpModuleModelDrift.ps1
```

لو فيه موديول اتغيّر ومالوش migration، السكربت هيقولك اسمه.

---

## 6. مثال حقيقي: إضافة جدول سجل العمليات

بعد تحديث سجل العمليات (Audit Trail) كل موديول بقى عنده جدول جديد
`AuditTrailEntries`، والـ Platform اتشال منه جدول `EntityChangeLogs` القديم.
أمر واحد بيعمل migration لكل الموديولات اللي اتغيرت ويطبقها:

```powershell
.\scripts\Add-ErpModuleMigrations.ps1 -Name AddAuditTrail -Apply
```

الشرح في [AUDIT_TRAIL.md](AUDIT_TRAIL.md).

## مشاكل شائعة

| المشكلة | الحل |
| --- | --- |
| `Build failed` | فيه error في الكود. شغّل `dotnet build ErpSystem.sln` وصلّحه الأول. |
| `dotnet ef` مش معروف | نزّله مرة واحدة: `dotnet tool install --global dotnet-ef` |
| `No effective connection string` | راجع `ConnectionStrings` في `ErpSystem.Api\appsettings.json` و`appsettings.Development.json`. |
| PowerShell رافض يشغّل السكربت | شغّل مرة واحدة: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
