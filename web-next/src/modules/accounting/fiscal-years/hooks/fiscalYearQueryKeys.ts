import { createEntityQueryKeys } from "@/shared/query/createEntityQueryKeys";

export const fiscalYearKeys = createEntityQueryKeys("fiscalYears");

export const fiscalYearContextKey = [...fiscalYearKeys.all, "context"] as const;
