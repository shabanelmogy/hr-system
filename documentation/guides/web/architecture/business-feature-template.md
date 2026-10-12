# Business Feature Template

Status: applied first to HR Fiscal Years.

Business features live inside their owning module, for example:

```text
src/modules/accounting/fiscal-years/
  pages/
  components/
  hooks/
  services/
  types/
  validation/
  index.ts
```

## Standard responsibilities

- `services`: HTTP transport only. Use the shared API client; do not embed React state.
- `hooks`: TanStack Query composition. Start entity keys with `createEntityQueryKeys()` and reconcile successful writes with `useInvalidatingMutation()`.
- `validation`: feature-owned Zod rules. Reuse the shared form primitives for optional control values.
- `components`: feature UI and business interaction. Reuse shared grids, cards, forms, dialogs, filters and feedback states rather than cloning them.
- `pages`: route-level orchestration; keep them independent from App Router files and Shell internals.
- `index.ts`: the deliberate public API for consumers outside the feature/module.

Business lifecycle rules, permissions, domain fields and server contracts remain in
the feature. The shared helpers standardize transport/cache/form behavior only.

## Query and write convention

```ts
const keys = createEntityQueryKeys("entityName");
useQuery({ queryKey: keys.page(query), queryFn: () => service.getPage(query) });
useInvalidatingMutation(service.create, [keys.all]);
```

Writes remain online-authoritative unless a feature has an explicitly replay-safe
offline contract. Successful writes invalidate the stable entity root and any
documented dependent roots.

## Translation and route boundaries

Each module may declare a lazy translation namespace in its
`moduleDefinition.tsx`. The Shell loads only the active module namespace.
Feature-specific `loading.tsx` and `error.tsx` boundaries belong at the nearest
meaningful App Router group and use the shared route feedback components.

## Definition of done

1. Feature ownership and public API are explicit.
2. Permissions and validation match the server contract.
3. Query keys and invalidation follow the shared convention.
4. Loading/error/empty states use shared primitives.
5. Arabic/English and RTL-safe shared controls are preserved.
6. Focused tests, strict type-check, architecture check, lint and production build pass.
