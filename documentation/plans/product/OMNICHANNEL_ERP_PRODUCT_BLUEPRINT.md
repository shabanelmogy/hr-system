# مخطط ERP SaaS متعدد القنوات

**الحالة:** مخطط منتج وملكية وتسلسل فقط — لا ينشئ هذا الملف Module أو Route أو
جدولًا أو شاشة في runtime.

**آخر تحديث:** 2026-09-19

## القرار التنفيذي

يتوسع المنتج على المدى الطويل من ERP داخلي إلى منصة SaaS تدير العمليات
الداخلية والقنوات الرقمية الخارجية من نفس نواة العزل والمحاسبة والمخزون. توجد
أربع عائلات واجهات مستهدفة:

1. Back-office للـ Tenant على الويب والموبايل.
2. Employee وManager self-service.
3. Job Portal عام للباحثين عن عمل وأصحاب العمل على الويب والموبايل.
4. Commerce للجملة والقطاعي على الويب والموبايل.

هذا قرار تخطيط، وليس إعلانًا عن أن القنوات أو الموديولات الجديدة منفذة. الأولوية
الحالية هي تثبيت المحاسبة والمخزون وPOS وContacts/CRM تدريجيًا، ثم بناء القنوات
المستقلة فوق Contracts وأحداث موثقة. يبدأ Commerce بعد تثبيت مصدر الحقيقة للمال
والمخزون والجهات، بينما Job Portal stream مستقل يبدأ بعد تثبيت Recruitment
public contracts وprivacy/consent ولا ينتظر Accounting أو Inventory.

## الرؤية

يقدم النظام لكل Tenant مساحة تشغيل واحدة تشمل الشركات والفروع والمستخدمين
والصلاحيات والاشتراكات، ثم تسمح له بتشغيل قنوات متعددة دون نسخ بيانات أو تجاوز
العزل:

- إدارة الموارد والعمليات من Back-office.
- نشر الوظائف المعتمدة خارجيًا من خلال Job Portal مستقل.
- بيع المنتجات بأسعار وسياسات B2B أو B2C من Commerce مستقل.
- استقبال الطلبات من الويب والموبايل وPOS مع تسوية موحدة في Accounting.
- إتاحة تكاملات مستقبلية عبر APIs وEvents دون ربط قواعد البيانات ببعضها.

## Personas والقنوات

| Persona | القناة المستهدفة | الغرض | حدود الوصول |
| --- | --- | --- | --- |
| Platform/Super Admin | Back-office web | إدارة المنصة والخطط والدعم | Platform scope مع تدقيق كامل |
| Tenant Admin | Back-office web/mobile | إدارة tenant والشركات والمستخدمين | Tenant scope؛ لا يرى Tenant آخر |
| Finance/Accountant | Back-office web | الإعدادات والقيود والإقفال والتقارير | Company أو نطاق مالي مصرح |
| Warehouse/POS staff | Web/mobile وPOS | المخزون والاستلام والبيع والجرد | Branch/company scope |
| HR/Recruiter | Back-office web | الموظفون والتوظيف الداخلي | HR tenant/company scope |
| Employee/Manager | Mobile وweb خفيف | الملف والإجازات والموافقات | بيانات المستخدم ونطاقه |
| Employer/Recruiter خارجي | Job Portal web/mobile | نشر وظيفة ومراجعة المرشحين | Tenant أو مؤسسة مشتركة وفق دعوة |
| Candidate | Job Portal web/mobile | البحث والتقديم ومتابعة الطلب | Public listing ثم candidate account |
| B2B buyer | Commerce web/mobile | قوائم أسعار وطلبات جملة واعتمادات | Customer/tenant account وسياسة سعر |
| B2C shopper | Commerce web/mobile | اكتشاف وشراء ودفع وتتبع | متجر/قناة عامة أو حساب عميل |
| Supplier/Logistics partner | Portal مستقبلي | التوريد والتسليم والتسويات | Contracted partner scope فقط |

## الوضع الحالي مقابل الهدف

