import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import type { KanbanCardAttachment, CreateKanbanCardAttachmentRequest, UpdateKanbanCardAttachmentRequest } from "../types/Attachment";

export default class AttachmentService {
  static async getAll(): Promise<KanbanCardAttachment[]> {
    const response = await apiService.get(apiRoutes.kanbanCardAttachments.getAll);
    const list = extractValues<KanbanCardAttachment>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async getById(id: string | number): Promise<KanbanCardAttachment> {
    const response = await apiService.get(apiRoutes.kanbanCardAttachments.getById(id));
    return extractValue<KanbanCardAttachment>(response);
  }
  static async getByCard(cardId: string | number): Promise<KanbanCardAttachment[]> {
    const response = await apiService.get(apiRoutes.kanbanCardAttachments.getByCard(cardId));
    const list = extractValues<KanbanCardAttachment>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async create(data: CreateKanbanCardAttachmentRequest): Promise<KanbanCardAttachment> {
    const response = await apiService.post(apiRoutes.kanbanCardAttachments.add, data);
    return extractValue<KanbanCardAttachment>(response);
  }
  static async update(data: UpdateKanbanCardAttachmentRequest): Promise<KanbanCardAttachment> {
    const response = await apiService.put(apiRoutes.kanbanCardAttachments.update, data);
    return extractValue<KanbanCardAttachment>(response);
  }
  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.kanbanCardAttachments.delete(id));
    return id;
  }
}
