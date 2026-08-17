namespace HrManagementSystem.Application.Features.Platform.EntityChangeLogs.Contracts
{
    public record EntityChangeLogsResponse
    (
        string ChangeLogId,
        string EntityName,
        string Key,
        string OldValue,
        string NewValue,
        string ChangedBy,
        DateTime ChangedAt,
        string ChangedByPc
    );


}
