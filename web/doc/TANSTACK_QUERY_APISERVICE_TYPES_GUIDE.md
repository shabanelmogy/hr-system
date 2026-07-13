# Feature Implementation Guide: Types + ApiService + TanStack Query

This guide standardizes how to implement a new feature using the patterns established in src/features/basicdata/countries. Follow these steps to create reusable, consistent feature modules with:
- Strong TypeScript types
- ApiService with axios interceptors
- TanStack Query for data fetching and mutations

Notes
- Folder name casing varies in the repo (basicdata vs basicData). Use your existing folder structure consistently.
- This guide uses a generic Entity example. Replace Entity/Entities/entity with your feature noun (e.g., Company/Companies/company).

Recommended Folder Structure
- src/features/basicdata/entities/
  - components/
  - hooks/
    - useEntityQueries.ts
    - useEntityGridLogic.ts (optional, if you use MUI DataGrid or similar)
  - services/
    - entityService.ts
  - types/
    - Entity.ts
  - utils/

Core Building Blocks
1) API Routes (src/routes/apiRoutes.tsx)
2) Types (src/features/basicdata/entities/types/Entity.ts)
3) Service (src/features/basicdata/entities/services/entityService.ts)
4) TanStack Query Hooks (src/features/basicdata/entities/hooks/useEntityQueries.ts)
5) (Optional) Grid Logic Hook (src/features/basicdata/entities/hooks/useEntityGridLogic.ts)
6) Barrel Exports (src/features/basicdata/entities/index.ts)

Prerequisites
- ApiService is centralized in src/shared/services/apiService.js
- Response normalization helpers are in src/shared/utils/ApiHelper.ts
- Toast and error helpers (used in grid logic) are under src/shared/components and src/shared/utils

Step 1: Add API Routes
Define CRUD endpoints for your entity in src/routes/apiRoutes.tsx using the CrudRoutes shape, similar to countries.

TypeScript
- interface CrudRoutes { getAll: string; getById: (id) => string; add: string; update: string; delete: (id) => string; }
- const version = "/api/v1";

Example (add under ApiRoutes):
- entities: {
  - getAll: `${version}/entities/getAll`,
  - getById: (id) => `${version}/entities/${id}`,
  - add: `${version}/entities/add`,
  - update: `${version}/entities/update`,
  - delete: (id) => `${version}/entities/delete/${id}`,
- },

Validation
- Ensure the route names and shapes match your backend (case, segments, ids).

Step 2: Define Types
Create types that match your API model and UI needs. Use the Countries types as a template (src/features/basicdata/countries/types/Country.ts).

Define at least:
- Entity: core data model used in UI
- CreateEntityRequest: data required to create
- UpdateEntityRequest: extends Create with id
- EntityResponse: raw response shape (optional if identical to Entity)
- Filters and QueryParams: for search/sort/pagination where applicable

Example skeleton
- export interface Entity {
  - id: string | number;
  - nameEn: string;
  - nameAr: string;
  - isDeleted: boolean;
  - createdOn: string;
  - updatedOn: string;
  - [key: string]: any;
- }
- export interface CreateEntityRequest {
  - nameEn: string;
  - nameAr: string;
  - // ...other optional fields
- }
- export interface UpdateEntityRequest extends CreateEntityRequest { id: string | number; }
- export interface EntityResponse { /* align with backend exactly if it differs */ }
- export interface EntityFilters { search?: string; isActive?: boolean; /* ... */ }
- export interface EntityQueryParams { page?: number; pageSize?: number; sortBy?: string; sortDirection?: 'asc' | 'desc'; filters?: EntityFilters; }

Notes
- ID types are unioned (string | number) across the codebase; keep this for compatibility.
- Use null vs undefined consistently: Optional fields are usually undefined; API may return null.

Step 3: Implement Service
Create a service class encapsulating API calls. Follow the CountryService pattern (src/features/basicdata/countries/services/countryService.ts).

Imports
- import { apiRoutes } from "@/routes";
- import { apiService } from "@/shared/services";
- import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
- import { Entity, CreateEntityRequest, UpdateEntityRequest } from "../types/Entity";