| السياق/السطح | الوضع الحالي الموثق | الهدف | القرار الآن |
| --- | --- | --- | --- |
| Platform | Identity وTenant وCompany وEntitlements وعزل أساسي | نواة مشتركة لكل القنوات | مستمر؛ لا تكررها القنوات |
| HR | Workforce وRecruitment داخليان ضمن حدود HR الحالية | مصدر بيانات الوظائف الداخلية والتعيين | يبقى HR؛ Job Portal مستقل |
| Contacts | Party ومرجع جهات وتكامل Accounting | هوية عميل/مورد مشتركة للقنوات | يبقى المصدر؛ لا يصبح Storefront |
| Accounting | حدود module وacc schema وContracts/Outbox موثقة | مصدر الحقيقة للقيود والفواتير والتسوية | أولوية قبل Commerce |
| Inventory | module وinv schema جاهزان كحدود | مخزون وفروع وحجز وتوافر للقنوات | أولوية قبل الطلبات الخارجية |
| POS | module وpos schema جاهزان كحدود | بيع قطاعي ومزامنة الطلبات والقنوات | يبنى بعد أساس Inventory |
| CRM | module وcrm schema جاهزان كحدود | دورة العميل والحملات والشرائح | يبنى مع Contacts قبل التسويق |
| Sales | غير موجود كموديول runtime | quotations، customer terms، price validation، SalesOrder | Planned بعد Accounting وInventory |
| Procurement | غير موجود كموديول runtime | RFQ، PO، ASN handoff، vendor terms | Planned بعد Accounting وInventory |
| Payments | غير موجود كموديول runtime | provider intents، authorization/capture/refund، webhook inbox | Planned بعد order contracts |
| Fulfillment | غير موجود كموديول runtime | shipments، carriers، delivery، return logistics | Planned بعد order contracts |
| Back-office web/mobile | منصات تشغيل قائمة وقواعد ملكية مشتركة | واجهات تشغيل لكل موديول | تستمر حسب vertical slices |
| Job Portal | غير موجود كموديول أو سطح runtime | public vacancy projection/search وقنوات التقديم المساندة | Planned مستقل بعد Recruitment contracts |
| Commerce | غير موجود كموديول أو سطح runtime | storefront merchandising، cart/checkout session، customer order projection | Planned بعد Sales contracts |
| Supplier/Logistics | غير موجود | بوابة وتكاملات تنفيذية | Deferred إلى ما بعد الطلب والتوافر |

## الملكية وحدود الموديولات

كل موديول جديد يظل مستقلًا عن الموديولات الحالية في source وpersistence وواجهات
المستخدم. لا توجد جداول مشتركة أو EF navigations عابرة للموديولات.

| الموديول أو السياق | يملك | يستهلك | لا يملك |
| --- | --- | --- | --- |
| Platform | Identity، tenancy، companies، memberships، entitlements، channel policies | حقائق التشغيل المنشورة بعقود | HR أو Catalog أو Orders أو Jobs |
| HR | Candidate profile/link، EmploymentApplication، requisition/job posting/opening، interview، offer، hire lifecycle، إضافة إلى Employee/organization | Platform external auth principal وContacts عبر عقود | Public vacancy search/index أو candidate-facing channel UX |
| Contacts | Party، customer/supplier references، بيانات الاتصال | Platform scope وحقائق الموديولات | CRM campaigns أو candidate portal UX |
| Accounting | Chart، journals، posting، periods، receivable/payable، financial settlement truth | Financial facts من Sales، Procurement، POS، Commerce، Payments | Cart، payment provider state، stock أو candidate lifecycle |
| Inventory | Operational product/SKU/UOM، warehouses، stock ledger، costing، reservation، ATP | Platform/Contacts وطلبات الحجز المعتمدة | Cart، checkout، customer pricing، POS UI |
| POS | Retail sale transaction، cash session، terminal workflow، sale facts | Inventory availability وSales/Commerce contracts لاحقًا | Ecommerce catalog، SalesOrder truth، payment provider state |
| CRM | Customer lifecycle، opportunities، segments، campaigns | Contacts facts وcommerce/job signals بعقود | Ledger أو stock truth أو public account identity |
| Sales المستقبلي | Quotations، customer contract/terms، final price validation، SalesOrder، commercial order lifecycle | Contacts، Inventory availability، Commerce order requests | Storefront merchandising، cart، checkout UI، stock ledger |
| Procurement المستقبلي | RFQ، purchase terms، purchase order، ASN handoff، vendor lifecycle | Contacts، Inventory requirements، Accounting commitments | Customer sales، stock ledger، payment provider state |
| Payments المستقبلي | Provider intents، authorization/capture/refund، webhook inbox، signature/replay protection، payment reconciliation | Sales/Commerce order contracts وprovider adapters | Financial posting/settlement truth، cart أو stock |
| Commerce المستقبلي | Storefront merchandising، channel assortment، offers/promotions، cart، checkout session/orchestration، customer-facing order projection | Inventory availability، Contacts party، Sales idempotent order request، Payments status | SalesOrder truth، stock ledger، GL، HR، canonical customer master |
| Fulfillment/Logistics المستقبلي | Shipment، carrier integration، delivery status، returns transport | Sales/Commerce order facts وInventory reservations | Order commercial truth، stock ledger، GL |

