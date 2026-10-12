# Board Task Attachment - User Story

## Feature Overview
Manage attachments for board tasks, allowing users to upload and link files to tasks.

## User Stories

### US-001: View Board Task Attachments
As a user, I want to view all board task attachments so that I can see files related to tasks.
- Only users with ViewBoardTaskAttachments permission can access
- Deleted attachments are excluded
- Attachments include: task title, file name, file URL, content type, upload date

### US-002: View Attachments by Task
As a user, I want to view attachments for a specific task so that I can find related files quickly.
- Only users with ViewBoardTaskAttachments permission can access
- Returns empty list if no attachments
- Ordered by creation date descending

### US-003: Add Attachment
As a user, I want to attach a file to a task so that I can share resources.
- Only users with CreateBoardTaskAttachments permission can add
- Prevent duplicate attachments for same file and task
- Returns full attachment information after creation

### US-004: Update Attachment
As a user, I want to update an attachment so that I can correct mistakes or change files.
- Only users with EditBoardTaskAttachments permission can update
- Changes are logged for audit

### US-005: Delete Attachment
As a user, I want to remove an attachment from a task so that I can keep the task clean.
- Only users with DeleteBoardTaskAttachments permission can delete
- Soft delete only; file itself remains

## API Endpoints

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | /api/v1/boardtaskattachments | ViewBoardTaskAttachments | Get all task attachments |
| GET | /api/v1/boardtaskattachments/{id} | - | Get attachment by ID |
| GET | /api/v1/boardtaskattachments/task/{taskId} | ViewBoardTaskAttachments | Get attachments by task |
| POST | /api/v1/boardtaskattachments | CreateBoardTaskAttachments | Attach file to task |
| PUT | /api/v1/boardtaskattachments | EditBoardTaskAttachments | Update attachment |
| DELETE | /api/v1/boardtaskattachments/{id} | DeleteBoardTaskAttachments | Remove attachment |

## Validation Rules
- BoardTaskId: > 0 and must exist
- UploadedFileId: not empty and must exist
- Duplicate check: BoardTaskId + UploadedFileId unique among non-deleted

## Error Scenarios
- 404: BoardTaskAttachmentNotFound
- 409: BoardTaskAttachmentExists
- 400: InvalidBoardTask, InvalidFile

## Technical Notes
- Use AsNoTracking for reads
- Filter !IsDeleted on all reads
- Log changes via IEntityChangeLogService in updates
- Soft delete with audit fields in Toggle
