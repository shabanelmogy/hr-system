import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import type { KanbanLabel, CreateKanbanLabelRequest, UpdateKanbanLabelRequest } from "../types/Label";

export default class LabelService {
  static async getAll(): Promise<KanbanLabel[]> {
    const response = await apiService.get(apiRoutes.kanbanLabels.getAll);
    const list = extractValues<KanbanLabel>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async getById(id: string | number): Promise<KanbanLabel> {
    const response = await apiService.get(apiRoutes.kanbanLabels.getById(id));
    return extractValue<KanbanLabel>(response);
  }
  static async create(data: CreateKanbanLabelRequest): Promise<KanbanLabel> {
    const response = await apiService.post(apiRoutes.kanbanLabels.add, data);
    return extractValue<KanbanLabel>(response);
  }
  static async update(data: UpdateKanbanLabelRequest): Promise<KanbanLabel> {
    const response = await apiService.put(apiRoutes.kanbanLabels.update, data);
    return extractValue<KanbanLabel>(response);
  }
  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.kanbanLabels.delete(id));
    return id;
  }
}