الموديولات المستقبلية JobPortal وCommerce وSales وProcurement وPayments وFulfillment
لا تدخل داخل HR أو Inventory أو POS أو Accounting. عند بدء تنفيذ أي موديول جديد
ينشأ كحزمة قياسية مستقلة Contracts/Domain/Application/Infrastructure/
Presentation/Bootstrap + Tests مع schema وmigrations مملوكة باستخدام
New-ErpModule.ps1، وبعد Phase 00 وfeature evidence مكتملة. استكمال Accounting
وInventory يتم داخل الموديولين القائمين عبر feature documentation workflow، ولا
يستخدم New-ErpModule.ps1 لهما.

## B2B وB2C

Commerce واحد مستقبلي يمكنه دعم سياستي B2B وB2C عبر channel/account policies،
مع إبقاء الاختلافات التجارية صريحة:

- B2B: حساب شركة مشتري، قوائم أسعار واتفاقيات، حد ائتماني أو شروط دفع، موافقات
  متعددة، حد أدنى للطلب، عروض أسعار، وطلبات متكررة.
- B2C: كتالوج عام، سعر معلن، guest أو customer account، دفع فوري، كوبونات،
  شحن وإرجاع مبسطان.
- القاعدة المشتركة: المنتج والتوافر يأتيان من مصدرهما، والطلب يملك lifecycle
  تجاريًا واحدًا، والنتيجة المالية تنتقل إلى Accounting عبر contract/event.
- لا تستخدم B2B أو B2C أي tenant/company identifier يرسله المتصفح لتوسيع
  الوصول؛ يحدد السياق من القناة والهوية والسياسة الموثقة.

## Job Portal boundary

Job Portal تجربة توزيع وتقديم مستقلة، وليست شاشة عامة داخل HR. HR هو المالك
الحالي والمستقبلي لـ Candidate profile/link وEmploymentApplication وrequisition/
job posting/opening وinterview وoffer وhire lifecycle. JobPortal يملك فقط:

- public vacancy projection/search/index وtenant-branded channel content.
- saved jobs، alerts، preferences، وdraft application UX.
- public/employer BFF workflow وread models وقواعد visibility/publication/
  withdrawal الخاصة بالقناة.
- anti-abuse/rate limits وsearch/read models المناسبة للزوار.

عند submit يستدعي JobPortal عقد HR بصورة idempotent؛ لا يصبح مصدر الحقيقة للطلب
ولا يكتب HR في جداول JobPortal. Platform يملك external auth principal. ويحدد
tenant/company من approved publication وhost/channel، لا من اختيار يدوي يرسله
الزائر. JobPortal stream مستقل بعد تثبيت Recruitment public contracts وprivacy/
consent، ولا ينتظر Accounting أو Inventory.

## Commerce boundary

Commerce هو context تجاري للقنوات، وليس إعادة تسمية Inventory أو POS أو Sales:

- يملك storefront merchandising، channel assortment، offers/promotions، cart،
  checkout session/orchestration، وcustomer-facing order projection.
- Sales يملك quotations، customer contract/terms، final price validation،
  SalesOrder، وcommercial order lifecycle. Commerce يرسل إليه idempotent order
  request ولا يملك SalesOrder truth.
- Inventory يقرر التوافر والحجز وoperational product/SKU/UOM وحركة المخزون.
- POS يملك المعاملة الطرفية النقدية والجلسة والصندوق، ويمكنه نشر sale facts
  بعقود؛ لا يتحول إلى Commerce.
- Payments يملك provider intents وauthorization/capture/refund وwebhook inbox
  وreconciliation، بينما Accounting يملك financial posting وsettlement truth.
- Contacts يملك party/customer reference، وCRM يستهلك إشارات العميل والطلب.

قرار Product/PIM مؤجل: Inventory يملك operational product/SKU/UOM حاليًا
ومستقبلًا. يُدرس PIM/Catalog context مستقل فقط عند تعقد media/content/
variants/multi-channel localization، ويتطلب ADR منفصلًا؛ Commerce يستهلك
projection ولا يصبح مصدر product operational truth.

الأحداث المقترحة مثل CatalogPublished وOrderRequested وInventoryReservationRequested
وPaymentAuthorized وInvoicePosted هي أمثلة للحدود فقط، وتخضع كل واحدة منها
لمراجعة Contract وOutbox/Inbox وidempotency عند التنفيذ.

## Van Sales boundary

Van Sales قدرة تشغيل ميداني للمندوب الذي يبيع أو يسجل الطلبات أثناء الجولة من
سيارة أو عهدة ميدانية. تبقى في البداية capability منسقة داخل المونوليث بين
Sales وInventory وAccounting وPayments وContacts/CRM، مع Mobile sales-rep surface
ولوحة متابعة وتسوية. لا تنشئ هذه الخطة Module أو Route أو schema أو شاشة في
runtime.

