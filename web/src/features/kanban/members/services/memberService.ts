import { apiRoutes } from "@/routes";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import type { KanbanBoardMember, CreateKanbanBoardMemberRequest, UpdateKanbanBoardMemberRequest } from "../types/Member";

export default class MemberService {
  static async getAll(): Promise<KanbanBoardMember[]> {
    const response = await apiService.get(apiRoutes.kanbanBoardMembers.getAll);
    const list = extractValues<KanbanBoardMember>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async getById(id: string | number): Promise<KanbanBoardMember> {
    const response = await apiService.get(apiRoutes.kanbanBoardMembers.getById(id));
    return extractValue<KanbanBoardMember>(response);
  }
  static async getByBoard(boardId: string | number): Promise<KanbanBoardMember[]> {
    const response = await apiService.get(apiRoutes.kanbanBoardMembers.getByBoard(boardId));
    const list = extractValues<KanbanBoardMember>(response);
    return list.filter(x => !x.isDeleted);
  }
  static async create(data: CreateKanbanBoardMemberRequest): Promise<KanbanBoardMember> {
    const response = await apiService.post(apiRoutes.kanbanBoardMembers.add, data);
    return extractValue<KanbanBoardMember>(response);
  }
  static async update(data: UpdateKanbanBoardMemberRequest): Promise<KanbanBoardMember> {
    const response = await apiService.put(apiRoutes.kanbanBoardMembers.update, data);
    return extractValue<KanbanBoardMember>(response);
  }
  static async delete(id: string | number): Promise<string | number> {
    await apiService.delete(apiRoutes.kanbanBoardMembers.delete(id));
    return id;
  }
}
