> Imported 2026-09-28 from the School Management repository (`docs/MOBILE_TEMPLATE_EXTRACTION.md`) as evidence for plan `erp-platform-template`. Not maintained here; decisions in `../DECISIONS.md` override it.

# مراجعة تطبيق الموبايل (HR/ERP) — خطة استخلاص Template

**المصدر:** `G:\test\hr-system\hr-system\mobile-react`
**التاريخ:** 2026-09-28

**النطاق:** اتقرأ:
- هيكل الملفات كامل (756 ملف، حوالي 2.5MB)
- `package.json` و`README` و`AGENTS` و`eas.json` و`.env.example`
- الـ root layout والـ providers وسجل الـ modules وحدود الطبقات
- عينات من الـ core (API، والـ theme، والـ env، والـ secure storage، والـ outbox) والـ platform (auth، والـ route manifest) والـ shared (Button، وForm، وList screen)
- سكربتات الفحص

**خارج النطاق:** الوثائق المرجعية في `../documentation/mobile-react/` (خارج الفولدر المتاح)، وتفاصيل modules الـ HR والمحاسبة، ومعظم المكونات.

---

## 1. الخلاصة

التطبيق ده **أنضج بكتير من المعتاد**، ومناسب جدًا يكون أساس تطبيق الموبايل في الـ template. فيه معمارية واضحة وحدود طبقات متراقبة بسكربت، وفيه 120 ملف اختبار، وأنظمة متقدمة (offline + outbox، realtime، RBAC للـ routes، i18n بفحص تطابق).

المشكلة الأساسية مش في الجودة، لكن في **الاقتران**:

1. **حاجات عامة متخزنة في مكان مركزي فيه معلومات الـ domain:** كل الـ routes في `core/constants/routes.ts`، وكل الـ permissions (13KB) والـ route manifest في `platform/auth`، وكل الترجمات (حوالي 300KB) في `core/localization` ومقسمة حسب modules الـ HR والمحاسبة.
2. **عقد الـ auth مختلف عن الـ API بتاع المدرسة/الـ Standard:** tenant ثم company، و`requiresTenantSelection`/`tenantSelectionToken`، وحقول مختلفة.
3. **الوثائق المرجعية برّه التطبيق** (`../documentation`)، والـ template لازم يبقى مكتفي بذاته.

---

## 2. نقاط القوة (تتنقل للـ template زي ما هي تقريبًا)

| الجانب | الموجود |
|---|---|
| المعمارية | `core` ← `shared` ← `platform` ← `shell` ← `modules`، وكل feature جواه `domain/application/data/presentation/composition` |
| حدود الطبقات | `module-boundaries.mjs` + `check-architecture.mjs`: بيمنع الـ domain من استخدام frameworks، ويمنع الـ presentation من استدعاء الـ API مباشرة |
| Modules | `registerMobileModule` + `validateMobileModuleRegistry` + dependencies بين الـ modules + entitlements |
| Routes رفيعة | ملفات `app/` بتعمل `RouteGuard` + Screen بس (زي `branches.tsx`) |
| API | axios فيه refresh single-flight، وrequest-context rotation عند تغيير الجلسة، وread-only guard، وتحويل موحّد للأخطاء (`ApiError`) |
| Auth | login، واختيار tenant وcompany، وregister، واستعادة الحساب، وتأكيد الإيميل، وقبول دعوة، وprofile بصورة وcrop، وjelsa offline (lease) |
| الأمان | SecureStore بـ `WHEN_UNLOCKED_THIS_DEVICE_ONLY`، وSQLCipher للقاعدة المحلية، وredaction للـ telemetry، ومنع الأسرار في `EXPO_PUBLIC_*` |
| Offline | SQLite + outbox بحالات كاملة (conflict، uncertain، dead-letter) + idempotency + baseRowVersion + sync coordinator + policies |
| Realtime | SignalR + registry بيعمل invalidate لـ queries مع كل event |
| RBAC | route manifest + `RouteGuard` + `AuthorizeView` + اختبار parity للـ permissions مع الـ backend |
| i18n | i18next + RTL حقيقي (`direction` على مستوى الـ root) + فحص parity واستخدام المفاتيح |
| Theme | tokens بـ TypeScript (spacing، radius، typography، layout) + 4 palettes × light/dark + navigation theme |
| مكونات UI | حوالي 40 مكون domain-neutral: TextField، وSelect، وMultiSelect، وDateTime، وForm، وFormSection، وDataTable، وMultiView (قائمة/جدول/كروت)، وHierarchicalTree، وCharts، وModal، وToast، وErrorDialog، وConfirmation، وDiscardChanges، وAuditLog، وSpreadsheetImport |
| الإطلاق | `app.config.ts` حسب البيئة، وEAS preview/production، وdeep links للـ auth، وفحص release-readiness، وexpo-observe |
| الجودة | `npm run check` بيشغّل typecheck وlint وarchitecture وcontracts وi18n وtests مع coverage |

