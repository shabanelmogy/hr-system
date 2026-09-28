> Imported 2026-09-28 from the School Management repository (`docs/TEMPLATE_BLUEPRINT.md`) as evidence for plan `erp-platform-template`. Not maintained here; decisions in `../DECISIONS.md` override it.

# Template Blueprint — ويب + موبايل + API

**الغرض:** الصورة الموحّدة للـ template. بتجمع أحسن ما في مشروع المدرسة (API + Next.js + نظام التخطيط + platform RBAC)، وتطبيق HR الموبايل (المعمارية + الشاشات + نظام الألوان والمكونات)، في منتج واحد بيطلّع **API + Web + Mobile** بشكل احترافي.

**التاريخ:** 2026-09-28
**الحالة:** مقترح للمراجعة. أول تنفيذ ملموس: `packages/tokens` (§3).

> **تحديث 2026-09-28 — القرارات دي بتلغي أجزاء من الوثيقة:**
> - الأساس بقى مشروع ERP (`G:\test\hr-system\hr-system`، هيتغير اسمه لـ erp-system) مش مشروع المدرسة. المدرسة هتبقى module اسمه Education.
> - الويب **MUI** مش shadcn. أي ذكر لـ shadcn/Tailwind هنا للويب اتلغى؛ `@app/tokens` بقى فيه `createMuiThemeOptions`.
> - `templates/planning` و `packages/tokens` اتنقلوا لمشروع ERP. الخطة الحاكمة دلوقتي:
>   `documentation/plans/business/erp-platform-template/PLAN.md` في مشروع ERP.
> - أنماط الشاشات هنا هتدخل كتالوج ERP (`SCREEN_PATTERN_CATALOG.md`) كـ Candidate بأرقام P-008 … P-014.

---

## 1. الفكرة في سطر

> كل شاشة وكل مكون وكل عقد API **متعرّف مرة واحدة كـ pattern**، وبيتنفذ على الويب (shadcn) والموبايل (native) بنفس الاسم ونفس السلوك، وبيتولّد لأي feature جديدة من الـ manifest.

---

## 2. شكل الـ Monorepo

```text
<product>/
├── apps/
│   ├── api/                    .NET 10 — Clean Architecture + CQRS + Identity + Tenancy + RBAC
│   ├── web/                    Next.js 16 — BFF + shadcn/ui + Tailwind v4
│   └── mobile/                 Expo — Expo Router + مكونات native
├── packages/
│   ├── tokens/                 ✅ اتعمل — ألوان، خطوط، مسافات، radius، ظلال، حركة
│   ├── contracts/              Zod v4 schemas + types (متولدة من OpenAPI الـ API)
│   ├── api-client/             client typed مشترك (fetch، refresh، ProblemDetails، pagination)
│   ├── i18n/                   ترجمات ar/en: common + platform، والـ modules تضيف namespaces
│   ├── ui-web/                 مكونات shadcn بتوعنا + الـ screen patterns للويب
│   ├── ui-native/              مكونات RN (من shared/components في HR) + الـ screen patterns للموبايل
│   └── domain-primitives/      money، decimal، quantity، date-only (من core/erp في HR)
├── planning/                   نظام التخطيط (موجود في templates/planning)
├── templates/                  generators + profiles (Foundation / Standard / Reference apps)
└── tooling/                    eslint/tsconfig مشتركة، سكربتات الفحص (architecture، i18n، contrast، drift)
```

- **قاعدة الاعتماد:** `apps` بتعتمد على `packages`. و`ui-web`/`ui-native` بيعتمدوا على `tokens` و`i18n` بس. و`contracts` مش بيعتمد على React.
- **Reference apps:** المدرسة (ويب) و HR (موبايل + ويب لاحقًا) بيستخدموا نفس الـ packages. ده بيضمن إن الـ template متجرب على تطبيقين حقيقيين.

---

## 3. نظام التصميم (Design System)

### 3.1 Tokens — تم التنفيذ

`packages/tokens` مستخلص من theme الموبايل، واتكمل:

