# Kanban System (Frontend) Implementation Guide

Purpose
- Define a complete plan to build the Kanban system UI with Material UI in the frontend project.
- Align strictly with backend user stories and endpoints from backend/HrManagementSystem/Docs/User Stories/KanbanBoard.
- Standardize folder structure, types, routes, services, React Query hooks, and UI components.

Tech stack
- React + TypeScript
- Material UI (MUI)
- TanStack Query
- Axios ApiService (existing: src/shared/services/apiService.js)
- i18n (existing)

Backend coverage (per docs)
- Boards: KanbanBoard
- Columns: KanbanColumn
- Cards: KanbanCard
- Labels: KanbanLabel
- Board Members: KanbanBoardMember
- Card Assignees: KanbanCardAssignee
- Card Labels: KanbanCardLabel
- Card Comments: KanbanCardComment
- Card Attachments: KanbanCardAttachment
- Board Tasks: BoardTask
- Board Task Comments: BoardTaskComment
- Board Task Attachments: BoardTaskAttachment

Note on routing styles
- Backend docs expose two patterns:
  1) REST-like lowercase: e.g., /api/v1/kanbanboards, /kanbancolumns, /kanbancards
  2) Controller/Action (PascalCase): e.g., /api/v1/KanbanLabels/Add, /KanbanCardComments/GetByCardId/card/{cardId}
- Keep the routes in frontend/src/routes/apiRoutes.tsx matching backend endpoints exactly.

1) Project structure (frontend)
- src/features/kanban/
  - boards/
    - components/
    - hooks/
    - services/
    - types/
    - utils/
    - index.ts
  - columns/
    - components/ hooks/ services/ types/ utils/ index.ts
  - cards/
    - components/ hooks/ services/ types/ utils/ index.ts
  - labels/
  - members/
  - assignees/
  - cardLabels/
  - comments/
  - attachments/
  - boardTasks/
  - boardTaskComments/
  - boardTaskAttachments/
  - pages/
    - BoardsListPage.tsx
    - BoardViewPage.tsx
  - GUIDE/

2) API Routes additions (src/routes/apiRoutes.tsx)
Add sections mirroring backend endpoints. Keep exact paths (mixed styles allowed by docs).
- kanbanBoards (REST):
  - getAll: /api/v1/kanbanboards
  - getById: (id) => /api/v1/kanbanboards/{id}
  - add: /api/v1/kanbanboards
  - update: /api/v1/kanbanboards
  - delete: (id) => /api/v1/kanbanboards/{id}
- kanbanColumns (REST):
  - getAll: /api/v1/kanbancolumns
  - getById: (id) => /api/v1/kanbancolumns/{id}
  - add: /api/v1/kanbancolumns
  - update: /api/v1/kanbancolumns
  - delete: (id) => /api/v1/kanbancolumns/{id}
- kanbanCards (REST):
  - getAll: /api/v1/kanbancards
  - getById: (id) => /api/v1/kanbancards/{id}
  - add: /api/v1/kanbancards
  - update: /api/v1/kanbancards
  - delete: (id) => /api/v1/kanbancards/{id}
- kanbanLabels (Controller/Action):
  - getAll: /api/v1/KanbanLabels/GetAll
  - getById: (id) => /api/v1/KanbanLabels/GetById/{id}
  - add: /api/v1/KanbanLabels/Add
  - update: /api/v1/KanbanLabels/Update
  - delete: (id) => /api/v1/KanbanLabels/Delete/{id}
- kanbanBoardMembers (REST):
  - getAll: /api/v1/kanbanboardmembers
  - getById: (id) => /api/v1/kanbanboardmembers/{id}
  - getByBoard: (boardId) => /api/v1/kanbanboardmembers/board/{boardId}
  - add: /api/v1/kanbanboardmembers
  - update: /api/v1/kanbanboardmembers
  - delete: (id) => /api/v1/kanbanboardmembers/{id}
