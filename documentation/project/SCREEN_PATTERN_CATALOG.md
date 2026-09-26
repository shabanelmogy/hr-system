# Screen Pattern Catalog

هذا الكتالوج هو المرجع المركزي لأنماط الشاشات القابلة لإعادة الاستخدام في
الويب والموبايل. النمط يحدد شكل التركيب، حالات التشغيل، حدود إعادة الاستخدام،
ومعايير القبول؛ ولا يحدد حقول المجال أو صلاحياته. كل ميزة جديدة تختار نمطًا
مسجلًا أو تضيف نمطًا جديدًا وفق البروتوكول في نهاية هذا الملف.

## الحالة والملكية

- **Status:** Active baseline for new screens.
- **Owner:** Shared UX/Frontend documentation, مع احتفاظ كل موديول بملكية
  عقوده وبياناته وصلاحياته.
- **References are evidence:** Countries وCost Center وAdd Tenant مراجع
  تنفيذية للتركيب والسلوك، وليست مصدرًا لحقول أو قواعد أعمال ميزة أخرى.
- **Platform fit:** اختيار النمط مستقل لكل منصة. يمكن للويب استخدام split
  layout وللموبايل استخدام stacked layout ما دام العقد والرحلة متكافئين.

## مصفوفة المراجع عبر المنصات

حالة المنصة داخل النمط تستخدم واحدة من القيم التالية:

- `Implemented`: المرجع الحالي يطبق تركيب النمط وسلوكه مباشرة.
- `Adapted`: نفس رحلة العمل والعقد، مع تركيب مختلف يناسب المنصة.
- `Deferred`: مطلوب وله مالك وشرط إعادة فتح، ولا يوجد UI مضلل حاليًا.
- `Excluded`: غير مطلوب على المنصة بقرار منتج صريح.

| Pattern | Web reference/status | Mobile reference/status | Shared primitives | الاختلاف المقصود |
| --- | --- | --- | --- | --- |
| P-001 Grid/CRUD | Countries `CountriesPage` + `CountriesMultiView` — `Implemented` بخمس طرق عرض Grid/Cards/Chart/Report/Import | Countries `CountriesScreen` — `Implemented` بخمس طرق عرض Table/Cards/Chart/Report/Import | Web list/grid/form/report/import shared components؛ Mobile `AppListScreen`, `AppMultiView`, `AppDataTable`, `AppDataCard`, `AppForm` ومنصة Reporting المشتركة | Report في Reference Data هو Global managed Crystal: `super_admin` + `GlobalCrystalReports:View` فقط، بلا tenant entitlement؛ Tenant reports هي `CrystalReports:View` + accessible Reporting module. Import يتبع create permission والـread-only policy |
| P-002 Tree + Master/Detail | Cost Centers `CostCentersPage` + `CostCenterTreeDiagram` + `SplitTreeView` — `Implemented` | `CostCentersScreen` + `OrganizationalStructureManagementScreen` + `OrganizationalStructureTreeDiagram` + `AppHierarchicalTree` — `Implemented` | Web `SplitTreeView`؛ Mobile `AppHierarchicalTree` | Web يعرض split view عند توفر المساحة؛ Mobile يستخدم stacked/detail navigation ولا يضغط عمودين داخل الهاتف |
| P-003 Tabbed multi-section form | Add Tenant في `TenantManagementPage` + `FormTabs` + `MyForm` — `Implemented` | `TenantManagementScreen` + `TenantFormModal` + `AppForm` — `Adapted` | Web `FormTabs`/`MyForm`؛ Mobile `AppForm` و`AppFormTabs` عند اعتماد tabs | Web maps the first invalid field to its tab and focuses it after the tab is mounted. Mobile Add Tenant remains one full-screen stacked form with one validation context; `AppFormTabs` is covered as the reusable primitive, not forced into this flow |
| P-005 Singleton Settings Editor | Ledger Setup `LedgerSetupResourcePage` لمسار Accounting Company Settings — `Adapted` evidence | `LedgerSetupResourceScreen` + `LedgerSetupForm` لمسار Accounting Company Settings — `Adapted` evidence | Web `PageHeader` + `MyForm`؛ Mobile `AppPageHeader` + `AppForm` | المرجع يثبت رحلة التحميل/التحرير/الحفظ لسجل واحد فقط؛ الـgeneric resource switch والـcatch-all DTO ليسا جزءًا من النمط أو المعمارية المستهدفة |
| P-006 Scoped Relationship / Mapping Editor | Role Permissions `RolePermissionsPage` + `useRolePermissions` — `Implemented` | `RolePermissionsScreen` + `PermissionModuleCard` — `Adapted` | shared filters, feedback, dirty-state, save/read-only shells | Web يستخدم قائمة شاشات رأسية ويفتح صلاحيات كل شاشة داخل Accordion؛ Mobile يستخدم بطاقات شاشات رأسية قابلة للفتح. كلاهما يحافظ على scope، الاختيار، dirty state، الصلاحيات والحفظ الصريح |
| P-007 Settings Navigation Hub | `LedgerSetupOverviewPage` + Accounting module definition — `Implemented` | `LedgerSetupOverviewScreen` + Accounting module definition — `Implemented` | module navigation, page headers, permission-filtered route manifests | الـHub يكتشف ويفتح الرحلات فقط؛ لا يملك DTO عامًا أو CRUD أو business state للأطفال |

