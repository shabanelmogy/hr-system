import { fileURLToPath, URL } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    clearMocks: true,
    maxWorkers: 4,
    exclude: [...configDefaults.exclude, "e2e/**"],
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text-summary", "json-summary", "lcov"],
      thresholds: {
        statements: 79,
        branches: 74,
        functions: 80,
        lines: 82,
      },
      include: [
        "src/lib/auth/{SessionContext,authorization,backend-session,company-switch-verification,cookies,permissions,route-access,session-request-state,session,token-expiration}.{ts,tsx}",
        "src/lib/api/{proxy-security,proxy-transport}.ts",
        "src/app/api/**/route.ts",
        "src/app/hangfire/[[...path]]/route.ts",
        "src/lib/signalr/{realtimeToken,signalRDiagnostics,signalRHubUrl}.ts",
        "src/platform/auth/login/loginResult.ts",
        "src/platform/auth/utils/apiResponse.ts",
        "src/platform/auth/profile/services/userProfileResponse.ts",
        "src/platform/tenants/tenantApiSchemas.ts",
        "src/platform/tenant-admins/tenantAdminApiSchemas.ts",
        "src/shared/config/queryClient.ts",
        "src/shared/query/{createEntityQueryKeys,useInvalidatingMutation}.ts",
        "src/shared/components/forms/dialog/formErrorSummary.ts",
        "src/shared/components/forms/text-fields/formFieldError.ts",
        "src/shared/validation/zodFormPrimitives.ts",
        "src/shared/components/data-grid/navigation/recordNavigation.ts",
        "src/shared/components/data-grid/table/pagination.ts",
        "src/platform/modules/{moduleApi,registry,routeRequirements}.ts",
        "src/app/runtime-preferences.ts",
        "src/shared/components/feedback/routes/safeReturnPath.ts",
      ],
    },
  },
});
