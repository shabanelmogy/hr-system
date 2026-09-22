export const arCurrencies = {
  currencies: {
    title: 'العملات',
    empty: 'لا توجد عملات مطابقة للبحث والفلاتر الحالية.',
    fields: { currencyCode: 'كود العملة', nameAr: 'الاسم العربي', nameEn: 'الاسم الإنجليزي', symbol: 'الرمز', status: 'الحالة' },
    recordStatus: { active: 'السجلات النشطة', archived: 'السجلات المؤرشفة', all: 'كل السجلات' },
    search: {
      placeholder: 'ابحث في العملات',
      fields: { all: 'كل الأعمدة', currencyCode: 'كود العملة', nameAr: 'الاسم العربي', nameEn: 'الاسم الإنجليزي', symbol: 'الرمز' },
      operators: { contains: 'يحتوي', doesNotContain: 'لا يحتوي', equals: 'يساوي', doesNotEqual: 'لا يساوي', startsWith: 'يبدأ بـ', endsWith: 'ينتهي بـ' },
    },
    filters: { title: 'فلاتر العملات', description: 'فلترة دليل عملات الشركة حسب حالة السجل وحقول البحث.', recordStatus: 'حالة السجل', searchField: 'عمود البحث', operator: 'الشرط' },
    actions: { add: 'إضافة عملة' },
    form: { createTitle: 'إضافة عملة', editTitle: 'تعديل عملة', viewTitle: 'تفاصيل العملة', subtitle: 'إدارة دليل عملات الشركة المستخدم في المحاسبة ولقطات العملة التشغيلية.', identity: 'بيانات العملة' },
    validation: { code: 'أدخل ثلاثة أحرف إنجليزية بالضبط.', name: 'أدخل اسمًا بحد أقصى 100 حرف.', symbol: 'أدخل رمزًا بحد أقصى 10 أحرف.' },
    messages: { created: 'تم إنشاء العملة.', updated: 'تم تحديث العملة.', archive: 'تمت أرشفة العملة.', restore: 'تمت استعادة العملة.', loadFailed: 'تعذر تحميل العملات.', saveFailed: 'تعذر حفظ العملة.', actionFailed: 'تعذر تنفيذ إجراء العملة.' },
    confirm: { archiveTitle: 'أرشفة العملة؟', archiveDescription: 'أرشفة {{code}}. قد تمنع المراجع المحاسبية هذا الإجراء.', restoreTitle: 'استعادة العملة؟', restoreDescription: 'استعادة {{code}} إلى دليل عملات الشركة النشط.' },
  },
};
