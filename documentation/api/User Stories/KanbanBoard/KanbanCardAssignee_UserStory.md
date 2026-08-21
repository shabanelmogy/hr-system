# Kanban Card Assignee Management - User Story

## Feature Overview
Manage assignees for Kanban cards. This feature allows assigning users to specific cards to track responsibility and workload distribution. Each card can have multiple assignees, and users can be assigned to multiple cards across different boards.

---

## User Stories

### US-001: View All Kanban Card Assignees
**As a** user with appropriate permissions  
**I want to** view all Kanban card assignees across all cards  
**So that** I can see who is assigned to which tasks

**Acceptance Criteria:**
- User can see a list of all non-deleted card assignees
- Each assignee shows: card title, user name, user email, assignment date
- Only users with `ViewKanbanCardAssignees` permission can access
- Deleted assignees are excluded from the list
- Results include related card and user information

**Technical Notes:**
- Endpoint: `GET /api/v1/kanbancardassignees`
- Returns: `IEnumerable<KanbanCardAssigneeResponse>`
- Includes navigation properties for Card and User

---

### US-002: View Kanban Card Assignee by ID
**As a** user  
**I want to** view details of a specific card assignee  
**So that** I can see their assignment information

**Acceptance Criteria:**
- User can retrieve a single card assignee by ID
- Returns complete assignee information including card and user details
- Returns 404 if assignee not found or deleted
- No special permission required (authenticated users only)

**Technical Notes:**
- Endpoint: `GET /api/v1/kanbancardassignees/{id}`
- Returns: `Result<KanbanCardAssigneeResponse>`
- Status Codes: 200 (Success), 404 (Not Found)

---

### US-003: View Assignees by Card ID
**As a** user with appropriate permissions  
**I want to** view all assignees of a specific Kanban card  
**So that** I can see who is responsible for that task

**Acceptance Criteria:**
- User can retrieve all assignees for a specific card
- Only non-deleted assignees are returned
- Results include user details
- Only users with `ViewKanbanCardAssignees` permission can access
- Empty list returned if card has no assignees

**Technical Notes:**
- Endpoint: `GET /api/v1/kanbancardassignees/card/{cardId}`
- Returns: `IEnumerable<KanbanCardAssigneeResponse>`
- Filters by card ID and IsDeleted = false

---

### US-004: View Assignees by User ID
**As a** user with appropriate permissions  
**I want to** view all cards assigned to a specific user  
**So that** I can see their workload and responsibilities

**Acceptance Criteria:**
- User can retrieve all card assignments for a specific user
- Only non-deleted assignments are returned
- Results include card details
- Only users with `ViewKanbanCardAssignees` permission can access
- Empty list returned if user has no assignments

**Technical Notes:**
- Endpoint: `GET /api/v1/kanbancardassignees/user/{userId}`
- Returns: `IEnumerable<KanbanCardAssigneeResponse>`
- Filters by user ID and IsDeleted = false

---

### US-005: Assign User to Kanban Card
**As a** user with appropriate permissions  
**I want to** assign a user to a Kanban card  
**So that** they are responsible for completing the task

**Acceptance Criteria:**
- User can assign a member by providing: card ID and user ID
- System validates that the card exists and is not deleted
- System validates that the user exists and is not deleted
- System prevents duplicate assignments (same user + card combination)
- Only users with `CreateKanbanCardAssignees` permission can assign
- Returns complete assignee information after creation

**Validation Rules:**
- KanbanCardId: Required, must be greater than 0, card must exist
- UserId: Required, not empty, user must exist
- Unique constraint: No duplicate (CardId + UserId) combinations

**Technical Notes:**
- Endpoint: `POST /api/v1/kanbancardassignees`
- Returns: `Result<KanbanCardAssigneeResponse>`
- Status Codes: 201 (Created), 404 (Card/User Not Found), 409 (Duplicate)

---

