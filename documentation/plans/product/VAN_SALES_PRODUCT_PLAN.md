# خطة Van Sales والبيع الميداني

**الحالة:** خطة منتج وتنفيذ مستقبلية فقط. لا ينشئ هذا الملف Module أو Route أو
جدولًا أو شاشة في الـ runtime.

**آخر تحديث:** 2026-09-19

**المرجع الأعلى:** [مخطط ERP SaaS متعدد القنوات](OMNICHANNEL_ERP_PRODUCT_BLUEPRINT.md)

## 1. القرار والحدود

Van Sales قدرة تشغيلية للمندوب الذي يبيع أو يسجل الطلبات أثناء الجولة من سيارة
أو عهدة ميدانية. تبدأ داخل المونوليث كـ workflow منسق بين Sales وInventory
وAccounting وPayments وContacts/CRM، وتستخدم تطبيق الموبايل كسطح للمندوب ولوحة
ويب للمتابعة والتسوية.

لا تصبح Van Sales موديولًا مستقلًا لمجرد وجود تطبيق موبايل. تظل ملكية الطلب
التجاري في Sales، وملكية المخزون في Inventory، وملكية القيد والتحصيل في
Accounting. لا يكتب الموبايل في قاعدة البيانات ولا يعتبر العملية النهائية
مكتملة من سجل محلي فقط.

الترتيب السابق للتنفيذ إلزامي:

1. تثبيت Accounting: الفترات، القيود المزدوجة، الضرائب، AR/AP، الفواتير
   والتحصيل.
2. تثبيت Inventory: المنتج وSKU وUOM والمخازن وحركة المخزون والتكلفة والحجز
   والتوافر.
3. تثبيت Sales وContacts والعقود اللازمة للسعر والعميل والطلب.
4. تثبيت Payments عند الحاجة للدفع الإلكتروني، ثم بدء مراحل 04A.

## 2. أهداف المنتج

- تمكين المندوب من تنفيذ الجولة والزيارة والبيع أو تسجيل الطلب من الموبايل.
- إبقاء العميل والسعر والائتمان والمخزون والفاتورة والتحصيل في مصادر الحقيقة
  الخاصة بها.
- دعم شبكة ضعيفة بجمع أوامر مؤقتة قابلة للمزامنة، مع منع الادعاء بإتمام مالي
  أو مخزني قبل قبول الخادم.
- جعل تحميل السيارة وإرجاعها وتسوية النقد والمخزون قابلة للمراجعة وإعادة
  التشغيل.
- إبقاء الحدود قابلة للفصل لاحقًا إلى RouteSales/Distribution إذا ظهر دليل
  حجم أو تشغيل أو امتثال، دون نسخ SalesOrder أو StockLedger أو GL.

## 3. المستخدمون والقنوات

| المستخدم | السطح | ما يراه أو ينفذه |
| --- | --- | --- |
| مندوب المبيعات | Mobile | الجولة، العملاء، الزيارة، الطلب، التحصيل، المرتجع، الإغلاق |
| مشرف التوزيع | Web | الخطط، تعيين السيارات والمندوبين، الاستثناءات، المتابعة |
| أمين المخزن | Web | تحميل السيارة، التحويل، المرتجع، الجرد، فروق العهدة |
| المحاسب | Web | الفاتورة، AR، المقبوضات، التسوية، الفروق، الإقفال |
| مدير الشركة | Web | مؤشرات المبيعات والمخزون والنقد والتدقيق |
| الدعم/المراجع | Web | سجل الأوامر، التعارضات، إعادة الإرسال، إبطال الجهاز |

## 4. الملكية وحدود الموديولات

| السياق | يملك | يستهلك أو ينشر | لا يملك |
| --- | --- | --- | --- |
| Sales | route/trip/day، visit plan، تعيين المندوب والسيارة، السعر، الائتمان، SalesOrder والحالة التجارية | Contacts، Inventory availability، Accounting facts | StockLedger، GL، provider state |
| Inventory | vehicle كـ location عند اعتماد النموذج، load/transfer، issue/return، count، lot/serial، reservation وATP | أوامر Sales المقبولة | السعر، الفاتورة، التحصيل |
| Accounting | invoice، AR، cash receipt، allocation، settlement، posting، period controls | Sales/Inventory/Payments facts | route أو حركة المخزون |
| Payments | intent، authorization/capture/refund، provider webhook، replay protection | طلب الدفع من Sales/Commerce | cash receipt وAR allocation |
| Contacts | Party وcustomer reference والعناوين ووسائل الاتصال | Platform scope وحقائق الموديولات | نسخة عميل خاصة بالموبايل |
| CRM | visit/engagement signals والشرائح عند الحاجة | Events من Sales/Van Sales | route truth أو الطلب أو المخزون |
| Mobile surface | snapshot مشفر، drafts، command journal، sync/UI state | عقود الموديولات وخادم المزامنة | أي business truth نهائي |
| POS | terminal/cash-session retail flow الخاص به | primitives مشتركة فقط بعقد مستقل | Van trip وroute وvehicle stock |
| Platform | الهوية، tenant/company/branch، entitlements، device/session policy | scope وaudit context | قواعد البيع أو المخزون |

