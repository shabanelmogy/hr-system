export const arFiscalYears = {
  fiscalYears: {
    empty: 'لا توجد سنوات مالية مطابقة للبحث والفلاتر الحالية.',
    fields: { code: 'الكود', nameAr: 'الاسم العربي', nameEn: 'الاسم الإنجليزي', startDate: 'تاريخ البداية', endDate: 'تاريخ النهاية', frequency: 'دورية الفترات', status: 'الحالة' },
    frequency: { monthly: 'شهرية', quarterly: 'ربع سنوية' },
    status: { all: 'كل الحالات', draft: 'مسودة', open: 'مفتوحة', closing: 'قيد الإقفال', closed: 'مقفلة', locked: 'مقفولة نهائيًا' },
    recordStatus: { active: 'السجلات النشطة', archived: 'السجلات المؤرشفة', all: 'كل السجلات' },
    search: {
      placeholder: 'ابحث في السنوات المالية', fields: { all: 'كل الأعمدة', code: 'الكود', nameAr: 'الاسم العربي', nameEn: 'الاسم الإنجليزي' },
      operators: { contains: 'يحتوي', doesNotContain: 'لا يحتوي', equals: 'يساوي', doesNotEqual: 'لا يساوي', startsWith: 'يبدأ بـ', endsWith: 'ينتهي بـ' },
    },
    filters: { title: 'فلاتر السنوات المالية', description: 'فلترة التقويم المالي للشركة حسب حالة السجل ودورة السنة.', recordStatus: 'حالة السجل', lifecycle: 'حالة الدورة', searchField: 'عمود البحث', operator: 'الشرط' },
    actions: { add: 'إضافة سنة مالية', lifecycle: 'نقل الحالة' },
    lifecycle: { open: 'فتح السنة', beginClosing: 'بدء الإقفال', close: 'إقفال السنة', lock: 'القفل النهائي' },
    form: { createTitle: 'إضافة سنة مالية', editTitle: 'تعديل سنة مالية', viewTitle: 'تفاصيل السنة المالية', subtitle: 'تعريف التقويم المالي المستخدم في خطط القوى العاملة والميزانيات.', identity: 'هوية السنة المالية', calendar: 'التقويم والفترات', endDateHelper: 'يُحسب تلقائيًا ليغطي اثني عشر شهرًا بالضبط.', periodsHelper: 'تُنشأ الفترات الشهرية أو ربع السنوية تلقائيًا.' },
    periods: { title: 'الفترات المُنشأة', count: '{{count}} فترة', item: 'الفترة {{sequence}}' },
    validation: { code: 'أدخل كودًا صحيحًا من 2 إلى 20 حرفًا.', name: 'أدخل اسمًا صحيحًا من 2 إلى 100 حرف.', startDate: 'اختر تاريخ البداية.', endDate: 'اختر تاريخ النهاية.', duration: 'يجب أن تغطي السنة المالية اثني عشر شهرًا بالضبط.' },
    messages: { created: 'تم إنشاء السنة المالية.', updated: 'تم تحديث السنة المالية.', archive: 'تمت أرشفة السنة المالية.', restore: 'تمت استعادة السنة المالية.', lifecycle: 'تم نقل حالة السنة المالية.', loadFailed: 'تعذر تحميل السنوات المالية.', saveFailed: 'تعذر حفظ السنة المالية.', actionFailed: 'تعذر تنفيذ إجراء السنة المالية.' },
    confirm: {
      archiveTitle: 'أرشفة السنة المالية؟', archiveDescription: 'يمكن أرشفة السنة المالية في حالة المسودة فقط.', restoreTitle: 'استعادة السنة المالية؟', restoreDescription: 'سيعود التقويم المسودة إلى السجلات النشطة.',
      openTitle: 'فتح السنة المالية؟', openDescription: 'سيصبح التقويم متاحًا لخطط القوى العاملة ولن يمكن تعديله.', beginClosingTitle: 'بدء إقفال السنة المالية؟', beginClosingDescription: 'ستدخل السنة مرحلة الإقفال المحكومة.', closeTitle: 'إقفال السنة المالية؟', closeDescription: 'سيتم إقفال جميع الفترات.', lockTitle: 'قفل السنة المالية نهائيًا؟', lockDescription: 'القفل نهائي في هذا الإصدار.',
    },
  },
  FiscalYearNotificationTitle: 'تحديث السنة المالية',
  FiscalYearCreatedNotificationMessage: 'تم إنشاء السنة المالية {{Code}}.',
  FiscalYearUpdatedNotificationMessage: 'تم تحديث السنة المالية {{Code}}.',
  FiscalYearArchivedNotificationMessage: 'تمت أرشفة السنة المالية {{Code}}.',
  FiscalYearRestoredNotificationMessage: 'تمت استعادة السنة المالية {{Code}}.',
};
