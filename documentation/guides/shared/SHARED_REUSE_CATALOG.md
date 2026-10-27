# Shared reuse catalog

هذا فهرس للوثائق التي تصف القدرات المشتركة المعتمدة. هو لا ينسخ عقودًا أو
يعلن API جديدًا؛ قبل كل ميزة نقرأ المصادر المرتبطة ونسجل قرار إعادة الاستخدام
في كتاب الميزة المالك.

## كتالوج أنماط الشاشات

[SCREEN_PATTERN_CATALOG.md](SCREEN_PATTERN_CATALOG.md) هو المرجع الإلزامي
لاختيار تركيب الشاشة قبل إنشاء Grid أو Tree/Master-Detail أو Tabbed Form.
المعرفات الحالية هي:

| Pattern | Web reference | Mobile reference | الاستخدام |
| --- | --- | --- | --- |
| P-001 Grid/CRUD | Countries Page/MultiView | Countries Screen و`AppListScreen` | قوائم البيانات المسطحة ذات إدارة الخادم |
| P-002 Tree + Master/Detail | Cost Centers و`SplitTreeView` | Cost Centers و`AppHierarchicalTree` | البيانات الهرمية |
| P-003 Tabbed multi-section form | Add Tenant و`FormTabs` | Add Tenant full-screen stacked عبر `AppForm` (`Adapted`) | aggregate أو إعداد متعدد الأقسام |
| P-005 Singleton Settings Editor | Ledger Setup Company Settings journey + `MyForm` (`Adapted`) | Ledger Setup Company Settings journey + `AppForm` (`Adapted`) | سجل إعداد واحد لكل company/scope؛ المرجع العام الحالي evidence مؤقت وليس target architecture |
| P-006 Scoped Relationship / Mapping Editor | Role Permissions module-first rail + screen accordion editor | Role Permissions responsive module selector + screen disclosure-card editor (`Adapted`) | علاقات أو mappings كثيرة داخل scope، تدعم grouping بموديول مالك مع dirty/read-only/save contract |
| P-007 Settings Navigation Hub | Ledger Setup overview + Accounting module definition | Ledger Setup overview + Accounting module definition | مدخل permission-filtered لأطفال مستقلين بلا generic CRUD ownership |
| P-008 Global Scoped Context Selector | shared `ContextBadge`/`ContextSwitcher` + Tenant/Company/Fiscal Year Topbar composition | shared `AppContextBadge` + Tenant/Company/Fiscal Year App-header composition عبر `NavigationContextActionsProvider` (`Adapted`) | عرض هوية scope موحدة واختيار سياق عالمي موثوق مع dirty guard وعزل user/company وفصل domain owner عن Shell slot |

الأنماط المرشحة `P-004` (Stepper/Wizard) و`P-008` (Transactional Document)
و`P-009` (Record View) و`P-010` (Dashboard) و`P-011` (Kanban) و`P-012` (Calendar)
و`P-013` (Activity & Chatter) و`P-014` (Work Queue) ما تزال `Candidate` ولا يجوز
اختيارها في عقد تنفيذ حتى تُسجل بمرجع فعلي وعقد قبول كامل. الكتالوج يحدد
لكل منها المكونات المشتركة الموجودة اليوم والناقص قبل التفعيل.

قبل اختيار النمط اتبع **قواعد اختيار النمط** المرتبة، وبعده **قواعد التركيب
المشتركة C-01..C-11** (حاوية النموذج، شكل القائمة، فتح السجل، المراجع،
الإجراءات، الألوان الدلالية للحالة، الحالات الإلزامية، التجاوب، هيكل الصفحة)
في [SCREEN_PATTERN_CATALOG.md](SCREEN_PATTERN_CATALOG.md).

### Managed reporting authorization boundary

`web-next/src/modules/reporting/public/useManagedReportAvailability.ts` is the
shared consumer policy for report views. It has two explicit scopes:

- `global`: `super_admin` **and** `GlobalCrystalReports:View`; it passes
  `enabled=false` to the accessible-module query and never depends on a tenant
  Reporting entitlement.