الملكية الأساسية ثابتة: Sales يملك route/trip/day وvisit plan وSalesOrder؛
Inventory يملك vehicle location وload/issue/return/count وreservation؛ Accounting
يملك invoice وAR وcash receipt وposting؛ Payments يملك provider intents وwebhooks؛
Contacts يملك Party/customer reference؛ وMobile يملك snapshot وdrafts وcommand
journal وsync state فقط. لا يكتب الموبايل قيدًا أو StockLedger أو payment state،
ولا يتحول Van Sales إلى POS.

التفصيل التنفيذي المعتمد، بما فيه MVP وDeferred، تدفق الجولة، سياسة Offline،
الفجوات، العقود والأحداث، مراحل 04A.00 إلى 04A.08، الاختبارات، بوابات الجاهزية
وقواعد الاستخراج إلى RouteSales/Distribution، موجود في
[خطة Van Sales والبيع الميداني](VAN_SALES_PRODUCT_PLAN.md).

القاعدة التشغيلية المختصرة: يبدأ التنفيذ بعد تثبيت Accounting وInventory وSales
والعقود اللازمة. الوضع الافتراضي online-confirmed؛ يسمح Offline بجمع أمر
provisional قابل للمزامنة فقط. لا تصبح الفاتورة أو التحصيل أو حركة المخزون
نهائية قبل قبول الخادم والمصالحة. ولا يُعاد فتح قرار استخراج RouteSales/
Distribution إلا بدليل حجم أو تشغيل أو امتثال وخطة migration قابلة للرجوع.


## APIs وEvents

كل قناة تستخدم API versioning وProblemDetails وcorrelation/causation IDs
والصلاحيات من الخادم. الواجهات العامة لا تكشف جداول أو مفاتيح داخلية.

### API surface matrix

| Surface | Authentication/scope | Rate limit | Idempotency/replay | PII/consent/audit |
| --- | --- | --- | --- | --- |
| Backoffice authenticated | Platform identity + tenant/company/branch RBAC | User/tenant and expensive-operation limits | Required for mutations and bulk jobs | Full actor, reason, correlation, security audit |
| Public browse | Anonymous or channel session bound to approved host/publication | IP, host, device and abuse limits | Read requests do not mutate | Minimize PII; publication/consent policy only |
| Candidate/customer authenticated | External auth principal or customer identity, scoped to channel/account | Account/device limits with abuse detection | Draft/submit/order/payment mutations require keys | Explicit consent, data minimization, audit on sensitive actions |
| Partner/webhook | API key/OAuth or provider signature, tenant/partner scoped | Per key/provider and endpoint limits | Inbox dedupe, provider event ID, replay window | No secrets in clients; payload redaction and delivery audit |
| Internal module integration | Contracts, trusted service context, tenant/company dimensions | Bounded consumer and publisher queues | Outbox/Inbox, stable event ID, revision/ordering | PII classification, correlation/causation, operational audit |

Webhook consumers verify provider signatures, enforce replay protection, persist
an Inbox receipt before applying a side effect, and expose reconciliation/
dead-letter handling. API keys and provider secrets never ship to web or mobile
clients. Shared BuildingBlocks may provide transport, validation, auth plumbing,
and observability primitives only; they do not contain HR, Sales, Commerce,
Accounting, or other business rules.

قواعد التكامل:

1. الطلب المتزامن يعيد قرارًا قابلًا للعرض، ولا يعتمد على قراءة قاعدة موديول
   آخر.
2. الحقيقة التي تحتاج تسليمًا مضمونًا تمر عبر transactional Outbox، ويستهلكها
   الطرف الآخر عبر Inbox/idempotency.
3. الأحداث تحمل tenant وcompany/channel dimensions عند الحاجة، مع stable event
   identity وrevision أو ordering policy.
4. إعادة المحاولة وdead-letter وreconciliation جزء من تصميم كل تدفق مالي أو
   تجاري أو أمني.
5. لا يكون event bus أو API gateway سببًا لتجاوز ownership؛هما وسيلة نقل فقط.

## العزل والأمن وOffline

- Tenant وCompany وBranch أبعاد مستقلة، وتبقى كل عملية محكومة بالـ trusted
  execution context.
- القنوات العامة تستخدم channel/merchant context، ولا تحول public browsing إلى
  tenant-wide data access.
- candidate وcustomer identities تُربط بسياسات واضحة ولا تُساوى تلقائيًا بحساب
  موظف أو مستخدم إداري.