هذه المصفوفة هي سجل حقيقة التنفيذ. لا يجوز تغيير حالة منصة إلى `Implemented`
من دون مسار مصدر فعلي واختبار أو evidence مناسب، ولا يعني `Adapted` أن المنصة
يمكنها حذف حقل أو validation أو permission من العقد المشترك.

## عقد استهلاك الكتالوج في التخطيط

يُستهلك هذا الكتالوج قبل أي تنفيذ شاشة من خلال
`documentation/plans/FEATURE_DECOMPOSITION_TEMPLATE.md` (الإصدار `2.0`). لكل
Screen ID وعلى كل منصة، يجب أن يذكر عقد الميزة Pattern ID، المسار الدقيق للمصدر
الذي تمت مراجعته، قرار form/sub-pattern، حالة المنصة، وقدرات Grid/Table/Cards/
Tree/Detail/Report/Import/Export/Chart كـ`Required` أو `Deferred` أو `Excluded`.
كما يسجل حالات loading/empty/error/forbidden/dirty/conflict، سياسة offline وMock
Data، scope والصلاحيات، responsive/RTL/accessibility، وأي اختلاف مقصود.

النمط `Candidate` يوقف تنفيذ واجهة المستخدم. لا يتحول إلى `P-###` نشط إلا بعد
تسجيله هنا بمرجع مصدر فعلي واختبارات/دليل مراجعة وقرار واضح للمنصتين. يكفي
اختيار نمط قائم فقط عندما يكون المصدر الفعلي مطابقًا لرحلة العمل؛ لا يكفي ذكر
اسم مكوّن shared أو نسخ شكل Countries.

## P-001 — Server-managed Grid / CRUD

### الاستخدام

يُستخدم لقائمة مسطحة أو شبه مسطحة من سجلات مستقلة نسبيًا، مثل Countries أو
Currency أو Address Types، عندما تكون الرحلة الأساسية: list، search/filter،
create، edit، archive/restore، وview permissions.

### المرجع الحالي

- Web (`Implemented`):
  `web-next/src/modules/reference-data/geographical-information/countries/pages/CountriesPage.tsx`
  و`web-next/src/modules/reference-data/geographical-information/countries/components/CountriesMultiView.tsx`.
- Mobile (`Implemented`):
  `mobile-react/src/modules/reference-data/geography/countries/presentation/screens/CountriesScreen.tsx`
  مع `AppListScreen`, `AppMultiView`, `AppDataTable`, `AppDataCard`, و`CountryForm`.
- Web shared list/form primitives يجب فحصها أولًا تحت
  `web-next/src/shared/components/`.
- Mobile shared list/form primitives يجب فحصها أولًا تحت
  `mobile-react/src/shared/components/`.

### العقد الإلزامي

1. يملك `services` استدعاء `apiService`، وتملك React Query أو طبقة الاستعلام
   المقابلة المفاتيح والكاش والـmutations.
2. يستخدم الجدول أو البطاقات مكونات الـshared المعتمدة، ولا يعيد feature إنشاء
   toolbar أو pagination أو loading/empty/error state محليًا.
3. يدعم البحث والتصفية والترقيم والفرز حسب عقد API؛ لا تُنفذ تصفية محلية
   توحي بنتائج غير موجودة في الخادم.
4. يدعم إنشاء وتعديل السجل بنفس عقد النموذج المشترك، مع Zod/validation على
   العميل، وأخطاء الخادم أسفل الحقل المعني، وتركيز أول حقل غير صالح.
5. يوضح حالات loading، empty، error، forbidden، archive/restore، وconflict أو
   concurrency إن كان العقد يدعمها.
6. يراعي RTL، الترجمة، أحجام الشاشة، وإمكانية الوصول للجدول والبطاقات.
7. تكون الصلاحيات والـtenant/company scope جزءًا من العقد؛ إخفاء زر الواجهة
   لا يغني عن authorization في API.
