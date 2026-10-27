# Platform Settings / إعدادات النظام

Verified customer guide, 2026-10-19. Open **Administration → Settings / الإدارة ← الإعدادات**. Settings is one destination; each visible tab displays its real editor in the same screen. Only tabs authorized for your current account/scope appear.

Company configuration includes company languages/texts, offline policy, operating countries and localization messages when the account has each existing view permission. Global Error Log Settings is available only to SuperAdmin with ErrorLogSettings:View; editing additionally requires ErrorLogSettings:Edit. Viewing error records is a separate Administration destination and does not grant access to retention.

Each tab keeps its own Save/Edit workflow. There is no common Save across all settings. Current-company settings retain current-company scope; global retention retains global scope. Validation and revision-conflict feedback appear through each existing editor. Resolve/reload conflicts within that editor. Switching away from an unsaved editor asks through the shared discard dialog; Keep editing preserves the draft. Pending saves prevent leaving the editor. On Web, the selected tab is represented by the tab query in /administration/settings, so reload/deep selection remains available.

المحتوى المعروض داخل كل تاب هو شاشة الإعداد الأصلية، وليس رابطًا لشاشة أخرى. كل تاب له صلاحياته ونطاقه وطريقة حفظه المستقلة. عند وجود تعديلات غير محفوظة، اختر متابعة التعديل للاحتفاظ بها أو تأكيد التجاهل للانتقال. لا تترك الشاشة أثناء الحفظ. إعداد مدة الاحتفاظ بسجلات الأخطاء يظل خاصًا بمدير النظام، وسجل الأخطاء نفسه موجود بجوار الإعدادات داخل الإدارة.

Mobile uses the same Settings destination under Administration and adds Device preferences / تفضيلات الجهاز for language, theme and local cache preferences. Business settings remain governed by server policy; local preferences do not grant business offline authority. Physical Android/iOS verification remains deferred by the requester under PROD-026. Existing child direct URLs remain compatible.


## Administration application

Open Applications > Administration for permitted Users, Roles/Permissions, Invitations, Settings and diagnostic/audit tools. Open Settings for company languages/UI texts and existing configuration tabs. Visibility follows the current account/company grants; the application tile grants no additional authority. Existing bookmarked child URLs remain compatible. Super Admin keeps global navigation. Mobile Administration includes native Settings/device preferences.