## 5. نطاق MVP

يدخل MVP فقط ما يلزم لتشغيل جولة ميدانية قابلة للتسوية:

| capability | داخل MVP | معيار القبول |
| --- | --- | --- |
| Trip setup | route/day/visit plan وتعيين المندوب والسيارة والفرع | لا توجد جولة نشطة متعارضة لنفس السيارة/المندوب إلا بسياسة صريحة |
| Vehicle stock | تحميل وتحويل وإرجاع وجرد وتالف، مع lot/serial عند الحاجة | مجموع load - issue - return - count يطابق العهدة ولا يظهر مخزون سالب غير مفسر |
| Customer visit | قائمة العملاء، check-in اختياري، ملاحظات ونتيجة الزيارة | كل سجل scoped ومراجعته مرتبطة بالفاعل والجهاز والجولة |
| Direct sale | بيع من مخزون السيارة مع price/credit validation | Sales يقبل الطلب، Inventory يقبل issue، وAccounting يقبل الفاتورة/التحصيل |
| Preorder | تسجيل طلب يحتاج تنفيذًا لاحقًا | الطلب يبقى في حالة تجارية واضحة ولا يحجز أو يصرف دون قبول Inventory |
| Pricing | قائمة أسعار، خصم، حد ائتماني، version وexpiry | انتهاء السياسة أو تعارضها يحول الطلب للمراجعة ولا يدمج بصمت |
| Collections | نقدي وإلكتروني حسب العقود | الإلكتروني يحتاج provider confirmation؛ النقد يذهب إلى Accounting receipt |
| Returns | مرتجع عميل، تالف، غير مباع، سبب وحالة الفحص | كل كمية ترجع إلى Inventory عبر command/fact قابل للتكرار |
| EOD settlement | مطابقة الطلبات والمدفوعات والنقد والمخزون وإغلاق الجولة | لا يمكن الإغلاق مع تعارض غير مصرح أو أمر PendingSync غير معالج |
| Audit/support | actor/device/trip/correlation/سبب الإلغاء والتعديل وتعقب retry | يمكن للمراجع إعادة بناء دورة العملية دون قراءة قاعدة موديول آخر |

## 6. مؤجل أو خارج النطاق

### مؤجل إلى ما بعد MVP

- تحسين المسارات تلقائيًا بالخرائط وقياس ETA.
- GPS حي أو geofencing؛ يحتاج consent واحتفاظًا وسياسة عمل واضحة.
- تسعير ديناميكي معقد، عروض مخصصة، bundle engine وloyalty.
- أسطول متعدد الشركات، third-party distributors وroute optimization على نطاق
  كبير.
- إثبات تسليم كامل، التوقيع والصور المتقدمة، offline maps.
- Supplier/Procurement Portal، WMS/TMS وlast-mile مستقل.
- تقارير تنبؤية أو AI؛ تستخدم read models بعد اكتمال جودة البيانات.
- فصل RouteSales/Distribution إلى module أو microservice.

### خارج النطاق صراحة

- تحويل Van Sales إلى POS أو إعادة استخدام cash session الخاصة بالـ POS.
- كتابة قيد أو StockLedger أو Payment provider state من الموبايل.
- قبول `tenantId` أو `companyId` أو `branchId` من العميل لتوسيع نطاق الوصول.
- اعتبار payment capture أو invoice/posting مكتملًا دون رد خادم موثق.
- معاملة offline كسجل نهائي بدل provisional command قابل للمصالحة.

## 6A. ملخص MVP مقابل Deferred

| Capability | MVP/القرار الحالي | المؤجل أو الشرط |
| --- | --- | --- |
| Pre-sales وpreorder | Required بعد عقود Sales/Inventory | لا يثبت توافرًا أو فاتورة قبل قبول الخادم |
| Direct-store-delivery من vehicle stock | Required فقط بعد vehicle location وissue contract | البيع/الإصدار النهائي Offline يظل Deferred/Decision-required |
| Cash collection | Required عند تثبيت Accounting cash receipt وAR allocation | check/wallet وcash automation حسب الدولة/المزود |
| Electronic tender | Required فقط مع Payments provider contract | capture Offline وprovider غير المدعوم مؤجل |
| Visits وproof-of-visit | زيارة وملاحظة أساسية داخل MVP | GPS، توقيع، صورة، geofence مؤجلة/قرار خصوصية |
| Load/return/count وEOD | Required | cold chain، packaging وfleet telemetry مؤجلة |
| Offline | snapshot + command journal + sync/reconcile | provisional sale/issue أو document range لا يصبح Required إلا بعقد Phase 00 |
| RouteSales/Distribution context | داخل Sales في المونوليث | extraction بعد evidence وADR في 04A.08 |

لا يجوز تحويل أي بند Deferred إلى MVP ضمنيًا بإضافة شاشة أو field. يحتاج كل
توسيع قرار Phase 00 ومالكًا ودليل إعادة فتح.