8. عندما تكون الميزة **Geographic/Reference Data** وتملك عقود Chart وManaged
   Report وAtomic Import، يكون مرجع Countries الكامل هو خمس طرق عرض:
   `Grid|Table`, `Cards`, `Chart`, `Report`, `Import`. يجب أن تستخدم الشاشة
   المكونات المشتركة نفسها، وأن تخفي Report أو Import فقط عند غياب صلاحيتها أو
   module entitlement، لا بسبب اختلاف محلي في تركيب الشاشة.

### ما لا يُنسخ تلقائيًا من Countries

وجود هذا النمط لا يعني أن كل كيان في النظام يحتاج Chart أو Import أو Report.
يجب أن يصنف عقد الميزة كل قدرة `Required` أو `Deferred` أو `Excluded`. لكن عند
اختيار Countries كمرجع لميزة بيانات جغرافية تقبل العقود الخمسة، تصبح الطرق
الخمس جزءًا من المطابقة المطلوبة على الويب والموبايل ولا يجوز إسقاط إحداها من
منصة بلا قرار موثق. الحقول وسياسة الأرشفة تظل ملكًا للمجال ولا تُنسخ.

## P-002 — Tree + Master / Detail

### الاستخدام

يُستخدم للبيانات الهرمية التي تحتاج تحديد عقدة ثم عرض تفاصيلها أو تحريرها، مثل
Cost Centers وChart of Accounts. الشجرة ليست بديلًا عن عقد API ولا تمنح ضمنيًا
إمكانية إعادة الأب أو تغيير الترتيب.

### المرجع الحالي

- Web (`Implemented`):
  `web-next/src/modules/hr/basic-data/organizational-structure/management/pages/CostCentersPage.tsx`,
  `web-next/src/modules/hr/basic-data/organizational-structure/management/components/tree-view/CostCenterTreeDiagram.tsx`,
  و`web-next/src/shared/components/tree-view/SplitTreeView.tsx`.
- Mobile (`Implemented`):
  `mobile-react/src/modules/hr/basic-data/organizational-structure/presentation/screens/CostCentersScreen.tsx`,
  `mobile-react/src/modules/hr/basic-data/organizational-structure/presentation/screens/OrganizationalStructureManagementScreen.tsx`,
  `mobile-react/src/modules/hr/basic-data/organizational-structure/presentation/components/OrganizationalStructureTreeDiagram.tsx`,
  و`mobile-react/src/shared/components/tree-view/AppHierarchicalTree.tsx`.

### العقد الإلزامي

1. يحدد الخادم علاقة `parentId`، المستوى، الترتيب، lifecycle، وrow version؛
   لا تستنتج الواجهة صحة النقل أو الأب من الرسم وحده.
2. على الشاشات الكبيرة يستخدم الويب split tree/detail مع حالة واضحة للعقدة
   المحددة، وحالة فارغة عند عدم الاختيار.
3. على الموبايل يُستخدم عرض stacked أو انتقال إلى detail screen مع الحفاظ على
   back behavior، ولا يُفرض عرض عمودين ضيقين.
4. يكون create/edit/archive/restore ظاهرًا فقط إذا كان مسموحًا في الصلاحيات؛
   drag/reparent لا يُنفذ إلا بعقد مستقل يعرّف التحقق والتعارض والتراجع.
5. يوضح البحث داخل الشجرة، expand/collapse، loading لكل جزء، empty tree،
   forbidden، not found، وserver conflict.
6. يستخدم النمط المشترك للـtree وdetail shell، بينما تبقى حقول الحساب أو
   مركز التكلفة وقواعد المجال داخل الموديول المالك.
7. يجب أن يكون التنقل إلى التفاصيل قابلًا للوصول بلوحة المفاتيح أو قارئ الشاشة
   وأن يحافظ على RTL ومرساة العقدة المختارة عند إعادة التحميل.

## P-003 — Tabbed Form

### الاستخدام

يُستخدم عندما يمثل النموذج aggregate أو configuration متعدد الأقسام، وتصبح
الشاشة الطويلة أو المتطلبات المختلفة لكل قسم صعبة القراءة في Section واحد.
التبويبات تنظّم العرض فقط؛ لا تغيّر عقد API ولا تقسّم عملية الحفظ إلى عمليات
مستقلة إلا إذا وُجد workflow صريح لذلك.

### المرجع الحالي: Add Tenant

- Web (`Implemented`): `web-next/src/platform/tenants/TenantManagementPage.tsx`
- Web layout primitive: `web-next/src/shared/components/forms/layouts/FormTabs.tsx`
- Web form shell: `web-next/src/shared/components/forms/dialog/MyForm.tsx`
- الأقسام الفعلية في المرجع: `identity`, `subscription`, `contact`,
  `entitlements`, `notes`.
- Mobile (`Adapted`):
  `mobile-react/src/platform/tenants/presentation/screens/TenantManagementScreen.tsx`
  و`mobile-react/src/platform/tenants/presentation/components/TenantFormModal.tsx`
