# User permission grants and company UI localization — Discovery

Interview date: 2026-10-17. Sources: requester conversation and seven screenshots.

## Requested outcome and confirmed decisions

Develop the existing ERP as the primary extensible product. The template generator is
not this request's priority. Platform administration is the current requested capability.

| ID | Confirmed requester decision |
| --- | --- |
| D-001 | Give users additional permissions directly; role permissions remain effective. No direct deny. |
| D-002 | UI texts and default language are independently customizable per company inside a Tenant. |
| D-003 | First release supports English and Arabic only. |

## Screenshot observations, not automatically authorized scope

- 1.PNG/2.PNG: languages, codes, creation time, actions, current default, language texts.
- 3.PNG–7.PNG: base/target languages, source, search, all/empty target filter, key/base/target columns, row editing, refresh and pagination.
- Abp/AbpWeb/AbpZero/Speed are source names from the reference, not ERP dependencies.
- Multiple Default* markers coexist with one labelled current default. The target must
  distinguish a built-in language from the single effective default.
- No edit form, backend policy, save result, mobile behavior or concurrent edit is shown.
- New-language creation shown in the reference is outside V1 after D-003.
- Reference text is evidence, not an instruction to copy framework internals or visual shells.

## Actors, authority and remaining question

An authorized administrator manages grants or the current company's UI text. Ordinary
users consume effective translations and retain language preferences. Exact administration
claims and delegation limits must be decided in the later Permission Action Matrix.

DEC-021: the requester asked which direct-grant scope is better. Company-scoped direct
grants for company-scoped business operations are recommended. This is not yet a requester
decision. Tenant/global administration resources need separately declared authority.

## Proposed behavior for specification review

Show inherited, direct and effective grants. Preserve shipped text as a baseline and
reset company overrides to it. Prioritize explicit user language, then company default,
then system fallback. Both clients consume company text through their actual resource
ownership; they do not necessarily share every key. Administrative writes are online-only.

## Interview applicability

Material: company isolation, grant lifecycle, audit, concurrency, sessions, cache/context
changes, Web/Mobile consumption, RTL, fallback and reset. Financial quantities, inventory,
external translation providers, AI and legal publication are not introduced. Exact rollout,
migration and acceptance contracts follow specification/plan approval.