export const arErrorLogs = {
  systemSettings: { title: 'إعدادات النظام' },
  errorLogs: {
    title: 'سجلات الأخطاء', description: 'مراجعة أخطاء الشركة الحالية.', detail: 'تفاصيل الخطأ',
    all: 'الكل', search: 'بحث في الأخطاء', filters: 'عوامل التصفية', clearFilters: 'مسح عوامل التصفية',
    from: 'من', to: 'إلى', export: 'تصدير XLSX', exportFailed: 'تعذر تصدير سجلات الأخطاء.',
    loadFailed: 'تعذر تحميل سجلات الأخطاء.', forbidden: 'ليس لديك صلاحية عرض سجلات الأخطاء هذه.',
    empty: 'لا توجد أخطاء مطابقة.', invalidRange: 'يجب أن يكون تاريخ النهاية مساويًا لتاريخ البداية أو بعده.',
    source: { api: 'واجهة البرمجة', job: 'مهمة', web: 'الويب', mobile: 'الجوال' },
    severity: { warning: 'تحذير', error: 'خطأ' },
    fields: { occurredOnUtc: 'وقت الحدوث', source: 'المصدر', severity: 'الحدة', userName: 'المستخدم', service: 'الخدمة', action: 'الإجراء', statusCode: 'الحالة', durationMs: 'المدة (مللي ثانية)', correlationId: 'معرف الربط', summary: 'الملخص', client: 'العميل', browser: 'المتصفح', ipAddress: 'عنوان IP' },
  },
  systemErrorLogs: { title: 'سجلات أخطاء النظام', diagnostics: 'إطارات الدوال' },
  errorLogSettings: {
    title: 'إعدادات سجلات الأخطاء', description: 'تحديد فترة الاحتفاظ العامة.', retentionDays: 'أيام الاحتفاظ',
    required: 'أدخل عدد أيام الاحتفاظ.', range: 'أدخل عددًا صحيحًا من 1 إلى 3650.',
    queueDepth: 'عمق الطابور: {{count}}', droppedCount: 'المهملة: {{count}}', failedWrites: 'الكتابات الفاشلة: {{count}}',
    saved: 'تم حفظ إعدادات سجلات الأخطاء.', saveFailed: 'تعذر حفظ الإعدادات.', loadFailed: 'تعذر تحميل الإعدادات.',
    conflict: 'تغيرت الإعدادات في مكان آخر. أعد تحميل المراجعة الأخيرة وراجع المسودة قبل الحفظ.', reloadRevision: 'إعادة تحميل المراجعة',
  },
};