---

## 3. التصنيف: إيه يدخل الـ template وإيه يفضل

| المسار | التصنيف | ملاحظات |
|---|---|---|
| `core/api`, `config`, `storage`, `query`, `validation`, `providers`, `observability`, `onboarding` | **Foundation** | بعد إزالة أي مرجع لـ routes الـ domain |
| `core/theme` | **Foundation** بيتنقل لـ `packages/tokens` | مصدر واحد للويب والموبايل |
| `core/localization` (infra) | **Foundation** | الـ provider والـ i18n والـ RTL. **الترجمات نفسها تتوزع على الـ modules** |
| `core/erp` (money، decimal، quantity، date-time) | **Standard** | primitives مفيدة لأي SaaS، باسم محايد (`core/business-primitives`) |
| `core/offline`, `core/offline-policy`, `platform/offline-operations`, `platform/auth/.../offline-session-lease` | **Optional module: Offline** | قوي جدًا بس معقد، ومعظم التطبيقات مش محتاجاه. يتفعل من الـ manifest |
| `core/realtime` + `platform/realtime` | **Standard** | مع تعميم أسماء الـ events |
| `core/preferences/MockData*` | **Dev-only** | يتحول لـ demo mode مربوط بالـ seed |
| `shared/components` | **`packages/ui-native`** | المكتبة الأساسية، بعد توحيد الأسماء مع الويب |
| `shared/listing`, `shared/contexts`, `shared/importing` | **Standard** | server list state، وunsaved changes، واستيراد Excel |
| `platform/auth` | **Standard** | بعد توحيد العقد (§4) |
| `platform/auth/presentation/rbac` | **Standard** (الآلية) | الـ permissions والـ routes تتسجّل من الـ modules، مش ملف مركزي |
| `platform/tenants`, `tenant-admins`, `tenant-access`, `administration` | **Standard** | platform admin، وإدارة tenant، ومستخدمين، وأدوار، ودعوات |
| `platform/modules`, `platform/navigation`, `shell` | **Standard** | shell بـ module registration فاضي + sample module |
| `platform/notifications` | **Standard** | + push (Expo) |
| `platform/tools` (API endpoints، health، Hangfire، localization، track changes، file manager) | **Optional: Admin tools** | مفيدة للـ platform admin، ومرتبطة بقدرات الـ backend |
| `platform/reporting` (Crystal) | **يفضل في HR** أو يبقى optional | مرتبط بتقنية تقارير معينة |
| `platform/tenant-administration/company-geographic-scope` | **HR** | |
| `modules/hr`, `accounting`, `crm` | **يفضل في HR** | |
| `modules/reference-data/geography/countries` | **Sample/reference feature** | الوثائق بتعتبر Countries هو الـ feature المرجعي، فيبقى هو المثال الحي في الـ template (زي `Subjects` في الويب) |
| `scripts/check-architecture`, `module-boundaries`, `check-i18n`, `check-release-readiness`, `check-native-config`, `check-dependency-compatibility` | **Standard** | تتعمم وقائمة الـ modules تتولد تلقائيًا |
| `scripts/sync-phase00-matrix.mjs`, `check-contract-matrix.mjs` | **تتعاد صياغتها** | مربوطة بوثائق المشروع. الفكرة (مطابقة الـ routes مع عقود الـ API) ممتازة وتتحول لفحص عام |

