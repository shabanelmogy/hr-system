# استخدام معايير القوائم والرابط

بعد Phase06 Verified، أنشئ codec بسياسة صريحة للحقول/operators والأنواع والحدود
المسموح وضعها في الرابط. approved-public قرار موثق لمالك القائمة، وليس موافقة
تلقائية على بيانات personnel/financial أو صلاحية وصول. لا تولّد السياسة من DTO.

أنشئ createRouteCollectionCriteria داخل مالك الصفحة؛ applied هو المعيار الملتزم،
والنص الجاري كتابته draft منفصل. اربط Shared MyDataGrid/CardList وtoolbarFilters؛
apply للمعايير، page/size/sort عبر نفس المساعد، refresh/export يستخدمان applied فقط.
مالك الميزة يحول أسماء الحقول/paging/sort إلى API wire ويتحقق من النوع والسياق.

false و0 وnull والفلتر الغائب قيم مختلفة. explicit Apply يحدث الرابط بعد نجاح
Router؛ الفشل/الإلغاء لا يلتزم بحالة متوقعة. الثانية أثناء pending ترجع blocked،
ولا queue مخفية. reset يمسح parameter المملوك ويحافظ على بقية الرابط/fragment.
لا تكتب الرابط من effect ولا تستخدم localStorage لحفظ السياق/الفلتر هنا.

اجمع scopeKey الحالي + criteriaKey + page/size في هوية الطلب، وألغِ/احجب النتائج
القديمة باستخدام المصدر المشترك وخدمة المالك. الرابط لا يملك company/auth أو
صلاحيات. المعايير السيئة ترجع defaults مع invalid، ولا يعاد كتابة الرابط تلقائيًا.
التصدير وسكوب اختياره وفلاتره الفعلية قرار API/الميزة ومطلوب اختباره في S3.

المعاينة /dev/criteria تقنية ببيانات محاكاة، وeditor/:record يثبت الرجوع فقط؛ ليست
Countries CRUD. شغّل browser بعد انتهاء الكتابة/build لتجنب HMR أثناء القبول.
