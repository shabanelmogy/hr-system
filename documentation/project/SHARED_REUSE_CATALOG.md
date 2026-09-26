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
| P-006 Scoped Relationship / Mapping Editor | Role Permissions table/group editor | Role Permissions module-card editor (`Adapted`) | علاقات أو mappings كثيرة داخل scope مع dirty/read-only/save contract |
| P-007 Settings Navigation Hub | Ledger Setup overview + Accounting module definition | Ledger Setup overview + Accounting module definition | مدخل permission-filtered لأطفال مستقلين بلا generic CRUD ownership |

المعرف `P-004` محجوز لـStepper لكنه ما يزال `Candidate` ولا يجوز اختياره في
عقد تنفيذ حتى يُسجل بمرجع فعلي وعقد قبول كامل. التفاصيل والحدود واختبارات كل
نمط موجودة في [SCREEN_PATTERN_CATALOG.md](SCREEN_PATTERN_CATALOG.md).

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
| مكونات وسلوك Next.js العام | [server-managed-feature-reference.md](../web-next/features/server-managed-feature-reference.md) | ميزات الويب التي تتبع قائمة وإدارة خادم |
| هيكل تطبيق Expo | [MOBILE_ARCHITECTURE.md](../mobile-react/MOBILE_ARCHITECTURE.md) | كل موديولات الموبايل |
| نمط واجهة Expo | [MOBILE_STYLE_GUIDE.md](../mobile-react/MOBILE_STYLE_GUIDE.md) | الشاشات والمكونات الأصلية |
| التنفيذ العام لميزات الموبايل | [MOBILE_FEATURE_GUIDE.md](../mobile-react/MOBILE_FEATURE_GUIDE.md) | ميزات الموبايل متعددة الطبقات |
| غلاف الموديول والتنقل المشترك في Next.js | [frontend-architecture-reference.md](../web-next/architecture/frontend-architecture-reference.md#shared-module-shell-behavior) | Basic Data وWorkforce Planning وAttendance وأي موديول ويب جديد |
| تعريف تنقل الموديول واشتقاق قوائم الموديول الفرعي | [frontend-architecture-reference.md](../web-next/architecture/frontend-architecture-reference.md#route-and-entitlement-ownership-baseline) | `src/modules/hr/navigation` و`hrModuleDefinition.navigation` وطبقة shell |
| دورة سياق المستخدم والشركة والحماية من فقدان التعديلات | [frontend-architecture-reference.md](../web-next/architecture/frontend-architecture-reference.md#user-and-company-context-lifecycle) | `SessionContext` و`MainShell` و`UnsavedChangesProvider` ومبدّل الشركة |
| تحميل أدوات التصدير عند الطلب | [frontend-architecture-reference.md](../web-next/architecture/frontend-architecture-reference.md#on-demand-feature-tooling) | `useGridExport` وقوائم الجداول التي تدعم التصدير |

## قرار الإضافة أو التمديد

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