- الدفع وAPI keys وwebhooks ورفع الملفات تحتاج policy وaudit وrotation مستقلة.
- Offline ليس مطلبًا لكل النظام. browse/search/catalog/job listings يجوز لها
  cache/read محدودًا بزمن وصلاحية واضحين، كما يجوز حفظ application drafts
  وcarts محليًا قبل الإرسال.
- application submit، offer accept، checkout، payment، final order، وfinancial
  posting ليست offline-complete؛ تحتاج online confirmation، idempotent retry،
  ومصالحة واضحة عند انقطاع الاتصال.
- POS وعمليات المستودع أو field workflows قد تحتاج offline execution لاحقًا،
  لكن ذلك يتطلب conflict policy وidempotency وreconciliation لكل عملية قبل
  اعتماده.
- لا تُعلن أي capability offline قبل تحديد conflict policy وidempotency ومدة
  صلاحية البيانات المحلية ومسحها عند logout أو تبدل tenant.

## الواجهات القابلة للنشر

يُحافظ على deployability مستقلة لكل تجربة:

- Back-office web: التطبيق التشغيلي الحالي، مع route ownership للموديول.
- Back-office mobile: employee/manager/admin workflows التي تحتاج mobility.
- Job Portal web: SEO/public discovery وemployer portal.
- Job Portal mobile: candidate alerts، applications، employer quick actions.
- Commerce web: storefront وB2B workspace وaccount/order views.
- Commerce mobile: shopper ordering وsales/field workflows.

يمكن البدء بتطبيقات منفصلة أو shells منفصلة فوق shared design/auth packages، لكن
لا يُنسخ business logic بين web وmobile. كل surface يحتاج contract/types/services
واختبارات parity خاصة به قبل إعلان الجاهزية.

## Integration contract/event map

الأسماء التالية تخطيطية لتثبيت اتجاه الملكية والتسليم وليست Contracts أو Events
موجودة في runtime حاليًا:

| Producer | Consumer | Purpose | Delivery |
| --- | --- | --- | --- |
| HR | JobPortal | Approved vacancy publication، visibility، withdrawal، status facts | HR Outbox → JobPortal Inbox/projection، revision/order policy |
| JobPortal | HR | SubmitApplication request بعد موافقة القناة | Idempotent command/Contract، HR يملك EmploymentApplication truth |
| Commerce | Sales | Customer order request من cart/checkout | Idempotent Contract، Sales acceptance/rejection هو القرار التجاري |
| Inventory | Sales/Commerce/POS | Availability، reservation، ATP، release facts | Contract/Event مع revision وreconciliation؛ لا cross-DbContext |
| Sales | Accounting | Accepted sale، pricing/terms، receivable/invoice source facts | Transactional Outbox → Accounting Inbox، idempotent posting |
| POS | Accounting | Retail sale/cash/return financial source facts | Outbox/Inbox، balancing وduplicate suppression |
| Procurement | Accounting | PO/vendor commitment، receipt/ASN financial source facts | Outbox/Inbox، reconciliation |
| Payments | Sales/Commerce/Accounting | Authorized/captured/refunded provider facts | Signed provider webhook → Payments Inbox ثم idempotent downstream events |
| Sales | Fulfillment | Accepted order handoff، shipment/return request | Durable Contract/Event، status revisions وreplay |
| Fulfillment | Sales/Commerce/Accounting | Shipment/delivery/return status and settlement facts | Outbox/Inbox، carrier webhook replay protection |

كل صف يحتاج Contract/versioning وtenant/company/channel dimensions وسياسة
idempotency وretry وdead-letter وreconciliation عند بدء التنفيذ. لا تسمح الخريطة
بقراءة قاعدة بيانات الموديول المنتج أو بمعاملة موزعة.

## Channel quality policy

هذه معايير feature gates مستقبلية وليست ادعاءً بأن الأسطح منفذة أو جاهزة:

- **Public web:** SSR أو equivalent rendering عند الحاجة، metadata، sitemap،
  canonical URLs، crawl control، structured content، وtenant/channel host
  isolation.
- **Arabic/English:** RTL/LTR صحيحتان، ترجمة كل النصوص، locale-aware currency/
  number/date/time formatting، ومحتوى tenant قابل للتوطين دون خلط locale.
- **Accessibility:** keyboard navigation، focus/error semantics، contrast،
  labels، screen-reader semantics، واختبارات automated وmanual حسب السطح.
- **Mobile:** deep links/universal links، notification permission/preferences،
  push routing، offline cache boundaries، واستعادة session آمنة.
- **Performance:** budgets محددة لكل surface (initial load، API p95، search/
  listing، checkout أو application submit)، قياس على أجهزة وشبكات مستهدفة،
  ومراقبة regression قبل gate.