## 6B. مصفوفة أنماط التشغيل

| النمط | Recommended MVP | Deferred | Decision required | المالك | Reopen trigger |
| --- | --- | --- | --- | --- | --- |
| Pre-sales / preorder | خطة زيارة، طلب، سعر وائتمان، queue للتنفيذ | تسليم فوري من السيارة | هل يحجز الطلب الكمية أم ينتظر Sales acceptance؟ | Sales | أول عميل يحتاج ATP أو تخصيصًا |
| Direct-store-delivery | issue من vehicle location بعد Sales acceptance | إصدار نهائي Offline، invoice fiscal غير متصل | vehicle موقع مخزني أم عهدة فقط؟ | Inventory + Accounting | قانون الدولة أو فرق العهدة |
| Hybrid preorder + DSD | المساران في trip واحد بحالات منفصلة | split shipment وmulti-warehouse orchestration | أولوية الطلب وpartial fulfillment | Sales + Inventory | ارتفاع partial orders أو قنوات متعددة |
| Collection-only route | تحصيل AR مع customer reference وcash receipt | route مستقل واسع وpromise-to-pay workflow | هل يحتاج التحصيل زيارة بلا بيع وصلاحيات منفصلة؟ | Accounting + Sales | أول فريق تحصيل أو متطلبات فصل المهام |
| Merchandising / proof-of-visit | visit result وملاحظة بلا GPS | صور/POD وgeofence وoffline maps | consent والاحتفاظ وإلزامية الإثبات | Sales + CRM + Security | عقد عميل أو نزاع تسليم |
| Driver = rep | Recommended MVP: فاعل واحد مع assignment واضح | delegation متعددة الأدوار | هل يسمح الدور بتسليم بلا بيع أو بتحويل العهدة؟ | Sales + Platform | أسطول أكبر أو SoD قانوني |
| Driver منفصل عن rep | تخطيط فقط، لا يخلط صلاحيات البيع | تنفيذ كامل للسائق والمندوب | assignment وhandover بين الشخصين | Sales + Inventory | وجود distributor أو ورديات متعددة |

## 6C. خريطة الأدلة والبيانات المفاهيمية

هذه أسماء تخطيطية لتحديد الملكية وليست schema أو entity declarations. لا توجد
cross-module foreign keys؛ كل reference يعبر Contract/Event ويدعم version وscope.

| الدليل المفاهيمي | المالك | الاستخدام |
| --- | --- | --- |
| `SalesRoute`, `SalesTrip`, `TripStop`, `Visit`, `assignment` | Sales | خطة الجولة، الزيارة، المندوب والسيارة والفرع |
| `VehicleStockLocation`, `loadRef`, `issueRef`, `returnRef`, `countRef` | Inventory | دليل العهدة وحركة المخزون |
| `PolicyPack`, price/discount/credit references | Sales مع Accounting credit refs | نسخة السياسة التي اتخذ بها القرار ومدة صلاحيتها |
| `VanCommandEnvelope`, local journal وdraft | Mobile local only | أمر محلي قابل للمزامنة؛ ليس مصدر حقيقة |
| `DocumentNumberAllocation`, invoice، receipt | Accounting + country fiscal adapter | تخصيص وترقيم مستندات وقبولها المالي |
| `FieldSettlement`, cash/AR reconciliation refs | Accounting | التسوية النهائية والمبالغ والفروق |
| provider intent/capture/refund/webhook refs | Payments | أثر مزود الدفع دون نقل provider state إلى Sales |

يحمل كل reference `tenantId` و`companyId` و`branchId` عند انطباقها ويفشل إذا
اختلفت الحدود. لا تنقل الخطة المفاتيح الداخلية أو تجعل mobile journal يملك
رقمًا ماليًا مقبولًا.

## 6D. مصفوفة القواعد التجارية

| القاعدة | MVP policy | Deferred/Decision | المالك | Reopen trigger |
| --- | --- | --- | --- | --- |
| Versioned price lists | نسخة وسريان ورفض النسخة المنتهية | price engine متعدد القنوات | Sales | أول قناة أو عقد أسعار مختلف |
| Promotions/free goods | لا عروض معقدة؛ discount policy موثقة | bundles، free goods، loyalty | Sales + Commerce | حاجة تجارية مثبتة |
| Discount ceiling/override | سقف وسبب وموافقة role أعلى | offline override أوسع | Sales + Platform | أول حالة override ميداني |
| Credit limit/aging/customer block | قرار خادم قبل قبول الطلب أو التحصيل | قرار Offline provisional | Accounting + Contacts + Sales | سياسة ائتمان أو تحصيل محلية |
| Tax inclusive/exclusive | policy pack يحدد العرض والحساب | fiscal rounding متعدد الدول | Accounting | الدولة/الضريبة المستهدفة |
| UOM/pack conversion | تحويل موثق للـ SKU والعبوة | conversion ديناميكي حسب العميل | Inventory + Sales | اختلاف حزم أو unit sale |
| MOQ | حد أدنى لكل customer/price policy | cross-SKU MOQ وcase mix | Sales | أول عقد جملة يحتاجه |
| Partial fulfillment | preorder يقبل partial state صريحًا | split/merge وbackorder automation | Sales + Inventory | معدل partial مرتفع |
| Deposit/partial/mixed tender | فقط إذا Accounting contract يغطي allocation | deposit wallet/credit note المعقد | Accounting + Payments | أول مزود أو منتج يتطلبه |
| Commission | لا يُثبت في Van Sales MVP | calculation/payment/chargeback | قرار Product + Accounting/HR | نموذج عمولة معتمد |

