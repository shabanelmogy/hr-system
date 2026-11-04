# Accounting — Fiscal Localization Research and Design Review

| Field | Value |
| --- | --- |
| Review date | 2026-11-04 |
| Status | Discovery research; design recommendations await discussion |
| Canonical plan | `accounting-core-gl` — reopened; zero accepted implementation |
| Canonical localization decision | DEC-007 |
| Initial design countries | Egypt and Saudi Arabia, explicitly requested |
| First launch country | Egypt remains the last explicitly selected launch country; simultaneous Saudi launch has not been selected |
| Confirmed launch business scope | Multiple activities, B2B invoices and B2C sales; Egyptian eInvoice and eReceipt integrations are Required |
| Clients | Angular is the target Web client; Mobile capability decisions remain explicit |

This is a research companion to `RESEARCH.md` and `DISCOVERY.md` section 15. It is
not an implementation plan, an approved schema, a statutory certification, or
permission to start runtime work. Recommendations below are not requester
decisions. Existing Core GL decisions remain comparison inputs under D-028.

## 1. Findings that change the review

1. Review localization before freezing country-dependent chart/setup contracts.
   Runtime construction can still begin with a bounded GL foundation after the
   revised discovery/specification and its applicable gates are approved.
2. Design one accounting kernel with explicit **Egypt** and **Saudi** fiscal
   policies/adapters. The two countries already demonstrate different document
   lifecycles; a country dropdown plus a QR generator is insufficient.
3. The requested first operational release is broader than manual Core GL.
   B2B/B2C issuance, taxes and Egyptian eInvoice/eReceipt cannot remain deferred
   beyond that release. Separate delivery slices can preserve a manageable build.
4. A general ERP for multiple activities needs a declared coverage matrix.
   Supporting several activities does not establish support for every regulated
   sector, specialized receipt, tax exception or statutory filing.
5. Recommend online ERP invoicing as the initial journey. A POS interface can use
   the same services when a retail workflow needs it. Offline issuance changes
   device sequencing, security and reconciliation and needs a separate decision.
   The requester asked which option is best; this recommendation is **not yet
   approved** and must not silently change D-006.
6. Country requirements must be versioned and verified against official sources.
   Odoo's localization describes Odoo; its templates do not determine applicable
   law, our delivery scope, or our ownership boundaries.

## 2. Evidence method and limitations

Evidence is separated into requester decisions, verified source observations,
official external requirements, and local design proposals. Source code was
inspected read-only after a Graphify query. No API, live database, Angular
Accounting journey, ETA account or ZATCA taxpayer account was verified.

Odoo comparison uses branch **19.0**, reviewed on the date above; it is not a
claim about the latest release or about immutable upstream content. The public
demo observation recorded in `RESEARCH.md` uses a non-Egyptian company and is not
Egyptian or Saudi localization acceptance.

Both production and preproduction ETA documentation were reachable intermittently.
The preproduction homepage carries an old update date and its visible release
index ends in 2023. Individual pages contain later examples. Neither a homepage
date nor a successful fetch proves production behavior. Pin schemas, reference
codes, validators and endpoint contracts again during implementation preflight.

ZATCA's currently published specification page points to documents dated
2023-05-19. The reviewed XML and security documents identify version 1.2. Record
these actual versions; recheck the official publication and taxpayer applicability
before implementation and rollout. No taxpayer's integration wave was inferred.

## 3. Official source register

These are annotated links, not copied manuals. Dates refer to the source when
stated; all were reviewed on 2026-11-04. Technical observations do not by
themselves establish legal applicability to every company.