### US-006: Update Kanban Card Assignee
**As a** user with appropriate permissions  
**I want to** update a card assignee's assignment  
**So that** I can reassign tasks or change card assignments

**Acceptance Criteria:**
- User can update card ID or user ID
- System validates assignee exists
- System validates new card exists (if changed)
- System validates new user exists (if changed)
- System prevents duplicate assignments after update
- System logs all changes for audit purposes
- Only users with `EditKanbanCardAssignees` permission can update
- Returns updated assignee information

**Validation Rules:**
- Same validation as Assign operation
- Cannot create duplicate assignment through update
- Assignee ID must exist

**Technical Notes:**
- Endpoint: `PUT /api/v1/kanbancardassignees`
- Returns: `Result<KanbanCardAssigneeResponse>`
- Status Codes: 200 (Success), 404 (Not Found), 409 (Duplicate)
- Change logging enabled via IEntityChangeLogService

---

### US-007: Remove Assignee from Kanban Card
**As a** user with appropriate permissions  
**I want to** remove an assignee from a Kanban card  
**So that** they are no longer responsible for the task

**Acceptance Criteria:**
- User can delete a card assignee by ID
- System performs soft delete (sets IsDeleted = true)
- System records deletion metadata (who, when, from which PC)
- Deleted assignees are excluded from all queries
- Only users with `DeleteKanbanCardAssignees` permission can delete
- Returns 404 if assignee not found

**Technical Notes:**
- Endpoint: `DELETE /api/v1/kanbancardassignees/{id}`
- Returns: `Result`
- Status Codes: 204 (No Content), 404 (Not Found)
- Soft delete implementation with audit fields

---

## API Endpoints Summary

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| GET | /api/v1/kanbancardassignees | ViewKanbanCardAssignees | Get all card assignees |
| GET | /api/v1/kanbancardassignees/{id} | - | Get assignee by ID |
| GET | /api/v1/kanbancardassignees/card/{cardId} | ViewKanbanCardAssignees | Get assignees by card |
| GET | /api/v1/kanbancardassignees/user/{userId} | ViewKanbanCardAssignees | Get assignments by user |
| POST | /api/v1/kanbancardassignees | CreateKanbanCardAssignees | Assign user to card |
| PUT | /api/v1/kanbancardassignees | EditKanbanCardAssignees | Update assignee |
| DELETE | /api/v1/kanbancardassignees/{id} | DeleteKanbanCardAssignees | Remove assignee |

---

## Data Models

### KanbanCardAssigneeRequest
```csharp
{
    "id": 0,
    "kanbanCardId": 1,
    "userId": "user-guid"
}
```

### KanbanCardAssigneeResponse
```csharp
{
    "id": 1,
    "kanbanCardId": 1,
    "kanbanCardTitle": "Implement user authentication",
    "userId": "user-guid",
    "userName": "john.doe",
    "userEmail": "john.doe@example.com",
    "assignedOn": "2024-01-15T10:30:00Z",
    "createdOn": "2024-01-15T10:30:00Z",
    "updatedOn": "2024-01-20T14:45:00Z",
    "isDeleted": false
}
```

### SimpleKanbanCardAssigneeResponse
```csharp
{
    "id": 1,
    "userId": "user-guid",
    "userName": "john.doe"
}
```

---

## Business Rules

1. **Unique Assignment**: Each user can only be assigned to a card once
2. **Valid References**: Card and User must exist and not be deleted
3. **Multiple Assignees**: A card can have multiple assignees
4. **Multiple Cards**: A user can be assigned to multiple cards
5. **Soft Delete**: All deletions are soft deletes with audit trail
6. **Change Logging**: All updates are logged for audit purposes
7. **Cascade Behavior**: Restrict delete on foreign keys to prevent orphaned records
8. **Card Deletion Protection**: Cards with active assignees cannot be deleted (must remove assignees first)

---

## Validation Rules

