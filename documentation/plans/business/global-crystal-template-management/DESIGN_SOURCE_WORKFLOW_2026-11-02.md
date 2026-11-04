# Module / data-source / empty-draft workflow — GCT-1 revision

## Authorization and discovery

The requester approved implementation of module → approved View/data source →
empty template → Crystal Designer → inspected immutable RPT version → publication.
Design remains in the desktop Crystal Designer. This is an extension of the active
global-crystal-template-manager feature, not authorization to implement the future
View Builder or access arbitrary SQL/database objects.

## Evidence and existing-system relationship

VERIFIED CURRENT: Reporting owns GlobalCrystalReport; EntityKey already persists
the approved source identity. GlobalCrystalReport.Create permits zero versions;
NextVersionAsync starts at 1. Registry supplies canonical columns/parameters/XSD;
native inspection enforces the same schema/fingerprint. Existing global sources
are countries, states and districts, supplied through ReferenceData Contracts.
An existing raw SQL ViewStore exposes database definitions; it is not an approved reporting source catalog and has no managed schema/scope binding. Reusing it as report authorization would bypass reviewed providers. No browser report designer exists. The requester reaffirmed approved ERP sources instead of arbitrary database discovery.

REQUESTED TARGET: Select module and approved source; inspect its fields and
parameters; save a named empty draft before choosing an RPT; download a designer
preparation ZIP containing XSD, source contract and instructions. Create a Blank
Report in Crystal Designer, bind the XSD, save/upload RPT as version 1. The empty
application template is a metadata draft, not a fabricated executable RPT.

## Frozen scope and readiness (G0–G3)

- Owner: Reporting; extend the existing aggregate, CQRS, store, locks and manager.
- Sources are reviewed executable providers, initially the three global geographic
  projections in reference-data. No invented HR/Accounting sources or direct foreign
  table queries. Future View Builder integration is Deferred to its own authorized
  feature; this slice exposes the source contract needed by that integration.
- Source/module mapping comes from a server catalog. EntityKey remains the durable
  source binding; changing a source after creation is Excluded. Choosing another
  source creates another template. No persistence/schema shape changes or migration.
- Empty draft: exact GlobalCrystalReports:Create + super_admin + Global View +
  persisted source entity Edit; key unique even when archived; source/module must
  agree, contract fingerprint must be current; name/description bounded. Atomic
  identity lock and unique index remain authoritative. Zero files/versions and no
  automatic publication, grants or native-valid claim.
- Design sources: existing View authority, filtered per source. Designer ZIP:
  existing Download authority plus source Edit. No credentials, SQL, real rows or
  arbitrary filesystem paths in the package. Canonical XSD/metadata only.
- Upload/inspect/revalidate/publish/archive/ACL rules stay unchanged. First upload
  to an empty draft is immutable version 1 and must pass native schema/source policy.
- Existing file-first creation remains available. Existing consumer envelopes remain
  additive-compatible. Empty drafts follow existing shadowing policy and are absent
  from published company lists; warn the administrator about duplicate identities.
- Angular Required; Next/Mobile administration Excluded by existing platform choice;
  consumer behavior unaffected. Audit both consumers for zero-version handling.
- UI: existing reporting.global-templates.manager, P-001 + C-01 shared DialogPanel,
  FormContainer, OptionSelect, TextField, SurfaceCard, FeedbackState and MyDataGrid;
  no shared-control changes. Dedicated typed feature state/service own form/network.
  EN/AR, RTL, narrow view, loading/retry, empty sources, field validation/focus,
  unsaved close, identity cancellation and server failures are Required.
- Create: module/source/name/key/description; edit: upload design against fixed
  source; view: source fields/parameters and instructions; listing: draft + source;
  fixtures: realistic source catalog and zero-version draft. No JSON text entry.
- Source schema version/fingerprint shown/exported; schema changes require normal
  inspection/revalidation before publish. No incompatible automatic rebind.

G0–G3 pass for this exact bounded revision. User approval above covers the plan
revision and execution. G4 native-valid RPT/PDF and hosted deployment are existing
release-only gates under FOLLOW-024 / PROD-028; they cannot change this frozen
metadata workflow. GCT-1 remains execution-ready, overall release gated.

## Delivery / adversarial review / acceptance

API → Angular → consumer compatibility audit → browser/technical gates → canonical
books/manifests/regeneration. Verify denied actor/action/source before effects,
unknown source and mismatched module, stale fingerprint, duplicate/race, bounded
names/keys, zero versions/no file side effects, first upload version 1, no early
publication, ZIP schema/metadata agreement and absence of secrets. Validate Angular
shared form errors, source switching, cancellation, EN/AR/RTL/mobile. Run full ERP
and Angular gates. Inspect configured SQL schema/history; no model drift expected.
No package/dependency additions or automatic remote deployment. Rollback is additive
route/UI removal; existing drafts remain valid unpublished records in existing tables.

Official designer references: SAP Blank Report / Database Expert and ADO.NET XML
schema selection. No PrimeNG MCP is available in this session; existing reviewed
shared adapters are reused without claiming MCP validation.

## Phase 00 implementation preflight

Current source above reconciled on 2026-11-02. Required-file manifest and existing
four applied books remain the evidence owners; generated packets are derivative.
One active feature remains global-crystal-template-manager. No sibling or View
Builder implementation starts. Initial documentation check was launched before
runtime edits. Runtime evidence and final verification are appended after delivery.


## Superseding manual SQL View decision — 2026-11-02

Requester clarified: manually enter a real SQL Server View name, initially global
shared data, until the future Builder exists. Keep the approved ERP source contract
selection; add a physical View binding, not arbitrary SQL. Source module owns its
database access through public Contracts. ReferenceData supports the current three
global contracts; its adapter checks a two-part identifier, existing schema-bound
View, direct dependencies restricted to ref.Countries/States/Districts (and per-source
allowed subsets), exact canonical fields/types/nullability, bounded rows and filters.
No tenant/company tables, functions, synonyms, cross-database, unknown/nested sources
are admitted. View definition/schema fingerprint persists with the draft; changed
View definitions fail closed at rendering rather than silently changing published data.

GlobalCrystalReport gains nullable ViewName/ViewFingerprint; existing file-first
templates retain their established provider path. Add/apply Reporting migration and
inspect configured live schema before claiming completion. Manual View field is
Required in the new empty-draft path. Download package includes the bound name in
report detail instructions; XSD remains the approved logical shape. SQL is executed
by ReferenceData using its configured connection; Crystal receives pushed data.

G0–G3 frozen for the revised scope; one active GCT-1 feature. Additional acceptance:
SQL-backed valid/invalid View inspection, forbidden dependencies, SQL identifier
injection, definition change, row bounds/filter parameterization, actual persisted
binding and first upload path. Arbitrary shape/global modules outside the reviewed
providers and company-scoped View execution remain Excluded from this slice.
