import { apiRoutes } from "@/config";
import { apiService } from "@/shared/services";
import type {
  LocalizationEntry,
  UpdateLocalizationRequest,
} from "../types/localization";

export async function getLocalization(
  culture: string,
): Promise<LocalizationEntry[]> {
  const data = parseLocalizationDictionary(await apiService.get<unknown>(
    `${apiRoutes.advancedTools.getLocalizationApi}/${culture}`,
  ));

  return Object.entries(data).map(([key, value]) => ({
    id: key,
    key,
    value,
  }));
}

export async function updateLocalization(
  request: UpdateLocalizationRequest,
): Promise<unknown> {
  return apiService.put(apiRoutes.advancedTools.updateLocalizationApi, {
    language: request.language,
    key: request.key,
    value: request.value,
  });
}

export function parseLocalizationDictionary(value: unknown): Record<string, string> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid localization response.");
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (!entries.every(([, entryValue]) => typeof entryValue === "string")) {
    throw new Error("Invalid localization response.");
  }

  return Object.fromEntries(entries) as Record<string, string>;
}