## 6E. مصفوفة المخزون واللوجستيات

| الموضوع | MVP | Deferred/Decision | المالك | Reopen trigger |
| --- | --- | --- | --- | --- |
| Lot/batch/serial | يحترم policy المنتج عند issue/return | إدخال يدوي متقدم أو multi-scan | Inventory | SKU يتطلب traceability |
| FEFO/expiry | يمنع صرف المنتهي إذا كانت policy إلزامية | اقتراح FEFO تلقائي وexpiry alerts | Inventory | perishables أو regulator |
| Returnable packaging/empties | يسجل كمرجع منفصل فقط إذا مطلوب للعقد | دورة deposit/return ledger | Inventory + Accounting | عميل أو عبوة قابلة للإرجاع |
| Sellable/non-sellable/damaged/expired | buckets واضحة ولا تختلط بالـ ATP | disposition workflow وwrite-off approval | Inventory + Accounting | ارتفاع التالف أو audit finding |
| Vehicle weight/volume capacity | limit configuration يمنع load الواضح الزائد | packing optimization وtelemetry | Inventory + Fleet | أسطول أو منتجات كبيرة |
| Cold chain | خارج MVP | temperature capture، alert، evidence | Inventory + Logistics | منتج حساس أو التزام قانوني |
| Consignment/cross-dock | قرار قبل اعتماده، لا implicit ownership | cycle count وsettlement للموزع | Inventory + Sales + Accounting | distributor contract |

## 6F. مصفوفة وسائل التحصيل والنقد

| الوسيلة | MVP | Deferred/Decision | المالك |
| --- | --- | --- | --- |
| Cash | cash receipt، AR allocation، cash ceiling وEOD handover | smart safe وcash-in-transit integration | Accounting |
| Electronic card/provider | provider intent + signed webhook + capture/refund | offline terminal أو provider متعدد | Payments |
| Check | يسجل كمرجع غير settled حتى clear | check printing/clearing integration | Accounting + قرار الدولة |
| Wallet | يمر عبر Payments provider contract | مزود wallet متعدد أو reconciliation خاص | Payments + قرار الدولة |
| Partial/mixed tender | لا يقبل إلا إذا allocation contract صريح | split tender وrounding المعقد | Accounting + Payments |
| Safe-drop/cash ceiling | policy تمنع تجاوز الحد وتطلب handover | خزنة ذكية وتسوية وسيطة | Accounting + Operations |
| EOD handover | فصل المندوب والمشرف والمحاسب مع audit | multi-day custody وcash-in-transit | Accounting + Security |

Payments يملك electronic provider state فقط، بينما Accounting يملك cash receipt
وAR allocation وsettlement. لا تجعل Van Sales أو Payments قيدًا ماليًا ولا
تخلط cash session الخاصة بـ POS مع FieldSettlement.

## 7. التدفق التشغيلي المرجعي

### قبل الجولة

1. ينشئ Sales الجولة واليوم وخطة الزيارات ويعين المندوب والسيارة في نطاق
   tenant/company/branch المسموح.
2. ينفذ Inventory load/transfer إلى vehicle location، مع snapshot للكمية
   والسياسات والـ lot/serial عند الحاجة.
3. يفتح الجهاز shift ويربطه بالمندوب والسيارة والجولة؛ ينزل snapshot محدود
   المدة والصلاحية.

### أثناء الزيارة

1. يثبت التطبيق هوية المندوب والجولة والعميل من snapshot مصرح به.
2. يسجل visit result، ثم ينشئ direct sale أو preorder.
3. يتحقق الخادم من السعر والائتمان والتوافر والإصدار عبر عقود versioned.
4. يطلب Inventory reservation/issue بعد قبول Sales.
5. يرسل Payment authorization/capture عند الدفع الإلكتروني أو Accounting cash
   receipt/collection عند النقد.
6. يسجل العميل المرتجع أو التالف كأمر منفصل بسبب وحالة، ولا يعدل الطلب الأصلي
   بصمت.

### نهاية الجولة

1. يرجع المندوب المخزون غير المباع والتالف وينفذ Inventory count.
2. يطابق النظام orders، invoices، receipts، provider references، النقد،
   document sequence والكمية.
3. يعالج المشرف التعارضات أو يرفض التسوية مع سبب واضح.
4. يغلق Sales trip فقط بعد قبول كل الأوامر أو وجود استثناء مصرح ومُسجل.

## 8. سياسة Offline وإعادة استخدام الأساس الحالي

### ما يعاد استخدامه