- Mobile form shell: `mobile-react/src/shared/components/forms/AppForm.tsx`
- Mobile tabs primitive المتاح عند اعتماد التبويبات على الموبايل:
  `mobile-react/src/shared/components/forms/layouts/AppFormTabs.tsx`.

المرجع الحالي للموبايل يعرض Add Tenant كـfull-screen stacked form ولا يستدعي
`AppFormTabs`. لذلك حالته `Adapted` وليست تطبيقًا حرفيًا لـTabbed layout. هذا
اختلاف موثق في الكثافة، وليس دعوة لإعادة كتابة قواعد النموذج. عند اعتماد tabs
على الموبايل يستخدم `AppFormTabs`؛ وإذا بقي stacked يجب أن يحافظ على نفس عقد
الحقول والتحقق والصلاحيات والحفظ وdirty-state وأخطاء الخادم.

### العقد الإلزامي

1. يوجد **form context واحد** وschema واحد للـaggregate كله. لا تنشئ كل tab
   form مستقلًا ولا ترسل طلب حفظ جزئيًا من دون قرار workflow موثق.
2. في تطبيق tabs يملك كل tab قائمة field names أو section contract حتى يمكن
   تحديد `hasError` وترجمة رسالة مثل “يوجد خطأ في هذا القسم”. في تطبيق Mobile
   stacked تحتفظ الأقسام بنفس الملكية من دون عرض tab غير موجود.
3. عند الإرسال الفاشل ينتقل تطبيق tabs تلقائيًا إلى أول tab يحتوي خطأ ثم يركز
   أول حقل غير صالح. تطبيق stacked يمرر ويركز أول حقل غير صالح مباشرة. في
   الحالتين تظهر الرسالة تحت الحقل من خلال المكوّن المشترك.
4. يظل Save/Create متاحًا للمستخدم؛ التحقق يشرح الأخطاء ولا يعتمد على browser
   native validation أو `alert`/`confirm`.
5. يسجل النموذج dirty state ويحمي الإغلاق، cancel، تغيير الصفحة، وتغيير الشركة
   من فقدان التعديلات عبر آلية unsaved-changes المشتركة.
6. تكون أزرار Save/Cancel وloading وserver error في shell ثابت، ولا تتغير
   مواضعها أو سلوكها من tab إلى آخر.
7. تُعاد أخطاء الخادم إلى الحقول أو القسم المقابل. الأخطاء العابرة للأقسام
   تظهر في ملخص قابل للوصول مع رابط يعيد المستخدم إلى القسم الصحيح.
8. تُحسم تبعيات الأقسام في schema أو domain/application layer. يمكن لقسم
   Entitlements أن يعتمد على اختيار Plan، لكن لا تُخفى قاعدة المجال داخل
   `FormTabs` أو مكوّن shared.
9. التبويب الحالي لا يضيع عند إعادة التصيير، وتُستخدم `keepMounted` عندما
   يحتاج React Hook Form إلى بقاء الحقول المسجلة. لا تُخزّن قيمة حقل في state
   محلي موازٍ للـform.
10. deep-linking إلى tab، عند وجود tabs، مسموح فقط إذا كان مفيدًا ويمكن حمايته
    من عرض بيانات غير مصرح بها؛ وإلا يبقى tab state داخليًا ويبدأ النموذج من
    أول قسم.
11. على الشاشات الصغيرة تتحول التبويبات إلى عرض قابل للتمرير أو stacked، مع
    label واضح وaria state، ومنع قص العناوين في RTL.
12. يغطي تطبيق tabs: tab selection، validation/error badge، والانتقال لأول
    خطأ. ويغطي كل تطبيق: dirty close، submit loading، server field error، focus
    لأول حقل، RTL، وإعادة ضبط baseline بعد حفظ ناجح.

### الحدود

- لا يستخدم P-003 لخطوات workflow مرتبة بضرورة إكمال كل خطوة قبل التالية؛ استخدم
  `FormStepper` وسجل ذلك كـP-004 عندما تتكرر الحاجة.
- لا يستخدم لتجميع صفحات مستقلة لها APIs أو صلاحيات أو lifecycle مختلفة؛ هذه
  قد تكون master/detail أو wizard أو navigation flow.
- لا ينسخ عدد تبويبات Add Tenant أو أسماءها إلى موديول آخر؛ الذي يُنسخ هو
  contract والسلوك العام فقط.

## P-005 — Singleton Settings Editor

**الحالة:** `Active` — راجع في 2026-09-25.

### الاستخدام

يُستخدم عندما تملك الشركة أو الـscope سجل إعداد واحدًا ذا هوية ثابتة، مثل
`AccountingCompanySettings`. لا تُعرض الـsingleton كقائمة ذات صف وهمي ولا
تُمنح archive/delete lifecycle لا يملكه عقد المجال.

