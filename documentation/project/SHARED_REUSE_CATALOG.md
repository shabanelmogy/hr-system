# Shared reuse catalog

هذا فهرس للوثائق التي تصف القدرات المشتركة المعتمدة. هو لا ينسخ عقودًا أو
يعلن API جديدًا؛ قبل كل ميزة نقرأ المصادر المرتبطة ونسجل قرار إعادة الاستخدام
في كتاب الميزة المالك.

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
