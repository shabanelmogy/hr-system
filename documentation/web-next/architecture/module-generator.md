# Frontend Module Generator

The generator creates the stable frontend boundary for a module without editing
Shell navigation, launchers, or route-authorization conditionals.

```powershell
npm.cmd run generate:module -- --slug inventory --code inventory --name "Inventory"
```

When the folder name and backend catalog code intentionally differ, specify both.
Accounting is the current example: folder `accounting`, catalog code `acc`.

```powershell
npm.cmd run generate:module -- --slug accounting --code acc --name "Accounting" --dry-run
```

The generated boundary contains `moduleDefinition.tsx`, a deliberate `index.ts`
public API, Arabic/English module translation resources, and module-owned
documentation. The generator rejects unsafe/non-kebab-case destinations and its
self-test performs a real write into an isolated temporary directory.

After generation, register the module at the application composition root only
after the backend catalog code exists. A frontend definition never enables a
module or grants a permission by itself; `/modules/accessible` remains the
authoritative entitlement result.

## Reference business feature

HR Fiscal Years is the first live feature conforming to the stabilized business
feature template: module ownership, public API, shared query-key factory,
invalidating mutations, server permissions, loading/error handling, and existing
Arabic/English behavior all pass the architecture/build/test gate without a
Shell-specific exception.

Chart of Accounts was evaluated as the intended first Accounting experiment, but
the current Accounting backend exposes no Chart of Accounts CRUD/permission
contract or business submodule. Creating a frontend route against an invented API
would violate the server-authoritative rule. Accounting therefore remains a
registered empty business boundary until that contract is introduced and
coordinated with mobile.