يعاد استخدام أساس الموبايل الحالي دون إنشاء Offline implementation موازٍ:

- `mobile-react/src/core/offline/scope.ts` و`scope-repository.ts` لحفظ
  `OfflineScope` الحالي الذي يحتوي `userId` و`tenantId` و`companyId` فقط.
  لا يدّعي هذا الأساس عزل branch أو device.
- `database.ts` و`scoped-record-store.ts` للتخزين المحلي الموجه بالنطاق.
- `outbox.ts` و`sync-coordinator.ts` و`sync-state.ts` لإدارة الأوامر وحالات
  المزامنة وإعادة المحاولة.
- `connectivity-service.ts` وproviders لسياسة online/offline والإشعارات.
- اختبارات offline الحالية كأساس لاختبارات الأوامر والتعارضات.

إعادة الاستخدام لا تعني أن الأساس الحالي يغطي قواعد Van Sales؛ تظل كل قواعد
البيع والتسوية والـ inventory داخل عقود الموديولات المالكة.

يضاف فوق `OfflineScope` envelope الحالي **feature business partition** صريح داخل
كل record وcommand: `branchId` و`vehicleId` و`tripId` و`shiftId`. يتحقق الخادم
من تعيين المندوب والجهاز والسيارة والجولة والفرع في كل command، ولا يعتمد على
القيم المحلية أو على توسيع `OfflineScope` العام. لا يوسع الـ generic core إلا بعد
عقد عام تستخدمه أكثر من feature.

`mobile-react/src/core/offline/sync-coordinator.ts` يوفّر حاليًا handler registry
عامًا، لكن تسجيل الأوامر وتشغيلها في التطبيق مربوط بطيار Workforce Planning في
`mobile-react/src/modules/hr/workforce-planning/composition/workforce-plan-draft-pilot.ts`.
قبل Van Sales يجب إضافة multi-feature command-provider registry/registration
يضم WorkforcePlan وVan Sales، مع trigger/timer واحد، لا queue ثانية ولا تكامل
خاص بالـ feature داخل الـ core.

### الفجوات المطلوبة

- `VanTripSnapshot` و`VehicleStockSnapshot` و`CustomerVisitDraft` scoped مع
  `OfflineScope` وfeature partition، version وexpiry، وليس cache عامًا.
- `VanCommand` ثابت الهوية يحتوي tenant/company/branch، device، shift، trip،
  monotonic sequence، idempotency key وcausation/correlation IDs.
- حالات صريحة: `Draft`، `PendingSync`، `Accepted`، `Rejected`، `Conflict`،
  `DeadLetter`، `Uncertain`، مع سبب قابل للعرض. يلزم Van Sales projection
  منفصل باسم `Reconciled` بعد قبول الخادم؛ الحالات الحالية في الـ outbox ونتيجة
  `SyncCoordinator` ليست دليلًا على وجود هذا projection في feature.
- conflict queue للمشرف، replay آمن، واستعادة بعد crash أو إغلاق التطبيق أثناء
  الإرسال.
- تشفير وTTL وحد للحجم وpurge عند logout أو تبدل النطاق، مع remote revoke
  يعزل queue ويلغي مفاتيح الجهاز عند أول اتصال.
- منع offline payment capture؛ وأي provisional invoice/receipt range يحتاج
  عقد دولة مستقلًا ومراجعة Accounting قبل اعتماده.

القاعدة النهائية: `online-confirmed` هو الوضع الافتراضي. Offline يسمح بجمع
الأمر أو الزيارة فقط، ويظل provisional حتى يقبله الخادم. التعارض في السعر أو
الائتمان أو المخزون أو AR allocation يوقف الأمر للمراجعة؛ لا يوجد last-write-
wins للحقائق المالية أو المخزنية.

## 8A. بروتوكول Command/Sync

كل أمر Van Sales محلي أو مرسل يحمل envelope ثابتًا بالحقول التالية:

| الحقل | الغرض |
| --- | --- |
| `commandId` | هوية الأمر المحلية غير القابلة لإعادة الاستخدام |
| `idempotencyKey` | منع تكرار الأثر التجاري/المالي |
| `sequence` | ترتيب monotonic داخل device/shift/trip partition |
| `userId` | الفاعل المحلي الذي أنشأ الأمر |
| `tenantId`, `companyId`, `branchId` | النطاق الذي يعاد التحقق منه على الخادم |
| `deviceId`, `vehicleId`, `tripId`, `shiftId` | business partition للـ Van feature |
| `schemaVersion`, `policyVersion` | توافق payload والسياسة التي اتخذ بها القرار |
| `baseVersions` | row/event/policy revisions التي بني عليها الأمر |
| `occurredAt` | وقت الجهاز للقياس، لا يثبت الترتيب وحده |
| `correlationId`, `causationId` | تتبع الرحلة والتعويضات عبر الموديولات |
| `payloadHash` | كشف تغيير payload بعد حفظه محليًا |
| `payload` | الأمر domain-specific بعد validation |