### المرجع الحالي وحدوده

- Web (`Adapted` evidence):
  `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx`.
- Mobile (`Adapted` evidence):
  `mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupResourceScreen.tsx`
  و`mobile-react/src/modules/accounting/ledger-setup/presentation/components/LedgerSetupForm.tsx`.
- اختبارات boundary/schema الحالية:
  `web-next/src/modules/accounting/ledger-setup/services/ledgerSetupService.test.ts`،
  `web-next/src/modules/accounting/ledger-setup/validation/ledgerSetupValidation.test.ts`،
  `mobile-react/src/modules/accounting/ledger-setup/data/remote/__tests__/ledger-setup-remote-boundary.test.ts`،
  و`mobile-react/src/modules/accounting/ledger-setup/presentation/validation/ledger-setup-schema.test.ts`.

هذه المراجع تثبت تركيب رحلة singleton الحالية فقط. لا يعتمد النمط
`resourceName` switch، أو catch-all fields، أو DTO عام. المستهلك المستهدف يجب
أن يملك service/query/schema/form typed باسمه، وتظل إعادة بناء Ledger Setup
إلى أطفال typed عملاً مطلوبًا لا يغلقه تسجيل النمط.

### العقد الإلزامي

1. يحمل المسار سجلًا واحدًا للـscope الحالي بعقد GET/PUT أو upsert typed، مع
   `RowVersion` أو token التزامن عند وجوده.
2. يفرّق بين loading، unconfigured، configured، load error، save error،
   forbidden، read-only، وconflict؛ غياب الصف ليس قائمة فارغة.
3. يستخدم Web `MyForm` والحقول المشتركة، ويستخدم Mobile `AppForm` وحقوله؛
   تظل Save متاحة وتظهر validation تحت كل حقل مع focus لأول خطأ.
4. تعتمد selectors على lookups مالكة ومحددة النطاق، ولا تُخزّن labels أو
   كائنات غير موثوقة بدل المعرفات التي يطلبها العقد.
5. يحمي dirty navigation، ويعيد baseline بعد الحفظ، ويعيد تحميل الحقيقة
   الحالية عند conflict. لا يوجد delete/archive إلا إذا أثبته عقد المجال.
6. يملك feature النصوص والصلاحيات وقواعد dependencies؛ shell المشترك يملك
   layout وvalidation focus وloading/feedback فقط.

## P-006 — Scoped Relationship / Mapping Editor

**الحالة:** `Active` — راجع في 2026-09-26.

### الاستخدام

يُستخدم لتحرير علاقات أو تعيينات كثيرة داخل scope محدد، مثل Role Permissions،
Account Mappings، أو قيود أبعاد الحساب، عندما يختار المستخدم عناصر/علاقات ثم
يحفظ مجموعة مقصودة كوحدة واضحة. لا يستخدم كبديل عام لـCRUD إذا كانت كل علاقة
aggregate مستقلاً ذا lifecycle منفصل.

### المرجع الحالي

- Web (`Implemented`):
  `web-next/src/platform/auth/roles/components/RolePermissionsPage.tsx`،
  `web-next/src/platform/auth/roles/components/role-permissions/`،
  و`web-next/src/platform/auth/roles/hooks/useRolePermissions.ts`.
- Mobile (`Adapted`):
  `mobile-react/src/platform/administration/presentation/roles/permissions/screens/RolePermissionsScreen.tsx`
  و`mobile-react/src/platform/administration/presentation/roles/permissions/components/PermissionModuleCard.tsx`.

Role Permissions مرجع لتركيب الاختيار/التصفية/dirty-state/read-only والحفظ،
وليس مصدرًا لحقول Accounting أو قرار replace مقابل versioned mappings. على
كل مستهلك إضافة اختبارات عقده، لأن وجود المرجع لا يثبت قواعد المجال الجديد.

### العقد الإلزامي

1. يحدد العقد scope، عناصر المصدر، العلاقات الحالية، الفرق dirty، ودلالة
   الحفظ بدقة: replace-set أو delta أو versioned records؛ لا تستنتج الواجهة ذلك.
2. تُحمّل source/target capabilities والlookups من المالك الفعلي، وتختفي
   الخيارات غير المدعومة بدل إظهار placeholders أو معرفات مختلقة.
3. يفرق UI بين loading، empty source، no matches، partial lookup error، save
   error، forbidden، read-only، conflict، وsaved baseline.
4. تحفظ filters/search اختيار المستخدم ولا تفقد تغييرات مخفية بالفلتر. يعرض
   ملخصًا واضحًا للتغييرات قبل الحفظ عندما تكون المجموعة كبيرة أو حساسة.