## مراحل التنفيذ والبوابات

### Phase 00 — Product and boundary evidence

- تثبيت personas والقنوات ونموذج B2B/B2C وقرار Job Portal.
- مراجعة ownership matrix والتدفقات المالية والمخزنية.
- كتابة feature evidence وreuse inventory لكل موديول مستقبلي.
- Gate: لا runtime work، وموافقة ADR والـ contracts outline.

### Phase 01 — Accounting foundation (commercial source of truth)

- استكمال Accounting داخل الموديول القائم وفق feature documentation workflow
  وبترتيب chart of accounts، fiscal periods، double-entry posting، tax، AR/AP،
  ثم idempotent source facts.
- Gate: قيود متوازنة وغير قابلة للتكرار، isolation، audit، migrations،
  reconciliation، وAPI/web/mobile evidence المناسبة.

### Phase 02 — Inventory foundation (commercial availability source)

- استكمال Inventory داخل الموديول القائم وفق feature documentation workflow
  بترتيب product/SKU، UOM، warehouses، stock ledger، costing، reservation،
  وavailable-to-promise مع حماية concurrency.
- Gate: stock invariants، costing/reconciliation، idempotent reservations،
  audit، migrations، وoffline policy فقط للعمليات التي تحتاجها.

Accounting وInventory يمكن تطويرهما في توازٍ منضبط بعد تثبيت العقود. التكامل
بينهما يكون عبر Contracts/Events وOutbox/Inbox، بدون cross-DbContext أو
distributed transaction.

### Phase 03 — Sales and Procurement (future modules)

- بعد إغلاق أساس Accounting وInventory، تُثبت حدود Sales وProcurement كـ
  موديولات مستقلة عند الحاجة التجارية؛ لا تُضاف إلى POS أو Inventory.
- Sales يملك commercial sale lifecycle، وProcurement يملك شراء الموردين
  والعروض وأوامر الشراء؛ كلاهما يرسل facts إلى Accounting ويطلب التوافر أو
  الحجز من Inventory عبر عقود.
- Gate: pricing/approval/quantity invariants، supplier/customer ownership،
  posting and stock handoff، وreconciliation قابلة للإعادة.

### Phase 04 — POS business and retail operations

- تنفيذ POS business بعد Sales/Procurement أو بالتوازي فقط مع عقود واضحة؛
  يشمل terminal/cash workflow وreturns وshift controls.
- Gate: cash balancing، stock reservation، accounting handoff، concurrency،
  audit، ودعم offline محدود للـ terminal عند ثبوت الحاجة.

### Phase 04A — Van Sales and field distribution

- تنفيذ Van Sales كـ capability ميدانية بعد اكتمال Sales وInventory والعقود
  الأساسية للدفع الإلكتروني عبر Payments، والتحصيل والتسوية عبر Accounting،
  وContacts/CRM. يبدأ السطح من mobile sales-rep
  مع back-office route/trip monitoring، ولا ينشئ موديولًا أو schema مستقلًا في
  البداية.
- النطاق: Sales-owned route/trip/day وvisit plan وتعيين المندوب والسيارة،
  vehicle load/return/count، customer visits، direct sale أو preorder،
  provisional order/return capture، Sales price/credit validation، Payments
  electronic authorization/capture/refund handoff، وAccounting cash receipt/
  collection وAR allocation وreconciliation.
- Mobile Van Sales يملك encrypted snapshot/drafts/command journal/UI state فقط؛
  SalesOrder وroute truth وStockLedger وPayment state وGL تظل في مالكيها، مع
  idempotency وOutbox/Inbox وtenant/company/branch/vehicle scoping.
- Offline يقتصر على snapshot scoped وpreallocated stock حيث يسمح contract،
  approved policies بإصدار version/expiry، و`PendingSync` queue مشفرة بتسلسل
  device/shift monotonic. الافتراضي online-confirmed؛ provisional offline
  sale/issue أو signed invoice/receipt range لا يعمل إلا باستثناء دولة/نشاط
  مستقل ولا يصبح settled/posted قبل reconciliation وقبول الخادم.
- Gate: route and vehicle RBAC، zero duplicate invoices/collections under retry،
  no unexplained negative van stock، cash/stock/document-sequence reconciliation،
  offline retry/conflict/dead-letter وoperator manual-resolution tests، device
  loss/revoke، battery/poor-network/restart/crash tests، device security/local
  purge، mobile RTL/LTR/accessibility، وقياسات sync reliability وAPI p95.
