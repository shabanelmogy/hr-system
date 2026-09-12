namespace ErpSystem.Modules.HR.Presentation.Security.Authorization.Filters;

/// <summary>
/// Wire-compatible HR alias. New modules should consume the shared BuildingBlock
/// attribute directly instead of referencing HR.Presentation.
/// </summary>
public class HasPermissionAttribute(string permission)
    : ErpSystem.BuildingBlocks.Authorization.HasPermissionAttribute(permission);
