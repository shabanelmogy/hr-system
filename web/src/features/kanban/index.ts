export * from "./boards/hooks/useBoardQueries";
export { default as BoardService } from "./boards/services/boardService";
export type {
  CreateKanbanBoardRequest,
  KanbanBoard,
  UpdateKanbanBoardRequest,
} from "./boards/types/Board";

export * from "./columns/hooks/useColumnQueries";
export { default as ColumnService } from "./columns/services/columnService";
export type {
  CreateKanbanColumnRequest,
  KanbanColumn,
  UpdateKanbanColumnRequest,
} from "./columns/types/Column";

export * from "./cards/hooks/useCardQueries";
export { default as CardService } from "./cards/services/cardService";
export type {
  CreateKanbanCardRequest,
  KanbanCard,
  UpdateKanbanCardRequest,
} from "./cards/types/Card";

// Labels
export * from "./labels/hooks/useLabelQueries";
export { default as LabelService } from "./labels/services/labelService";
export type {
  CreateKanbanLabelRequest,
  KanbanLabel,
  UpdateKanbanLabelRequest,
} from "./labels/types/Label";

// Members
export * from "./members/hooks/useMemberQueries";
export { default as MemberService } from "./members/services/memberService";
export type {
  CreateKanbanBoardMemberRequest,
  KanbanBoardMember,
  UpdateKanbanBoardMemberRequest,
} from "./members/types/Member";

// Assignees
export * from "./assignees/hooks/useAssigneeQueries";
export { default as AssigneeService } from "./assignees/services/assigneeService";
export type {
  CreateKanbanCardAssigneeRequest,
  KanbanCardAssignee,
  UpdateKanbanCardAssigneeRequest,
} from "./assignees/types/Assignee";

// Card Labels
export * from "./cardLabels/hooks/useCardLabelQueries";
export { default as CardLabelService } from "./cardLabels/services/cardLabelService";
export type {
  CreateKanbanCardLabelLinkRequest,
  KanbanCardLabelLink,
  UpdateKanbanCardLabelLinkRequest,
} from "./cardLabels/types/CardLabel";

// Comments
export * from "./comments/hooks/useCommentQueries";
export { default as CommentService } from "./comments/services/commentService";
export type {
  CreateKanbanCardCommentRequest,
  KanbanCardComment,
  UpdateKanbanCardCommentRequest,
} from "./comments/types/Comment";

// Attachments
export * from "./attachments/hooks/useAttachmentQueries";
export { default as AttachmentService } from "./attachments/services/attachmentService";
export type {
  CreateKanbanCardAttachmentRequest,
  KanbanCardAttachment,
  UpdateKanbanCardAttachmentRequest,
} from "./attachments/types/Attachment";

// Board Tasks
export * from "./boardTasks/hooks/useBoardTaskQueries";
export { default as BoardTaskService } from "./boardTasks/services/boardTaskService";
export type {
  BoardTask,
  CreateBoardTaskRequest,
  UpdateBoardTaskRequest,
} from "./boardTasks/types/BoardTask";

// Board Task Comments
export * from "./boardTaskComments/hooks/useBoardTaskCommentQueries";
export { default as BoardTaskCommentService } from "./boardTaskComments/services/boardTaskCommentService";
export type {
  BoardTaskComment,
  CreateBoardTaskCommentRequest,
  UpdateBoardTaskCommentRequest,
} from "./boardTaskComments/types/BoardTaskComment";

// Board Task Attachments
export * from "./boardTaskAttachments/hooks/useBoardTaskAttachmentQueries";
export { default as BoardTaskAttachmentService } from "./boardTaskAttachments/services/boardTaskAttachmentService";
export type {
  BoardTaskAttachment,
  CreateBoardTaskAttachmentRequest,
  UpdateBoardTaskAttachmentRequest,
} from "./boardTaskAttachments/types/BoardTaskAttachment";

// Pages
export { default as KanbanBoards } from "./pages/BoardsListPage";
export { default as KanbanBoardView } from "./pages/BoardViewPage";