- `tenant`: `CrystalReports:View` **and** an accessible `reporting` module.

Countries, States, and Districts use the global scope. Address Types and
Organizational Structure use the tenant scope. The feature view hides Report,
falls back to Grid if authorization is lost, and `ManagedCrystalReportView`
also disables catalog requests until authorization is settled and allowed.
Policy and query-defense evidence lives in
`web-next/src/modules/reporting/public/useManagedReportAvailability.test.ts` and
`web-next/src/modules/reporting/crystal-report-manager/ManagedCrystalReportView.test.tsx`.

اختيار النمط لا ينقل حقول المرجع أو قواعده. يجب أن يسجل feature profile ما تم
إعادة استخدامه، وما هو `Required` أو `Deferred` أو `Excluded` لكل منصة.

| المجال | المصدر المرجعي | يستخدمه |
| --- | --- | --- |
| API modular monolith وملكية الموديول | [MODULAR_MONOLITH_ARCHITECTURE.md](../api/MODULAR_MONOLITH_ARCHITECTURE.md) | كل موديولات الـAPI |
| مكونات وسلوك Next.js العام | [server-managed-feature-reference.md](../web/server-managed-feature-reference.md) | ميزات الويب التي تتبع قائمة وإدارة خادم |
| هيكل تطبيق Expo | [MOBILE_ARCHITECTURE.md](../mobile/MOBILE_ARCHITECTURE.md) | كل موديولات الموبايل |
| نمط واجهة Expo | [MOBILE_STYLE_GUIDE.md](../mobile/MOBILE_STYLE_GUIDE.md) | الشاشات والمكونات الأصلية |
| التنفيذ العام لميزات الموبايل | [MOBILE_FEATURE_GUIDE.md](../mobile/MOBILE_FEATURE_GUIDE.md) | ميزات الموبايل متعددة الطبقات |
| غلاف الموديول والتنقل المشترك في Next.js | [frontend-architecture-reference.md](../web/architecture/frontend-architecture-reference.md#shared-module-shell-behavior) | Basic Data وWorkforce Planning وAttendance وأي موديول ويب جديد |
| تعريف تنقل الموديول واشتقاق قوائم الموديول الفرعي | [frontend-architecture-reference.md](../web/architecture/frontend-architecture-reference.md#route-and-entitlement-ownership-baseline) | `src/modules/hr/navigation` و`hrModuleDefinition.navigation` وطبقة shell |
| عنوان صفحة Web كثيفة | `PageHeader` simple مع `compact` | Role Permissions وأي workspace يحتاج عنوانًا أصغر دون إنشاء header محلي |
| دورة سياق المستخدم والشركة والحماية من فقدان التعديلات | [frontend-architecture-reference.md](../web/architecture/frontend-architecture-reference.md#user-and-company-context-lifecycle) | `SessionContext` و`MainShell` و`UnsavedChangesProvider` ومبدّل الشركة |
| اختيار سياق عمل عالمي P-008 | [SCREEN_PATTERN_CATALOG.md](SCREEN_PATTERN_CATALOG.md#p-008--global-scoped-context-selector) | Web `ContextBadge`/`ContextSwitcher` وTopbar slots؛ Mobile `AppContextBadge` و`NavigationContextActionsProvider` و`AppAppBar`؛ Tenant identity وCompany/Fiscal Year selectors |
| تحميل أدوات التصدير عند الطلب | [frontend-architecture-reference.md](../web/architecture/frontend-architecture-reference.md#on-demand-feature-tooling) | `useGridExport` وقوائم الجداول التي تدعم التصدير |

## قرار الإضافة أو التمديد

### إثبات إعادة استخدام مكونات القوائم والفلاتر

وجود import لمكوّن مشترك واحد لا يثبت الالتزام بالنمط. قبل تعديل قائمة، سجّل
في كتاب الميزة جدولًا يربط كل جزء من الشاشة بالمكوّن الفعلي ومصدره. راجع
الجدول في المتصفح، بما فيه الفلاتر المفتوحة، ولا تعتمد على نجاح TypeScript
أو لقطة للفلاتر وهي مغلقة. المرجع القديم الذي يستخدم controls محلية لا يلغي
العقد الحالي؛ خذ منه قواعد المجال فقط وطبّق التركيب المشترك الحالي.

| جزء الشاشة | Web contract/source under `web-next/src/shared/components/` | Mobile contract/source under `mobile-react/src/shared/components/` |
| --- | --- | --- |
| العنوان وتبديل العرض والتحديث والتصدير وفتح الفلاتر | `navigation/header/PageHeader.tsx`, `variant="multi-view"`؛ زر الفلاتر في `HeaderActions` | `AppPageHeader` + `AppListScreen`/`AppMultiView` |
| البحث وإعادة الضبط وحاوية المعايير | `lists/card-view/CardViewHeader.tsx`/`CardViewToolbar.tsx` أو `MyDataGrid.toolbarSearch`؛ بحث واحد للنتيجة المشتركة | `AppListScreen` search/actions، مع حقول مشتركة للمعايير الخاصة بالمجال |
| التاريخ | `forms/date-time/MyDateTimeField.tsx`, `mode="date"` | `AppDateTimeField` |
| النص والاختيارات | `MyTextField` و`MySelect`؛ `size="small"` و`margin="none"` للمعايير عند انطباقهما | `AppTextField` و`AppSelectField` |
| النتائج والترقيم والحالات | `MyDataGrid`, `EntityCard`, `CardViewPagination`, `FeedbackState` | `AppDataTable`, `AppDataCard`, `AppListScreen` pagination, `AppStateView` |

في القوائم ذات ترتيب ثابت على الخادم، يقبل `CardViewHeader`/`CardViewToolbar`
الخيار العام `showSort={false}` دون callbacks وهمية. الافتراضي يظل إظهار
الفرز للمستهلكين الحاليين. `filterControls` يستقبل عناصر `Grid` لصف معايير
إضافي؛ الحاوية المشتركة تملك المسافات، والميزة تملك الحقول والقيم وخرائط API.
`showFilter={false}` يخفي الاختيار البسيط المشترك عندما تستخدم الميزة هذا
الصف، مع الحفاظ على توافق props القديمة. `MySelect.size` افتراضيه `medium`،
واختيار `small` يمر إلى حقل الإدخال الحقيقي دون CSS محلي لتعديل ارتفاعه.

Error Logs هو مستهلك فعلي لهذه الخيارات: `web-next/src/platform/error-logs/pages/ErrorLogsPage.tsx`.
في Grid يستخدم MyDataGrid.toolbarSearch وResetButton وGridOptionsButton وGridFooter
وتنقل السجلات، ويمرر نفس حقول المعايير إلى toolbarFilters. في Cards يستخدم
CardViewHeader مع filterControls. كلا العرضين يستهلك حالة خادم واحدة دون بحث مكرر. المعايير تظل متاحة عند empty/error، وإخفاؤها
أو تبديل العرض لا يغير قيمها. على الهاتف تبقى لوحة المعايير داخل مساحة تمرير
محدودة حتى تظل النتائج قابلة للوصول. المراجعة الإلزامية تشمل EN/AR وRTL،
الهاتف وسطح المكتب، حالة empty ثم Reset، واستمرار المعايير بين العرضين.

توافق الخيارات والحقول مغطى في `CardViewHeader.test.tsx`؛ مسار المعايير الفعلي
في `web-next/e2e/error-logs.spec.ts`. لا تُنسخ واجهة Error Logs إلى ميزة أخرى:
استخدم المكونات العامة مع حقول تلك الميزة وعقدها.

قبل إنشاء shared component أو service أو Contract:

1. ابحث في هذه المصادر وفي مكونات الموديول المالك.
2. أعد الاستخدام إن كان العقد مناسبًا، أو مدّد القطعة بإضافة اختيار عام
   متوافق للخلف؛ لا تضع قاعدة مجال داخل shared.
3. إذا أُضيفت قدرة مشتركة فعلًا، حدّث دليلها العام في نفس التغيير، موضحًا
   الواجهة العامة والخيارات والقيم الافتراضية، مثال استخدام حقيقي، القيود،
   RTL وإمكانية الوصول، حالات التحميل والخطأ، التوافق، والاختبارات.
4. اربط المستهلكين المتأثرين بملفاتهم feature profiles، وسجّل لكل منصة
   `Required` أو `Deferred` أو `Excluded` مع السبب والمالك أو شرط إعادة الفتح.
5. شغّل التوليد وفحص التوثيق إذا تغيّرت أقسام مرقمة أو مصادر وصفة.

عند ظهور نمط جديد، لا تضف مكوّنًا محليًا قبل تحديث كتالوج الأنماط وتسجيل
المعرف الثابت، المرجع التنفيذي، حدود shared، حالات الاستخدام، وقائمة الاختبارات.
يجب فحص نفس رحلة العمل في Web وMobile وتسجيل حالة كل منصة صراحة؛ لا يُسجل
مرجع منصة واحدة ويُترك النظير الآخر ضمنيًا. اختلاف layout الموثق مسموح إذا
حافظ على العقد والسلوك والصلاحيات والتحقق.

الترقية إلى shared قرار ملكية، وليست اختصارًا لتجنب تسمية الموديول أو توثيقه.
السجل الحالي يفهرس الوثائق فقط؛ تفاصيل كل Contract أو مكوّن تبقى في مصدره
الرسمي وفي ملفات المستهلكين.

## حماية التغييرات غير المحفوظة في الويب

العقد العام هو `useUnsavedChangesRegistration(active, busy?)` لتسجيل النموذج
و`requestDiscard(): Promise<boolean>` قبل أي انتقال يملكه التطبيق. القيمة
`active` تعني وجود تغييرات قابلة للفقد، و`busy` تمنع الانتقال أثناء الإرسال.
لا يحتاج المستهلك إلى إدارة حوار أو سجل المتصفح بنفسه.

```tsx
useUnsavedChangesRegistration(formState.isDirty, formState.isSubmitting);

const { requestDiscard } = useUnsavedChanges();
if (await requestDiscard()) router.push(destination);
```

يعرض المزود `DiscardChangesDialog` المشترك بترجمة عربية وإنجليزية، ويدعم RTL
ولوحة المفاتيح من خلال نظام الحوارات المعتمد. يحمي الروابط الداخلية، ومبدلات
الموديول والشركة، والخروج من المستند. في المتصفحات الداعمة لـNavigation API
يحمي Back وForward قبل التزام الوجهة، بما في ذلك الانتقال عدة خطوات والنقر
المتكرر، دون إضافة أو حذف عناصر من history. في المتصفحات الأقدم تبقى حماية
الروابط و`beforeunload`، ولا توجد حماية مضمونة لتنقل history داخل المستند.

التوافق والاختبارات: يغطي `historyTraversalGuard.test.ts` الإلغاء، والموافقة
مرة واحدة، والوجهة متعددة الخطوات، وForward، وتغير صفحة الأصل، وإلغاء تركيب
المزود. يغطي `unsavedChangesRegistry.test.ts` تعدد النماذج وحالة الإرسال
والاشتراكات. يجب إبقاء رحلة متصفح فعلية ضمن فحص الإصدار للمتصفحات المدعومة.


### قاعدة Grid الإلزامية

قوائم Web تستخدم `MyDataGrid` من الـpublic API المشترك. لا يجوز استيراد
`ClientDataGrid` أو MUI DataGrid/Pro/Premium داخل الميزة؛ هذه تفاصيل تنفيذية
داخل shared. فحص `check:architecture` يطبق هذه القاعدة على imports بما فيها
aliases وdynamic imports؛ types الخاصة بالأعمدة والعقود مسموحة. اختبارات
`web-next/scripts/shared-grid-policy.test.mjs` تثبت حدود القاعدة.

`MyDataGrid.toolbarFilters?: ReactNode` صف إضافي من حقول Grid يملكه شكلًا
`DataGridToolbar`، ويملك المستهلك القيم والقواعد. `emptyContent?: ReactNode`
يعرض FeedbackState المشترك داخل noRowsOverlay مع الإبقاء على البحث والمعايير
وإعادة الضبط؛ غيابه يحافظ على overlay الافتراضي. لا يبدل أي منهما GridFooter
أو تنقل السجلات أو الترقيم. لا يُمرر محتوى خاص بـError Logs إلى shared.

تمت إزالة استهلاك ClientDataGrid القديم في LocalizationDataGrid لصالح MyDataGrid،
مع الحفاظ على row editing وcallbacks والصلاحيات والترتيب الأصلي غير المفرز.
الإنشاء يسبقُه البحث الإلزامي عن مكوّن موجود؛ التمديد العام يسبق أي مكوّن
جديد، والمكوّن الجديد reusable/shared فقط عندما لا توجد قطعة مناسبة.


### Settings داخل Administration — القرار الحالي 2026-10-19

Administration تضم الشاشات التشغيلية ومدخل Settings واحدًا. تعرض Settings
محتوياتها الفعلية في تابات فوق FormTabs للويب وAppFormTabs للموبايل؛ لا تعرض
روابط أو بطاقات بدل المحتوى. يحدد سجل Platform التابات المسموح بها وفق حراس
مسارات الأطفال. كل إعداد يحتفظ بحفظه وصلاحياته ونطاقه وواجهته المشتركة؛ لا توجد
صلاحية أو DTO أو عملية Save عامة. سجل الأخطاء يظل بجوار Settings تحت الإدارة،
ومدة الاحتفاظ تاب داخلها للـSuper Admin بصلاحيتها المستقلة.

هذا P-007 composition مع أطفال P-005/P-001 مستقلين، وليس P-003 aggregate
بنموذج واحد. تبقى MyDataGrid وأدواتها والنماذج المشتركة داخل الأطفال. التاب
النشط فقط يُركّب، والتغيير المحمي يمر بآلية التعديلات غير المحفوظة المشتركة.
AppFormTabs.fillAvailable خيار عام لاحتواء محرر قابل للتمرير داخل شاشة ثابتة؛
الافتراضي يحافظ على المستخدمين السابقين. سجل Mobile المشترك يمنع التخلص من
نموذج أثناء الحفظ، ويحتفظ بسلوك التسجيل القديم عند غياب busy.

المرجع التطبيقي: documentation/modules/platform/features/platform-settings/.
هذا القرار يحل محل تنظيم المجموعتين المستقلتين المقبول بتاريخ 2026-10-18.

### كروت الإعدادات: مراجعة الشكل جزء من الالتزام

في Settings تُراجع كروت الطفل الفعلية، وليس حاوية التابات فقط. القيم الرقمية
تستخدم MetricCard بخياراتها الحالية للأيقونة والوصف والإجراء والحجم؛ لا تضغط
الإعداد الأساسي ومؤشرات التشغيل كلها في شرائط صغيرة متماثلة. حالات التحذير
والخطأ تتبع قيمة التشغيل الفعلية، ولا تضاف trends أو حالات محسوبة بلا عقد.

أقسام الإعدادات ذات controls تستخدم FormSection؛ خيار variant="outlined"
يضيف سطحًا موحدًا من theme مع padding متجاوب وحدود هادئة. plain يظل الافتراضي
مع divider القديم؛ outlined يخفي الفاصل الداخلي افتراضيًا، ويمكن إظهاره صراحة.
العنوان مرتبط بالقسم عبر aria-labelledby، والإجراءات تسمح بالالتفاف في العرض
الصغير. لا تُنسخ Card/CardContent وعناوين وأيقونات محلية عندما يغطيها هذا العقد.
Mobile يعيد استخدام AppCard + AppFormSection لنفس تركيب العنوان والوصف والأيقونة.

قبل الإغلاق، سجل صورة ومراجعة EN/AR وcompact/wide للتابات ذات الكروت، بالإضافة
إلى controls والحالات والإجراء الأساسي، حتى عندما تنجح TypeScript. سجل أي فرق
مقصود في كتاب الميزة؛ المصدر الفعلي والمراجعة المرئية مطلوبان، لا import فقط.


### Administration application grouping

Platform Administration uses the existing ModuleLauncher/SubmoduleLauncher (Web) and the established AppCard module tile renderer (Mobile). Compose a permission-filtered internal application from existing administrative child routes; do not recreate launcher cards or restore separate Users/Roles/Languages shortcut tiles. Configuration children stay in the Settings workspace's actual shared tabs. Keep this presentation group separate from backend installed/purchased-module contracts. Current source, compatibility and acceptance belong to the platform-settings feature manifest/books.


### Launcher icon foreground and sizing

ModuleLauncher/SubmoduleLauncher own the contrasting icon foreground and established icon size for all descendant SVGs in each icon surface, including SVGs nested in navigation ColoredIcon wrappers. Do not assume icons are direct SVG children, retain sidebar accent colors over a solid launcher background, or patch Administration locally with hardcoded colors. The shared launcher must enforce its theme foreground/size independently of wrapper specificity. Sidebar ColoredIcon retains its existing navigation behavior. Acceptance must inspect rendered computed SVG color/size in light/dark and AR compact, not only the existence of an icon prop/import.


### Read-only detail fields and user-requested text copy

Use DetailFields from shared/components/data-display for labelled read-only metadata: semantic description list, responsive columns, full-width long values, explicit text direction and null placeholders. Use FormSection for the section/card header/surface and MyForm for the dialog; do not duplicate those shells. Long titles/subtitles must wrap through the shared FormHeader without displacing its close action.

CopyButton from shared/components/forms composes MyButton and shared/utils/clipboard. It owns pending/success/failure/retry feedback; features supply only authorized text and their label. Clipboard text is plain text and copying starts only from the user action. The shared transport is reused by ErrorDialogHost and keeps the existing legacy-browser fallback with cleanup/focus restoration. Clipboard failures remain visible and retryable, without native alert/confirm. Features must format only data already allowed in their current scope; a generic copy component never adds hidden technical fields.


## Rich content and safe HTML previews

- Web `web-next/src/shared/components/forms/rich-text`: public MyRichTextField, lazy Tiptap field with controlled value/change/blur/ref/error, read-only/direction, localized formatting and generic cursor insertions. Import its sub-API dynamically; do not pull the editor into the broad forms barrel. Callers supply business tokens and server validation. Use shared MyForm for the surrounding data-entry lifecycle.
- Web `web-next/src/shared/components/preview`: public SafeHtmlPreview, inert sandbox iframe with restrictive CSP, no scripts/network/link navigation. Accept only already server-validated content. It represents rendered content, not a live external page.
- Mobile `mobile-react/src/shared/components/preview`: public AppHtmlPreview with native WebView and Web iframe implementations, static HTML and shared retry. Native originWhitelist supports inline source while onShouldStartLoadWithRequest independently restricts navigation to about:blank; JS/storage/files/cookies/resources are disabled. Parent composes the shared modal/scroll shell.

Initial consumer: Platform company-email-templates. These shared components contain no account-template permissions, placeholders or delivery rules. Preview host policy/props tests are reusable; actual email-client acceptance remains a separate release check.

Message history reuse2026-10-21: SafeHtmlPreview adds optional scrollable mode for already server-sanitized, non-navigable snapshots. It preserves opaque sandbox/CSP and permits keyboard/pointer scrolling; the original inert default remains unchanged. Never enable scrolling for HTML retaining active links/refresh/forms. API MessageSnapshotPolicy removes href and independently sanitizes all formatting attributes before storage. Shared public card-view API now exposes the existing ResetButton; do not create another reset control.
