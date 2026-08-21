# Kanban Board Management - User Story

## Feature Overview
Manage Kanban boards for project management and task tracking. Kanban boards provide a visual way to organize work, track progress, and collaborate with team members. Each board contains columns, cards, labels, and members with specific roles.

---

## User Stories

### US-001: View All Kanban Boards
**As a** user with appropriate permissions  
**I want to** view all Kanban boards  
**So that** I can see available boards and their current status

**Acceptance Criteria:**
- User can see a list of all non-deleted boards
- Each board shows: name, description, archive status, creation date
- Boards include their columns, labels, members, and tasks
- Only users with `ViewKanbanBoards` permission can access
- Deleted boards are excluded from the list
- Results include complete board hierarchy with nested data

**Technical Notes:**
- Endpoint: `GET /api/v1/kanbanboards`
- Returns: `IEnumerable<KanbanBoardResponse>`
- Includes navigation properties for all related entities
- Columns are ordered by Order field
- Cards within columns are ordered by Order field

---

### US-002: View Kanban Board by ID
**As a** user  
**I want to** view details of a specific board  
**So that** I can see complete board information including all columns, cards, and members

**Acceptance Criteria:**
- User can retrieve a single board by ID
- Returns complete board information including:
  - All columns with their cards
  - All labels
  - All members with their roles
  - All tasks
- Returns 404 if board not found or deleted
- No special permission required (authenticated users only)

**Technical Notes:**
- Endpoint: `GET /api/v1/kanbanboards/{id}`
- Returns: `Result<KanbanBoardResponse>`
- Status Codes: 200 (Success), 404 (Not Found)

---

### US-003: Create Kanban Board
**As a** user with appropriate permissions  
**I want to** create a new Kanban board  
**So that** I can organize and track work for a project or team

**Acceptance Criteria:**
- User can create a board by providing: name and description
- Name is required (3-100 characters)
- Description is required (3-500 characters)
- System validates uniqueness of board name
- Board is created with default values:
  - IsArchived = false
  - BackgroundColor = null (optional)
- Only users with `CreateKanbanBoards` permission can create boards
- Returns complete board information after creation

**Validation Rules:**
- Name: Required, 3-100 characters, must be unique
- Description: Required, 3-500 characters
- BackgroundColor: Optional
- IsArchived: Boolean, defaults to false

**Technical Notes:**
- Endpoint: `POST /api/v1/kanbanboards`
- Returns: `Result<KanbanBoardResponse>`
- Status Codes: 201 (Created), 409 (Duplicate Name), 400 (Validation Error)

---

### US-004: Update Kanban Board
**As a** user with appropriate permissions  
**I want to** update a board's information  
**So that** I can modify board details or archive/unarchive it

**Acceptance Criteria:**
- User can update: name, description, background color, archive status
- System validates board exists
- System validates name uniqueness (excluding current board)
- System logs all changes for audit purposes
- Only users with `EditKanbanBoards` permission can update
- Returns updated board information

**Validation Rules:**
- Same validation as Create operation
- Board ID must exist
- Name must be unique (excluding current board)

**Technical Notes:**
- Endpoint: `PUT /api/v1/kanbanboards`
- Returns: `Result<KanbanBoardResponse>`
- Status Codes: 200 (Success), 404 (Not Found), 409 (Duplicate Name), 400 (Validation Error)
- Change logging enabled via IEntityChangeLogService

---

### US-005: Delete Kanban Board
**As a** user with appropriate permissions  
**I want to** delete a board  
**So that** I can remove unused or completed boards

**Acceptance Criteria:**
- User can delete a board by ID
- System performs soft delete (sets IsDeleted = true)
- System prevents deletion if board has active (non-deleted) columns
- System records deletion metadata (who, when, from which PC)
- Deleted boards are excluded from all queries
- Only users with `DeleteKanbanBoards` permission can delete
- Returns 404 if board not found

**Business Rules:**
- Cannot delete board if it has active (non-deleted) columns
- Must delete or archive all columns before deleting board
- Soft delete preserves data for audit purposes

**Technical Notes:**
- Endpoint: `DELETE /api/v1/kanbanboards/{id}`
- Returns: `Result`
- Status Codes: 204 (No Content), 404 (Not Found), 400 (Has Active Columns)
- Soft delete implementation with audit fields

---

### US-006: Archive/Unarchive Kanban Board
**As a** user with appropriate permissions  
**I want to** archive or unarchive a board  
**So that** I can hide completed projects without deleting them

**Acceptance Criteria:**
- User can toggle archive status via Update endpoint
- Archived boards can be filtered out in queries
- Archive status doesn't affect deletion rules
- Archived boards retain all data (columns, cards, members)
- Only users with `EditKanbanBoards` permission can archive

**Technical Notes:**
- Implemented through Update endpoint
- IsArchived field controls visibility

---

## API Endpoints Summary

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | /api/v1/kanbanboards | ViewKanbanBoards | Get all boards |
| GET | /api/v1/kanbanboards/{id} | - | Get board by ID |
| POST | /api/v1/kanbanboards | CreateKanbanBoards | Create new board |
| PUT | /api/v1/kanbanboards | EditKanbanBoards | Update board |
| DELETE | /api/v1/kanbanboards/{id} | DeleteKanbanBoards | Delete board |