يحفظ التطبيق draft وjournal/outbox في معاملة محلية ذرية واحدة، بحيث لا يوجد
draft بلا command أو command بلا مرجع قابل للإرسال. عند الإرسال يعيد الخادم
أحد outcomes المحددة:

- `Accepted`: تم تطبيق الأثر وإرجاع references مملوكة للموديول.
- `AlreadyProcessed`: نفس idempotency key؛ يعاد نفس outcome دون side effect.
- `Rejected`: فشل business/authorization ثابت مع ProblemDetails وسبب.
- `Conflict`: base version أو policy أو stock/credit غير متوافق؛ يحتاج مراجعة.
- `Uncertain`: انقطع الاتصال بعد الإرسال المحتمل؛ لا يعاد blind retry.

يوفر API استعلام status/reconcile حتميًا بـ`commandId` و`idempotencyKey`، ويعيد
أي document/stock/payment/accounting references المقبولة. sequence gap يوقف
الـ partition أو يعالجه policy صريحة؛ لا يعاد ترتيب أمر مالي بصمت. لا يوجد
last-write-wins للطلبات أو المخزون أو التحصيل. الحالات العامة الموجودة في
`OutboxStore` و`SyncCoordinator` يعاد استخدامها، لكن Van Sales يحتاج
`Reconciled` projection feature-specific بعد قبول الخادم؛ لا ندّعي أن هذا
projection موجود حاليًا.

## 8B. فجوات الأساس قبل Van Sales

هذه فجوات تأسيسية يجب إغلاقها أو تسجيلها كـ gate قبل 04A.05:

- multi-feature sync registry: الموجود في
  `mobile-react/src/core/offline/sync-coordinator.ts` قابل للتسجيل، لكن ربط
  التنفيذ الحالي بطيار WorkforcePlan موجود في
  `mobile-react/src/modules/hr/workforce-planning/composition/workforce-plan-draft-pilot.ts`؛
  المطلوب provider registry واحد لكل feature وtrigger واحد.
- feature-scoped partition: `OfflineScope` العام لا يحتوي branch/device؛ يلزم
  partition business داخل records/commands مع server-side assignment revalidation.
- uncertain reconciliation/status query: يلزم API deterministic يميز Accepted/
  AlreadyProcessed/Uncertain ويعيد references، مع `Reconciled` projection.
- policy capability registration: سجل يعلن command types، replay safety، policy
  freshness، scopes، والـ owner قبل تشغيل أي feature offline.
- safe schema migrations: upgrade/restore لا يحذف draft أو unsynced أو accepted
  command؛ يلزم backup/restore proof وversioned local migrations.
- central support UI: queue موحدة لـ conflict وuncertain وdead-letter وdevice
  revoke، مع صلاحيات وسبب وإعادة تشغيل آمنة.
- optional device attestation: قرار مستقل حسب قيمة المخزون/النقد؛ لا يجعل
  Van Sales شرطًا على كل أجهزة الموبايل قبل وجود threat model.

## 8C. الأجهزة والملحقات

- barcode/camera: scanner fallback، permission، duplicate scan وoffline image
  policy؛ لا تُحفظ صورة أو بيانات زائدة عن الحاجة.
- Bluetooth/thermal printer: printer capability matrix، queue محلية، duplicate
  print marker، وإعادة الطباعة audit؛ الطباعة لا تعني posting أو settlement.
- signature/POD: مؤجل حتى يحدد business/legal contract؛ يحتاج hash وconsent وretention.
- GPS: اختياري؛ يتطلب consent صريحًا، retention محدودًا، وميزة يمكن تعطيلها
  دون كسر البيع. لا تستخدم impossible travel إلا إذا كان GPS مفعلًا ومصرحًا.
- background execution: sync best-effort مع قيود iOS/Android؛ لا يعتمد إغلاق
  الجولة أو posting على background task غير مضمون.
- MDM/root/jailbreak: سياسة أجهزة مدارة واكتشاف خطر حسب threat model، مع remote
  revoke؛ لا تمنع كل جهاز شخصي دون قرار منتج.
- budgets: حد battery/storage/network وTTL وحجم snapshot وقياس p95 للمزامنة.

## 8D. الأمن ومكافحة الاحتيال وفصل المهام

- assignment server-side يمنع تبديل المندوب أو الشركة أو الفرع أو السيارة من
  payload محلي؛ كل transition يراجع permissions وentitlements.
- override للسعر/الخصم/الائتمان يحتاج role أعلى وreason وaudit وربما online-only.
- impossible-travel أو geofence لا يعمل إلا بعد قرار GPS/consent؛ لا يرفض عميلًا
  بناءً على إشارة غير متاحة.
- document-number allocation محمي من reservation abuse؛ لا يسمح بتخزين ranges
  أو إعادة استخدامها بلا country policy وAccounting audit.
- stock/cash variance وduplicate/uncertain commands لها alerts وmanual review؛
  لا يمحو المشرف الدليل الأصلي.
