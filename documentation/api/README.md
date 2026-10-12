# API documentation

Backend guides for the .NET modular monolith. Start feature work with the
[API feature development workflow](API_FEATURE_DEVELOPMENT_WORKFLOW.md); the
[architecture constitution](ERP_ARCHITECTURE_CONSTITUTION.md) is the authority
when a guide and the code disagree.

## Architecture and rules

| Document | Use it for |
| --- | --- |
| [ERP_ARCHITECTURE_CONSTITUTION.md](ERP_ARCHITECTURE_CONSTITUTION.md) | Non-negotiable architecture rules |
| [MODULAR_MONOLITH_ARCHITECTURE.md](MODULAR_MONOLITH_ARCHITECTURE.md) | Module shape, ownership, unit of work, generator |
| [adr/README.md](adr/README.md) | Architecture decision records |
| [Clean_Architecture_CQRS_Guide.md](Clean_Architecture_CQRS_Guide.md) | Controller → ISender → handler → port layering |
| [Domain_Development_Guide.md](Domain_Development_Guide.md) | How much behavior belongs in a Domain model |
| [Realtime_Updates_Guide.md](Realtime_Updates_Guide.md) | SignalR events after commit |
| [FOUNDATION_CLOSURE_MATRIX.md](FOUNDATION_CLOSURE_MATRIX.md) | Evidence that the API foundation is closed |

## Configuration and operations

| Document | Use it for |
| --- | --- |
| [Authentication_Configuration.md](Authentication_Configuration.md) | JWT, external sign-in, and secret handling |
| [Operational_Foundation.md](Operational_Foundation.md) | Logging, correlation, health, background jobs |
| [PRODUCTION_DEPLOYMENT_RUNBOOK.md](PRODUCTION_DEPLOYMENT_RUNBOOK.md) | Publishing and verifying a release |
| [MIGRATIONS_COMMANDS_AR.md](MIGRATIONS_COMMANDS_AR.md) | أوامر الـ migrations بالعربي مع أمثلة |

## Feature profiles

Each profile records how one applied feature is built. The owning module's
feature catalog (`documentation/modules/<slug>/features/README.md`) links the
matching review and web/mobile books.

- [AccountingLedgerSetup_API_Implementation_Profile.md](AccountingLedgerSetup_API_Implementation_Profile.md)
- [AddressTypes_API_Implementation_Profile.md](AddressTypes_API_Implementation_Profile.md)
- [Addresses_API_Implementation_Profile.md](Addresses_API_Implementation_Profile.md)
- [AttendanceDevices_API_Implementation_Profile.md](AttendanceDevices_API_Implementation_Profile.md)
- [CompanyGeographicScope_API_Implementation_Profile.md](CompanyGeographicScope_API_Implementation_Profile.md)
- [Countries_API_Implementation_Profile.md](Countries_API_Implementation_Profile.md)
- [Districts_API_Implementation_Profile.md](Districts_API_Implementation_Profile.md)
- [FiscalYears_API_Implementation_Profile.md](FiscalYears_API_Implementation_Profile.md)
- [LedgerSetupCoaHierarchy_API_Implementation_Profile.md](LedgerSetupCoaHierarchy_API_Implementation_Profile.md)
- [LedgerSetupCurrency_API_Implementation_Profile.md](LedgerSetupCurrency_API_Implementation_Profile.md)
- [ManagedCrystalContractRegistry_API_Implementation_Profile.md](ManagedCrystalContractRegistry_API_Implementation_Profile.md)
- [ManagedCrystalManagerExperience_API_Implementation_Profile.md](ManagedCrystalManagerExperience_API_Implementation_Profile.md)
- [ManagedCrystalTemplateValidation_API_Implementation_Profile.md](ManagedCrystalTemplateValidation_API_Implementation_Profile.md)
- [OrganizationalStructure_API_Implementation_Profile.md](OrganizationalStructure_API_Implementation_Profile.md)
- [States_API_Implementation_Profile.md](States_API_Implementation_Profile.md)
- [TenantModuleEntitlements_API_Implementation_Profile.md](TenantModuleEntitlements_API_Implementation_Profile.md)
- [WorkforcePlanning_API_Implementation_Profile.md](WorkforcePlanning_API_Implementation_Profile.md)
- [Recruitment_Domain_Design.md](Recruitment_Domain_Design.md) (design; no final API profile yet)
- HTTP contracts: [Countries](Controllers/Geographic/CountriesController.md), [States](Controllers/Geographic/StatesController.md), [Districts](Controllers/Geographic/DistrictsController.md)
