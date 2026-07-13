import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import type { KanbanCardAssignee, CreateKanbanCardAssigneeRequest, UpdateKanbanCardAssigneeRequest } from "../types/Assignee";

export default class AssigneeService {
  static async getAll(): Promise<KanbanCardAssignee[]> {
    const response = await apiService.get(apiRoutes.kanbanCardAssignees.getAll);
    const list = extractValues<KanbanCardAssignee>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async getById(id: string | number): Promise<KanbanCardAssignee> {
    const response = await apiService.get(apiRoutes.kanbanCardAssignees.getById(id));
    return extractValue<KanbanCardAssignee>(response);
  }
  static async getByCard(cardId: string | number): Promise<KanbanCardAssignee[]> {
    const response = await apiService.get(apiRoutes.kanbanCardAssignees.getByCard(cardId));
    const list = extractValues<KanbanCardAssignee>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async getByUser(userId: string | number): Promise<KanbanCardAssignee[]> {
    const response = await apiService.get(apiRoutes.kanbanCardAssignees.getByUser(userId));
    const list = extractValues<KanbanCardAssignee>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async create(data: CreateKanbanCardAssigneeRequest): Promise<KanbanCardAssignee> {
    const response = await apiService.post(apiRoutes.kanbanCardAssignees.add, data);
    return extractValue<KanbanCardAssignee>(response);
  }
  static async update(data: UpdateKanbanCardAssigneeRequest): Promise<KanbanCardAssignee> {
    const response = await apiService.put(apiRoutes.kanbanCardAssignees.update, data);
    return extractValue<KanbanCardAssignee>(response);
  }
  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.kanbanCardAssignees.delete(id));
    return id;
  }
}