---

## Data Models

### KanbanBoardRequest
```csharp
{
    "id": 0,
    "name": "Sprint Planning Q1 2024",
    "description": "Planning and tracking for Q1 2024 sprint activities"
}
```

### KanbanBoardResponse
```csharp
{
    "id": 1,
    "name": "Sprint Planning Q1 2024",
    "description": "Planning and tracking for Q1 2024 sprint activities",
    "isArchived": false,
    "createdOn": "2024-01-15T10:30:00Z",
    "updatedOn": "2024-01-20T14:45:00Z",
    "isDeleted": false,
    "columns": [
        {
            "id": 1,
            "name": "To Do",
            "order": 0,
            "isArchived": false,
            "cards": [
                {
                    "id": 1,
                    "title": "Implement user authentication",
                    "description": "Add JWT-based authentication",
                    "order": 0,
                    "dueDate": "2024-12-31T23:59:59Z",
                    "isArchived": false
                }
            ]
        },
        {
            "id": 2,
            "name": "In Progress",
            "order": 1,
            "isArchived": false,
            "cards": []
        },
        {
            "id": 3,
            "name": "Done",
            "order": 2,
            "isArchived": false,
            "cards": []
        }
    ],
    "labels": [
        {
            "id": 1,
            "name": "Backend",
            "colorHex": "#FF5733"
        },
        {
            "id": 2,
            "name": "Frontend",
            "colorHex": "#33FF57"
        }
    ],
    "members": [
        {
            "id": 1,
            "userId": "user-guid-1",
            "role": 2
        },
        {
            "id": 2,
            "userId": "user-guid-2",
            "role": 1
        }
    ],
    "tasks": [
        {
            "id": 1,
            "title": "Setup project structure",
            "description": "Initialize project with proper folder structure",
            "status": 2,
            "priority": 3,
            "dueDate": "2024-02-01T00:00:00Z",
            "assigneeId": "user-guid-1",
            "position": 0
        }
    ]
}
```

### SimpleKanbanBoardResponse
```csharp
{
    "id": 1,
    "name": "Sprint Planning Q1 2024",
    "description": "Planning and tracking for Q1 2024 sprint activities",
    "isArchived": false
}
```

---

## Business Rules

1. **Unique Names**: Board names must be unique across the system
2. **Column Protection**: Cannot delete board with active columns
3. **Soft Delete**: All deletions are soft deletes with audit trail
4. **Change Logging**: All updates are logged for audit purposes
5. **Archive vs Delete**: 
   - Archived boards remain accessible but can be filtered out
   - Deleted boards are completely hidden from queries
6. **Hierarchy**: Boards contain columns, which contain cards
7. **Member Management**: Boards can have multiple members with different roles
8. **Label System**: Boards can have custom labels for categorizing cards
9. **Task Tracking**: Boards can have associated tasks for project management

---

## Validation Rules

### Name
- Required
- Minimum length: 3 characters
- Maximum length: 100 characters
- Must be unique across all boards
- Trimmed before validation

### Description
- Required
- Minimum length: 3 characters
- Maximum length: 500 characters
- Trimmed before validation

### BackgroundColor
- Optional
- String format (typically hex color code)

### IsArchived
- Boolean
- Defaults to false

---

## Error Scenarios

### 404 Not Found
- **KanbanBoardNotFound**: Board with specified ID doesn't exist or is deleted

### 409 Conflict
- **KanbanBoardExists**: Board with same name already exists

### 400 Bad Request
- **KanbanBoardHasColumns**: Cannot delete board because it has active columns
- **MaxLengthError**: Field exceeds maximum length
- **Required**: Required field is missing
- **DuplicatedValue**: Board name already exists

---

## Database Schema

### Table: KanbanBoards

| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | Primary Key, Identity |
| Name | nvarchar(100) | Required, Unique Index |
| Description | nvarchar(500) | Required |
| BackgroundColor | nvarchar(50) | Nullable |
| IsArchived | bit | Required, Default: false |
| CreatedOn | datetime | Required |
| CreatedById | string | Foreign Key |
| UpdatedOn | datetime | Nullable |
| UpdatedById | string | Foreign Key, Nullable |
| IsDeleted | bit | Required, Default: false |
| DeletedOn | datetime | Nullable |
| DeletedById | string | Foreign Key, Nullable |
| DeletedByPc | string | Nullable |

### Indexes
- Primary Key: Id
- Unique Index: Name
- Foreign Key Index: CreatedById
- Foreign Key Index: UpdatedById
- Foreign Key Index: DeletedById

### Relationships
- **KanbanColumns**: One-to-Many (board has many columns)
- **KanbanBoardMembers**: One-to-Many (board has many members)
- **KanbanLabels**: One-to-Many (board has many labels)
- **BoardTasks**: One-to-Many (board has many tasks)

---

## Security Considerations