5. يعرض Web العناصر المصدرية كشاشات رأسية قابلة للفتح، ويعرض الصلاحيات داخل
   Accordion الشاشة المختارة بدل مصفوفة إجراءات أفقية. يستخدم Mobile stacked
   cards أو sections، مع تكافؤ كامل في العلاقات والصلاحيات والتحقق.
6. توجد dirty-navigation protection، Save صريح، server-authoritative validation،
   وإعادة تحميل بعد conflict. لا تعتبر checkbox state المحلية حقيقة مالية.

### خط أساس Web لتفاعل شاشة الصلاحيات — 2026-09-26

- المشكلة المرصودة: تمدد إجراءات الصلاحيات كأعمدة أفقية يجعل الشاشة أصعب في
  القراءة ويخفي سياق الشاشة عند زيادة عدد الإجراءات.
- القرار: الدور المختار هو scope الصفحة، وتظهر الموارد/الشاشات كقائمة رأسية.
  الضغط على شاشة يفتح Accordion واحدًا يعرض إجراءاتها فقط، مع عداد المحدد،
  وأمر تحديد أو إلغاء كل صلاحيات الشاشة.
- تحفظ التصفية والبحث والترقيم والتغييرات غير المحفوظة كما هي، ولا يؤدي إغلاق
  Accordion أو انتقال المستخدم بين الصفحات إلى إسقاط الاختيارات.
- يستخدم Web النمط نفسه في العرض المكتبي والصغير؛ لا تعاد مصفوفة action-per-column
  ولا يظهر scrollbar أفقي لإدارة الصلاحيات.
- يجب أن يربط كل عنوان Accordion بمحتواه عبر `id` و`aria-controls`، وأن تحمل كل
  خانة اختيار اسمًا قابلًا للوصول يجمع اسم الإجراء واسم الشاشة.
- لا يغير هذا النمط عقد API: يظل الحفظ replace-set الكامل للدور، وتظل سلطة
  التحقق والتنفيذ على الخادم.

### خط أساس Mobile لتفاعل شاشة الصلاحيات — 2026-09-26

- يظل الدور المختار هو scope الرحلة، وتظهر الموارد للمستخدم باسم «الشاشات» في
  قائمة بطاقات رأسية Native بلا جدول أو تمرير أفقي.
- عنوان البطاقة هدف لمس قابل للوصول لا يقل عن 44 نقطة، ويحمل اسم الشاشة وحالة
  `expanded`. يفتح الضغط صلاحيات شاشة واحدة فقط، ويغلق فتح شاشة أخرى البطاقة
  السابقة من دون فقد الاختيارات غير المحفوظة.
- تظهر الصلاحيات داخل البطاقة عبر `AppSwitchField`، مع إجراء مستقل لتحديد أو
  إلغاء كل صلاحيات الشاشة، وترتيب ثابت للإجراءات الشائعة يبدأ بالعرض ثم الإضافة
  والتعديل ثم الحذف، وتأتي الإجراءات المتخصصة بعد ذلك بترتيب أبجدي ثابت.
- يعرض ملخص الرحلة عدد الصلاحيات المحددة ونسبة التغطية وعدد التغييرات المعلقة
  مقارنة بخط أساس الخادم. البحث يطابق اسم الشاشة واسم الإجراء المترجم.
- تستخدم الرحلة مكونات Mobile المشتركة والثيم الدلالي، وتدعم EN/AR وRTL والوضع
  الداكن، وتحمي dirty navigation. يتحقق handler الحفظ نفسه من edit permission
  وread-only وSystem Role ولا يعتمد على تعطيل الزر وحده.
- لا يغير هذا التكييف عقد API أو offline policy: يظل الحفظ online-authoritative
  replace-set كاملًا للدور، ولا تمثل حالة switches المحلية حقيقة خادم قبل النجاح.

## P-007 — Settings Navigation Hub / Launcher

**الحالة:** `Active` — راجع في 2026-09-25.

### الاستخدام

يُستخدم لمدخل إعدادات يجمع روابط أطفال مستقلين، مثل Ledger Setup. هو طبقة
اكتشاف وتنقل وصلاحيات فقط، وليس aggregate أو generic CRUD owner.

### المرجع الحالي

- Web (`Implemented`):
  `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupOverviewPage.tsx`
  و`web-next/src/modules/accounting/moduleDefinition.tsx`؛ ويغطي
  `web-next/src/modules/accounting/moduleDefinition.test.tsx` تسجيل المسارات.
- Mobile (`Implemented`):
  `mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupOverviewScreen.tsx`
  و`mobile-react/src/modules/accounting/moduleDefinition.ts`.

### العقد الإلزامي

1. كل card/row يربط Screen ID وroute وtranslation وView permission/submodule
   معروفًا. لا تظهر وجهة ميتة أو طفل Deferred كميزة جاهزة.
