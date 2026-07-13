import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import type { KanbanColumn, CreateKanbanColumnRequest, UpdateKanbanColumnRequest } from "../types/Column";

export default class ColumnService {
  static async getAll(): Promise<KanbanColumn[]> {
    const response = await apiService.get(apiRoutes.kanbanColumns.getAll);
    const list = extractValues<KanbanColumn>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async getById(id: string | number): Promise<KanbanColumn> {
    const response = await apiService.get(apiRoutes.kanbanColumns.getById(id));
    return extractValue<KanbanColumn>(response);
  }
  static async create(data: CreateKanbanColumnRequest): Promise<KanbanColumn> {
    const response = await apiService.post(apiRoutes.kanbanColumns.add, data);
    return extractValue<KanbanColumn>(response);
  }
  static async update(data: UpdateKanbanColumnRequest): Promise<KanbanColumn> {
    const response = await apiService.put(apiRoutes.kanbanColumns.update, data);
    return extractValue<KanbanColumn>(response);
  }
  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.kanbanColumns.delete(id));
    return id;
  }
}
