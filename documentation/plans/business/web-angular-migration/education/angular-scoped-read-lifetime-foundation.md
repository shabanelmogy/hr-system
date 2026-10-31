# استخدام القراءة المحددة بعمر المالك

استخدم createScopedRead الحالي داخل Injector/Component مالك القراءة. مرر identity
immutable فيه السياق والصلاحية، وallowed نقي يعتمد عليه، وخدمة تعيد DTO كاملًا
ومتحققًا منه مع timeout. callback تستقبل identity الملتقطة؛ zero-arg القديمة صالحة.
لا ترسل HTTP progress أو stream تغييرات إلى bootstrap؛ أول قيمة تقفل الاشتراك.

الـhelper يملك loading/error/forbidden/ready والإلغاء وحجب الرد القديم. EMPTY وفشل
بدء المصدر يرجعان error قابلًا للمحاولة. retry للحالة error، وrefresh لا يكرر القراءة
أثناء loading. invalidate لإشعار تحديث صريح، ويلغي pending المناسب للسياق الحالي.
لا يتجاوز403 أو null أو identity قديمة. مهلة النقل والتحقق من DTO تظل ملك الخدمة.

اشترك منفصلًا في إشعارات المالك المسموح بها، فلتر current scope، واستخدم
takeUntilDestroyed. الإشعار لا يحتوي بيانات موثوقة ولا يمنح إذنًا؛ يستدعي invalidate.
مالك الميزة يقرر coalescing/reconnect/missed-event reconciliation والاحتفاظ باسم
الاختيار والتحميل المحلي/الصفحة. لا global spinner أو cache جديدة هنا.

AuthSession.readIdentity الحالي null أثناء تغيير السياق؛ استخدمه للمستهلك المناسب
ولا تكتفِ بتغيير Company Header مع استمرار مصدر قديم. لا mutate للهوية في مكانها.
FOLLOW-017 يملك قبول مستهلك الأعمال والـAPI/watch الحقيقيين؛ معاينة /dev/reads تقنية
بـSubject/timers وعدادات، لا تثبت SignalR/SQL أو اكتمال S1/S3.