| Ref | Primary source | Evidence used |
| --- | --- | --- |
| OD-07 | [Odoo 19 Egypt documentation](https://github.com/odoo/documentation/blob/19.0/content/applications/finance/fiscal_localizations/egypt.rst) | Base localization and ETA integration are separate modules; implementation-specific setup |
| OD-08 | [Odoo Egypt module manifest](https://github.com/odoo/odoo/blob/19.0/addons/l10n_eg/__manifest__.py) | Base package declares accounts, taxes, fiscal positions and tax reports |
| OD-09 | [Odoo Egypt template defaults](https://github.com/odoo/odoo/blob/19.0/addons/l10n_eg/models/template_eg.py) | Account roles, currency-difference accounts, rounding and extra journal defaults |
| OD-10 | [Odoo Egypt tax templates](https://github.com/odoo/odoo/blob/19.0/addons/l10n_eg/data/template/account.tax-eg.csv) | Separate sales/purchase/reversal mappings, tax tags and ETA classifications |
| OD-11 | [Odoo Egypt account templates](https://github.com/odoo/odoo/blob/19.0/addons/l10n_eg/data/template/account.account-eg.csv) | Six-digit starter account codes and Arabic names are product template choices |
| OD-12 | [Odoo Egypt fiscal positions](https://github.com/odoo/odoo/blob/19.0/addons/l10n_eg/data/template/account.fiscal.position-eg.csv) | Egypt/non-Egypt automatic selection is an Odoo implementation, not a universal export-tax decision |
| OD-13 | [Odoo 19 Saudi documentation](https://github.com/odoo/documentation/blob/19.0/content/applications/finance/fiscal_localizations/saudi_arabia.rst) | Separate base localization, reports, Phase 2 integration and POS capabilities |
| OD-14 | [Odoo 19 Companies](https://github.com/odoo/documentation/blob/19.0/content/applications/general/companies.rst) | Company represents an independent business entity; independent subsidiaries are additional companies |
| OD-15 | [Odoo 19 Multi-company](https://github.com/odoo/documentation/blob/19.0/content/applications/general/companies/multi_company.rst) | Multiple companies in one database with company-scoped settings/access and selected shared data |
| OD-16 | [Odoo 19 Accounting overview](https://github.com/odoo/documentation/blob/19.0/content/applications/finance/accounting.rst) | Per-company charts with optional shared accounts; branches inherit parent chart, currency and taxes |
| EG-01 | [ETA integration overview](https://sdk.preprod.invoicing.eta.gov.eg/start/) | ERP/POS integration, B2B/B2C, asynchronous processing and taxpayer identity |
| EG-02 | [Invoice v1.0](https://sdk.preprod.invoicing.eta.gov.eg/documents/invoice-v1-0/) | Issuer/receiver, branch/activity, item/unit/tax references, FX, signature and document version |
| EG-03 | [Receipt v1.2](https://sdk.invoicing.eta.gov.eg/documents/receipt-v1-2/) | Device identity, content-derived UUID, predecessor link, payment and buyer fields |
| EG-04 | [Return receipt v1.2](https://sdk.preprod.invoicing.eta.gov.eg/documents/return-receipt-v1-2/) | Return receipt links the original sale; correction references are separate |
| EG-05 | [Document types](https://sdk.preprod.invoicing.eta.gov.eg/types/) | Invoice/credit/debit/export families and activity-specific receipts; receipt 1.0/1.1 marked retired |
| EG-06 | [ETA code tables](https://sdk.preprod.invoicing.eta.gov.eg/codes/) and [tax types](https://sdk.preprod.invoicing.eta.gov.eg/codes/tax-types/) | Official classification vocabulary; rates and applicability need their own authority |
| EG-07 | [Submit invoices](https://sdk.preprod.invoicing.eta.gov.eg/einvoicingapi/01-submit-documents/) | Partial acceptance, HTTP 202, submission/document identifiers, duplicate responses |
| EG-08 | [Submit receipts](https://sdk.preprod.invoicing.eta.gov.eg/ereceiptapi/02-submit-receipt/) | Separate endpoint, active POS prerequisite, result tracking and signature-validation caveat |
| EG-09 | [Authenticate POS](https://sdk.preprod.invoicing.eta.gov.eg/ereceiptapi/01-authenticate-pos/) | Device-specific authentication inputs and taxpayer B2C permission |
| EG-10 | [Document signature creation](https://sdk.preprod.invoicing.eta.gov.eg/signature-creation/) | Canonicalization, SHA-256 and CAdES-BES process |
| EG-11 | [Integration practices](https://sdk.preprod.invoicing.eta.gov.eg/integrationpractices/) | Callbacks preferred, submission polling alternative, token caching and resubmission pitfalls |
| EG-12 | [Receipt issuance FAQ](https://sdk.preprod.invoicing.eta.gov.eg/receiptissuancefaq/) | Receipt hashing/correction chain and receipt QR as a portal URL |
| EG-13 | [Receipt calculations](https://sdk.invoicing.eta.gov.eg/main-calculations/) | Ordered arithmetic, tax components and field precision validations |
| EG-14 | [ETA branch codes](https://sdk.preprod.invoicing.eta.gov.eg/codes/branch/) | Branch codes are taxpayer-specific external identifiers |
| EG-15 | [Law 6/2025, original official publication](https://www.eta.gov.eg/sites/default/files/2025-02/law_no.6.of_.2025.pdf) | Conditional simplified regime, withholding treatment, quarterly VAT return and simplified records |
| EG-16 | [Law 149/2026](https://eta.gov.eg/sites/default/files/2026-08/law.no_.149.of_.2026.pdf) | Published VAT amendments, including equipment/exemptions and credit-balance provisions |
| EG-17 | [Law 150/2026](https://eta.gov.eg/sites/default/files/2026-08/law.no_.150.of_.2026.pdf) | Regular records and temporary tax-card restrictions |
| EG-18 | [Official corrigendum, 2026-08-08](https://eta.gov.eg/sites/default/files/2026-08/law.no_.149.150.151.of_.2026.retractation.pdf) | Two scanned pages visually inspected; corrections must accompany the original laws |
| EG-19 | [ETA legislation index](https://eta.gov.eg/ar/content/qwanyn-aldrybt-ly-alqymt-almdaft) | Navigation to current amendments and implementing decisions, including 417/418/420 of 2025 |
| EG-20 | [Law 206/2020, official original](https://www.eta.gov.eg/sites/default/files/2024-03/law_no.206-2020.pdf) | Retention investigation baseline; extracted body is poorly encoded, not a consolidated current-law receipt |
| EG-21 | [Investment Ministry standards update](https://mift.gov.eg/Blog/Details/204) | 2026 standards-governance changes; a historical standards set cannot be assumed complete |
| SA-01 | [ZATCA detailed guideline v2, May 2023](https://zatca.gov.sa/en/E-Invoicing/Introduction/Guidelines/Documents/E-Invoicing_Detailed__Guideline.pdf) | Phase 2 clearance versus reporting, notes, format and failure-process distinctions |
| SA-02 | [ZATCA specification publication](https://zatca.gov.sa/en/E-Invoicing/SystemsDevelopers/Pages/E-Invoice-specifications.aspx) | Official data dictionary/XML version navigation |
| SA-03 | [ZATCA XML implementation v1.2](https://zatca.gov.sa/ar/E-Invoicing/SystemsDevelopers/Documents/20230519_ZATCA_Electronic_Invoice_XML_Implementation_Standard_%20vF.pdf) | UBL 2.1, country validation, calculation/rounding and document-type rules |
| SA-04 | [ZATCA security standard v1.2](https://www.zatca.gov.sa/ar/E-Invoicing/SystemsDevelopers/Documents/20230519_ZATCA_Electronic_Invoice_Security_Features_Implementation_Standards_vF.pdf) | Cryptographic identity, previous-invoice hash, stamping and QR specifications |
| SA-05 | [Saudi VAT regulations publication](https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/VATImplementingRegulations.aspx) | Required next legal baseline for Saudi tax, reporting and retention applicability; not a completed article-by-article review |

## 4. Comparison with the existing plan and Odoo

| Topic | Existing plan / source | Odoo observation | Local proposal and maintenance consequence | Authority |
| --- | --- | --- | --- | --- |
| Delivery boundary | Manual Core GL first; tax/e-invoicing deferred | OD-07/13 split base accounting and electronic integrations | Retain a small GL foundation slice, but make Egyptian B2B/B2C tax-document delivery part of the first operational release | D-031/032; exact decomposition DEC-032 |
| Country coverage | Egypt chosen during reopened review | Separate EG/SA localizations | EG and SA are initial design targets; first launch remains Egypt unless changed explicitly | D-030/033 |
| Accounts | D-010 independent company COA; D-011 levels; D-024 ACC proposal | OD-09/11 supply starter accounts, six-digit codes and defaults | Separate statutory/reporting classification from the visible account code/tree. Resolve the actual hierarchy and starter experience under DEC-029/030/031 | Proposal |
| Tax defaults | Generic future tax plan | OD-09/10 supply defaults and mappings | Select applicable rules by company regime and transaction context, not by copying every default into all companies | DEC-007/032 |
| Branch setup | HR owns Branch; DEC-009 defers branch balancing | Egypt/Saudi Odoo configuration uses journals for parts of issuance setup | Map legal tax sites and issuance devices explicitly; no necessary one-journal-per-branch policy or automatic interbranch balancing | DEC-034 |
| Party | Contacts owns Party; manual GL did not require it | Odoo collects customer legal/type/registration data | Issued documents need authoritative party facts and frozen snapshots; invoicing now adds a dependency manual GL did not have | Proposal; DEC-032 |
| Currency | One functional currency and primary book; rate snapshots | Localization supplies currency/defaults | Keep accounting currency, transaction currency and mandated tax-currency representation distinct | DEC-007 and existing DEC-008 |
| Historical integrity | Immutable posted journal and linked correction | Source templates are editable/product-managed | Freeze issued tax-document content and rule versions too; reconcile commercial, fiscal and ledger corrections | DEC-033 |
| QR | Existing generator named GenerateZatcaQrCode | Saudi base QR and Phase 2 integration are separate OD-13 capabilities | Review/reuse only verified pieces; Egyptian QR and Saudi Phase 2 payloads have their own contracts | Source observation, not acceptance |

No reviewed primary source establishes Odoo's account numbering, hierarchy,
additional IFRS journal, or fiscal-position automation as a mandatory national
chart for our target companies. Sector/regulator-specific constraints still need
coverage review. Absence of a finding is not proof that no such rule exists.

## 5. Proposed separation of responsibilities

Use the existing modular application and Accounting owner. Two countries justify
explicit policies/adapters, without requiring a dynamic plugin marketplace,
microservice per country, generic rule language, or additional message broker.

| Responsibility | Proposed boundary | Why |
| --- | --- | --- |
| Common GL | Accounts, journals, periods, posting, reversal, dimensions, FX and audit | One financial truth under D-019 |
| Tax calculation | One authoritative server calculation capability, proposed in Accounting Taxes | ERP invoicing and POS use the same breakdown; UI/adapters do not independently recalculate tax |
| Fiscal profiles | Effective company/registration policies, applicable activities, obligations, mappings and readiness | Local rules are not UI translation or company geography |
| Country packages | Reviewed starter definitions, classifications, validators and report mappings | Country changes are testable and versioned |
| Commercial documents | Owning invoice/sales/POS lifecycle, prices, quantities, discounts, supply and payment references | Source business ownership remains explicit |
| Electronic adapters | ETA eInvoice, ETA eReceipt and ZATCA issuance/clearance/reporting contracts | Similar transport concerns; different statutory behavior |
| Reporting | Reconciled tax facts, ledger totals and source-document drill-through | A PDF layout or an accepted fiscal document does not prove a correct return |

The tax-calculation boundary needs to be reconciled explicitly with D-018: source
modules own commercial facts and approved business amounts; a shared tax result
must not create a second independent amount authority. These are proposed
responsibilities, not approved new module/schema names.

## 6. Country/profile model and company setup

**Initial boundary selected — D-034, 2026-11-04:** the requester prefers one
primary fiscal country per legal company. Actual independent Egyptian and Saudi
legal entities use separate Company records within the same ERP environment,
each retaining its independent chart, functional-currency configuration and
country integration setup. Country need not equal transaction currency.

Cross-country fiscal registrations for the same legal entity are **Deferred**;
reopen D-034 under DEC-034 when an actual target company requires that case,
before promising or implementing its rollout. This is an initial product scope,
not a legal rule: do not invent another legal entity merely to fit the model.
Registration-type and fiscal-site cardinalities still need their own contracts;
one primary country does not mean one identifier shared by all registration types.

The detailed fiscal-profile model remains proposed: stable identity, country,
applicable regime and effective dates. Do not infer fiscal jurisdiction from UI
language, timezone, address default, permitted trading countries, customer's
country, or currency.

OD-06's multi-company note allows different country localizations per company,
while branches inherit their parent's localization, and recommends separate
companies for entities operating in different countries. OD-14/15 describe legal
entity and multi-company organization. OD-16 permits optional account sharing;
retaining independent company charts is our selected direction under D-010/034.
This comparison does not copy Odoo's branch model into HR or resolve DEC-034's
remaining fiscal-site/device/signing questions.

For an Egyptian issuer selling to a Saudi customer, a Saudi customer address
alone does not activate a Saudi issuing profile. The legal issuer, establishment,
supply and registration obligations determine the applicable path.

Proposed setup areas:

1. Legal issuer and registration: official name, registration identities/status,
   tax status, legal address, applicability evidence and effective dates.
2. Activities and tax regime: several company activities where needed; select the
   relevant activity per issuing context/document with a visible default.
3. Accounting setup: functional currency, primary book, periods, editable starter
   chart or mapped existing chart, tax/control accounts and reporting mappings.
4. Fiscal sites/devices: registered external site identifiers, authoritative
   address, optional organizational-branch links and device/certificate context.
5. Electronic channels: country, document family, test/production environment,
   secret references, signing/onboarding and connection/validation diagnostics.
6. Readiness: separate GL, tax calculation, eInvoice, eReceipt and Saudi channel
   readiness. An unconfigured optional channel must not disable unrelated setup.
   A Required issuing path must be blocked with an actionable explanation.

Prefer explicit controls and prerequisites over a large unstructured Settings
page. A saved draft is not an active issuer. Never put secrets/private keys in a
package, account template, client response, mock data, export or audit message.

## 7. Chart templates and package lifecycle

Separate the following concepts:

- **Country package version:** supported classifications, validators, mappings and
  source receipts.
- **Company configuration revision:** the company's selected policies and links.
- **Document rule snapshot:** the exact rules, tax results and mappings used when
  a document was issued/posted.

Recommended behavior for discussion:

- Starter accounts are copied/mapped into the company chart. Existing account
  codes and IDs are not the identity of national tax concepts.
- A preview lists create/reuse/conflict actions before application. Applying the
  same package twice is idempotent and cannot duplicate accounts or journals.
- Preserve names and mappings edited by the company. Package provenance uses
  stable template keys; upgrades do not infer identity from a renamed code.
- Updates introduce a reviewed future-effective version. Show impact and mapping
  conflicts; never regenerate posted entries, signatures or historical returns.
- Before first use, a wrong-country setup may be replaced only after a dependency
  check. After use, changing legal issuer/country/currency is a controlled business
  transition with retained history, not a destructive reinstall.
- Withdraw a bad unused package version; fix used versions through a documented
  forward change. Database rollback alone cannot undo an issued external document.

DEC-031 owns starter-versus-blank onboarding; DEC-007 owns applicable country rules.
No national mandatory COA is claimed by this proposal.

## 8. Egypt: requirements affecting the initial design

### 8.1 Company regimes and effective rules

EG-15 articles 1–4, 11–13 demonstrate why country alone is insufficient: the
simplified regime has election/eligibility conditions, distinct withholding
treatment, quarterly VAT returns and simplified-record provisions. Do not select
it automatically from turnover or assume every Egyptian company's reporting
calendar is monthly. The final applicability matrix must incorporate subsequent
legislation/implementing decisions; no universal tax-rate table is approved here.

EG-16/17 were published on 2026-07-28. Read them with EG-18, visually inspected
because extracted text omits the correction tables. EG-17 adds a temporary-card
restriction: that card cannot be used to issue electronic invoices/receipts.
Registration status therefore matters in readiness, beyond storing a TaxNumber.
These are design-relevant examples, not a consolidated opinion on all Egyptian law.

### 8.2 eInvoice and eReceipt are distinct channels

EG-02 requires document-version, issuer/receiver and branch/activity facts,
GS1/EGS and unit references, tax detail and applicable currency representation.
EG-03 adds device-specific identity and a content-derived UUID with a predecessor
link. Buyer-data requirements are conditional; do not require a national ID for
every walk-in buyer or copy a documented threshold permanently into UI code.

EG-05 lists invoice/credit/debit/export families and multiple activity-specific
receipt families, with older receipt versions retired. A generic B2C receipt does
not prove support for every sector. EG-04's original-sale reference and correction
reference have different meanings and must not be represented as one free-text ID.

The initial release must cover the **applicable** electronic channels explicitly
requested by the owner. Routing cannot be selected only by cash versus credit,
payment method, or Party.IsCompany. Taxpayer entitlement, transaction type and
authority rules must participate in validated routing.

### 8.3 Electronic processing and signing

EG-07/08 describe asynchronous validation and submission results, including
partial acceptance. Persist the per-document result. An HTTP 202 or an item in an
accepted-for-processing list is not final tax validity. Rejected and pending
documents need visible resolution paths.

EG-09 defines POS authentication inputs and taxpayer B2C entitlement. Issuance
from an ERP screen still needs a valid registered issuing context. A browser tab
or every application login is not automatically a new fiscal POS device.

EG-10 describes invoice canonicalization/hash/signature construction. EG-08/12
also contain a receipt signature-validation deployment caveat. Keep receipt
signature capability versioned; obtain implementation-stage confirmation of the
required deployed behavior. Do not assume invoice signing and receipt signing
have identical deployment requirements or that receipts are permanently unsigned.

Odoo's USB/Windows IoT bridge is one product implementation (OD-07). Choose our
signing topology under DEC-034 using actual certificate/provider capabilities and
hosting. A local signing connector may be needed for a local token; it is not
automatically required for every environment. Keys remain with their authorized
signing boundary, outside Angular/Mobile storage and normal logs.

### 8.4 Arithmetic, codes and currencies

EG-06 distinguishes VAT, percentage/fixed table taxes, withholding, and several
fees; tax subtypes have parent-type constraints. A matching ETA code does not
establish the legal rate, taxable base, exemption, recoverability or tax point.

EG-13 supplies ordered receipt equations and precision rules. Several values
support five decimal places, while a field description in EG-03 mentions two
with a five-place example. Resolve that discrepancy against the selected schema,
validator and preproduction examples; do not globally round all source amounts
to currency display precision. Use decimal arithmetic and explicit rounding at
defined stages. Preserve document, tax-currency and ledger FX representations.

EG-12 requires deterministic receipt hashing, predecessor handling and a portal
URL in the receipt QR. Its invalid-middle-receipt example retains downstream
receipt content; do not automatically rebuild every later hash after a correction.
Concurrency must serialize the required per-device issuance state durably.

## 9. Saudi Arabia: constraints the common design must support

SA-01 sections 4 and 6.4 distinguish Phase 2 tax-invoice **clearance before sharing
with the buyer** from simplified-invoice **reporting within 24 hours of issuance**;
associated credit/debit notes follow their relevant paths. Build this distinction
into issuance policy and delivery permissions. Egyptian asynchronous submission
must not become the universal legal issuance rule.

SA-03 defines UBL 2.1 syntax plus country-specific validation/calculation rules.
The Arabic/English labels shown in the ERP are separate from mandated document
content. Use the authority's data dictionary and validation rules for actual
addresses, identities, currency/tax amounts, allowances, advances and notes.
Do not reuse Egyptian JSON, receipt families, precision or codes as Saudi rules.

SA-04 defines cryptographic identity/stamping, previous-invoice hash and QR
requirements. Issuing-unit identity, protected keys/certificates, renewal and
revocation need a durable operational owner. Keep compliant sequence/hash state
separate from a general journal number and from an Egyptian POS chain.

OD-13 separately exposes base/QR, reporting and Phase 2/POS integrations. The
existing five-field Saudi-named TLV generator cannot establish Phase 2 coverage.
Phase 1/2 applicability is a taxpayer-specific profile fact, not inferred from
revenue copied from a historical wave announcement. Recommend designing for
Phase 2 standard and simplified paths from the outset; actual Saudi launch scope
and acceptance remain DEC-032/007.

Saudi VAT, zakat/income tax, withholding, statutory statements, special sectors
and retention need their own applicable requirement matrix. An e-invoice adapter
does not supply those capabilities. SA-05 is the next legal baseline; this review
does not claim a complete Saudi tax/standards analysis or approved retention term.

## 10. Cross-country tax calculation and reporting proposals

Use typed, limited policies with explicit precedence, not a user-programmable
formula engine at this stage. Propose that the authoritative calculation accepts
legal issuer/profile, supply/document dates, activity, line classification,
customer status, prices/discounts, currencies and document kind. It returns:

- bases, tax components, rates and classifications, with policy/version identity;
- taxable/zero/exempt/out-of-scope distinctions and applicable reason references;
- inclusive/exclusive price treatment, allocation and rounding evidence;
- original and tax-currency totals plus the rate snapshot actually applied;
- posting purposes and reporting classifications, without hard-coded account IDs.

Percentage, fixed and dependent bases must be represented where a selected
country/activity requires them. Withholding cannot be implemented as an arbitrary
negative VAT rate: the relevant event, party, certificate/reporting and settlement
semantics need an explicit rule. Input-tax recoverability and adjustments are
separate from a sale's output-tax category.

Reports need durable tax facts with source-line links, supply/tax dates, original
document references and inclusion/adjustment status. These are tax evidence, not
a duplicate GL. Reconcile declared totals to source documents and journal
postings, explain differences and retain correction lineage. An account balance
alone cannot reconstruct zero/exempt bases or every return box reliably.

Keep fiscal years/GL periods, VAT return periods, withholding event periods and
statutory filing calendars separate. Statement/reporting mappings may aggregate
different company account codes; a report category is not an account's tree depth.
File export, return preparation, filing/submission and payment are distinct
capabilities. Current Required/Deferred/Excluded choices remain open in DEC-032.

## 11. Commercial, fiscal and posting lifecycles

Represent three linked dimensions of state rather than one `IsPosted` flag:

| Dimension | Examples for discussion | Authority |
| --- | --- | --- |
| Commercial document | Draft, approved, issued, adjusted | Owning invoice/POS workflow |
| Fiscal processing | Prepared, submitted, validation pending, valid/invalid; cleared/reported where applicable | Country adapter preserves actual authority result |
| Financial posting | Not posted, posted, reversal/correction linked | Accounting posting engine |

These example labels do not replace each country's actual state machine.
DEC-033 must select the legal issue point, posting trigger, buyer-delivery gate,
tax recognition date and rejection/timeout behavior for each supported family.
There is no atomic transaction across our SQL database and either authority.

Recommended controls:

- Persist an immutable issuance snapshot and a reliable submission intent before
  dispatch. Use the existing transactional outbox/inbox where applicable.
- Repeated clicks/replayed messages cannot duplicate commercial documents or
  journals. Keep a stable source ID/revision and per-channel submission identity.
- For unknown network outcome, reconcile using the channel's supported mechanism
  before resending. A short remote duplicate-detection window is not our durable
  idempotency guarantee.
- Process per-document results and callbacks idempotently. Preserve ordering and
  investigate missing/contradictory results. EG-11 prefers callbacks and describes
  submission-status polling as an alternative; avoid polling every document or
  requesting a token for each call.
- Permanent validation failures require correction; transient failures get bounded
  retry/backoff respecting response headers and the channel contract.
- Posted/issued content is never silently edited. An external cancellation or
  rejection does not silently delete a journal; reconcile the appropriate linked
  credit/debit/return and accounting effect under the selected policy.
- Preserve both original submitted data and authority-returned artifacts, including
  cleared Saudi XML where applicable. A regenerated PDF is not the legal source.

For an online initial ERP journey, authority/network outage must show a truthful
pending/blocked state and recovery action. A future offline POS mode must decide
which device owns local issuance, durable sequence/hash state, clock validity,
key access, deadlines and resynchronization; it cannot be enabled by a generic
`offline: true` setting. Online-only financial posting does not itself settle
offline commercial/fiscal issuance.

## 12. Existing-system ownership and observed gaps

All paths below are relative to the repository root. They prove inspected source,
not accepted implementation or a live schema.

| Observation | Exact inspected source | Consequence |
| --- | --- | --- |
| Platform Company has LegalName, RegistrationNumber, TaxNumber, RegistrationCountryId, DefaultCurrencyCode and TimeZoneId | `api/Modules/Platform/ErpSystem.Modules.Platform.Domain/Companies/Entities/Company.cs` | Reuse legal identity through owner contracts; do not create a competing Company master. Default currency is not proof of functional/tax currency setup |
| HR Branch has organizational code, lifecycle and timezone; no ETA/ZATCA identity in this entity | `api/Modules/HR/ErpSystem.Modules.HR.Domain/OrganizationalStructure/Entities/Branch.cs` | Propose fiscal-site mapping owned by Accounting; do not turn tax IDs into HR BranchCode or require branch-balanced GL |
| Contacts Party contains display name, email/phone, scope and revision | `api/Modules/Contacts/ErpSystem.Modules.Contacts.Domain/Party.cs` | This entity alone does not provide complete fiscal counterparty facts; review owner extensions/contracts and frozen document snapshots |
| Accounting settings currently hold functional currency and primary book | `api/Modules/Accounting/ErpSystem.Modules.Accounting.Domain/Finance/LedgerSetup/Entities/AccountingCompanySettings.cs` | Country/regime/channel readiness needs an explicit design, not an assumed existing implementation |
| Accounting FX source has dated/versioned rate records | `api/Modules/Accounting/ErpSystem.Modules.Accounting.Domain/Finance/LedgerSetup/Entities/ExchangeRates.cs` | Reuse the owner and prove applicable fiscal FX/date rules separately |
| Current QR generator uses GenerateZatcaQrCode and five TLV fields | `api/Modules/Accounting/ErpSystem.Modules.Accounting.Infrastructure/Features/Finance/Invoicing/Services/InvoiceQrCodeService.cs` | Saudi-oriented historical helper; not Egyptian QR evidence, signed invoice evidence or proof of Saudi Phase 2 |
| Inspected Inventory Domain/Contracts expose catalog category/subcategory work; PointOfSale Domain currently exposes AssemblyReference only | `api/Modules/Inventory/ErpSystem.Modules.Inventory.Domain/`; `api/Modules/Inventory/ErpSystem.Modules.Inventory.Contracts/`; `api/Modules/PointOfSale/ErpSystem.Modules.PointOfSale.Domain/` | Product/service/UOM fiscal contracts and device/sales lifecycle must be verified/designed. Do not assume an existing product/POS capability from the module name |

Fiscal-site-to-HR-branch cardinality, missing master contracts and device ownership
remain DEC-034. Preserve registered issuer/site facts historically even when an
organizational branch moves or a legal address changes. An organizational branch,
legal establishment, sales journal and fiscal issuing unit need not be identical.

## 13. Proposed user journeys and client boundaries

Before implementation, assign canonical screen patterns and review shared Angular
components. These are discovery journeys, not approved Screen Contracts.

| Journey | Angular proposal | Mobile proposal needing an independent scope decision |
| --- | --- | --- |
| Company fiscal setup | Guided sections, existing-owner lookups, inline validation, draft and readiness summary | Consider read/status and limited setup; do not assume full administration |
| Tax definitions/mappings | Typed editor, effective dates, usage/impact preview and role/account mapping | Decide Required versus Deferred per maintenance journey |
| Branch/site/device | Clear organizational link, external ID, environment, onboarding and certificate health | Status/alerts may be useful; secrets and private keys never enter ordinary client state |
| Invoice/B2C sale | One commercial builder with conditional country/document sections and authoritative tax preview | Decide creation/edit/view separately, including device/signing feasibility |
| Submission operations | Searchable queues, per-document results, field-linked errors, retry/reconcile history | Consider read/status and authorized recovery actions |
| Corrections/returns | Dedicated linked-document journey with source balances/lines and fiscal/ledger outcomes | Do not treat view-only badges as implemented correction capability |

Use existing shared forms/grids/feedback. Show normal business terms, readiness
reasons and exact corrective actions. Avoid exposing schema versions or internal
adapter names in routine data entry; retain them in appropriate diagnostics.
Server calculation/validation stays authoritative. Device/signing policy must not
force every browser user to install a connector without a demonstrated need.

## 14. Scope and sequence to discuss

This is a dependency order, not an authorized execution plan:

1. Agree the coverage matrix and boundaries: issuer profiles, sectors, document
   families, tax regimes, Saudi design/rollout, reports and client journeys.
2. Freeze country-dependent contracts, ownership, snapshot/version semantics and
   issuance/posting policy; then revisit COA simplification DEC-029/030/031.
3. Plan the common GL/setup and commercial/tax capabilities in bounded vertical
   slices with accepted integration contracts.
4. Verify Egyptian eInvoice and eReceipt end to end, with linked corrections,
   recovery and reconciled posting before the requested first operational launch.
5. Use Saudi standard/simplified examples to validate the common design; actual
   ZATCA runtime/onboarding and launch gates require explicit scope approval.

Tax reporting, purchasing/input tax, AP/AR collections, advances, export,
special-sector receipts, statutory statements and treasury are assessed
individually. The requester has not approved all of them merely by requesting
multiple activities. Dependencies essential to selected issuance paths cannot
be deferred past the relevant release.

## 15. Acceptance scenarios for the later contracts

These are proposed evidence requirements; no tests were implemented/run here.

| Risk | Meaningful acceptance scenario |
| --- | --- |
| Wrong jurisdiction or cross-company leak | EG and SA companies share the kernel but cannot use each other's tax registrations, credentials, mappings or device chain |
| Destructive template initialization | Apply/reapply and upgrade a starter with company edits and concurrent setup; no duplicate or overwritten used accounts |
| Incorrect tax totals | Verify reviewed inclusive/exclusive, fixed/percentage/dependent, discounts, zero/exempt, withholding and FX examples against authoritative expected amounts |
| Retroactive change | Change a rate, address, account code or activity after issue; old payload/signature, reporting facts and journal remain reproducible |
| False external success | HTTP 202, mixed submission result and late validation error show distinct states and correct follow-up |
| Duplicate business/financial effect | Repeated click, timed-out response, retry and duplicate callback produce the required single business document/posting and a traceable channel history |
| Broken device state | Concurrent Egyptian receipts, invalid middle receipt and recovery follow the verified chain/correction rules |
| Saudi legal delivery error | Standard invoice cannot be shared as cleared prematurely; simplified invoice follows its stamping/reporting deadline and recovery policy |
| Incomplete correction | Credit/debit/return references, quantities, tax adjustments and ledger effects reconcile with the original; accepted source is retained |
| Credential/environment mix | Test and production identities cannot be mixed; expired/revoked certificate or deactivated device yields an actionable failure without secret leakage |
| Filing evidence mismatch | Return totals drill through to tax facts/source and ledger; excluded/pending/adjusted documents have documented treatment |
| Premature release claim | Demonstrate required Angular and explicitly selected Mobile journeys with real test-environment authority evidence; production-only checks remain separately owned |

## 16. Remaining decisions and completion boundary

| Canonical note | Remaining decision / research | Trigger |
| --- | --- | --- |
| DEC-007 | Current applicable EG/SA rules, rates, identifiers, document/schema versions, accounting standards and retention by record class; legal sources and test/production confirmation | Before freezing affected rules and before the relevant country launch |
| DEC-029/030/031 | COA hierarchy, codes and starter onboarding informed by this localization review | Subsequent COA interview |
| DEC-032 | Exact activity/document/tax/report/client coverage; sales versus purchasing/collections; Saudi launch timing | Revised specification approval |
| DEC-033 | Legal issuance, posting, delivery, correction and failure semantics per document family; offline recommendation remains unapproved | Before transaction contracts or offline scope |
| DEC-034 | Initial one-country-per-company boundary resolved by D-034; legal-site/organizational-branch mapping, owner contracts, devices and signing remain open. Reopen cross-country registrations only for an actual target-company case | Before affected setup/integration contracts or the new case's rollout |

Retention is deliberately unresolved: EG-20 provides a baseline with extraction
limitations; current amendments, other applicable records laws, special asset
classes and legal holds must be reconciled. Saudi retention/location/access rules
also require SA-05 and applicable current sources. Do not set one global deletion
age or treat tax-platform availability as our archive. Retain exact payloads,
authority artifacts, tax/posting links and relevant evidence under an approved
per-class policy. DEC-007 owns this release dependency.

Research has established the architectural constraints and explicit scope changes.
It has not completed every country's statutory requirement matrix or selected the
remaining business policies. Next discussion should select the fiscal setup/COA
onboarding approach, then resolve the document and tax coverage in small batches.
