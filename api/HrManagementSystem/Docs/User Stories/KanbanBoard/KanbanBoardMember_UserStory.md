# Kanban Board Member Management - User Story

## Feature Overview

Manage members and their roles within Kanban boards. This feature allows adding users to boards with specific roles (Owner, Editor, Viewer) to control access and permissions for board management.

---

## User Stories

### US-001: View All Kanban Board Members

**As a** user with appropriate permissions  
**I want to** view all Kanban board members across all boards  
**So that** I can see who has access to which boards

**Acceptance Criteria:**

- User can see a list of all non-deleted board members
- Each member shows: board name, user name, user email, role, creation date
- Only users with `ViewKanbanBoardMembers` permission can access
- Deleted members are excluded from the list
- Results include related board and user information

**Technical Notes:**

- Endpoint: `GET /api/v1/kanbanboardmembers`
- Returns: `IEnumerable<KanbanBoardMemberResponse>`
- Includes navigation properties for Board and User

---

### US-002: View Kanban Board Member by ID

**As a** user  
**I want to** view details of a specific board member  
**So that** I can see their role and membership information

**Acceptance Criteria:**

- User can retrieve a single board member by ID
- Returns complete member information including board and user details
- Returns 404 if member not found or deleted
- No special permission required (authenticated users only)

**Technical Notes:**

- Endpoint: `GET /api/v1/kanbanboardmembers/{id}`
- Returns: `Result<KanbanBoardMemberResponse>`
- Status Codes: 200 (Success), 404 (Not Found)

---

### US-003: View Members by Board ID

**As a** user with appropriate permissions  
**I want to** view all members of a specific Kanban board  
**So that** I can see who has access to that board

**Acceptance Criteria:**

- User can retrieve all members for a specific board
- Only non-deleted members are returned
- Results include user details and roles
- Only users with `ViewKanbanBoardMembers` permission can access
- Empty list returned if board has no members

**Technical Notes:**

- Endpoint: `GET /api/v1/kanbanboardmembers/board/{boardId}`
- Returns: `IEnumerable<KanbanBoardMemberResponse>`
- Filters by board ID and IsDeleted = false

---

### US-004: Add Member to Kanban Board

**As a** user with appropriate permissions  
**I want to** add a user as a member to a Kanban board  
**So that** they can access and work on the board

**Acceptance Criteria:**

- User can add a member by providing: board ID, user ID, and role
- System validates that the board exists and is not deleted
- System validates that the user exists and is not deleted
- System prevents duplicate memberships (same user + board combination)
- Role must be a valid enum value (Viewer, Editor, Owner)
- Only users with `CreateKanbanBoardMembers` permission can add members
- Returns complete member information after creation

**Validation Rules:**

- KanbanBoardId: Required, must be greater than 0, board must exist
- UserId: Required, not empty, user must exist
- Role: Required, must be valid enum value (1=Owner, 2=Admin, 3=Editor, 4=Viewer)
- Unique constraint: No duplicate (BoardId + UserId) combinations

**Technical Notes:**

- Endpoint: `POST /api/v1/kanbanboardmembers`
- Returns: `Result<KanbanBoardMemberResponse>`
- Status Codes: 201 (Created), 404 (Board/User Not Found), 409 (Duplicate)

---

### US-005: Update Kanban Board Member

**As a** user with appropriate permissions  
**I want to** update a board member's role or assignment  
**So that** I can change their access level or move them to another board

**Acceptance Criteria:**

- User can update board ID, user ID, or role
- System validates member exists
- System validates new board exists (if changed)
- System validates new user exists (if changed)
- System prevents duplicate memberships after update
- System logs all changes for audit purposes
- Only users with `EditKanbanBoardMembers` permission can update
- Returns updated member information

**Validation Rules:**

- Same validation as Add operation
- Cannot create duplicate membership through update
- Member ID must exist

**Technical Notes:**