- فقد الجهاز: revoke token/keys، عزل queue، forced re-auth، واستعادة من الخادم.
- SoD: المندوب يبيع/يجمع ضمن حده، المشرف يعتمد override والتسوية التشغيلية،
  أمين المخزن يعتمد load/return/count، والمحاسب يعتمد AR/settlement/posting.
  لا يسمح دور واحد بإخفاء variance أو اعتماد أثره المالي دون مراجعة.

## 9. العقود والأحداث

الأسماء التالية أمثلة تخطيطية، وليست API أو event declarations حالية:

- Commands: `OpenVanTrip`, `LoadVehicleStock`, `RecordVanVisit`,
  `RequestDirectSale`, `SubmitPreorder`, `RequestCashCollection`,
  `RequestReturn`, `CloseVanTrip`.
- Events: `VanTripOpened`, `VehicleStockLoaded`, `VanVisitRecorded`,
  `SalesOrderAccepted`, `InventoryIssueAccepted`, `PaymentCaptured`,
  `CashReceiptPosted`, `VanReturnAccepted`, `VanTripReconciled`.
- كل mutation لها contract version، stable event/command ID، tenant/company/
  branch/vehicle/trip dimensions، correlation/causation، وInbox/Outbox policy.
- لا distributed transaction؛ أي فشل جزئي يعالج بإعادة المحاولة أو تعويض أو
  reconciliation queue.
- Web/API يستخدم versioning وProblemDetails وRBAC server-side وrate limits.

## 10. مراحل 04A

### 04A.00 — Evidence والحدود

**الهدف:** إثبات الحاجة ونطاق الدولة/الشركة قبل runtime.

**المخرجات:** personas، route-to-cash map، ownership matrix، offline decision،
privacy/GPS decision، reuse inventory، contract outline، وADR عند أي قرار
يتجاوز الحدود.

**البوابة:** موافقة Accounting وInventory وSales وSecurity؛ لا code ولا schema.

### 04A.01 — Sales route/trip/day

**الهدف:** تثبيت route، trip، visit plan، assignment وRBAC في Sales.

**المخرجات:** state machine، tenant/company/branch scope، lifecycle contracts،
audit reasons، وback-office read model أولي.

**البوابة:** لا جولة مزدوجة، لا cross-company assignment، وكل transition
idempotent ومغطى باختبارات عزل.

### 04A.02 — Inventory vehicle location

**الهدف:** جعل السيارة/العهدة موقعًا مخزنيًا مضبوطًا أو اختيار البديل الموثق.

**المخرجات:** load/transfer/issue/return/count، lot/serial policy، costing
handoff، reservation وnegative-stock invariants.

**البوابة:** reconciliation load/issue/return/count، concurrency tests، ولا
نقل ملكية StockLedger إلى Van Sales.

### 04A.03 — Customer، السعر والطلب

**الهدف:** ربط Contacts وprice/credit policy وSalesOrder مع direct sale وpreorder.

**المخرجات:** customer snapshot contract، price version/expiry، credit decision،
order acceptance/rejection، وسبب كل override.

**البوابة:** server authority، no client-supplied scope، duplicate order tests،
ورفض السياسة المنتهية.

### 04A.04 — Payments وAccounting handoff

**الهدف:** إتمام الدفع الإلكتروني والتحصيل النقدي والفاتورة والتسوية دون كتابة
مالية من القناة.

**المخرجات:** payment intent/webhook inbox، cash receipt/AR allocation، invoice
states، provider replay protection، وreconciliation report.

**البوابة:** zero duplicate capture/receipt/invoice تحت retry، balanced entries،
period controls، وmanual exception workflow.

### 04A.05 — Mobile offline capture and sync

**الهدف:** إضافة Van commands فوق offline foundation القائمة.

**المخرجات:** scoped encrypted snapshots، command journal، idempotency، sequence،
retry/backoff، conflict/dead-letter، remote revoke، purge، وerror UX.

**البوابة:** restart/crash/poor-network/device-loss tests، out-of-order delivery،
no silent merge، وproof أن offline لا يثبت قبضًا أو قيدًا نهائيًا.

### 04A.06 — Back-office monitoring and EOD

**الهدف:** تمكين المشرف والمخزن والمحاسب من إدارة الاستثناء والتسوية.

**المخرجات:** route/trip monitor، conflict queue، stock/cash/document dashboard،
إعادة إرسال آمنة، device revoke، وإغلاق الجولة.

**البوابة:** audit قابل لإعادة البناء، صلاحيات فصل المهام، ورفض الإغلاق مع
تعارض غير معالج.

### 04A.07 — Pilot، القياس والجاهزية

**الهدف:** تجربة محدودة على شركات وأجهزة وشبكات مستهدفة.

**المخرجات:** runbook، support playbook، dashboards، alerts، SLO budgets،
pilot report، ونتائج RTL/accessibility/security/performance.

**البوابة:** لا release عام قبل zero unexplained negative stock، zero duplicate
financial facts، reconciliation age ضمن الحد، ونجاح device revoke وrestore.

### 04A.08 — Extraction review

**الهدف:** تقرير هل تبقى القدرة داخل المونوليث أم تحتاج RouteSales/Distribution.

