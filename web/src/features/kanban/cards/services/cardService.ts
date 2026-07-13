import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import type { KanbanCard, CreateKanbanCardRequest, UpdateKanbanCardRequest } from "../types/Card";

export default class CardService {
  static async getAll(): Promise<KanbanCard[]> {
    const response = await apiService.get(apiRoutes.kanbanCards.getAll);
    const list = extractValues<KanbanCard>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async getById(id: string | number): Promise<KanbanCard> {
    const response = await apiService.get(apiRoutes.kanbanCards.getById(id));
    return extractValue<KanbanCard>(response);
  }
  static async create(data: CreateKanbanCardRequest): Promise<KanbanCard> {
    const response = await apiService.post(apiRoutes.kanbanCards.add, data);
    return extractValue<KanbanCard>(response);
  }
  static async update(data: UpdateKanbanCardRequest): Promise<KanbanCard> {
    const response = await apiService.put(apiRoutes.kanbanCards.update, data);
    return extractValue<KanbanCard>(response);
  }
  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.kanbanCards.delete(id));
    return id;
  }
}