- **4 palettes** (green، orange، blue، monochrome) × light/dark، **وكلهم بيعدّوا WCAG AA** (سكربت `check:contrast`).
- **أسماء ألوان موحّدة** بمنطق shadcn، مع تحويل أسماء الموبايل: `secondary` بقى `brand2`، و`accent` بقى `brand3`، و`danger` بقى `destructive`.
- **مخرجات للويب:** `tokens.css` (متغيرات لكل palette و mode) و`theme.css` (Tailwind v4 `@theme`). يعني shadcn يشتغل عليها مباشرة.
- **للموبايل:** `getTheme(palette, mode)` و`nativeShadow()` بنفس القيم.
- text styles (من `AppText`)، ومسافات، وradius، وظلال، وحركة، وbreakpoints، وz-index، وlayout.
- خط واحد عربي/لاتيني (IBM Plex Sans Arabic).
- `withBrandPrimary()` علشان كل tenant يقدر يغيّر لونه الأساسي.

### 3.2 قواعد بصرية مشتركة

| القاعدة | الويب | الموبايل |
|---|---|---|
| الاتجاه | `dir` على `<html>` + logical utilities (`ms-`, `pe-`) | `direction` على الـ root (موجود في HR) |
| الـ Theme | `data-palette` + `.dark` على `<html>` | `AppThemeProvider` (موجود) بيقرا من `@app/tokens` |
| الأيقونات | أسماء بالمعنى (`add`، `filter`، `stats`…) وبتتحول لـ lucide | نفس الأسماء، وبتتحول لـ Ionicons (موجود `AppIcon`) |
| أقل مساحة للضغط | 44px للأزرار الأساسية | 44px (`layout.touchTarget`) |
| الحركة | `--duration-*`، وبتتقفل مع `prefers-reduced-motion` | `motion.duration` + `AccessibilityInfo.isReduceMotionEnabled` |

---

## 4. كتالوج المكونات المشتركة (نفس الاسم ونفس الـ props على المنصتين)

الأسماء بتتوحّد **من غير بادئة `App`**. تطبيق HR يعمل re-export مؤقت للأسماء القديمة أثناء النقل.

