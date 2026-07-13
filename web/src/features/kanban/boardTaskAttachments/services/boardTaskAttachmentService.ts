import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import type { BoardTaskAttachment, CreateBoardTaskAttachmentRequest, UpdateBoardTaskAttachmentRequest } from "../types/BoardTaskAttachment";

export default class BoardTaskAttachmentService {
  static async getAll(): Promise<BoardTaskAttachment[]> {
    const response = await apiService.get(apiRoutes.boardTaskAttachments.getAll);
    const list = extractValues<BoardTaskAttachment>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async getById(id: string | number): Promise<BoardTaskAttachment> {
    const response = await apiService.get(apiRoutes.boardTaskAttachments.getById(id));
    return extractValue<BoardTaskAttachment>(response);
  }
  static async getByTask(taskId: string | number): Promise<BoardTaskAttachment[]> {
    const response = await apiService.get(apiRoutes.boardTaskAttachments.getByTask(taskId));
    const list = extractValues<BoardTaskAttachment>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async create(data: CreateBoardTaskAttachmentRequest): Promise<BoardTaskAttachment> {
    const response = await apiService.post(apiRoutes.boardTaskAttachments.add, data);
    return extractValue<BoardTaskAttachment>(response);
  }
  static async update(data: UpdateBoardTaskAttachmentRequest): Promise<BoardTaskAttachment> {
    const response = await apiService.put(apiRoutes.boardTaskAttachments.update, data);
    return extractValue<BoardTaskAttachment>(response);
  }
  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.boardTaskAttachments.delete(id));
    return id;
  }
}