- kanbanCardAssignees (REST):
  - getAll: /api/v1/kanbancardassignees
  - getById: (id) => /api/v1/kanbancardassignees/{id}
  - getByCard: (cardId) => /api/v1/kanbancardassignees/card/{cardId}
  - getByUser: (userId) => /api/v1/kanbancardassignees/user/{userId}
  - add: /api/v1/kanbancardassignees
  - update: /api/v1/kanbancardassignees
  - delete: (id) => /api/v1/kanbancardassignees/{id}
- kanbanCardLabels (REST):
  - getAll: /api/v1/kanbancardlabels
  - getById: (id) => /api/v1/kanbancardlabels/{id}
  - getByCard: (cardId) => /api/v1/kanbancardlabels/card/{cardId}
  - add: /api/v1/kanbancardlabels
  - update: /api/v1/kanbancardlabels
  - delete: (id) => /api/v1/kanbancardlabels/{id}
- kanbanCardComments (Controller/Action):
  - getAll: /api/v1/KanbanCardComments/GetAll
  - getById: (id) => /api/v1/KanbanCardComments/GetById/{id}
  - getByCard: (cardId) => /api/v1/KanbanCardComments/GetByCardId/card/{cardId}
  - add: /api/v1/KanbanCardComments/Add
  - update: /api/v1/KanbanCardComments/Update
  - delete: (id) => /api/v1/KanbanCardComments/Delete/{id}
- kanbanCardAttachments (REST):
  - getAll: /api/v1/kanbancardattachments
  - getById: (id) => /api/v1/kanbancardattachments/{id}
  - getByCard: (cardId) => /api/v1/kanbancardattachments/card/{cardId}
  - add: /api/v1/kanbancardattachments
  - update: /api/v1/kanbancardattachments
  - delete: (id) => /api/v1/kanbancardattachments/{id}
- boardTasks (Controller/Action):
  - getAll: /api/v1/BoardTasks/GetAll
  - getById: (id) => /api/v1/BoardTasks/GetById/{id}
  - add: /api/v1/BoardTasks/Add
  - update: /api/v1/BoardTasks/Update
  - delete: (id) => /api/v1/BoardTasks/Delete/{id}
- boardTaskComments (Controller/Action):
  - getAll: /api/v1/BoardTaskComments/GetAll
  - getById: (id) => /api/v1/BoardTaskComments/GetById/{id}
  - getByTask: (taskId) => /api/v1/BoardTaskComments/GetByTaskId/task/{taskId}
  - add: /api/v1/BoardTaskComments/Add
  - update: /api/v1/BoardTaskComments/Update
  - delete: (id) => /api/v1/BoardTaskComments/Delete/{id}
- boardTaskAttachments (REST):
  - getAll: /api/v1/boardtaskattachments
  - getById: (id) => /api/v1/boardtaskattachments/{id}
  - getByTask: (taskId) => /api/v1/boardtaskattachments/task/{taskId}
  - add: /api/v1/boardtaskattachments
  - update: /api/v1/boardtaskattachments
  - delete: (id) => /api/v1/boardtaskattachments/{id}

3) TypeScript types (feature-local)
Define request/response interfaces per doc. Key properties:
- Common: id (string | number), createdOn, updatedOn, isDeleted
- KanbanBoard: id, name, description, isArchived, backgroundColor?, columns[], labels[], members[], tasks[]
- KanbanColumn: id, kanbanBoardId, name, order, isArchived, cards[]
- KanbanCard: id, kanbanColumnId, title, description?, order, dueDate?, isArchived, assignees[], cardLabels[], comments[], attachments[]
- KanbanLabel: id, kanbanBoardId, name, colorHex
- KanbanBoardMember: id, kanbanBoardId, userId, role
- KanbanCardAssignee: id, kanbanCardId, userId
- KanbanCardLabelLink: id, kanbanCardId, kanbanLabelId
- KanbanCardComment: id, kanbanCardId, commentText, userId, userName, userEmail, createdOn, updatedOn
- KanbanCardAttachment: id, kanbanCardId, uploadedFileId, fileName, fileUrl, contentType, fileSize?, uploadedOn
- BoardTask: id, title, description?, status, priority, dueDate?, estimatedHours?, loggedHours?, assigneeId?, position, kanbanBoardId?, kanbanColumnId?
- BoardTaskComment, BoardTaskAttachment similar to card comment/attachment