### KanbanCardId
- Required
- Must be greater than 0
- Card must exist in database
- Card must not be deleted

### UserId
- Required
- Cannot be empty string
- User must exist in database
- User must not be deleted

### Uniqueness
- Combination of (KanbanCardId + UserId) must be unique
- Enforced at database level with composite unique index
- Validated in application layer before save

---

## Error Scenarios

### 404 Not Found
- **KanbanCardAssigneeNotFound**: Assignee with specified ID doesn't exist
- **KanbanCardNotFound**: Referenced card doesn't exist or is deleted
- **UserNotFound**: Referenced user doesn't exist or is deleted

### 409 Conflict
- **KanbanCardAssigneeExists**: User is already assigned to this card

### 400 Bad Request
- **GreaterThanZero**: Card ID must be greater than 0
- **Required**: Required field is missing
- **InvalidValues**: Card or user doesn't exist

---

## Database Schema

### Table: KanbanCardAssignees

| Column | Type | Constraints |
|--------|------|-------------|
| Id | int | Primary Key, Identity |
| KanbanCardId | int | Foreign Key, Required |
| UserId | string | Foreign Key, Required |
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
- Unique Index: (KanbanCardId, UserId) where IsDeleted = false
- Foreign Key Index: KanbanCardId
- Foreign Key Index: UserId
- Foreign Key Index: CreatedById
- Foreign Key Index: UpdatedById
- Foreign Key Index: DeletedById

### Relationships
- **KanbanCard**: Many-to-One (required)
- **ApplicationUser**: Many-to-One (required)

---

## Security Considerations

1. **Authentication**: All endpoints require authentication
2. **Authorization**: CRUD operations require specific permissions
3. **Data Validation**: All inputs validated before processing
4. **Audit Trail**: All changes logged with user and timestamp
5. **Soft Delete**: Preserves data integrity and audit history
6. **Foreign Key Constraints**: Prevent orphaned records
7. **Permission Checks**: Verify user has access to board before assigning to cards

---

## Testing Scenarios

### Positive Tests
1. Assign user to card with valid data
2. Update assignee to different card
3. Update assignee to different user
4. View all assignees
5. View assignees by card
6. View assignees by user
7. Remove assignee (soft delete)
8. Retrieve assignee by ID
9. Assign multiple users to same card
10. Assign same user to multiple cards

### Negative Tests
1. Assign user to non-existent card
2. Assign non-existent user to card
3. Assign duplicate (same user + card)
4. Update to create duplicate
5. Remove non-existent assignee
6. Access without proper permissions
7. Assign user to deleted card
8. Assign deleted user to card
9. Update with invalid card ID (0 or negative)
10. Update with empty user ID

---

## Related Entities

- **KanbanCard**: Parent entity representing the card
- **ApplicationUser**: User entity representing the assignee
- **KanbanColumn**: Indirect relationship through KanbanCard
- **KanbanBoard**: Indirect relationship through KanbanCard and KanbanColumn

---

## Workflow Examples

### Assigning a Task
1. User creates a new card in a column
2. User assigns team member(s) to the card
3. Assigned users receive notification (if implemented)
4. Assigned users can view card in their task list
5. Users work on the task and update card status

### Reassigning a Task
1. User views card assignees
2. User removes current assignee
3. User assigns new team member
4. Both users receive notifications of the change
5. New assignee takes over the task

### Workload Management
1. Manager views all assignments for a user
2. Manager identifies overloaded team members
3. Manager reassigns tasks to balance workload
4. Team members receive updated task lists

### Task Completion
1. Assignee completes the task
2. Card is moved to "Done" column
3. Assignee can be removed or kept for reference
4. Card can be archived with assignee history intact

---

## Future Enhancements

