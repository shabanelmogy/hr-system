import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import type { BoardTask, CreateBoardTaskRequest, UpdateBoardTaskRequest } from "../types/BoardTask";

export default class BoardTaskService {
  static async getAll(): Promise<BoardTask[]> {
    const response = await apiService.get(apiRoutes.boardTasks.getAll);
    const list = extractValues<BoardTask>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async getById(id: string | number): Promise<BoardTask> {
    const response = await apiService.get(apiRoutes.boardTasks.getById(id));
    return extractValue<BoardTask>(response);
  }
  static async create(data: CreateBoardTaskRequest): Promise<BoardTask> {
    const response = await apiService.post(apiRoutes.boardTasks.add, data);
    return extractValue<BoardTask>(response);
  }
  static async update(data: UpdateBoardTaskRequest): Promise<BoardTask> {
    const response = await apiService.put(apiRoutes.boardTasks.update, data);
    return extractValue<BoardTask>(response);
  }
  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.boardTasks.delete(id));
    return id;
  }
}
