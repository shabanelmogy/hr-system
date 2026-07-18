namespace HrManagementSystem.Shared.Consts;

public static class Permissions
{
    public static string Type { get; } = "Permissions";

    public const string ViewAddresses = "Addresses:View";
    public const string CreateAddresses = "Addresses:Create";
    public const string EditAddresses = "Addresses:Edit";
    public const string DeleteAddresses = "Addresses:Delete";

    public const string ViewAddressTypes = "AddressTypes:View";
    public const string CreateAddressTypes = "AddressTypes:Create";
    public const string EditAddressTypes = "AddressTypes:Edit";
    public const string DeleteAddressTypes = "AddressTypes:Delete";

    public const string ViewApiKeys = "ApiKeys:View";
    public const string CreateApiKeys = "ApiKeys:Create";
    public const string EditApiKeys = "ApiKeys:Edit";
    public const string DeleteApiKeys = "ApiKeys:Delete";

    public const string ViewBackups = "Backups:View";
    public const string CreateBackups = "Backups:Create";
    public const string RestoreBackups = "Backups:Restore";
    public const string DeleteBackups = "Backups:Delete";

    public const string ViewCategories = "Categories:View";
    public const string CreateCategories = "Categories:Create";
    public const string EditCategories = "Categories:Edit";
    public const string DeleteCategories = "Categories:Delete";

    public const string ViewCountries = "Countries:View";
    public const string CreateCountries = "Countries:Create";
    public const string EditCountries = "Countries:Edit";
    public const string DeleteCountries = "Countries:Delete";

    public const string ViewDistricts = "Districts:View";
    public const string CreateDistricts = "Districts:Create";
    public const string EditDistricts = "Districts:Edit";
    public const string DeleteDistricts = "Districts:Delete";

    public const string ViewChangeLogs = "ChangeLogs:View";
    public const string ViewHangfireDashboard = "Hangfire:View";
    public const string ManageDatabaseViews = "DatabaseViews:Manage";

    public const string ViewLocalizations = "Localizations:View";
    public const string CreateLocalizations = "Localizations:Create";
    public const string EditLocalizations = "Localizations:Edit";
    public const string DeleteLocalizations = "Localizations:Delete";

    public const string ViewReportsCategories = "ReportsCategories:View";
    public const string CreateReportsCategories = "ReportsCategories:Create";
    public const string EditReportsCategories = "ReportsCategories:Edit";
    public const string DeleteReportsCategories = "ReportsCategories:Delete";

    public const string ViewRoles = "Roles:View";
    public const string CreateRoles = "Roles:Create";
    public const string EditRoles = "Roles:Edit";
    public const string DeleteRoles = "Roles:Delete";

    public const string ViewStates = "States:View";
    public const string CreateStates = "States:Create";
    public const string EditStates = "States:Edit";
    public const string DeleteStates = "States:Delete";

    public const string ViewSubCategories = "SubCategories:View";
    public const string CreateSubCategories = "SubCategories:Create";
    public const string EditSubCategories = "SubCategories:Edit";
    public const string DeleteSubCategories = "SubCategories:Delete";

    // Kanban Boards Permissions
    public const string ViewKanbanBoards = "KanbanBoards:View";
    public const string CreateKanbanBoards = "KanbanBoards:Create";
    public const string EditKanbanBoards = "KanbanBoards:Edit";
    public const string DeleteKanbanBoards = "KanbanBoards:Delete";

    // Kanban Columns Permissions
    public const string ViewKanbanColumns = "KanbanColumns:View";
    public const string CreateKanbanColumns = "KanbanColumns:Create";
    public const string EditKanbanColumns = "KanbanColumns:Edit";
    public const string DeleteKanbanColumns = "KanbanColumns:Delete";

    // Kanban Cards Permissions
    public const string ViewKanbanCards = "KanbanCards:View";
    public const string CreateKanbanCards = "KanbanCards:Create";
    public const string EditKanbanCards = "KanbanCards:Edit";
    public const string DeleteKanbanCards = "KanbanCards:Delete";