1. **Authentication**: All endpoints require authentication
2. **Authorization**: CRUD operations require specific permissions
3. **Data Validation**: All inputs validated before processing
4. **Audit Trail**: All changes logged with user and timestamp
5. **Soft Delete**: Preserves data integrity and audit history
6. **Foreign Key Constraints**: Prevent orphaned records
7. **XSS Prevention**: Input sanitization for name and description
8. **Unique Constraint**: Prevents duplicate board names

---

## Testing Scenarios

### Positive Tests
1. Create board with valid data
2. Update board name and description
3. Archive board
4. Unarchive board
5. Delete board (without columns)
6. View all boards
7. View board by ID
8. Create board with unique name
9. Update board with different name

### Negative Tests
1. Create board with duplicate name
2. Create board with empty name
3. Create board with name too short (< 3 chars)
4. Create board with name too long (> 100 chars)
5. Create board with empty description
6. Create board with description too short (< 3 chars)
7. Create board with description too long (> 500 chars)
8. Update non-existent board
9. Update board with duplicate name
10. Delete board with active columns
11. Delete non-existent board
12. Access without proper permissions

---

## Related Entities

- **KanbanColumn**: Columns within the board
- **KanbanCard**: Cards within columns
- **KanbanBoardMember**: Users who are members of the board
- **KanbanLabel**: Labels for categorizing cards
- **BoardTask**: Tasks associated with the board
- **ApplicationUser**: User entity for audit fields and members

---

## Workflow Examples

### Creating a New Project Board
1. User creates a new board with name and description
2. System validates uniqueness and creates board
3. User adds columns (To Do, In Progress, Done)
4. User invites team members with appropriate roles
5. User creates labels for categorization
6. Team members start adding cards to columns

### Archiving Completed Project
1. User marks all cards as complete
2. User archives the board (IsArchived = true)
3. Board remains accessible but hidden from active board list
4. Board can be unarchived if needed

### Deleting Unused Board
1. User removes or archives all columns
2. User deletes the board
3. System performs soft delete
4. Board is hidden from all queries but data is preserved

---

## Future Enhancements

1. **Board Templates**: Create boards from predefined templates
2. **Board Duplication**: Clone existing boards with all structure
3. **Board Sharing**: Share boards with external users
4. **Board Analytics**: Track board metrics and team performance
5. **Board Automation**: Automate card movements based on rules
6. **Board Notifications**: Notify members of board changes
7. **Board Export**: Export board data to various formats
8. **Board Search**: Full-text search across boards
9. **Board Favorites**: Mark frequently used boards as favorites
10. **Board Categories**: Organize boards into categories
11. **Board Permissions**: Granular permissions per board
12. **Board Activity Feed**: View all activities on a board
13. **Board Integrations**: Integrate with external tools (Slack, Teams, etc.)
14. **Board Themes**: Custom themes and backgrounds
15. **Board Widgets**: Add custom widgets to boards

---

## Performance Considerations

1. **Indexing**: Proper indexes on Name and foreign keys
2. **Pagination**: Implement pagination for large board lists
3. **Lazy Loading**: Load related entities only when needed
4. **Caching**: Cache frequently accessed boards
5. **Query Optimization**: Use projections to reduce data transfer
6. **Eager Loading**: Use Include() for related entities when needed
7. **AsNoTracking**: Use for read-only queries

---

## Integration Points

### With Other Modules
1. **User Management**: Board members are application users
2. **Notification System**: Send notifications for board events
3. **File Management**: Attach files to cards within boards
4. **Reporting**: Generate reports from board data
5. **Dashboard**: Display board statistics on dashboard
6. **Activity Log**: Track all board activities

### External Systems
1. **Email**: Send board invitations and notifications
2. **Calendar**: Sync card due dates with calendar
3. **Chat**: Integrate with team chat systems
4. **Version Control**: Link cards to commits/PRs
5. **Time Tracking**: Track time spent on cards

---

## Accessibility Considerations

1. **Keyboard Navigation**: Full keyboard support for board operations
2. **Screen Reader Support**: Proper ARIA labels and descriptions
3. **Color Contrast**: Ensure sufficient contrast for labels and backgrounds
4. **Focus Indicators**: Clear focus indicators for interactive elements
5. **Alternative Text**: Provide alt text for visual elements

---

## Localization Support

All error messages and UI text support multiple languages:
- English (en-US)
- Arabic (ar-EG)

Error messages are stored in localization JSON files and retrieved based on user's language preference.

---

## Audit Trail

All board operations are logged with:
- User who performed the action
- Timestamp of the action
- PC/Machine name
- Type of operation (Create, Update, Delete)
- Before and after values (for updates)

---

## Best Practices

1. **Naming Convention**: Use clear, descriptive board names
2. **Description**: Provide detailed board descriptions
3. **Column Structure**: Start with basic columns (To Do, In Progress, Done)
4. **Member Roles**: Assign appropriate roles to members
5. **Labels**: Create meaningful labels for categorization
6. **Archive vs Delete**: Archive completed boards instead of deleting
7. **Regular Cleanup**: Periodically review and archive old boards
8. **Consistent Structure**: Maintain consistent column structure across similar boards

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** HR Management System Team  
**Status:** Implemented
