# Ledger Setup Currency — Customer Education Pack

## 1. Status and audience

- Feature: `ledger-setup-currency` / Slice 1 child `1A`.
- Verification: Phase 06 `Verified` on 2026-09-22.
- Education/closure: Phase 07 complete on 2026-09-22.
- Audience: tenant administrators and finance setup users who maintain the company
  currency catalog on Web or Mobile.

This guide describes the verified runtime. Currency owns the company currency code,
Arabic/English names and symbol. Functional Currency is configured later in Company
Settings, and historical rates are maintained in Exchange Rates.

## 2. Access and permissions

| Permission/state | Available behavior |
| --- | --- |
| `AccountingSetup:View` | Open the Currency route, search/filter/sort/page and view details. |
| `AccountingSetup:Manage` | Create, edit, archive and restore in addition to View behavior. |
| Application read-only | View remains available; mutation controls are suppressed. |
| No View permission | The route fails closed with Access Denied / 403. |

Web route: `/finance/ledger-setup/currencies`.

Mobile route: `/finance/ledger-setup/currencies` through the Finance → Ledger Setup
navigation entry.

## 3. Field rules

| Field | Rule | Example |
| --- | --- | --- |
| Currency code | Exactly three English letters; spaces are trimmed and the code is stored uppercase. | `EGP` |
| English name | Required; maximum 100 characters. | `Egyptian Pound` |
| Arabic name | Required; maximum 100 characters. | `جنيه مصري` |
| Symbol | Required; maximum 10 characters. | `EGP` or `£` |

The same code cannot be created twice inside one company, including when the earlier
record is archived. Tenant and company scope come from the authenticated session and
are never entered in this form.

## 4. Web journey

1. Open **Finance → Ledger Setup → Currencies**.
2. Use Search, Field, Condition and Status to filter the complete server-owned list.
   Status can show Active, Archived or All records.
3. Select **Add Currency**, enter all four fields, and submit. Validation messages
   appear under the matching fields and focus moves to the first invalid field.
4. Use **View** to inspect the authoritative record without mutation controls.
5. Use **Edit** on an active row. The form loads current detail and sends its current
   RowVersion when saving.
6. Use **Archive** and confirm the action. If Accounting settings, an Account or an
   Exchange Rate still references the currency, the server returns an in-use message
   and leaves the currency active.
7. Switch Status to **Archived** to inspect or **Restore** an archived currency.

The Grid owns paging and sorting through the server. The total shown is the real
server total, not the number of rows currently loaded in the browser.

## 5. Mobile journey

1. Open **Finance → Ledger Setup → Currencies**.
2. Choose Table or Cards. Both views use the same server page, search, status filter,
   sort and total.
3. With Manage permission, use the Add action to create a currency and the row/card
   actions to edit, archive or restore.
4. Use View to open the full read-only form. View remains available for View-only and
   application read-only sessions.
5. Pull to refresh or use Retry after a transport error. Mobile never reports a local
   financial write as successful before the API commits it.

Currency does not support offline writes. A disconnected or failed mutation remains
unsaved and must be retried after connectivity returns.

## 6. Expected recovery messages

| Situation | User action |
| --- | --- |
| Duplicate code | Choose a different ISO code or restore/use the existing record. |
| Currency in use | Remove or change the blocking Accounting reference before archiving. |
| Concurrency conflict | The client reloads authoritative data and closes the stale action; review the latest record and try again. |
| Access Denied | Ask an administrator for `AccountingSetup:View`; Manage is separately required for writes. |
| Load failure | Use Retry after checking connectivity/API availability. |

## 7. Arabic quick guide / دليل عربي مختصر

1. افتح **الحسابات ← إعداد دفتر الأستاذ ← العملات**.
2. صلاحية العرض `AccountingSetup:View` تسمح بالبحث والتصفية وعرض التفاصيل فقط.
3. صلاحية الإدارة `AccountingSetup:Manage` مطلوبة للإضافة والتعديل والأرشفة
   والاستعادة.
4. أدخل كود عملة من ثلاثة أحرف إنجليزية، والاسم العربي، والاسم الإنجليزي، والرمز.
5. استخدم حالة **المؤرشفة** للوصول إلى العملة المؤرشفة ثم اختر **استعادة**.
6. إذا كانت العملة مستخدمة في إعدادات الحسابات أو الحسابات أو أسعار الصرف فلن يتم
   أرشفتها، ويجب إزالة المرجع أولًا.
7. عند تعارض التزامن يعيد التطبيق تحميل أحدث بيانات من الخادم قبل السماح بمحاولة
   جديدة.

## 8. Trainer checklist and video storyboard

Use the following ten-minute demonstration without changing production data:

1. Explain Currency ownership and the difference from Functional Currency and FX.
2. Show Active list search, status filtering, sorting and paging.
3. Create a temporary valid training currency, then view and edit it.
4. Archive it, show it through the Archived filter, and restore it.
5. Switch English/Arabic and demonstrate LTR/RTL labels.
6. Show a compact Web layout and the Mobile Table/Cards alternatives.
7. Demonstrate a View-only session and explain that Manage is separate.
8. Explain duplicate, in-use and concurrency recovery without fabricating success.
9. Remove or restore any temporary training data according to the training company
   policy.

Suggested video chapters: Purpose and ownership; access; list tools; create/edit;
archive/restore; permission modes; errors and conflict recovery; Mobile differences.

## 9. Scope boundaries and release evidence

Import, export, reports, trees, charts, hard delete, feature-owned realtime and
offline Currency writes are excluded from child `1A`. They must not appear as empty
or misleading controls.

The source and development runtime are accepted. Hosted authenticated device testing
and the physical phone/tablet LTR/RTL/accessibility matrix remain central release
checks `PROD-010` and `PROD-014`; execute them when a public preview/store candidate
is planned.

## 10. Support evidence

Canonical acceptance details, exact commands and classified non-feature findings are
recorded in
`documentation/system/features/ledger-setup-currency/LEDGER_SETUP_CURRENCY-REVIEW-ARTIFACTS.md`.
The product boundary remains governed by
`documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-currency.md`.