| المكون | المصدر في الموبايل (HR) | الأساس على الويب | ملاحظات الـ API الموحّد |
|---|---|---|---|
| `Text` | `AppText` | `<p>`/`<span>` + `text-*` | `variant`, `color`, `weight`, `align` |
| `Icon` | `AppIcon` | lucide-react | `name` (أسماء بالمعنى)، `size`، `color` |
| `Button` | `AppButton` | shadcn `Button` | `variant: primary/secondary/outline/ghost/warning/destructive`، `size`، `icon`، `iconPosition: start/end`، `loading`، `fullWidth` |
| `IconButton` | `AppIconButton` | `Button size="icon"` + Tooltip | `label` إجباري (accessibility) |
| `TextField` | `AppTextField` | `Input`/`Textarea` + Label | `label`, `error`, `hint`, `required`, `multiline`, `secure` |
| `SelectField` | `AppSelectField` | shadcn `Select` / Combobox | `options`, `searchable`, `loadOptions` (async lookup) |
| `MultiSelectField` | `AppMultiSelectField` | Combobox multiple | |
| `DateTimeField` | `AppDateTimeField` | `Calendar` + `Popover` | `mode: date/time/datetime`، يدعم RTL |
| `SwitchField` | `AppSwitchField` | `Switch` + Label | |
| `SegmentedControl` | `AppSegmentedControl` | `ToggleGroup` | |
| `FilterButton` / `FilterFormButton` | `AppFilterButton` | `Popover`/`Sheet` + checklist أو form | عدد الفلاتر النشطة كـ badge |
| `SearchFilterControls` | `AppSearchFilterControls` | Input + FilterButton | debounce موحّد |
| `Form` + `FormSection` + `FormTabs` + `FormStepper` + `FormStepActions` | `AppForm` + `forms/layouts/*` | react-hook-form + shadcn `Form` | ربط ProblemDetails بالحقول، `useZodForm` (موجود) |
| `FieldMessage` | `AppFieldMessage` | `FormMessage` | |
| `Card` / `DataCard` / `MetricCard` | `surfaces/*` | shadcn `Card` | `DataCard`: `active`، `selected`، `flash` بعد التعديل |
| `Modal` | `AppModal` (`dialog`/`fullScreen`) | `Dialog` على الديسكتوب و`Drawer`/`Sheet` على الموبايل-ويب | `title`, `subtitle`, `icon`, `footer`, `variant` |
| `ConfirmationDialog` | `dialogs/confirmation` | `AlertDialog` | `tone: destructive`، وسبب اختياري |
| `DiscardChangesDialog` + `useDiscardChanges` | `dialogs/discard-changes` | `AlertDialog` + router guard | مع `unsaved-changes-registry` (موجود) |
| `StateView` | `AppStateView` | مكون جديد | `state: loading/empty/error/offline/forbidden` + retry |
| `Alert` / `StatusBadge` | `feedback/*` | shadcn `Alert` / `Badge` | `tone` من الـ tokens |
| `Toast` + `ErrorDialog` | `feedback/transient/*` | sonner أو toast داخلي + `Dialog` | `toastService` نفس الـ API على الاتنين |
| `ErrorBoundary` | `AppErrorBoundary` | `error.tsx` + boundary | |
| `PageHeader` | `AppPageHeader` | مكون جديد | `title`, `subtitle`, `action`, `compact`, breadcrumbs على الويب |
| `Screen` | `AppScreen` | page container | `scroll`, `refreshControl` (موبايل)، `maxWidth` |
| `DataTable` | `AppDataTable` | TanStack Table + shadcn Table | `columns`, `getRowKey`, selection، sort، sticky header |
| `MultiView` + `CollectionPagination` | `multi-view/*` | Tabs/ToggleGroup + نفس المنطق | views: table / cards / carousel / calendar |
| `ListScreen` | `AppListScreen` | نفس التركيب | **الـ pattern الأساسي** (§5.4) |
| `Pagination` | `AppPaginationNavigation` | shadcn `Pagination` | server/client |
| `HierarchicalTree` | `tree-view` | مكون tree accessible | expand، search، actions، lazy load |
| Charts (`ChartCard`، Distribution، Ring، Bar، Interactive) | `charts/*` | Recharts + shadcn chart | الألوان من `theme.chart` |
| `Carousel` | `AppCarousel` | Embla/shadcn carousel | |
| `SpreadsheetImportView` | `AppSpreadsheetImportView` | نفس التركيب + dropzone | معاينة وأخطاء لكل صف |
| `EntityChangeLogModal` | `audit-log` | نفس التركيب | بيقرا من audit endpoint موحّد |
| `ThemePalettePicker` | `AppThemePalettePicker` | نفس التصميم | بيقرا `themePaletteOrder` |
| `PermissionMatrix` | (role-permissions في HR) | موجود في Standard web | يتنقل للموبايل |
| App shell: `Drawer`/`Sidebar`، `AppBar`، `Breadcrumbs`، `TabBar` | `shell/layouts` + `platform/navigation` | shadcn `Sidebar` + header | القائمة بتتبني من registry الـ modules |

---

## 5. كتالوج أنماط الشاشات (Screen Patterns)

كل pattern ليه: **هيكل ثابت**، ومكونات محددة، وعقد API متوقع. والـ generator بيولّد منه شاشات الـ features الجديدة على المنصتين.

### 5.1 Onboarding
**المصدر:** `shell/onboarding` (اختيار اللغة + شرائح تعريفية).
**الهيكل:** اختيار اللغة، ثم شرائح (صورة + عنوان + وصف)، ثم "ابدأ".
**الويب:** اختياري (غالبًا في أول تسجيل دخول بس). **API:** مفيش.

