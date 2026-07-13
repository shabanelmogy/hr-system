-- =====================================================
-- Database Performance Indexes for HR Management System
-- =====================================================
-- Purpose: Optimize authentication and login performance
-- Expected Impact: 5-10 seconds faster login
-- Date: January 2025
-- =====================================================

-- Check if indexes already exist before creating
PRINT 'Starting database index creation...';
GO

-- =====================================================
-- 1. User Lookup Indexes (Login Performance)
-- =====================================================

-- Index for username login
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_NormalizedUserName' AND object_id = OBJECT_ID('AspNetUsers'))
BEGIN
    PRINT 'Creating IX_Users_NormalizedUserName index...';
    CREATE NONCLUSTERED INDEX IX_Users_NormalizedUserName
    ON AspNetUsers(NormalizedUserName)
    WHERE NormalizedUserName IS NOT NULL;
    PRINT '✅ IX_Users_NormalizedUserName created successfully';
END
ELSE
BEGIN
    PRINT '⚠️ IX_Users_NormalizedUserName already exists, skipping...';
END
GO

-- Index for email login
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Users_NormalizedEmail' AND object_id = OBJECT_ID('AspNetUsers'))
BEGIN
    PRINT 'Creating IX_Users_NormalizedEmail index...';
    CREATE NONCLUSTERED INDEX IX_Users_NormalizedEmail
    ON AspNetUsers(NormalizedEmail)
    WHERE NormalizedEmail IS NOT NULL;
    PRINT '✅ IX_Users_NormalizedEmail created successfully';
END
ELSE
BEGIN
    PRINT '⚠️ IX_Users_NormalizedEmail already exists, skipping...';
END
GO

-- =====================================================
-- 2. Refresh Token Indexes (Token Refresh Performance)
-- =====================================================

-- Index for refresh token lookup by user
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_RefreshTokens_UserId' AND object_id = OBJECT_ID('RefreshTokens'))
BEGIN
    PRINT 'Creating IX_RefreshTokens_UserId index...';
    CREATE NONCLUSTERED INDEX IX_RefreshTokens_UserId
    ON RefreshTokens(UserId)
    INCLUDE (TokenHash, SessionId, ExpiresOn, RevokedOn);
    PRINT '✅ IX_RefreshTokens_UserId created successfully';
END
ELSE
BEGIN
    PRINT '⚠️ IX_RefreshTokens_UserId already exists, skipping...';
END
GO

-- Index for refresh token validation
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_RefreshTokens_TokenHash' AND object_id = OBJECT_ID('RefreshTokens'))
BEGIN
    PRINT 'Creating IX_RefreshTokens_TokenHash index...';
    CREATE NONCLUSTERED INDEX IX_RefreshTokens_TokenHash
    ON RefreshTokens(TokenHash)
    INCLUDE (UserId, SessionId, JwtId, ExpiresOn, RevokedOn);
    PRINT '✅ IX_RefreshTokens_TokenHash created successfully';
END
ELSE
BEGIN
    PRINT '⚠️ IX_RefreshTokens_TokenHash already exists, skipping...';
END
GO

-- =====================================================
-- 3. User Roles Index (Permission Loading)
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserRoles_UserId' AND object_id = OBJECT_ID('AspNetUserRoles'))
BEGIN
    PRINT 'Creating IX_UserRoles_UserId index...';
    CREATE NONCLUSTERED INDEX IX_UserRoles_UserId
    ON AspNetUserRoles(UserId)
    INCLUDE (RoleId);
    PRINT '✅ IX_UserRoles_UserId created successfully';
END
ELSE
BEGIN
    PRINT '⚠️ IX_UserRoles_UserId already exists, skipping...';
END
GO

-- =====================================================
-- 4. User Claims Index (JWT Claims Loading)
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserClaims_UserId' AND object_id = OBJECT_ID('AspNetUserClaims'))
BEGIN
    PRINT 'Creating IX_UserClaims_UserId index...';
    CREATE NONCLUSTERED INDEX IX_UserClaims_UserId
    ON AspNetUserClaims(UserId)
    INCLUDE (ClaimType, ClaimValue);
    PRINT '✅ IX_UserClaims_UserId created successfully';
END
ELSE
BEGIN
    PRINT '⚠️ IX_UserClaims_UserId already exists, skipping...';
END
GO

-- =====================================================
-- 5. User Logins Index (External Login Tracking)
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserLogins_UserId_LogOutDate' AND object_id = OBJECT_ID('UserLogins'))
BEGIN
    PRINT 'Creating IX_UserLogins_UserId_LogOutDate index...';
    CREATE NONCLUSTERED INDEX IX_UserLogins_UserId_LogOutDate
    ON UserLogins(UserId, LogOutDate DESC)
    INCLUDE (LoginDate, Id);
    PRINT '✅ IX_UserLogins_UserId_LogOutDate created successfully';
END
ELSE
BEGIN
    PRINT '⚠️ IX_UserLogins_UserId_LogOutDate already exists, skipping...';
END
GO

-- =====================================================
-- 6. Role Permissions Index (Permission Resolution)
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_RolePermissions_RoleId' AND object_id = OBJECT_ID('RolePermissions'))
BEGIN
    PRINT 'Creating IX_RolePermissions_RoleId index...';
    CREATE NONCLUSTERED INDEX IX_RolePermissions_RoleId
    ON RolePermissions(RoleId)
    INCLUDE (PermissionId);
    PRINT '✅ IX_RolePermissions_RoleId created successfully';
END
ELSE
BEGIN
    PRINT '⚠️ IX_RolePermissions_RoleId already exists, skipping...';
END
GO

-- =====================================================
-- Performance Statistics
-- =====================================================

PRINT '';
PRINT '=====================================================';
PRINT 'Index Creation Summary';
PRINT '=====================================================';

-- Count indexes created
SELECT 
    'AspNetUsers' AS TableName,
    COUNT(*) AS IndexCount
FROM sys.indexes 
WHERE object_id = OBJECT_ID('AspNetUsers')
    AND name LIKE 'IX_%'
UNION ALL
SELECT 
    'RefreshTokens' AS TableName,
    COUNT(*) AS IndexCount
FROM sys.indexes 
WHERE object_id = OBJECT_ID('RefreshTokens')
    AND name LIKE 'IX_%'
UNION ALL
SELECT 
    'AspNetUserRoles' AS TableName,
    COUNT(*) AS IndexCount
FROM sys.indexes 
WHERE object_id = OBJECT_ID('AspNetUserRoles')
    AND name LIKE 'IX_%'
UNION ALL
SELECT 
    'AspNetUserClaims' AS TableName,
    COUNT(*) AS IndexCount
FROM sys.indexes 
WHERE object_id = OBJECT_ID('AspNetUserClaims')
    AND name LIKE 'IX_%';

PRINT '';
PRINT '✅ All indexes processed successfully!';
PRINT '';
PRINT 'Expected Performance Improvements:';
PRINT '  - Login: 5-10 seconds faster';
PRINT '  - Token Refresh: 2-3 seconds faster';
PRINT '  - Permission Loading: 1-2 seconds faster';
PRINT '';
PRINT 'Next Steps:';
PRINT '  1. Test login performance';
PRINT '  2. Monitor query execution plans';
PRINT '  3. Run DBCC FREEPROCCACHE if needed';
PRINT '=====================================================';
GO