- Endpoint: `PUT /api/v1/kanbanboardmembers`
- Returns: `Result<KanbanBoardMemberResponse>`
- Status Codes: 200 (Success), 404 (Not Found), 409 (Duplicate)
- Change logging enabled via IEntityChangeLogService

---

### US-006: Delete Kanban Board Member

**As a** user with appropriate permissions  
**I want to** remove a member from a Kanban board  
**So that** they no longer have access to the board

**Acceptance Criteria:**

- User can delete a board member by ID
- System performs soft delete (sets IsDeleted = true)
- System records deletion metadata (who, when, from which PC)
- Deleted members are excluded from all queries
- Only users with `DeleteKanbanBoardMembers` permission can delete
- Returns 404 if member not found

**Technical Notes:**

- Endpoint: `DELETE /api/v1/kanbanboardmembers/{id}`
- Returns: `Result`
- Status Codes: 204 (No Content), 404 (Not Found)
- Soft delete implementation with audit fields

---

## API Endpoints Summary

| Method | Endpoint                                   | Permission               | Description           |
| ------ | ------------------------------------------ | ------------------------ | --------------------- |
| GET    | /api/v1/kanbanboardmembers                 | ViewKanbanBoardMembers   | Get all board members |
| GET    | /api/v1/kanbanboardmembers/{id}            | -                        | Get member by ID      |
| GET    | /api/v1/kanbanboardmembers/board/{boardId} | ViewKanbanBoardMembers   | Get members by board  |
| POST   | /api/v1/kanbanboardmembers                 | CreateKanbanBoardMembers | Add new member        |
| PUT    | /api/v1/kanbanboardmembers                 | EditKanbanBoardMembers   | Update member         |
| DELETE | /api/v1/kanbanboardmembers/{id}            | DeleteKanbanBoardMembers | Delete member         |

---

## Data Models

### KanbanBoardMemberRequest

```csharp
{
    "id": 0,
    "kanbanBoardId": 1,
    "userId": "user-guid",
    "role": 1  // 1=Owner, 2=Admin, 3=Editor, 4=Viewer
}
```

### KanbanBoardMemberResponse

```csharp
{
    "id": 1,
    "kanbanBoardId": 1,
    "kanbanBoardName": "Sprint Planning",
    "userId": "user-guid",
    "userName": "john.doe",
    "userEmail": "john.doe@example.com",
    "role": 1,
    "roleName": "Editor",
    "createdOn": "2024-01-15T10:30:00Z",
    "updatedOn": "2024-01-20T14:45:00Z",
    "isDeleted": false
}
```

---

## Business Rules

1. **Unique Membership**: Each user can only be a member of a board once
2. **Valid References**: Board and User must exist and not be deleted
3. **Role Hierarchy** (from highest to lowest authority):
   - **Owner (1)**: Full control over the board including deletion, ownership transfer, and all management capabilities
   - **Admin (2)**: Can view, edit board content, manage members, and configure board settings (cannot delete board or transfer ownership)
   - **Editor (3)**: Can view and edit board content (cards, columns, labels) but cannot manage members or board settings
   - **Viewer (4)**: Read-only access - can only view board content without making any changes
4. **Soft Delete**: All deletions are soft deletes with audit trail
5. **Change Logging**: All updates are logged for audit purposes
6. **Cascade Behavior**: Restrict delete on foreign keys to prevent orphaned records

---

## Validation Rules

### KanbanBoardId

- Required
- Must be greater than 0
- Board must exist in database
- Board must not be deleted

### UserId

- Required
- Cannot be empty string
- User must exist in database
- User must not be deleted

### Role

- Required
- Must be valid enum value (1, 2, 3, or 4)
- Corresponds to KanbanBoardRole enum
- Values: 1=Owner, 2=Admin, 3=Editor, 4=Viewer

### Uniqueness

- Combination of (KanbanBoardId + UserId) must be unique
- Enforced at database level with composite unique index
- Validated in application layer before save

---

## Error Scenarios

### 404 Not Found

