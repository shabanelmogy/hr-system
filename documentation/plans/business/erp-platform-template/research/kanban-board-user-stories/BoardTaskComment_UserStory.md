# Board Task Comment Management - User Story

## Feature Overview
Allow users to add, view, update, and soft-delete comments on board tasks. Comments support threaded replies via parent-child relationships and are associated with the authoring user for ownership enforcement.

## User Stories

### US-001: View Comments For A Task
As a user I want to view comments on a task so that I can read discussions and updates.

Acceptance Criteria:
- Can fetch all non-deleted comments for a task ordered by creation time (desc)
- Each comment shows: id, task id, task title, text, author name and email, created/updated dates
- Only users with ViewBoardTaskComments permission can access the list

### US-002: Add Comment To A Task
As a user I want to add a comment to a task so that I can contribute to the discussion.

Acceptance Criteria:
- Provide: BoardTaskId (required), CommentText (required, 1-2000 chars)
- System validates BoardTask existence and not deleted
- Comment author is set to the current user automatically
- Returns created comment with author info
- Only users with CreateBoardTaskComments permission can add

### US-003: Update My Comment
As a user I want to update a comment I authored so that I can correct or improve it.

Acceptance Criteria:
- Provide: Id (existing), BoardTaskId, CommentText (1-2000 chars)
- System checks comment exists and is not deleted
- Only the author can update their comment; otherwise 403 is returned
- Changes are logged in entity change log
- Only users with EditBoardTaskComments permission can update

### US-004: Delete (Toggle) My Comment
As a user I want to soft-delete a comment I authored so that I can remove it without losing history.

Acceptance Criteria:
- Provides comment id
- If not found return 404
- Only the author can delete their comment; otherwise 403 is returned
- Soft delete sets IsDeleted, DeletedById, DeletedOn, DeletedByPc
- Only users with DeleteBoardTaskComments permission can delete

### US-005: Admin View All Comments
As an admin I want to view all comments irrespective of author so that I can audit conversations.

Acceptance Criteria:
- Returns all non-deleted comments
- Requires ViewBoardTaskComments permission

## API Endpoints

Base route pattern: /api/v{version}/[controller]/[action]
Controller: BoardTaskComments

- GET    /api/v1/BoardTaskComments/GetAll                     (perm: ViewBoardTaskComments)
- GET    /api/v1/BoardTaskComments/GetById/{id}
- GET    /api/v1/BoardTaskComments/GetByTaskId/task/{taskId}  (perm: ViewBoardTaskComments)
- POST   /api/v1/BoardTaskComments/Add                         (perm: CreateBoardTaskComments)
- PUT    /api/v1/BoardTaskComments/Update                      (perm: EditBoardTaskComments)
- DELETE /api/v1/BoardTaskComments/Delete/{id}                 (perm: DeleteBoardTaskComments)

Note: Per route attributes, GetByTaskId uses "task/{taskId}" segment.

## Business Rules
1. Soft delete only (IsDeleted flag). Deleted metadata is tracked (ById, On, ByPc).
2. Only the author can update or delete a comment.
3. A board task cannot be deleted if it has any non-deleted comments (enforced in board task deletion).
4. ParentCommentId enables threaded replies; if provided, reply belongs to same task as parent.

## Validation Rules
- BoardTaskId: required, > 0, must exist and not be deleted.
- CommentText: required, 1-2000 chars.

## Error Scenarios
- 404 BoardTaskCommentNotFound: Comment does not exist or is deleted.
- 400 InvalidBoardTask: Provided task id is invalid.
- 403 UnauthorizedCommentAccess: Only the author can modify/delete their comment.

## Data Contracts

Request
- Id (int)
- BoardTaskId (int)
- CommentText (string)

Response
- Id (int)
- BoardTaskId (int)
- BoardTaskTitle (string)
- CommentText (string)
- UserId (string)
- UserName (string)
- UserEmail (string)
- CreatedOn (DateTime)
- UpdatedOn (DateTime?)
- IsDeleted (bool)

## Notes
- Read operations use AsNoTracking and filter by !IsDeleted.
- Update operations log changes via IEntityChangeLogService.
- Ownership validation is enforced in service layer for Update and Toggle.
- Configuration defines FK relationships to BoardTask, ParentComment, and User with restricted deletes, and indexes on BoardTaskId, ParentCommentId, and UserId.