4) Services per entity
- Pattern: use ApiService + ApiHelper extractValue/extractValues.
- Implement CRUD via endpoints above.
- Special operations:
  - Reordering columns/cards: update Order (and column reference for cross-column moves). Batch operations may be added later; for now call Update for each changed item.
  - List by parent id: getByBoard, getByCard, getByUser, getByTask.

5) React Query hooks
- Keys: e.g., kanbanBoardKeys, columnKeys, cardKeys, etc.
- List/detail queries + mutations with invalidation of respective all/list keys.
- Prefetch patterns: prefetch board detail when navigating from list.
- StaleTime defaults: 5 minutes for list/detail caches.

6) UI pages and components (MUI)
A) BoardsListPage
- Grid/list of boards with Card components
- Actions: Create, Edit, Archive toggle, Delete with soft-delete rules
- Filters: Archived vs Active
- Dialog for create/edit with validation: Name (3..100), Description (3..500)

B) BoardViewPage (core kanban)
- Layout: MUI Box with horizontal scroll of columns
- Columns
  - Header with column name, menu (rename, archive, delete), add card button
  - Cards stack (MUI Paper/Card)
  - DnD support for reordering and cross-column move (@hello-pangea/dnd recommended)
  - Update card/column order via Update endpoint
- Card
  - Compact view: title, label chips (colorHex), due date, assignees (AvatarGroup)
  - Click opens CardDetailsDialog
- CardDetailsDialog
  - Tabs: Details, Comments, Attachments
  - Details: title, description, labels picker, assignees picker, due date, archive toggle
  - Comments: list, add/edit/delete (creator-only)
  - Attachments: list, upload (via UploadedFile + link)
- Labels management (board scope)
  - Drawer/Dialog to manage board labels (create/update/delete)
  - Color picker (validate hex #RRGGBB)
- Members management (board scope)
  - Dialog to assign users with roles (Owner/Admin/Editor/Viewer)
  - Enforce unique (boardId + userId)

C) Optional: Tasks integration
- Board tasks (distinct from cards) can be surfaced on a side panel or separate tab in BoardViewPage.
- Support CRUD and comments/attachments similar to cards.

7) Permissions mapping
- Boards: ViewKanbanBoards, CreateKanbanBoards, EditKanbanBoards, DeleteKanbanBoards
- Columns: ViewKanbanColumns, CreateKanbanColumns, EditKanbanColumns, DeleteKanbanColumns
- Cards: ViewKanbanCards, CreateKanbanCards, EditKanbanCards, DeleteKanbanCards
- Labels: ViewKanbanLabels, CreateKanbanLabels, EditKanbanLabels, DeleteKanbanLabels
- Members: ViewKanbanBoardMembers, CreateKanbanBoardMembers, EditKanbanBoardMembers, DeleteKanbanBoardMembers
- Assignees: ViewKanbanCardAssignees, CreateKanbanCardAssignees, EditKanbanCardAssignees, DeleteKanbanCardAssignees
- CardLabels: ViewKanbanCardLabels, CreateKanbanCardLabels, EditKanbanCardLabels, DeleteKanbanCardLabels
- Comments: ViewKanbanCardComments, CreateKanbanCardComments, EditKanbanCardComments, DeleteKanbanCardComments
- Attachments: ViewKanbanCardAttachments, CreateKanbanCardAttachments, EditKanbanCardAttachments, DeleteKanbanCardAttachments
- BoardTasks: See BoardTasks doc (temporary perms use KanbanBoards perms)
- BoardTaskComments/Attachments: See docs for specific perms

