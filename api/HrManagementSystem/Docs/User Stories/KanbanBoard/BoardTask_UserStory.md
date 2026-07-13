# Board Task Management - User Story

## Feature Overview
Manage tasks that may belong to a Kanban board and optionally a specific column. Tasks track title, description, status, priority, due date, estimated/logged hours, assignee, and position.

## User Stories

### US-001: View Board Tasks
As a user
I want to view all board tasks
So that I can see existing tasks

Acceptance Criteria:
- Returns all non-deleted tasks
- Each task includes: id, title, description, status, priority, due date, assignee id, position, audit info
- Only authorized users can access per permissions policy

### US-002: Get Board Task by ID
As a user
I want to get a task by ID
So that I can view its details

Acceptance Criteria:
- Returns task when it exists and is not deleted
- Returns 404 when task is not found

### US-003: Create Board Task
As a user
I want to create a new board task
So that I can track work

Acceptance Criteria:
- Required inputs: Title, Status, Priority, Position
- Optional: KanbanBoardId, KanbanColumnId, AssigneeId, DueDate, EstimatedHours, LoggedHours, Description
- Only authorized users can create
- On success, returns 201 with created entity

### US-004: Update Board Task
As a user
I want to update a board task
So that I can modify its details

Acceptance Criteria:
- Required inputs: Id, Title, Status, Priority, Position
- Only authorized users can update
- On success, returns 201 with updated entity
- Returns 404 when task is not found

### US-005: Delete (Toggle) Board Task
As a user
I want to soft delete (toggle) a board task
So that I can remove outdated tasks

Acceptance Criteria:
- Performs soft delete toggle on the entity
- Cannot delete if task has non-deleted comments or attachments
- Only authorized users can delete
- On success, returns 204 No Content
- Returns 404 when task is not found
- Returns 400 if task has comments or attachments

## API Endpoints

Note: The API base route is `api/v{version}/[controller]/[action]`. The controller name is `BoardTasks`.

| Method | Endpoint                          | Permission               | Description                 |
|--------|-----------------------------------|--------------------------|-----------------------------|
| GET    | /api/v1/BoardTasks/GetAll         | ViewKanbanBoards (temp)  | Get all tasks               |
| GET    | /api/v1/BoardTasks/GetById/{id}   | -                        | Get task by ID              |
| POST   | /api/v1/BoardTasks/Add            | EditKanbanBoards (temp)  | Create new task             |
| PUT    | /api/v1/BoardTasks/Update         | EditKanbanBoards (temp)  | Update task                 |
| DELETE | /api/v1/BoardTasks/Delete/{id}    | DeleteKanbanBoards (temp)| Soft delete (toggle) task   |

Note: Replace temporary permissions with dedicated BoardTask permissions if/when defined (e.g., ViewBoardTasks, CreateBoardTasks, EditBoardTasks, DeleteBoardTasks).

## Request/Response Schemas

Request (BoardTaskRequest):
- Id: int
- Title: string
- Description: string
- Status: int (TaskStatus enum)
- Priority: int (TaskPriority enum)
- DueDate: DateTime?
- EstimatedHours: decimal?
- LoggedHours: decimal?
- AssigneeId: string?
- Position: int
- KanbanBoardId: int?
- KanbanColumnId: int?

Response (BoardTaskResponse):
- Id, Title, Description, Status, Priority, DueDate, EstimatedHours, LoggedHours, AssigneeId, Position, KanbanBoardId, KanbanColumnId
- CreatedOn, UpdatedOn, IsDeleted

## Business Rules
1. Title is required (3-200 chars).
2. Status must be one of TaskStatus: Todo, InProgress, Review, Done.
3. Priority must be one of TaskPriority: Low, Medium, High, Critical.
4. Estimated/Logged hours must be >= 0 if provided.
5. AssigneeId must refer to an existing user when provided.
6. KanbanBoardId/KanbanColumnId are optional but must refer to existing non-deleted entities if provided.
7. Soft delete is used; deleted tasks are excluded from read queries.
8. Cannot delete a task if it has comments or attachments.

## Validation Rules
- Title: Required, trimmed, length 3-200.
- Status: Inclusive between enum values.
- Priority: Inclusive between enum values.
- Hours: Non-negative if provided.
- References: Must exist when provided (board, column, assignee).

## Error Scenarios
- 404: BoardTaskNotFound — The board task was not found.
- 400: BoardTaskHasComments — Cannot delete task because it has comments.
- 400: BoardTaskHasAttachments — Cannot delete task because it has attachments.
- 400: Validation errors for status, priority, references, or title.

## Permissions
- Temporary: Using KanbanBoards permissions until specific BoardTask permissions are added.

## Notes
- Read operations use AsNoTracking and filter out deleted entities.
- Update logs changes via EntityChangeLogService.
- Soft delete toggles IsDeleted and sets DeletedBy/DeletedOn metadata.
