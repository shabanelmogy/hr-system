# خطة Angular — ابدأ من هنا

هذه خطة الانتقال التدريجي إلى Angular 22 وPrimeNG مع الاحتفاظ بـweb-next. الخطة الشاملة ما زالت Draft، بينما شرائح التنفيذ المحددة لها أدلة قبول مستقلة. اكتملت مصادقة Cookies والأساس والترجمة والثيم والنماذج والدخول والهيكل والوحدات وصفحة البداية حسب الحساب وتبديل الشركة الآمن مع التبويبات. راجع ROADMAP لمعرفة الوحدة الوحيدة النشطة والخطوة التالية؛ لا تعني هذه النتائج اكتمال شاشات ERP كلها.

أحدث النتائج: [سنة العمل المالية](../../../modules/platform/features/angular-fiscal-year-context/IMPLEMENTATION_REPORT.md)، [تبديل الشركة](../../../modules/platform/features/angular-company-context/IMPLEMENTATION_REPORT.md)، [الهيكل المشترك](../../../modules/platform/features/angular-application-shell/IMPLEMENTATION_REPORT.md)، [الوحدات والتنقل](../../../modules/platform/features/angular-module-navigation/IMPLEMENTATION_REPORT.md)، [صفحة البداية](../../../modules/platform/features/angular-role-home/IMPLEMENTATION_REPORT.md).

## اقرأ بالترتيب

1. [PLAN](PLAN.md): النطاق والملكية والمعمارية والقبول والتشغيل.
2. [ANGULAR_ARCHITECTURE](ANGULAR_ARCHITECTURE.md): الموديولات والمكونات المشتركة والحالة والألوان.
3. [ERP_ACCEPTANCE](ERP_ACCEPTANCE.md): 12 متطلبًا لصحة البيانات وسرعة الإدخال والقبول.
4. [ROADMAP](ROADMAP.md): ترتيب العمل والاعتماديات وتوقيت تطبيق المتطلبات.
5. [DECISIONS](DECISIONS.md): المعتمد والمقترح والقرارات الباقية.
6. [REVIEW](REVIEW.md): مراجعة الجاهزية والقيود ونتائج فحوص الخطة.

## أدلة ومساعدة التنفيذ

- [INVENTORY](INVENTORY.md): مسارات Next الحالية؛ وجود المسار لا يثبت اكتمال الميزة.
- [EVIDENCE](EVIDENCE.md): حقائق المصدر مقابل المطلوب والافتراضات والمجهول.
- [DISCOVERY](DISCOVERY.md) و[SPEC_SUMMARY](SPEC_SUMMARY.md): طلبك وحدود التحويل.
- [RESEARCH](RESEARCH.md): المصادر الرسمية للقرارات التقنية.
- [AUTHENTICATION_PREFLIGHT](AUTHENTICATION_PREFLIGHT.md): نتيجة أول مراجعة في مرحلة
  التحقق التأسيسي؛ عقود الدخول الحالية، بدائل حفظ الجلسة، والفجوات والاختبارات المطلوبة.
- [BROWSER_AUTHENTICATION_CONTRACT](BROWSER_AUTHENTICATION_CONTRACT.md): عقد النقل
  المستهدف لمسار Cookies الآمنة المعتمد داخل الـAPI، مع المسارات والحماية والتوافق والقبول.
- [SIGMA_ACCEPTANCE](SIGMA_ACCEPTANCE.md): النقاط الثمانية المعتمدة من مراجعة Sigma،
  بمعرّفات وشروط قبول ومالكين وتوقيت، وحدود تكييفها مع Angular 22 وZoneless وStrict.
- [IMPLEMENTATION_BRIEF](IMPLEMENTATION_BRIEF.md): مدخلات وتسليم مهمة واحدة بعد التصريح بتنفيذها.
- [عقد تنفيذ مصادقة المتصفح](decomposition/platform-browser-authentication.md):
  الوحدة المحددة للفحص، وربط API والويب والموبايل والتحقق والإغلاق.

التوثيق يفرق بين خطة قوية وبين ادعاء أن التطبيق تم تنفيذه واختباره. كل ميزة
تحتاج أدلة قبول فعلية. إضافة احتياج أعمال جديد مستقبلًا تُراجع في نطاقها، ولا
تغير سياسة البساطة أو تعيد إدخال BFF تلقائيًا.
