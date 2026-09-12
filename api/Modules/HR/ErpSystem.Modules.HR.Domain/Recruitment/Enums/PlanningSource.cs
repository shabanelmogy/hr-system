namespace ErpSystem.Modules.HR.Domain.Recruitment.Enums;

/// <summary>
/// Frozen V1 provenance for requisition capacity. Legacy is assigned only by
/// the server for pre-bridge records and compatibility-mode creates.
/// </summary>
public enum PlanningSource
{
    Planned = 1,
    Legacy = 2
}