---

## 4. القرار الأكبر: عقد الـ API بين الويب والموبايل

عندك دلوقتي **backend-ين بعقدين مختلفين للـ auth والـ tenancy**:

| الجانب | School / Standard | HR |
|---|---|---|
| الدخول | `select-token` ثم `access-token` مع `X-Tenant` | `login` بيرجع `authenticated` أو `tenant-selection` أو `company-selection` |
| المستويات | tenant | tenant + **company** جوه الـ tenant |
| الحقول | `tenants[]: {tenantId, name, role}` | `tenants[]: {id, identifier, name}` و `companies[]` |
| Account self-service | ناقص | موجود: register، وforgot/reset، وconfirm email، وinvitations |
| قدرات إضافية | audit أمني | Hangfire، وtrack changes، وlocalization API، وfile manager، وnotifications، وSignalR، وreports |

**الـ template لازم يبقى فيه عقد واحد.** وبناءً على اللي شفته من جانب الموبايل، **الـ HR backend غالبًا أغنى في الأساسيات** اللي حددناها للـ template (self-service، وnotifications، وrealtime، وjobs، وfiles، وchange tracking). اللي أقترحه:

1. تديني صلاحية على الـ HR backend وفولدر `documentation`، علشان أعمل مقارنة مباشرة بين الـ backend-ين في الأساسيات.
2. نقرر **core الـ API للـ template**: واحد منهم، أو دمج (الأمان والـ RBAC والـ subscriptions من الـ Standard + الـ self-service والـ jobs والـ notifications من الـ HR).
3. نقرر هل **مستوى الـ Company داخل الـ tenant** جزء من الـ Standard. رأيي إنه يبقى **optional** (Organization units)، لأن SaaS كتير محتاجاه (شركة ليها فروع أو شركات تابعة)، وكتير لأ.

---

## 5. التعديلات المطلوبة وقت الاستخلاص

| # | المشكلة | الحل في الـ template |
|---|---|---|
| 1 | `core/constants/routes.ts` فيه كل routes الـ domain (والـ core المفروض leaf) | كل module يعرّف routes بتاعته في `moduleDefinition`، والـ core يعرف الـ platform routes بس |
| 2 | `permissions.ts` و`route-manifest.ts` مركزيين في `platform/auth` | الـ module يسجّل الـ permissions والـ routes والـ drawer items. والـ manifest يتبني من الـ registry. ويُفضّل الـ permission catalog يتولد من الـ API (OpenAPI أو endpoint) |
| 3 | الترجمات مركزية في `core/localization/translations/*` | namespaces لكل module (`modules/<m>/i18n/{ar,en}.ts`)، والـ core فيه `common` بس. ونفس ملفات الـ platform تتشارك مع الويب في `packages/i18n` |
| 4 | `module-boundaries.mjs` فيه أسماء الـ modules مكتوبة يدوي | تتولد من الـ registry أو من الـ manifest |
| 5 | الوثائق في `../documentation` | `docs/` جوه التطبيق المتولد (architecture، وfeature guide، وstyle guide) + skills في نظام التخطيط |
| 6 | `.env.example` فيه رابط production حقيقي (`shabanhrms.runasp.net`) | قيم placeholder بس |
| 7 | Zod v4 في الموبايل و v3 في الويب | توحيد على **v4** قبل `packages/contracts` |
| 8 | React 19.2.3 (مثبت من RN 0.86) و 19.3.0 في الويب، وNode 22.13 و 24 في الـ template | الـ packages المشتركة تستخدم `peerDependencies`، وتوحيد نسخة Node في الـ monorepo |
| 9 | مكتبات UI خارجية: `react-native-toast-message`، و`react-native-big-calendar`، و`expo-linear-gradient` في Button | تتماشى مع قرار "native بدون مكتبات UI": الـ Toast موجود بالفعل كـ host داخلي فيستغنى عن المكتبة، والـ calendar يبقى في module الـ scheduling بس، والـ gradient يبقى optional variant |
| 10 | `xlsx` من CDN (مش npm registry) | يفضل كده (SheetJS بينشر كده)، بس يتوثق ويتقفل بـ checksum |
| 11 | override لـ `decode-uri-component` من `vendor/` | يتوثق سببه، وتتراجع الحاجة ليه مع كل تحديث |
| 12 | coverage threshold منخفض (حوالي 20%) | حد أعلى لـ `core` و`platform` (مثلًا 70%)، ومرن للـ modules |
| 13 | أسماء فيها `erp`/`ERP_LOCAL_NATIVE_BUILD`/`erp-system-mobile` | tokens (`__APP_NAME__`) في الـ generator |
| 14 | الـ theme: typography أحجام بس، ومفيش line-height/weights/font family، ومفيش elevation | تكملة الـ tokens (خط عربي، وأوزان، وارتفاعات، وظلال، وtouch target) في `packages/tokens` |