### 5.2 مسار الدخول (Auth flow)
**المصدر:** `app/(auth)/*` + `platform/auth/presentation/*`.
**الشاشات:** Login، واختيار Tenant، واختيار Company (optional module)، وRegister (بيتفعل بـ flag)، وForgot/Reset password، وConfirm email، وAccept invitation.
**قواعد:** deep links للـ confirm/reset/invitation (موجودة في HR)، وdemo login في dev بس، وsingle-tenant mode بيعدّي شاشة الاختيار تلقائي.
**API:** عقد موحّد واحد (§6.1).

### 5.3 الرئيسية / Dashboard
**المصدر:** `shell/home/HomeScreen` + `TenantDashboardScreen`.
**الهيكل:** ترحيب + سياق (tenant/company)، ثم صف Metric cards، ثم Shortcuts/وحدات سريعة، ثم Charts، ثم نشاط حديث وإشعارات.
**API:** `GET /dashboard` (زي REPORT-002 في المدرسة) بيرجع widgets مفلترة حسب الصلاحيات.

### 5.4 شاشة الإدارة / القائمة (Management List) — أهم pattern
**المصدر:** `UserManagementScreen` + `AppListScreen` + `AppMultiView`.

```text
┌ PageHeader: العنوان · الوصف · [إحصائيات] [إضافة +]
├ Search ─────────────── [Filter (n)] [actions إضافية]
├ View selector: [جدول] [كروت] [كاروسيل] [تقويم]      عدد النتائج
├ View:
│   جدول: أعمدة + badges حالة + actions للصف (تعديل/حذف/سجل التغييرات)
│   كروت: DataCard لكل عنصر + actions
├ Pagination (server)
└ States: loading / empty / error / forbidden · pull-to-refresh (موبايل)
Modals: Form (إضافة/تعديل) · Confirm (حذف) · Stats · ChangeLog
```

**الويب:** نفس الهيكل. الجدول هو الافتراضي على الديسكتوب، والكروت تلقائيًا على الشاشات الصغيرة.
**API:** list مقسم لصفحات + search + filters + sort (§6.2)، و`GET /{resource}/statistics`، و`GET /audit/{entity}/{id}`، و rowVersion في التعديل والحذف.
**الـ generator:** بيطلّع الشاشة دي كاملة من تعريف الـ feature (الحقول، والفلاتر، والأعمدة، والصلاحيات).

### 5.5 الفورم (إنشاء/تعديل)
**المصدر:** `AppForm` + `FormSection`/`FormTabs`/`FormStepper` + `useDiscardChanges`.
**الأشكال:** فورم بسيط في Modal، وفورم بأقسام، وفورم بـ tabs للكيانات الكبيرة، وWizard للعمليات متعددة الخطوات.
**قواعد:** تحذير لو خرجت من غير حفظ، وأخطاء السيرفر تظهر على الحقول، ورسالة واضحة لتعارض rowVersion ("البيانات اتغيرت، حدّث")، وزر الحفظ بيبقى loading.
**API:** POST/PUT بـ ProblemDetails بـ `errors[field]` واكواد ثابتة.

### 5.6 صفحة التفاصيل / لوحة الكيان
**المصدر:** `TenantDashboardScreen`، وتفاصيل الطالب/المدرس في المدرسة.
**الهيكل:** Header card (صورة، اسم، badges)، ثم Metric cards، ثم Tabs أو أقسام (بيانات، مرتبط، سجل)، وactions في الـ header.

### 5.7 شاشة الشجرة (Hierarchical)
**المصدر:** `AppHierarchicalTree` (الهيكل التنظيمي، ودليل الحسابات).
**الهيكل:** بحث، ثم شجرة قابلة للتوسيع، و actions لكل عقدة (إضافة ابن، تعديل، نقل)، وتفاصيل العقدة في panel أو modal.
**API:** `GET /{resource}/tree` أو children عند الطلب (lazy).

### 5.8 الإعدادات
**المصدر:** `SettingsScreen`.
**الهيكل:** مجموعات cards: المظهر (mode + palette)، واللغة، والإشعارات، والـ offline، والحساب.

