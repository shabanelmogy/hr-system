import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import type { KanbanCardComment, CreateKanbanCardCommentRequest, UpdateKanbanCardCommentRequest } from "../types/Comment";

export default class CommentService {
  static async getAll(): Promise<KanbanCardComment[]> {
    const response = await apiService.get(apiRoutes.kanbanCardComments.getAll);
    const list = extractValues<KanbanCardComment>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async getById(id: string | number): Promise<KanbanCardComment> {
    const response = await apiService.get(apiRoutes.kanbanCardComments.getById(id));
    return extractValue<KanbanCardComment>(response);
  }
  static async getByCard(cardId: string | number): Promise<KanbanCardComment[]> {
    // Controller/Action: GetByCardId/card/{cardId}
    const url = `/api/v1/KanbanCardComments/GetByCardId/card/${cardId}`;
    const response = await apiService.get(url);
    const list = extractValues<KanbanCardComment>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async create(data: CreateKanbanCardCommentRequest): Promise<KanbanCardComment> {
    const response = await apiService.post(apiRoutes.kanbanCardComments.add, data);
    return extractValue<KanbanCardComment>(response);
  }
  static async update(data: UpdateKanbanCardCommentRequest): Promise<KanbanCardComment> {
    const response = await apiService.put(apiRoutes.kanbanCardComments.update, data);
    return extractValue<KanbanCardComment>(response);
  }
  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.kanbanCardComments.delete(id));
    return id;
  }
}