- Extraction gate: لا يتملك RouteSales/Distribution route/trip/visit إلا بعد
  ADR وmigration evidence؛ لا يُستخرج إلى service أو module مستقل إلا مع contracts
  versioned وschema/deployment/observability مستقلة، وبدون نسخ SalesOrder أو
  StockLedger أو Payment provider state أو GL.

### Phase 05 — Commerce core (future module)

- إنشاء Commerce بالمولد بعد Phase 00 evidence؛ channel model، storefront
  merchandising، catalog projection، offers/promotions، cart، checkout session،
  وcustomer-facing order projection. يرسل Commerce idempotent order request
  إلى Sales ولا يملك SalesOrder truth.
- Gate: APIs/events مستقلة، B2B/B2C policy tests، reservation and payment
  idempotency، accounting handoff، وعدم القراءة المباشرة من Inventory أو POS.

### Phase 06 — Commerce channels and payments

- storefront web ثم mobile، B2C أولًا إذا كان go-to-market يتطلبه، ثم B2B
  accounts/quotes/approvals. Payments وwebhook reconciliation وFulfillment
  تأتي بعد order lifecycle.
- Gate: accessibility، security، performance، order recovery، support tooling،
  settlement/reconciliation، وreturns/fulfillment ownership.

### Phase 07 — Job Portal (future module)

- إنشاء JobPortal مستقل؛ publication/read model، candidate channel preferences/
  read model، saved jobs/alerts، draft application UX، employer/public BFF
  workflow، وnotifications. يستدعي HR Contract idempotently عند submit ولا
  يملك EmploymentApplication أو candidate lifecycle.
- Gate: privacy/consent، abuse protection، HR contract compatibility، search
  and moderation runbook.

Job Portal stream مستقل بعد عقود Recruitment public المعتمدة وprivacy/consent؛
يمكن تنفيذه بالتوازي مع المراحل التجارية ولا ينتظر Accounting أو Inventory.
يحتاج Accounting فقط إذا أضيفت خدمات مدفوعة أو billing خاصة به.

### Phase 08 — Fulfillment and ecosystem

- logistics/returns/supplier portal، marketplace أو partner APIs حسب traction.
- Gate: operational ownership، reconciliation، partner isolation، SLOs.

كل Phase تُغلق بعقد موثق، runtime evidence، tests، migration review، وقرارات
Deferred/Excluded صريحة. لا يُنشأ package توثيق runtime لموديول مستقبلي قبل
وجود الموديول نفسه ذريًا عبر New-ErpModule.ps1. هذا الشرط ينطبق فقط عندما
توجد حاجة إلى bounded context/runtime module جديد؛ سطح web أو mobile مستقل لا
ينشئ API module تلقائيًا، بل يتبع contract وfeature evidence ويُنشأ كـ
deployable client وفق قرار القناة.

## Microservice seams

الحدود المستهدفة للانتقال لاحقًا هي Platform، Accounting، Inventory، Sales،
Procurement، POS، Payments، CRM/Contacts، Commerce، JobPortal، وFulfillment.
الانتقال يبدأ عندما يملك
السياق:

- database/schema ownership كاملة ولا توجد قراءة مباشرة من سياق آخر.
- Contracts versioned وOutbox/Inbox وidempotency وreplay/reconciliation.
- config/secrets/observability/deployment مستقلة.
- inbound/outbound ownership واضحة، ولا توجد distributed transactions؛ التنسيق
  يتم عبر durable events وcompensating/reconciliation workflows.
- load profile أو compliance أو فريق ownership يبرر الفصل.

المونوليث الحالي يبقى composition/deployment واحدًا أثناء البناء. الفصل إلى
microservice ليس هدفًا زمنيًا مستقلًا ولا يبرر إنشاء abstraction عام قبل الحاجة.

## المخاطر والقرارات المؤجلة

- هل Commerce context واحد يكفي أم تفصل B2B وB2C بعد اختلاف دورة البيع؟
- هل Job Portal يركز على وظائف Tenant فقط أم marketplace متعدد أصحاب العمل؟
- موفر الدفع، الضرائب، الشحن، العملات، والدول المستهدفة.
- مصدر Product Catalog: Inventory أم Catalog subcontext مستقل داخل Commerce.
- هل candidate account مستقل أم federated مع Platform بعد consent.
- قواعد الحذف والاحتفاظ والـ legal hold للمرشحين والعملاء.
- حدود offline في POS والمستودعات، وسياسة التعارض عند تعدد الأجهزة.
- هل نحتاج Supplier/Procurement module قبل Fulfillment؟

إعادة فتح كل قرار مرتبطة بدليل: عميل أو عقد، حجم بيانات/طلبات، فشل تشغيلي،
متطلبات قانونية، أو ضغط أداء لا يمكن حله داخل الحد الحالي.

## فرص توسع إضافية مرتبة