2. يخفي أو يعطل الوجهات وفق سياسة المنتج الموثقة، بينما يبقى API authorization
   هو السلطة. global read-only يمنع الكتابة داخل الطفل ولا يحول الـHub إلى form.
3. يعرض loading/error/forbidden للـroute manifest أو entitlements إن كانت
   ديناميكية، ويحافظ على back/breadcrumb behavior وdeep links.
4. يستخدم responsive cards/list مع ترتيب منطقي في RTL، أسماء قابلة للوصول،
   وحالة focus واضحة. Mobile لا ينسخ grid مكتبيًا ضيقًا.
5. لا يستدعي child CRUD services ولا يملك catch-all DTO أو `resourceName`
   dispatch. كل طفل يحتفظ بخدمته واستعلاماته ونموذجه وعقده typed.
6. يختبر تسجيل المسارات، permission filtering، عدم وجود links ميتة، والتنقل
   إلى طفل ممثل على كل منصة مطلوبة.

## مصفوفة اختيار النمط

| شكل البيانات والرحلة | النمط المبدئي | قرار يجب تسجيله |
| --- | --- | --- |
| Collection مسطحة مع CRUD وخدمات بحث/ترقيم | P-001 Grid/CRUD | هل هي بيانات جغرافية تقبل مرجع Countries ذي الخمس طرق، أم أن Chart/Report/Import مصنفة صراحة Deferred/Excluded؟ |
| Hierarchy مع اختيار عقدة وتفاصيل | P-002 Tree + Master/Detail | هل النقل أو إعادة الترتيب مسموحان بعقد مستقل؟ |
| Aggregate أو إعداد متعدد الأقسام يحفظ كوحدة | P-003 Tabbed Form | tabs أم stacked على الموبايل؟ وهل توجد تبعيات بين الأقسام؟ |
| سجل إعداد واحد لكل company/scope | P-005 Singleton Settings Editor | ما حالة unconfigured؟ وما عقد GET/PUT والتزامن؟ |
| تحرير علاقات أو mappings داخل scope | P-006 Scoped Relationship / Mapping Editor | هل الحفظ replace-set أم delta أم records فعالة/versioned؟ |
| Hub لاكتشاف إعدادات أطفال مستقلة | P-007 Settings Navigation Hub | كيف تُصفى الوجهات بالصلاحيات؟ وهل كل route فعلي ومسجل؟ |
| Workflow مرتب يحتاج إكمال خطوة قبل التالية | Candidate P-004 Stepper | لا يعتمد حتى يُسجل reference وعقد التحقق |
| شاشة تشغيلية خاصة لا تطابق الأنماط السابقة | Candidate | لا تُجبر على نمط قريب؛ سجّل reference وسبب الاستثناء |

## بروتوكول تسجيل نمط جديد أو تحديث نمط قائم

1. ابدأ ببحث read-only في الكتالوج ومكونات `shared` ومراجع feature المسجلة.
2. ابحث عن **نفس رحلة العمل** في Web وMobile، وتحقق من المصدر الحالي لكل منصة،
   وليس من screenshot أو نسخة قديمة؛ سجل المسارات الفعلية والاختبارات التي
   تثبت السلوك.
3. امنح النمط معرفًا ثابتًا `P-###`، وحدد `Proposed` أو `Active` أو `Deprecated`
   والمالك وتاريخ المراجعة.
4. سجّل لكل منصة `Implemented` أو `Adapted` أو `Deferred` أو `Excluded`. لا
   يعتمد النمط كـ`Active` إلا بمرجع source حقيقي على منصة واحدة على الأقل وقرار
   صريح للمنصة الأخرى.
5. اكتب Web/Mobile applicability، وإعادة الاستخدام، وحالات loading/empty/error/
   forbidden/dirty/conflict، ومتطلبات RTL وaccessibility وresponsive.
6. حدّد ما هو reusable layout وما هو feature-owned data/permission/business
   rule. لا تحول اختلاف مجال إلى option غامض في shared component.
7. أضف أمثلة مصدرية واختبارات وحدودًا واضحة، ثم اربط كل مستهلك في feature
   profile بـ`Required` أو `Deferred` أو `Excluded`.
8. حدّث في **نفس التغيير** هذا الكتالوج و
   [SHARED_REUSE_CATALOG.md](SHARED_REUSE_CATALOG.md) ودليلي Web/Mobile وملفات
   feature profiles المتأثرة. إذا تغيرت evidence surface فحدّث manifest والوصفة
   وأعد التوليد من المصدر canonical؛ لا تعدّل `documentation/system/generated/`
   يدويًا.
9. أضف Change Log يذكر سبب الإضافة أو التعديل، المستهلكين المتأثرين، ونتائج
   الاختبارات أو سبب تأجيلها.

