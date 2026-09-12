import { apiRoutes } from "@/config";
import { apiService } from "@/shared/services";
import type {
  LocalizationEntry,
  UpdateLocalizationRequest,
} from "../types/localization";

export async function getLocalization(
  culture: string,
): Promise<LocalizationEntry[]> {
  const response = await apiService.get(
    `${apiRoutes.advancedTools.getLocalizationApi}/${culture}`,
  );
  const data = unwrapResponse(response);

  if (!isRecord(data)) return [];

  return Object.entries(data).map(([key, value]) => ({
    id: key,
    key,
    value: typeof value === "string" ? value : String(value ?? ""),
  }));
}

export async function updateLocalization(
  request: UpdateLocalizationRequest,
): Promise<unknown> {
  return apiService.put(apiRoutes.advancedTools.updateLocalizationApi, {
    Language: request.language,
    Key: request.key,
    Value: request.value,
  });
}

function unwrapResponse(response: unknown): unknown {
  if (!isRecord(response)) return response;
  return response.value ?? response.data ?? response;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