### 5.9 الملف الشخصي
**المصدر:** `ProfileScreen` + `ProfilePhotoCropModal`.
**الهيكل:** صورة مع قص، وبيانات، وتغيير الباسورد، والجلسات والأجهزة (جديد).

### 5.10 مركز الإشعارات
**المصدر:** `NotificationsScreen` + `NotificationRow`.
**الهيكل:** تبويب مقروء/غير مقروء، وتجميع بالتاريخ، و"تعليم الكل كمقروء"، والضغط بيفتح الـ route المرتبط. والتحديث realtime.

### 5.11 مشغّل الـ Modules
**المصدر:** `ModuleLauncherScreen` + `SubmoduleEntryScreen`.
**الهيكل:** شبكة modules متاحة حسب الـ entitlements، ثم الـ submodules، ثم أول شاشة مسموحة.

### 5.12 الاستيراد من Excel
**المصدر:** `AppSpreadsheetImportView` + `native-spreadsheet`.
**الهيكل:** رفع/اختيار ملف، ثم معاينة، ثم تحقق لكل صف (أخطاء)، ثم تأكيد الاستيراد، ثم ملخص.
**API:** `POST /{resource}/import` (validate-only ثم commit).

### 5.13 سجل التغييرات
**المصدر:** `EntityChangeLogModal` + `TrackChangesScreen`.
**الهيكل:** timeline: مين، إمتى، الحقل، القيمة قبل وبعد.
**API:** audit trail موحّد (الـ business audit الناقص في الـ Standard).

### 5.14 إدارة الـ Platform والـ Tenant
**المصدر:** HR (`TenantManagement`، `TenantAdminManagement`، `UserManagement`، `RoleManagement`، `Invitations`) + Standard web (`/platform/tenants`، `/admin/users`، `/admin/roles`).
**الهيكل:** شاشات Management List (§5.4) + PermissionMatrix + فورم الاشتراك والـ entitlements.

### 5.15 أدوات الإدارة (optional)
**المصدر:** `platform/tools` (Health، وHangfire، وAPI endpoints، والـ localization، والملفات، وtrack changes).
**الهيكل:** لوحات حالة read-only + إجراءات محدودة، للـ platform admin بس.

### 5.16 الحالات العامة
`StateView` (loading/empty/error/offline)، و`AccessDeniedScreen`، و404، وشاشة "الخدمة غير متاحة"، وشريط الـ offline والمزامنة (`SyncQueuePanel`).

### 5.17 التقويم والمواعيد (module)
**المصدر:** `AppointmentManagementScreen` (CRM).
**الهيكل:** view تقويم جوه `MultiView` + فورم موعد. وده أساس الـ Calendar/Scheduling module.

---

## 6. عقود الـ API اللي الشاشات محتاجاها

### 6.1 Auth والـ tenancy (عقد واحد للويب والموبايل)
- **اتقرر (انظر `API_BACKEND_COMPARISON.md` §5):** الدخول بيرجع **نتيجة واحدة من 3**: `authenticated` أو `tenant-selection` أو `company-selection` (نمط HR). والـ Company optional، والـ single-tenant/company بيدخل مباشرة.
- الويب: عن طريق الـ BFF و HttpOnly cookies. والموبايل: مباشرة مع SecureStore وrefresh rotation.
- جلسات لكل جهاز، و audience منفصل للويب والموبايل، وpush token لكل جهاز.
- self-service: register (flag)، وforgot/reset، وconfirm email، وinvitations. وكلها بـ deep links.

### 6.2 القوائم
```http
GET /api/v1/{resource}?search=&page=1&pageSize=25&sort=name:asc&filter[status]=active,locked
→ { items, pageNumber, pageSize, totalCount, totalPages, hasPreviousPage, hasNextPage }
```
+ `GET /{resource}/lookup` (موجود في المدرسة)، و`GET /{resource}/statistics`، و`GET /{resource}/export?format=xlsx`.