CRUD methods (typical)
- static async getAll(): Promise<Entity[]> { const response = await apiService.get(apiRoutes.entities.getAll); const list = extractValues<Entity>(response); return list.filter(x => !x.isDeleted); }
- static async getById(id: string | number): Promise<Entity> { const response = await apiService.get(apiRoutes.entities.getById(id)); return extractValue<Entity>(response); }
- static async create(data: CreateEntityRequest): Promise<Entity> { const response = await apiService.post(apiRoutes.entities.add, data); return extractValue<Entity>(response); }
- static async update(data: UpdateEntityRequest): Promise<Entity> { const response = await apiService.put(apiRoutes.entities.update, data); return extractValue<Entity>(response); }
- static async delete(id: string | number): Promise<string | number> { await apiService.delete(apiRoutes.entities.delete(id)); return id; }

Client-side searching (optional)
- static searchEntities(items: Entity[], term: string): Entity[] { if (!term.trim()) return items; const t = term.toLowerCase().trim(); return items.filter((x) => !x.isDeleted && (x.nameEn?.toLowerCase().includes(t) || x.nameAr?.includes(t))); }

Conventions from ApiService
- apiService.get/post/put/delete return response.data already; extractValue/Values normalizes multiple backend shapes.
- Axios interceptors add Authorization header from sessionStorage tokens and Culture header from i18n.language.
- 401s are refreshed automatically; on failure, user is redirected to /login.

Step 4: TanStack Query Hooks
Create hooks colocated with your feature: src/features/basicdata/entities/hooks/useEntityQueries.ts

Imports
- import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
- import EntityService from "../services/entityService";
- import { Entity } from "../types/Entity";

Query keys
- export const entityKeys = {
  - all: ["entities"] as const,
  - list: () => [...entityKeys.all, "list"] as const,
  - detail: (id: string | number) => [...entityKeys.all, "detail", id] as const,
- };

Queries
- export const useEntities = (options?: UseQueryOptions<Entity[], Error>) => useQuery({ queryKey: entityKeys.list(), queryFn: EntityService.getAll, staleTime: 5 * 60 * 1000, ...options });
- export const useEntity = (id: string | number | null | undefined, options?: UseQueryOptions<Entity, Error>) => useQuery({ queryKey: entityKeys.detail(id!), queryFn: () => EntityService.getById(id!), enabled: !!id, staleTime: 5 * 60 * 1000, ...options });

Client-side search memo (optional)
- export const useEntitySearch = (searchTerm: string, existing: Entity[] = []) => useMemo(() => { if (!searchTerm.trim()) return existing; return EntityService.searchEntities(existing, searchTerm); }, [searchTerm, existing]);

Mutation factory
- function useEntityMutation<TData = unknown, TVariables = unknown>(mutationFn: (variables: TVariables) => Promise<TData>, options?: UseMutationOptions<TData, Error, TVariables>) { const queryClient = useQueryClient(); return useMutation({ mutationFn, ...options, onSuccess: (data, variables, context) => { queryClient.invalidateQueries({ queryKey: entityKeys.all }); options?.onSuccess?.(data, variables, context); }, }); }

Mutations
- export const useCreateEntity = (options?: UseMutationOptions<Entity, Error, Partial<Entity>>) => useEntityMutation(EntityService.create as any, options);
- export const useUpdateEntity = (options?: UseMutationOptions<Entity, Error, Partial<Entity>>) => useEntityMutation(EntityService.update as any, options);
- export const useDeleteEntity = (options?: UseMutationOptions<string | number, Error, string | number>) => useEntityMutation<string | number, string | number>(EntityService.delete as any, options);

Invalidation helper
- export const useInvalidateEntities = () => { const queryClient = useQueryClient(); return () => queryClient.invalidateQueries({ queryKey: entityKeys.all }); };

Recommendations
- Choose appropriate staleTime and cacheTime. Countries use staleTime = 5 minutes.
- Always key queries with a stable array and include identifiers (id) for detail queries.
- Invalidate the entityKeys.all on successful mutation to refresh list and detail caches.