---

## 6. شكل الموبايل داخل الـ monorepo المقترح

```text
apps/mobile/
├── app/                      Expo Router (رفيع)
├── src/
│   ├── core/                 api, config, storage, query, validation, providers, observability, localization-infra
│   ├── platform/             auth, rbac, tenant-access, administration, notifications, realtime, modules, navigation
│   ├── shell/                layouts + module-registration (من الـ manifest)
│   └── modules/
│       └── sample/           feature مرجعي (Countries-style) يتشال أو يتكرر
├── scripts/                  check-architecture, check-i18n, check-release, check-native-config
└── docs/
packages/
├── tokens/                   ← من core/theme
├── ui-native/                ← من shared/components
├── contracts/                ← Zod v4 (من OpenAPI)
├── api-client/               ← من core/api (بدون تبعية لـ React Native)
└── i18n/                     ← common + platform (ar/en)
```

**Optional modules** (بتتفعل من الـ manifest): Offline، وAdmin tools، وSpreadsheet import، وCharts، وReporting.

---

## 7. خطة الاستخلاص المقترحة

| # | الخطوة | الناتج |
|---|---|---|
| 1 | مقارنة الـ HR backend بالـ Standard وقرار عقد الـ API الموحّد | Decision + contract |
| 2 | استخراج `packages/tokens` من `core/theme` وربطه بالويب (Tailwind/shadcn) والموبايل | مصدر ألوان وخطوط واحد |
| 3 | استخراج `packages/ui-native` من `shared/components` + توحيد الأسماء والـ props مع مكونات الويب | مكتبة الموبايل |
| 4 | فك الاقتران: routes وpermissions وترجمات لكل module، وmodule-boundaries متولد | registry-driven app |
| 5 | Template `apps/mobile` Standard: core + platform + shell + sample module + scripts + docs | تطبيق يشتغل على الـ API الموحّد |
| 6 | Offline كـ optional module + Admin tools كـ optional | modules منفصلة |
| 7 | Generator: `New-MobileProject.ps1` + دمج في `New-FullStackProject.ps1` + الـ feature generator يطلّع شاشات الموبايل | توليد كامل |
| 8 | تطبيق HR نفسه يتحول يستخدم الـ template (زي المدرسة) | إثبات إن الـ template شغال على تطبيقين حقيقيين |

الخطوة 1 بتحدد شكل كل اللي بعدها، علشان كده تيجي الأول.