8) Validation rules (UI)
- Boards: Name 3..100, Description 3..500, BackgroundColor optional (#RRGGBB optional)
- Columns: BoardId > 0, Name 3..100, Order >= 0
- Cards: ColumnId > 0, Title 3..200, Description <= 1000, Order >= 0, DueDate optional
- Labels: BoardId > 0, Name 2..100, ColorHex ^#[0-9A-Fa-f]{6}$, unique per board
- Members: BoardId > 0, UserId non-empty, Role in [1..4], unique (board+user)
- Assignees: CardId > 0, UserId non-empty, unique (card+user)
- CardLabels: CardId > 0, LabelId > 0, unique (card+label)
- CardComments: CardId > 0, Text 1..2000, creator-only edit/delete
- CardAttachments: CardId > 0, UploadedFileId > 0, unique (card+file)
- Tasks: Title 3..200, enums within ranges, non-negative hours

9) Drag-and-Drop behavior
- Reorder within column: Update card order values for affected cards.
- Move across columns: Update card.kanbanColumnId and reassign order.
- Optimistic UI: Apply reorder locally, call mutations per updated card; invalidate card list for the board upon success. Rollback on error.
- Columns reorder (if required): Similar approach updating Order field.

10) Comments and attachments workflows
- Card comments
  - List: GET KanbanCardComments/GetByCardId/card/{cardId}
  - Create/Update/Delete: enforce creator-only on Update/Delete (403)
  - UI: MUI List with avatars, timestamps, edit in place, soft delete awareness
- Card attachments
  - Upload file using existing file upload flow (UploadedFile)
  - Link file to card using kanbancardattachments endpoints
  - UI: list with file type icons, size, uploadedOn; remove links via delete
- Board task comments/attachments mirror the card flows with BoardTask endpoints

11) i18n and RTL
- Use t('...') keys; mirror countries feature pattern
- Chip/Badge colors must maintain contrast in dark/light modes; validate colorHex
- Ensure drag-and-drop works in RTL (test and adjust directions)

12) Error handling & toasts
- Use showToast and extractErrorMessage
- Surface 404s, 409 duplicates, and 400 validation messages from backend
- Soft delete messaging consistent with other features

13) Performance and UX
- Cache board detail with staleTime (5 min)
- Virtualize long card lists if needed
- Debounce drag updates to reduce API chatter on rapid moves
- Batch updates can be introduced later (server support)

14) Testing scenarios (derived from backend docs)
- Positive and negative tests for each entity (create/update/delete/list/detail)
- Permissions checks per endpoint
- Reordering and cross-column drag behavior
- Creator-only comment updates/deletes (403)
- Unique constraints: members, assignees, labels on cards, attachments

15) Implementation checklist
- Routes: Add all Kanban-related endpoints to apiRoutes.tsx
- Types: Create per-entity types under src/features/kanban/*/types
- Services: Implement CRUD services under src/features/kanban/*/services
- Hooks: Create React Query hooks under src/features/kanban/*/hooks
- Pages: Implement BoardsListPage, BoardViewPage
- Components: Columns, Cards, Dialogs (create/edit), Comments panel, Attachments panel, Labels and Members dialogs
- DnD: Integrate @hello-pangea/dnd for cards (and columns if needed)
- Permissions: Wire to usePermissions and guard actions
- i18n: Add translations
- QA: Run scenario tests above

Appendix: Minimal entity field references from backend
- Refer to backend docs under backend/HrManagementSystem/Docs/User Stories/KanbanBoard for request/response examples and rules. Ensure your TypeScript types align with these contracts.

Notes
- Where backend uses controller/action routes, keep exact casing and paths in apiRoutes.
- For missing batch reorder endpoints, use Update on affected entities; coordinate with backend for future bulk APIs.
- Use soft delete conventions consistently and hide IsDeleted items in UI queries.
