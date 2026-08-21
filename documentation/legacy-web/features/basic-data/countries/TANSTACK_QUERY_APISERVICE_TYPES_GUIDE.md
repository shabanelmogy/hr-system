# Feature-local Implementation Guide: Types + ApiService + TanStack Query (Template)

Purpose

- This per-feature guide documents the exact pattern used here (based on Countries) to implement Types, ApiService-based services, and TanStack Query hooks.
- Copy this file to any new feature’s GUIDE folder and replace placeholders (Entity/Entities/entity) with your actual feature name.

Recommended structure inside this feature

- components/
- hooks/
  - useEntityQueries.ts
  - useEntityGridLogic.ts (optional)
- services/
  - entityService.ts
- types/
  - Entity.ts
- utils/

Prerequisites

- Central ApiService: src/shared/services/apiService.js
- Response helpers: src/shared/utils/ApiHelper.ts (extractValue, extractValues)
- Routes registry: src/routes/apiRoutes.tsx

Step 1: Add API routes (src/routes/apiRoutes.tsx)

- Use the CrudRoutes shape like countries.
- Example (replace entities with your feature key):
  - entities: {
    - getAll: `${version}/entities/getAll`,
    - getById: (id) => `${version}/entities/${id}`,
    - add: `${version}/entities/add`,
    - update: `${version}/entities/update`,
    - delete: (id) => `${version}/entities/delete/${id}`,
  - },
- Keep naming, path segments, and id usage aligned with backend.

Reference: Countries routes

- countries in src/routes/apiRoutes.tsx are already implemented and can be used as a reference.

Step 2: Define Types (types/Entity.ts)

- Follow Country types at types/Country.ts.
- Minimum set:
  - Entity (core UI model, includes isDeleted, createdOn, updatedOn, id as string | number)
  - CreateEntityRequest
  - UpdateEntityRequest extends CreateEntityRequest with id
  - Optional: EntityResponse (if API differs), Filters, QueryParams
- Notes
  - Keep id: string | number for compatibility
  - API may return null; optional UI fields should generally be undefined

Reference: Countries

- types/Country.ts inside this feature

Step 3: Implement the Service (services/entityService.ts)

- Pattern (mirror services/countryService.ts):
  - import { apiRoutes } from "@/routes";
  - import { apiService } from "@/shared/services";
  - import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
  - import { Entity, CreateEntityRequest, UpdateEntityRequest } from "../types/Entity";
- Methods (typical CRUD):
  - getAll(): Promise<Entity[]>
    - const response = await apiService.get(apiRoutes.entities.getAll)
    - const items = extractValues<Entity>(response)
    - return items.filter(x => !x.isDeleted)
  - getById(id): Promise<Entity>
    - return extractValue<Entity>(await apiService.get(apiRoutes.entities.getById(id)))
  - create(data): Promise<Entity>
    - return extractValue<Entity>(await apiService.post(apiRoutes.entities.add, data))
  - update(data): Promise<Entity>
    - return extractValue<Entity>(await apiService.put(apiRoutes.entities.update, data))
  - delete(id): Promise<string | number>
    - await apiService.delete(apiRoutes.entities.delete(id)); return id
- Optional client-side search helper centralizes filtering logic.

Reference: Countries

- services/countryService.ts

Step 4: TanStack Query hooks (hooks/useEntityQueries.ts)

- Pattern (mirror hooks/useCountryQueries.ts):
  - Keys
    - export const entityKeys = {
      - all: ["entities"] as const,
      - list: () => [...entityKeys.all, "list"] as const,
      - detail: (id: string | number) => [...entityKeys.all, "detail", id] as const,
    - };
  - Queries
    - useEntities(options?) => useQuery({ queryKey: entityKeys.list(), queryFn: EntityService.getAll, staleTime: 5 _ 60 _ 1000, ...options })
    - useEntity(id, options?) => useQuery({ queryKey: entityKeys.detail(id!), queryFn: () => EntityService.getById(id!), enabled: !!id, staleTime: 5 _ 60 _ 1000, ...options })
  - Mutation factory with invalidation on success
    - function useEntityMutation(mutationFn, options?) { const qc = useQueryClient(); return useMutation({ mutationFn, ...options, onSuccess: (d, v, c) => { qc.invalidateQueries({ queryKey: entityKeys.all }); options?.onSuccess?.(d, v, c); } }); }
  - Mutations
    - useCreateEntity(options?) => useEntityMutation(EntityService.create, options)
    - useUpdateEntity(options?) => useEntityMutation(EntityService.update, options)
    - useDeleteEntity(options?) => useEntityMutation<string | number, string | number>(EntityService.delete, options)
  - Utilities
    - useEntitySearch(term, list)
    - useInvalidateEntities()

Reference: Countries

- hooks/useCountryQueries.ts

Step 5: Optional grid logic (hooks/useEntityGridLogic.ts)

- If you use MUI DataGrid, adapt countries/hooks/useCountryGridLogic.ts:
  - Compose useEntities and mutations
  - Toast on success/error using showToast and extractErrorMessage
  - Track last added/edited/deleted for selection and scroll
  - Expose dialog state (add/edit/view/delete) and handlers
  - Add handleRefresh that calls refetch()

Reference: Countries

- hooks/useCountryGridLogic.ts

Step 6: Barrel exports (index.ts)

- Export the feature’s public API:
  - Page component(s)
  - Service default export
  - Types (Entity, CreateEntityRequest, UpdateEntityRequest)
  - Hooks (useEntities/useEntity/useCreateEntity/useUpdateEntity/useDeleteEntity/useInvalidateEntities and keys)

Reference: Countries

- index.ts (adjust any mismatches)

ApiService conventions

- src/shared/services/apiService.js
  - Adds Authorization and Culture headers
  - Automatic refresh for 401; redirects to login when refresh fails
  - get/post/put/delete return response.data
  - processError normalizes error shape

ApiHelper conventions

- src/shared/utils/ApiHelper.ts
  - extractValue<T> supports { isSuccess, value }, { data }, or raw
  - extractValues<T> supports arrays and nested value arrays

Checklist (copy for each new feature)

- Routes: Add your section to src/routes/apiRoutes.tsx
- Types: Create types/Entity.ts (Entity, CreateEntityRequest, UpdateEntityRequest, optional Filters/QueryParams)
- Service: Create services/entityService.ts (getAll/getById/create/update/delete, optional search helper)
- Hooks: Create hooks/useEntityQueries.ts (keys, queries, mutations, invalidation, optional search)
- Grid logic: Create hooks/useEntityGridLogic.ts if you use a grid pattern
- Barrel: Update index.ts exports

Local examples in this feature

- services/countryService.ts
- hooks/useCountryQueries.ts
- hooks/useCountryGridLogic.ts
- types/Country.ts

Usage snippet

- const { data: entities = [], isLoading } = useEntities();
- const create = useCreateEntity({ onSuccess: (e) => showToast.success("Created") });
- create.mutate({ nameEn: "...", nameAr: "..." });

Adoption note

- Keep this guide file inside each feature’s GUIDE folder. For new features, copy this file, rename it, and replace Entity placeholders with your actual feature names.