- **KanbanBoardMemberNotFound**: Member with specified ID doesn't exist
- **KanbanBoardNotFound**: Referenced board doesn't exist or is deleted
- **UserNotFound**: Referenced user doesn't exist or is deleted

### 409 Conflict

- **KanbanBoardMemberExists**: User is already a member of this board

### 400 Bad Request

- **InvalidRole**: Role value is not a valid enum value
- **GreaterThanZero**: Board ID must be greater than 0
- **Required**: Required field is missing

---

## Database Schema

### Table: KanbanBoardMembers

| Column        | Type     | Constraints              |
| ------------- | -------- | ------------------------ |
| Id            | int      | Primary Key, Identity    |
| KanbanBoardId | int      | Foreign Key, Required    |
| UserId        | string   | Foreign Key, Required    |
| Role          | int      | Required, Enum           |
| CreatedOn     | datetime | Required                 |
| CreatedById   | string   | Foreign Key              |
| UpdatedOn     | datetime | Nullable                 |
| UpdatedById   | string   | Foreign Key, Nullable    |
| IsDeleted     | bit      | Required, Default: false |
| DeletedOn     | datetime | Nullable                 |
| DeletedById   | string   | Foreign Key, Nullable    |
| DeletedByPc   | string   | Nullable                 |

### Indexes

- Primary Key: Id
- Unique Index: (KanbanBoardId, UserId)
- Foreign Key Index: KanbanBoardId
- Foreign Key Index: UserId
- Foreign Key Index: CreatedById
- Foreign Key Index: UpdatedById
- Foreign Key Index: DeletedById

---

## Security Considerations

1. **Authentication**: All endpoints require authentication
2. **Authorization**: CRUD operations require specific permissions
3. **Data Validation**: All inputs validated before processing
4. **Audit Trail**: All changes logged with user and timestamp
5. **Soft Delete**: Preserves data integrity and audit history
6. **Foreign Key Constraints**: Prevent orphaned records

---

## Testing Scenarios

### Positive Tests

1. Add member with valid data
2. Update member role
3. View all members
4. View members by board
5. Delete member (soft delete)
6. Retrieve member by ID

### Negative Tests

1. Add member with non-existent board
2. Add member with non-existent user
3. Add duplicate membership
4. Update to create duplicate
5. Delete non-existent member
6. Add member with invalid role
7. Access without proper permissions

---

## Related Entities

- **KanbanBoard**: Parent entity representing the board
- **ApplicationUser**: User entity representing the member
- **KanbanBoardRole**: Enum defining member roles

---

## Enum: KanbanBoardRole

```csharp
public enum KanbanBoardRole
{
    Owner = 1,    // Full control over the board including deletion and ownership transfer
    Admin = 2,    // Can view, edit, manage members, and configure board settings
    Editor = 3,   // Can view and edit board content (cards, columns, labels)
    Viewer = 4    // Read-only access - can only view board content
}
```

### Role Permissions Matrix

| Permission | Owner | Admin | Editor | Viewer |
|------------|-------|-------|--------|--------|
| View board content | ✅ | ✅ | ✅ | ✅ |
| Create/Edit cards | ✅ | ✅ | ✅ | ❌ |
| Create/Edit columns | ✅ | ✅ | ✅ | ❌ |
| Create/Edit labels | ✅ | ✅ | ✅ | ❌ |
| Manage members | ✅ | ✅ | ❌ | ❌ |
| Configure board settings | ✅ | ✅ | ❌ | ❌ |
| Archive/Unarchive board | ✅ | ✅ | ❌ | ❌ |
| Delete board | ✅ | ❌ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ |

---

## Future Enhancements

1. **Role-Based Permissions**: Implement granular permissions based on member role
2. **Invitation System**: Send email invitations to new members
3. **Member Activity**: Track member activity and contributions
4. **Bulk Operations**: Add/remove multiple members at once
5. **Member Transfer**: Transfer ownership between members
6. **Access History**: Log member access to boards

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** HR Management System Team  
**Status:** Implemented
