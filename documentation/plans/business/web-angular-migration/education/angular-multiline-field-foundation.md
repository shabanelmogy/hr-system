# استخدام النص متعدد الأسطر المشترك

بعد Phase06 Verified، استخدم TextField الحالي مع [multiline]="true" و[rows]="4".
اربط FormControl نصيًا داخل FormContainer؛ لا تبنِ textarea محلية أو shell جديدًا.
الحفظ يظل متاحًا وتحقق المالك يعرض الرسائل أسفل الحقل ويضبط التركيز المشترك.

Enter يضيف سطرًا، ولا يحفظ. لا trim أو تفسير HTML. الكتابة/reset وتغيير الشكل
صامتة؛ تغيير DOM إلى input قد يخفي أسطرًا بصريًا دون تغيير القيمة الأصلية.
معنى الحقل وrequired/maxLength وحفظه وصلاحياته ملك الشاشة والـAPI.
[maxLength] للواجهة مع Validators.maxLength للتحقق من قيم التحميل أيضًا؛ العداد
UTF16 وليس عدد graphemes. rows من1 إلى20، والافتراضي/البديل3.

استخدم label/help/messages مترجمة من SQL LocalizationRuntime. النص والبريد
وكلمة المرور والأرقام يواصلون استخدام نفس الواجهة؛ multiline لا يحوّل البريد/
كلمة المرور/NumericField إلى textarea. لا autoResize أو rich text في هذه الشريحة.
التمدد رأسي بحد24rem، مع تمرير داخلي. readonly/disabled يحميان المسح والإدخال.
تقرير القبول والصور في angular-multiline-field-foundation؛ لا قبول business form
أو native UI أو نشر SQL بمجرد معاينة /dev/multiline التقنية.
