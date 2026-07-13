import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import type { KanbanBoard, CreateKanbanBoardRequest, UpdateKanbanBoardRequest } from "../types/Board";

export default class BoardService {
  static async getAll(): Promise<KanbanBoard[]> {
    const response = await apiService.get(apiRoutes.kanbanBoards.getAll);
    const list = extractValues<KanbanBoard>(response);
    return list.filter((x) => !x.isDeleted);
  }

  static async getById(id: string | number): Promise<KanbanBoard> {
    const response = await apiService.get(apiRoutes.kanbanBoards.getById(id));
    return extractValue<KanbanBoard>(response);
  }

  static async create(data: CreateKanbanBoardRequest): Promise<KanbanBoard> {
    const response = await apiService.post(apiRoutes.kanbanBoards.add, data);
    return extractValue<KanbanBoard>(response);
  }

  static async update(data: UpdateKanbanBoardRequest): Promise<KanbanBoard> {
    const response = await apiService.put(apiRoutes.kanbanBoards.update, data);
    return extractValue<KanbanBoard>(response);
  }

  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.kanbanBoards.delete(id));
    return id;
  }

  static search(items: KanbanBoard[], term: string): KanbanBoard[] {
    if (!term.trim()) return items;
    const t = term.toLowerCase().trim();
    return items.filter((x) => !x.isDeleted && (x.name?.toLowerCase().includes(t) || x.description?.toLowerCase().includes(t)));
  }
}