**المخرجات:** volume/latency/team/compliance evidence، ADR، ownership map،
projection أو adapter plan، migration/rollback وshadow-read plan إن لزم.

**البوابة:** لا استخراج بسبب أول شاشة أو أول endpoint. يلزم schema/deployment/
secrets/observability مستقلة، contracts versioned، وعدم امتلاك SalesOrder أو
StockLedger أو GL.

## 11. الاختبارات والتحقق

### Domain وapplication

- state transitions للجولة والزيارة والطلب والمرتجع والإغلاق.
- invariants للعهدة، المخزون السالب، السعر، الائتمان، document sequence.
- idempotency لكل command تحت retry وduplicate delivery.

### Integration وAPI

- SQL Server isolation عبر tenant/company/branch/vehicle.
- Outbox/Inbox، replay، dead-letter، stale processing وreconciliation.
- Payments provider signature/replay، Accounting posting، Inventory concurrency.
- API versioning، ProblemDetails، RBAC، rate limit وaudit.

### Mobile

- unit tests للـ command journal وscope وconflict resolver.
- offline/online transitions، restart، crash أثناء الإرسال، queue recovery،
  device revoke، TTL/purge، وحالات loading/error/empty.
- RTL/LTR، accessibility، low-end device، battery وpoor-network evidence.

### End-to-end وpilot

- رحلة كاملة: load → visit → direct sale/preorder → payment/collection →
  issue/return → reconciliation → close.
- تشغيل جهازين على نفس العميل، retry متكرر، out-of-order commands، وفقدان
  الاتصال أثناء capture أو close.
- قياس API p95، sync latency/failure، duplicate rate، negative-stock incidents،
  reconciliation age، وdevice revoke latency.

## 12. التشغيل والمراقبة

يجب تسجيل metrics وstructured logs مع redaction:

- open trips، visits/day، orders accepted/rejected، PendingSync age، conflict وDLQ.
- load/issue/return/count variance، negative-stock attempts، invoice/receipt
  duplicates، cash variance، reconciliation age.
- sync p50/p95، retry rate، provider webhook failures، device revoke latency.

تنبيهات MVP: تراكم PendingSync، DLQ غير فارغ، reconciliation متأخرة، فرق نقدي
أو مخزني، محاولة تجاوز المخزون، duplicate financial fact، وفشل provider
webhook. يحتاج الدعم إلى runbook لإعادة الإرسال، الجرد، إبطال الجهاز، ومعالجة
التعارض مع سبب وموافقة.

## 13. Definition of Done

تعتبر Van Sales جاهزة للـ pilot عندما:

- كل route/trip/order/stock/payment/accounting ownership موثق ومختبر.
- لا يوجد duplicate invoice أو receipt أو capture عند retry.
- لا يوجد negative van stock غير مفسر أو فرق عهدة بلا workflow.
- كل mutation scoped ومراجع audit مع actor/device/trip/correlation.
- offline queue مشفرة ومحددة النطاق وقابلة للاستعادة والمصالحة والإبطال.
- الاختبارات الأساسية والتكاملية والموبايل وE2E وpoor-network مكتملة.
- توجد dashboards وalerts وsupport runbook وpilot evidence.
- الويب والموبايل يعرضان نفس حالات lifecycle والرفض والتعارض وRTL/LTR.
- القرار المؤجل بشأن extraction له owner وtrigger وevidence، ولا يوجد runtime
  placeholder لموديول مستقل.

## 14. المخاطر والقرارات المؤجلة

- هل السيارة موقع مخزني دائم أم عهدة قابلة للتسوية اليومية؟
- هل يسمح القانون provisional invoice/receipt range أو يفرض online fiscal API؟
- حدود الائتمان والخصم أثناء الانقطاع، ومن يملك override؟
- هل الموقع الجغرافي مطلوب أم اختياري؟ ما consent والاحتفاظ؟
- هل المندوب يستطيع العمل على أكثر من شركة أو فرع في الجهاز نفسه؟
- هل الدفع النقدي يحتاج فصل صلاحيات بين المندوب والمشرف والمحاسب؟
- ما الحد التشغيلي الذي يبرر WMS/TMS أو RouteSales مستقلًا؟

يعاد فتح القرار فقط عند وجود عميل أو عقد، متطلب قانوني، incident تشغيلي، حجم
بيانات/مسارات، أو SLO لا يمكن تحقيقه داخل الحد الحالي.

## 15. قواعد تحديث التوثيق

أي تغيير في الملكية أو lifecycle أو offline policy يجب أن يحدث في نفس التغيير:

1. هذا الملف.
2. القسم المختصر في `OMNICHANNEL_ERP_PRODUCT_BLUEPRINT.md`.
3. وثائق Accounting/Inventory/Sales/Payments المتأثرة.
4. ملفات web/mobile/API الخاصة بالـ feature عند بدء runtime.
5. مصفوفة العقود وADR عند تغيير boundary أو extraction decision.

لا تسجل الخطة endpoint أو entity أو migration كأنها منفذة قبل وجود المصدر
والاختبار والدليل التشغيلي المقابل.
