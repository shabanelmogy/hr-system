import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import type { BoardTaskComment, CreateBoardTaskCommentRequest, UpdateBoardTaskCommentRequest } from "../types/BoardTaskComment";

export default class BoardTaskCommentService {
  static async getAll(): Promise<BoardTaskComment[]> {
    const response = await apiService.get(apiRoutes.boardTaskComments.getAll);
    const list = extractValues<BoardTaskComment>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async getById(id: string | number): Promise<BoardTaskComment> {
    const response = await apiService.get(apiRoutes.boardTaskComments.getById(id));
    return extractValue<BoardTaskComment>(response);
  }
  static async getByTask(taskId: string | number): Promise<BoardTaskComment[]> {
    const response = await apiService.get(apiRoutes.boardTaskComments.getByTask(taskId));
    const list = extractValues<BoardTaskComment>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async create(data: CreateBoardTaskCommentRequest): Promise<BoardTaskComment> {
    const response = await apiService.post(apiRoutes.boardTaskComments.add, data);
    return extractValue<BoardTaskComment>(response);
  }
  static async update(data: UpdateBoardTaskCommentRequest): Promise<BoardTaskComment> {
    const response = await apiService.put(apiRoutes.boardTaskComments.update, data);
    return extractValue<BoardTaskComment>(response);
  }
  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.boardTaskComments.delete(id));
    return id;
  }
}
