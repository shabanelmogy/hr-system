BEGIN TRANSACTION;
IF OBJECT_ID(N'[dbo].[WorkforcePlanLines]', N'U') IS NULL
    THROW 51010, 'WorkforcePlanLines must exist before repairing its legacy schema.', 1;

IF OBJECT_ID(N'[dbo].[WorkforcePlans]', N'U') IS NULL
    THROW 51011, 'WorkforcePlans must exist before repairing its legacy schema.', 1;

IF EXISTS (SELECT 1 FROM [dbo].[WorkforcePlanLines])
   AND EXISTS
   (
       SELECT 1
       FROM sys.columns
       WHERE [object_id] = OBJECT_ID(N'[dbo].[WorkforcePlanLines]')
         AND [name] IN
         (
             N'EstimatedSalary',
             N'EstimatedRecruitmentCost',
             N'Q1Target',
             N'Q2Target',
             N'Q3Target',
             N'Q4Target'
         )
   )
    THROW 51012, 'Legacy WorkforcePlanLines columns contain an unknown data contract. Empty the pre-release table or migrate its data explicitly before continuing.', 1;

IF EXISTS (SELECT 1 FROM [dbo].[WorkforcePlans])
   AND EXISTS
   (
       SELECT 1
       FROM sys.columns
       WHERE [object_id] = OBJECT_ID(N'[dbo].[WorkforcePlans]')
         AND [name] IN
         (
             N'SubmittedByEmployeeId',
             N'ApprovedByEmployeeId',
             N'ReviewNotes'
         )
   )
    THROW 51013, 'Legacy WorkforcePlans columns contain an unknown data contract. Empty the pre-release table or migrate its data explicitly before continuing.', 1;

DECLARE @dropDefaults nvarchar(max) = N'';
SELECT @dropDefaults +=
    N'ALTER TABLE [dbo].' + QUOTENAME(OBJECT_NAME(dc.parent_object_id)) +
    N' DROP CONSTRAINT ' + QUOTENAME(dc.[name]) + N';'
FROM sys.default_constraints AS dc
INNER JOIN sys.columns AS c
    ON c.[object_id] = dc.parent_object_id
   AND c.column_id = dc.parent_column_id
WHERE dc.parent_object_id IN
      (OBJECT_ID(N'[dbo].[WorkforcePlanLines]'), OBJECT_ID(N'[dbo].[WorkforcePlans]'))
  AND c.[name] IN
      (
          N'NewHireSlots',
          N'EstimatedSalary',
          N'EstimatedRecruitmentCost',
          N'Q1Target',
          N'Q2Target',
          N'Q3Target',
          N'Q4Target',
          N'SubmittedByEmployeeId',
          N'ApprovedByEmployeeId',
          N'ReviewNotes'
      );

IF @dropDefaults <> N'' EXEC sys.sp_executesql @dropDefaults;

IF COL_LENGTH(N'dbo.WorkforcePlanLines', N'EstimatedSalary') IS NOT NULL
    ALTER TABLE [dbo].[WorkforcePlanLines] DROP COLUMN [EstimatedSalary];
IF COL_LENGTH(N'dbo.WorkforcePlanLines', N'EstimatedRecruitmentCost') IS NOT NULL
    ALTER TABLE [dbo].[WorkforcePlanLines] DROP COLUMN [EstimatedRecruitmentCost];
IF COL_LENGTH(N'dbo.WorkforcePlanLines', N'Q1Target') IS NOT NULL
    ALTER TABLE [dbo].[WorkforcePlanLines] DROP COLUMN [Q1Target];
IF COL_LENGTH(N'dbo.WorkforcePlanLines', N'Q2Target') IS NOT NULL
    ALTER TABLE [dbo].[WorkforcePlanLines] DROP COLUMN [Q2Target];
IF COL_LENGTH(N'dbo.WorkforcePlanLines', N'Q3Target') IS NOT NULL
    ALTER TABLE [dbo].[WorkforcePlanLines] DROP COLUMN [Q3Target];
IF COL_LENGTH(N'dbo.WorkforcePlanLines', N'Q4Target') IS NOT NULL
    ALTER TABLE [dbo].[WorkforcePlanLines] DROP COLUMN [Q4Target];

IF COL_LENGTH(N'dbo.WorkforcePlans', N'SubmittedByEmployeeId') IS NOT NULL
    ALTER TABLE [dbo].[WorkforcePlans] DROP COLUMN [SubmittedByEmployeeId];
IF COL_LENGTH(N'dbo.WorkforcePlans', N'ApprovedByEmployeeId') IS NOT NULL
    ALTER TABLE [dbo].[WorkforcePlans] DROP COLUMN [ApprovedByEmployeeId];
IF COL_LENGTH(N'dbo.WorkforcePlans', N'ReviewNotes') IS NOT NULL
    ALTER TABLE [dbo].[WorkforcePlans] DROP COLUMN [ReviewNotes];

IF EXISTS
   (
       SELECT 1
       FROM sys.columns
       WHERE [object_id] = OBJECT_ID(N'[dbo].[WorkforcePlanLines]')
         AND [name] = N'BranchId'
         AND is_nullable = 0
   )
    ALTER TABLE [dbo].[WorkforcePlanLines] ALTER COLUMN [BranchId] int NULL;

IF EXISTS
   (
       SELECT 1
       FROM sys.columns
       WHERE [object_id] = OBJECT_ID(N'[dbo].[WorkforcePlanLines]')
         AND [name] = N'DivisionId'
         AND is_nullable = 1
   )
BEGIN
    IF EXISTS (SELECT 1 FROM [dbo].[WorkforcePlanLines] WHERE [DivisionId] IS NULL)
        THROW 51014, 'DivisionId contains NULL values and cannot be made required.', 1;

    ALTER TABLE [dbo].[WorkforcePlanLines] ALTER COLUMN [DivisionId] int NOT NULL;
END;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260906095027_RepairWorkforcePlanLinesLegacySchema', N'10.0.9');

COMMIT;
GO

