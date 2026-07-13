import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import type { KanbanCardLabelLink, CreateKanbanCardLabelLinkRequest, UpdateKanbanCardLabelLinkRequest } from "../types/CardLabel";

export default class CardLabelService {
  static async getAll(): Promise<KanbanCardLabelLink[]> {
    const response = await apiService.get(apiRoutes.kanbanCardLabels.getAll);
    const list = extractValues<KanbanCardLabelLink>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async getById(id: string | number): Promise<KanbanCardLabelLink> {
    const response = await apiService.get(apiRoutes.kanbanCardLabels.getById(id));
    return extractValue<KanbanCardLabelLink>(response);
  }
  static async getByCard(cardId: string | number): Promise<KanbanCardLabelLink[]> {
    const response = await apiService.get(apiRoutes.kanbanCardLabels.getByCard(cardId));
    const list = extractValues<KanbanCardLabelLink>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async create(data: CreateKanbanCardLabelLinkRequest): Promise<KanbanCardLabelLink> {
    const response = await apiService.post(apiRoutes.kanbanCardLabels.add, data);
    return extractValue<KanbanCardLabelLink>(response);
  }
  static async update(data: UpdateKanbanCardLabelLinkRequest): Promise<KanbanCardLabelLink> {
    const response = await apiService.put(apiRoutes.kanbanCardLabels.update, data);
    return extractValue<KanbanCardLabelLink>(response);
  }
  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.kanbanCardLabels.delete(id));
    return id;
  }
}