1. **Assignment Notifications**: Notify users when assigned to cards
2. **Workload Analytics**: Track and visualize user workload
3. **Assignment History**: View complete history of card assignments
4. **Bulk Assignment**: Assign multiple users to multiple cards at once
5. **Auto-Assignment**: Automatically assign cards based on rules
6. **Assignment Limits**: Set maximum number of assignments per user
7. **Assignment Requests**: Allow users to request assignment to cards
8. **Assignment Approval**: Require approval for certain assignments
9. **Time Tracking**: Track time spent by assignees on cards
10. **Assignment Comments**: Add notes when assigning/removing users
11. **Assignment Filters**: Filter cards by assignee in board view
12. **Assignment Reports**: Generate reports on assignment patterns
13. **Assignment Reminders**: Send reminders to assignees about due dates
14. **Assignment Delegation**: Allow assignees to delegate to others
15. **Assignment Capacity**: Show available capacity when assigning

---

## Performance Considerations

1. **Indexing**: Proper indexes on foreign keys and composite unique constraint
2. **Pagination**: Implement pagination for large assignee lists
3. **Lazy Loading**: Load related entities only when needed
4. **Caching**: Cache frequently accessed assignee data
5. **Query Optimization**: Use projections to reduce data transfer
6. **Eager Loading**: Use Include() for related entities when needed
7. **AsNoTracking**: Use for read-only queries

---

## Integration Points

### With Other Modules
1. **User Management**: Assignees are application users
2. **Notification System**: Send notifications for assignment changes
3. **Activity Log**: Track all assignment activities
4. **Dashboard**: Display user's assigned tasks
5. **Reporting**: Generate assignment and workload reports
6. **Calendar**: Show assigned tasks with due dates

### External Systems
1. **Email**: Send assignment notifications via email
2. **Chat**: Notify users in team chat systems
3. **Time Tracking**: Integrate with time tracking tools
4. **Calendar**: Sync assigned tasks to external calendars
5. **Project Management**: Sync with external PM tools

---

## Accessibility Considerations

1. **Keyboard Navigation**: Full keyboard support for assignment operations
2. **Screen Reader Support**: Proper ARIA labels for assignee information
3. **Color Contrast**: Ensure sufficient contrast for assignee indicators
4. **Focus Indicators**: Clear focus indicators for interactive elements
5. **Alternative Text**: Provide alt text for user avatars

---

## Localization Support

All error messages and UI text support multiple languages:
- English (en-US)
- Arabic (ar-EG)

Error messages are stored in localization JSON files and retrieved based on user's language preference.

---

## Audit Trail

All assignee operations are logged with:
- User who performed the action
- Timestamp of the action
- PC/Machine name
- Type of operation (Create, Update, Delete)
- Before and after values (for updates)

---

## Best Practices

1. **Clear Responsibility**: Assign cards to specific individuals, not teams
2. **Workload Balance**: Monitor and balance assignments across team members
3. **Communication**: Notify assignees when tasks are assigned or reassigned
4. **Due Dates**: Set realistic due dates for assigned tasks
5. **Regular Review**: Periodically review and update assignments
6. **Remove Completed**: Remove assignees from completed/archived cards
7. **Multiple Assignees**: Use sparingly; prefer single assignee for accountability
8. **Assignment Criteria**: Assign based on skills, availability, and workload

---

## Permissions Required

### ViewKanbanCardAssignees
- View all card assignees
- View assignees by card
- View assignees by user

### CreateKanbanCardAssignees
- Assign users to cards

### EditKanbanCardAssignees
- Update card assignments
- Reassign tasks

### DeleteKanbanCardAssignees
- Remove assignees from cards

---

## Business Value

1. **Accountability**: Clear ownership of tasks
2. **Workload Visibility**: See who is working on what
3. **Resource Planning**: Better allocation of team resources
4. **Progress Tracking**: Monitor individual and team progress
5. **Collaboration**: Facilitate team collaboration on tasks
6. **Transparency**: Increase visibility of work distribution
7. **Efficiency**: Reduce confusion about task ownership

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** HR Management System Team  
**Status:** Implemented
