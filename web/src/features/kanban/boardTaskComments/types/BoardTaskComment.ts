export interface BoardTaskComment {
  id: string | number;
  boardTaskId: string | number;
  commentText: string;
  userId: string | number;
  userName?: string;
  userEmail?: string;
  createdOn: string;
  updatedOn: string;
  isDeleted: boolean;
}

export interface CreateBoardTaskCommentRequest {
  boardTaskId: string | number;
  commentText: string;
}

export interface UpdateBoardTaskCommentRequest extends CreateBoardTaskCommentRequest {
  id: string | number;
}