Step 5: Optional Grid Logic Hook
If you use MUI DataGrid or similar, refer to countries/hooks/useCountryGridLogic.ts for a robust pattern:
- Compose useEntities and mutation hooks
- Handle toasts for onSuccess/onError using showToast and extractErrorMessage
- Track last added/edited/deleted rows to set selection and scroll
- Expose dialog state and handlers (add/edit/view/delete)
- Provide a handleRefresh that calls react-query refetch

Step 6: Barrel Exports
In src/features/basicdata/entities/index.ts export your public API:
- export { default as EntitiesPage } from './entitiesPage';
- export { default as EntityService } from './services/entityService';
- export type { Entity, CreateEntityRequest, UpdateEntityRequest } from './types/Entity';
- export { useEntities, useEntity, useEntitySearch, useCreateEntity, useUpdateEntity, useDeleteEntity, useInvalidateEntities, entityKeys } from './hooks/useEntityQueries';

Checklist (Copy-Paste for a New Feature)
1) Routes
- Add entities section to apiRoutes.tsx under ApiRoutes and implementation.
- Verify endpoint shapes match backend.

2) Types
- Create src/features/basicdata/entities/types/Entity.ts
- Define Entity, CreateEntityRequest, UpdateEntityRequest (+ optional Filters, QueryParams)

3) Service
- Create src/features/basicdata/entities/services/entityService.ts
- Implement getAll/getById/create/update/delete
- Use extractValue and extractValues from ApiHelper
- Optionally implement client-side search helper

4) React Query
- Create src/features/basicdata/entities/hooks/useEntityQueries.ts
- Define entityKeys
- Implement useEntities/useEntity
- Implement useCreateEntity/useUpdateEntity/useDeleteEntity
- Implement useInvalidateEntities

5) Grid Logic (optional)
- Create useEntityGridLogic.ts mirroring countries logic if you need grid selection/scroll and dialog orchestration.

6) Barrel Exports
- Update src/features/basicdata/entities/index.ts to re-export components, service, types, and hooks

7) UI Usage (minimal)
- In a list page: const { data: entities = [], isLoading, error } = useEntities();
- In a form dialog: const create = useCreateEntity({ onSuccess: (...) => {...} });

ApiService Conventions (from src/shared/services/apiService.js)
- Axios instance with baseURL depending on env (localhost in development; localStorage baseApiUrl or production URL otherwise)
- Request interceptor
  - Adds Authorization: Bearer <token> from sessionStorage
  - Adds Culture header (from i18n.language)
  - Skips auth for endpoints passing config.skipAuthInterceptor
- Response interceptor
  - On 401, automatically tries refresh flow (POST /v1/api/Auth/RefreshToken)
  - Queues concurrent 401s, retries original requests on success
  - On failure, logs out and redirects to /login
- API methods
  - get/post/put/delete wrap axios and return response.data
  - processError returns a normalized error object with status/title/errors/message

ApiHelper Normalization (src/shared/utils/ApiHelper.ts)
- extractValue<T>(response)
  - Supports { isSuccess, value }, { data }, or direct response shapes
- extractValues<T>(response)
  - Handles arrays and nested { value } shapes and returns T[] or []

Error Handling & Toasts
- In list/grid hooks, handle error via useEffect to show toasts (see countries/hooks/useCountryGridLogic.ts)
- Use extractErrorMessage helper (src/shared/utils) to convert API errors to readable text

Client-side Searching
- Implement a search helper on the service to reduce re-renders and keep logic in one place (see CountryService.searchCountries)

Performance Tips
- Memoize lists from queries when passing to heavy components
- Use enabled flags for detail queries until an id is available
- Keep queryKey stable and avoid object literals directly in keys unless serialized consistently

Example Naming Guidance
- types/Entity.ts: Entity, CreateEntityRequest, UpdateEntityRequest, EntityFilters, EntityQueryParams
- services/entityService.ts: EntityService class with static methods
- hooks/useEntityQueries.ts: useEntities, useEntity, useCreateEntity, useUpdateEntity, useDeleteEntity, useInvalidateEntities; entityKeys

By following these steps, new features will integrate consistently with ApiService and TanStack Query, with strong typing and predictable behavior. Align implementation with the countries feature for concrete examples and adapt field names to your domain.