التصنيف هنا تخطيطي: Core-adjacent هو الأقرب بعد أساس المبيعات والمخزون،
Later يحتاج نضجًا أو حجمًا إضافيًا، وDecision required يحتاج قرار منتج أو
امتثالًا قبل الالتزام.

| التصنيف | الفرصة | الاعتماد السابق | لماذا ليس الآن / إعادة الفتح |
| --- | --- | --- | --- |
| Core-adjacent | Omnichannel stock visibility/reservation | Inventory + Sales + POS + Commerce contracts | بعد أول قنوات بيع متعددة أو خطر overselling |
| Core-adjacent | B2B pricing، quotes، approvals، credit limits | Contacts + Accounting + Sales + Commerce | عند أول عميل جملة يحتاج terms مختلفة |
| Core-adjacent | Customer Self-Service Portal | Contacts + Sales + Commerce + Platform external identity | بعد استقرار customer/order contracts |
| Core-adjacent | Van Sales/field distribution mobile | Accounting + Inventory + Sales + Contacts/CRM + Payments + mobile sync؛ Phase 04A | بعد وجود route/vehicle/customer workflow فعلي؛ يتطلب offline provisional capture، idempotent sync، conflict/reconciliation evidence، ولا يُستخرج إلى context مستقل قبل دليل volume أو تشغيل أو compliance |
| Core-adjacent | After-sales/RMA | Sales + Inventory + Accounting + Fulfillment | عند ارتفاع الإرجاع والحاجة إلى reverse logistics |
| Core-adjacent | Country e-invoicing/fiscal adapters | Accounting + Payments + country policy | عند تحديد دولة والتزام ضريبي فعلي |
| Core-adjacent | Integration Hub/API keys/webhooks/partner portal | Platform security + Contracts + Outbox/Inbox | عند وجود شركاء أو تكاملات متكررة؛ لا تضع business rules في BuildingBlocks |
| Later | Marketplace/social connectors كـ anti-corruption adapters | Commerce contracts + partner security | لا نربط domain model بمزود خارجي قبل traction |
| Later | WMS/TMS/last-mile scale | Inventory + Fulfillment + carrier contracts | عند تجاوز warehouse/route/volume thresholds |
| Later | Analytics/forecasting/recommendations/AI | Reporting/read models + privacy + data quality | read models فقط؛ لا direct domain writes قبل بيانات موثوقة |
| Later | Tenant-branded domains/themes/content/locales | Platform tenancy + channel frontends | بعد ثبات channel composition وlocalization policy |
| Later | Loyalty/Gift Cards/Subscriptions contexts | CRM + Commerce + Accounting + entitlements | contexts مستقلة؛ لا تُدفن في POS أو Accounting |
| Later | Manufacturing/MRP | Inventory + Procurement + Accounting + costing | قرار بعيد بعد إثبات manufacturing demand |
| Later | Projects and Service Management | Contacts + Accounting + workforce/CRM signals | قرار بعيد عند وجود delivery/service contracts |
| Decision required | Centralized job marketplace vs tenant career sites | HR Recruitment public contracts + JobPortal + moderation | قرار go-to-market والخصوصية قبل اختيار النموذج |
| Decision required | Persona separation when email is shared | Platform external principals + consent + account linking | يجب الفصل بين candidate/customer/employee حتى مع بريد واحد |
| Decision required | Workforce marketplace/temporary staffing | HR + JobPortal + compliance | يتطلب licensing، privacy، وmarketplace liability decision |

هذه الفرص لا تُضاف إلى أي module قائم تلقائيًا. لكل فرصة قرار ownership،
feature evidence، schema/API/event design، ثم إنشاء موديول مستقل إذا تجاوزت
حدود context قائم.

## مرجع التنفيذ والتوثيق

قبل أي موديول أو surface جديد:

1. تُراجع هذه الوثيقة وADR-008 ومصفوفة الملكية.
2. يُنشأ feature evidence وPhase 00 قبل runtime.
3. يُفحص shared reuse catalog ولا يُنسخ business logic بين العملاء.
4. إذا كان القرار يتطلب bounded context/runtime module جديدًا، يُنشأ ذريًا عبر
   New-ErpModule.ps1 بمشاريعه الستة واختباراته وschema/migrations المملوكة.
   أما سطح web/mobile فيتبع contract/evidence ويُنشأ كـ deployable client
   مستقل دون إنشاء API module تلقائيًا.
5. تُحدّث وثائق API/web/mobile والمصفوفات وphase packets مع كل capability.
6. لا تعني الخطة أن endpoint أو screen أو table موجود حتى يثبت ذلك المصدر
   والاختبار والمراجعة.