    // Kanban Card Assignees Permissions
    public const string ViewKanbanCardAssignees = "KanbanCardAssignees:View";
    public const string CreateKanbanCardAssignees = "KanbanCardAssignees:Create";
    public const string EditKanbanCardAssignees = "KanbanCardAssignees:Edit";
    public const string DeleteKanbanCardAssignees = "KanbanCardAssignees:Delete";

    // Kanban Card Attachments Permissions
    public const string ViewKanbanCardAttachments = "KanbanCardAttachments:View";
    public const string CreateKanbanCardAttachments = "KanbanCardAttachments:Create";
    public const string EditKanbanCardAttachments = "KanbanCardAttachments:Edit";
    public const string DeleteKanbanCardAttachments = "KanbanCardAttachments:Delete";

    // Board Task Attachments Permissions
    public const string ViewBoardTaskAttachments = "BoardTaskAttachments:View";
    public const string CreateBoardTaskAttachments = "BoardTaskAttachments:Create";
    public const string EditBoardTaskAttachments = "BoardTaskAttachments:Edit";
    public const string DeleteBoardTaskAttachments = "BoardTaskAttachments:Delete";

    // Kanban Card Comments Permissions
    public const string ViewKanbanCardComments = "KanbanCardComments:View";
    public const string CreateKanbanCardComments = "KanbanCardComments:Create";
    public const string EditKanbanCardComments = "KanbanCardComments:Edit";
    public const string DeleteKanbanCardComments = "KanbanCardComments:Delete";

    // Board Task Comments Permissions
    public const string ViewBoardTaskComments = "BoardTaskComments:View";
    public const string CreateBoardTaskComments = "BoardTaskComments:Create";
    public const string EditBoardTaskComments = "BoardTaskComments:Edit";
    public const string DeleteBoardTaskComments = "BoardTaskComments:Delete";

    // Kanban Labels Permissions
    public const string ViewKanbanLabels = "KanbanLabels:View";
    public const string CreateKanbanLabels = "KanbanLabels:Create";
    public const string EditKanbanLabels = "KanbanLabels:Edit";
    public const string DeleteKanbanLabels = "KanbanLabels:Delete";

    // Kanban Board Members Permissions
    public const string ViewKanbanBoardMembers = "KanbanBoardMembers:View";
    public const string CreateKanbanBoardMembers = "KanbanBoardMembers:Create";
    public const string EditKanbanBoardMembers = "KanbanBoardMembers:Edit";
    public const string DeleteKanbanBoardMembers = "KanbanBoardMembers:Delete";

    public const string ViewUsers = "Users:View";
    public const string CreateUsers = "Users:Create";
    public const string EditUsers = "Users:Edit";
    public const string DeleteUsers = "Users:Delete";

    // Chat User Permissions
    public const string ViewChatUsers = "ChatUsers:View";
    public const string CreateChatUsers = "ChatUsers:Create";
    public const string EditChatUsers = "ChatUsers:Edit";
    public const string DeleteChatUsers = "ChatUsers:Delete";

    // Conversation Permissions
    public const string ViewConversations = "Conversations:View";
    public const string CreateConversations = "Conversations:Create";
    public const string EditConversations = "Conversations:Edit";
    public const string DeleteConversations = "Conversations:Delete";

    // Message Permissions
    public const string ViewMessages = "Messages:View";
    public const string CreateMessages = "Messages:Create";
    public const string EditMessages = "Messages:Edit";
    public const string DeleteMessages = "Messages:Delete";

    // Chat General Permissions
    public const string AccessChat = "Chat:Access";
    public const string ModerateChat = "Chat:Moderate";
    public const string ViewChatAnalytics = "Chat:ViewAnalytics";

    public static IReadOnlyList<string> GetAllPermissions() =>
        typeof(Permissions).GetFields()
            .Select(field => field.GetValue(null))
            .OfType<string>()
            .ToList();

}