### Checklist ظهور نمط شاشة جديد

- هل تكرر تركيب الشاشة أو رحلة العمل في ميزتين مستقلتين، أم ما زال خاصًا بمجال؟
- ما أقرب مرجع حقيقي في Web، وما نظيره في Mobile؟
- هل اختلاف المنصة `Adapted` ergonomics فقط، أم اختلاف capability يجب تصنيفه
  `Deferred` أو `Excluded`؟
- ما المكونات المشتركة الموجودة قبل إنشاء مكوّن جديد؟
- هل العقود والحقول والصلاحيات والـvalidation والـloading/error/empty متكافئة؟
- هل حدثت المصفوفة وfeature profiles والـrequired-files/recipes عند تغير الأدلة؟
- هل توجد اختبارات للمكونات المشتركة ورحلة ممثلة على كل منصة مطلوبة؟

## Anti-patterns

- نسخ JSX من Countries أو Add Tenant مع تغيير الأسماء فقط.
- إنشاء Grid أو Form محلي يكرر shared toolbar/dialog/validation/dirty-state.
- بناء renderer عام ضخم يحتوي قواعد كل الموديولات تحت flags غامضة.
- وضع business rules أو API calls أو صلاحيات الموديول داخل shared layout.
- اعتبار تحديث DTO أو migration دليلًا على اكتمال واجهة الويب والموبايل.
- إضافة drag-and-drop للشجرة من دون عقد نقل وتعارض وتدقيق.
- إخفاء خطأ في tab غير نشط أو ترك المستخدم يبحث عن أول حقل غير صالح.
- اعتبار اختلاف Mobile stacked عن Web tabs فشلًا؛ القرار يجب أن يكون موثقًا
  ومتكافئًا وظيفيًا.

## Change Log

| التاريخ | التغيير | المستهلكون |
| --- | --- | --- |
| 2026-09-22 | تثبيت Countries كمرجع الخمس طرق لميزات Geographic/Reference Data التي تملك عقود Chart وManaged Report وAtomic Import، وتوحيد بوابة Report بالصلاحية وReporting entitlement | Countries، States، Districts، Address Types، وأي ميزة جغرافية جديدة |
| 2026-09-22 | إنشاء P-001 Countries Grid/CRUD وP-002 Cost Center Tree/Master/Detail وP-003 Add Tenant Tabbed Form | Reference Data، Platform، HR، Accounting عند اعتماد النمط |
| 2026-09-22 | ربط كل نمط بمرجعي Web/Mobile وإضافة حالات Implemented/Adapted/Deferred/Excluded وقاعدة تحديث النظيرين | كل الشاشات الجديدة أو المعاد بناؤها |
| 2026-09-23 | إغلاق P1/P2/P3: Global Report بوابة مشتركة role+permission بلا tenant query، Tenant Report بوابة permission+Reporting module، واختبارات تركيب Cost Center وFormTabs وAdd Tenant على المنصتين | Countries، States، Districts، Address Types، Organizational Structure، Cost Centers، Add Tenant |
| 2026-09-23 | توحيد Local Mock Data كقدرة في shell النماذج: كل رحلة إدخال قابلة للكتابة تملأ draft محليًا صالحًا دون submit/persist أو اختلاق identity/scope/concurrency؛ الشاشات read-only/report/query-only لا تصطنع بيانات، ولا تستخدم feature flags مبنية على NODE_ENV/DEV | Accounting Currency، Fiscal Years، COA Accounts، Hierarchy Levels، وكل مستهلك لاحق لـMyForm/AppForm |
| 2026-09-25 | اعتماد P-005 Singleton Settings Editor وP-006 Scoped Relationship/Mapping Editor وP-007 Settings Navigation Hub بمراجع Web/Mobile فعلية وحدود تمنع اعتماد Ledger Setup generic renderer كمعمارية مستهدفة | Ledger Setup Company Settings، Dimensions Constraints، Link Accounts، Ledger Setup Overview، وأي مستهلك لاحق مطابق |
| 2026-09-26 | تحديث مرجع P-006 على Web إلى قائمة شاشات رأسية؛ يفتح Accordion الشاشة صلاحياتها بدل مصفوفة الإجراءات الأفقية، مع تثبيت الوصول وdirty-state والحفظ الصريح | Role Permissions وأي محرر علاقات كثيف يختار P-006 لاحقًا |
| 2026-09-26 | توحيد مرجع P-006 على Mobile إلى بطاقات شاشات رأسية قابلة للفتح مع مصطلحات EN/AR متطابقة، ترتيب إجراءات، عداد تغييرات، accessibility state وحماية handler الحفظ | Role Permissions وأي محرر علاقات Mobile يختار P-006 لاحقًا |