### 6.3 الكتابة
- `POST` بيرجع 201 + Location، و`PUT` بـ `rowVersion`، و`DELETE ?rowVersion=` بيرجع 204.
- الأخطاء كلها ProblemDetails: `code` ثابت، ورسالة مترجمة، و`errors{field: [codes]}`.
- الـ **capabilities** في الاستجابة (`canEdit`, `canDelete`) أو قاعدة واضحة من الـ permissions، علشان الـ actions تظهر صح.

### 6.4 مشترك
- `GET /audit/{entity}/{id}`، و`/notifications` + SignalR hub، و`/files` (رفع وتحميل)، و`/me/devices`، و`/me/preferences`.
- **OpenAPI هو مصدر الحقيقة:** منه بيتولد `packages/contracts` (Zod) والـ `api-client`.

---

## 7. قواعد UX موحّدة

| الموقف | القاعدة |
|---|---|
| نجاح عملية | Toast قصير، والكارت/الصف بيعمل flash (موجود في `DataCard`) |
| خطأ validation | على الحقل نفسه، من غير toast |
| خطأ غير متوقع | Error dialog فيه "نسخ التقرير" (موجود `formatErrorReport`) |
| تعارض rowVersion | Dialog "البيانات اتغيرت": تحديث أو مقارنة |
| حذف | ConfirmationDialog بـ tone destructive، والسبب إجباري للكيانات الحساسة |
| صلاحيات | الـ action مش بيظهر لو مفيش صلاحية، والـ route محمي (RouteGuard)، والسيرفر هو الحكم |
| تحميل | Skeleton أول مرة، وبعد كده مؤشر خفيف مع الاحتفاظ بالبيانات (`isFetching`) |
| الموبايل مقابل الويب | نفس المحتوى والترتيب. الجدول على الويب والكروت على الموبايل افتراضيًا، والمستخدم يقدر يبدّل |
| Offline (لو الـ module مفعّل) | شريط حالة، والكتابة بتتحط في outbox، والتعارضات بتظهر في Sync panel |

---

## 8. الـ Generator (هدف "بسهولة")

تعريف feature واحد في الـ manifest (حقول، وعلاقات، وفلاتر، وأعمدة، وصلاحيات، وviews) بيطلّع:

| المنصة | الناتج |
|---|---|
| API | entity + config + commands/queries + validators + controller + lookup + statistics + tests |
| contracts | Zod schemas + types |
| Web | route + Management List (§5.4) + Form (§5.5) + Details (§5.6) |
| Mobile | route رفيع + Screen بنفس الـ patterns + تسجيل في module definition (routes، وpermissions، والـ drawer، والترجمات) |
| i18n | مفاتيح ar/en للحقول والرسائل |

---

## 9. خطة التنفيذ المحدّثة

| # | المرحلة | الناتج |
|---|---|---|
| 1 | ✅ `packages/tokens` | نظام الألوان والخطوط مشترك ومتفحوص |
| 2 | ✅ مقارنة الـ HR backend بالـ Standard (`API_BACKEND_COMPARISON.md`): الـ HR هو أساس الـ API | عقد auth وtenancy واحد |
| 3 | تجهيز الـ monorepo (workspaces) ونقل المدرسة وHR لاستخدام `@app/tokens` | أول package مشترك شغال فعليًا |
| 4 | `ui-native` من `shared/components` (إعادة تسمية + tokens) | مكتبة الموبايل |
| 5 | `ui-web` بـ shadcn بنفس أسماء وprops الـ `ui-native` | مكتبة الويب |
| 6 | الـ Screen patterns (§5.4 و§5.5 أولًا) على المنصتين + صفحة معاينة | أنماط جاهزة |
| 7 | `contracts` + `api-client` من OpenAPI | عقود مشتركة |
| 8 | Generator للـ feature على الـ 3 منصات | "أمر واحد" |
| 9 | Modules: notifications/push، وfiles، وaudit، وrealtime، ثم Kanban، ثم Chat | الأساسيات + الإضافات |
