using System.Reflection;
using HrManagementSystem.Api.Features.GeographicalInformation.Countries.V1;
using HrManagementSystem.Api.Features.GeographicalInformation.Districts.V1;
using HrManagementSystem.Api.Features.GeographicalInformation.States.V1;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Infrastructure.Migrations;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace HrManagementSystem.Tests;

public sealed class PlatformGeographyAuthorizationTests
{
    [Theory]
    [InlineData(typeof(CountriesController))]
    [InlineData(typeof(StatesController))]
    [InlineData(typeof(DistrictsController))]
    public void CatalogControllers_RequireSuperAdminAndAnExplicitGeographyPermission(
        Type controllerType)
    {
        var authorization = Assert.Single(
            controllerType.GetCustomAttributes<AuthorizeAttribute>());
        Assert.Equal(AppRoles.super_admin, authorization.Roles);
        Assert.DoesNotContain(
            controllerType.GetCustomAttributes(inherit: true),
            attribute => attribute is TenantMemberAttribute);

        var platformPermissions = Permissions.GetPlatformGeographyPermissions().ToHashSet(
            StringComparer.Ordinal);
        var actions = controllerType.GetMethods(BindingFlags.Instance | BindingFlags.Public)
            .Where(method => method.GetCustomAttributes<HttpMethodAttribute>().Any())
            .ToList();

        Assert.NotEmpty(actions);
        Assert.All(actions, action =>
        {
            var permission = Assert.Single(action.GetCustomAttributes<HasPermissionAttribute>());
            Assert.Contains(permission.Policy!, platformPermissions);
        });
    }

    [Fact]
    public void PermissionCatalog_SeparatesPlatformGeographyFromTenantAssignableClaims()
    {
        var platformPermissions = Permissions.GetPlatformGeographyPermissions();
        var tenantPermissions = Permissions.GetTenantPermissions();

        Assert.Equal(12, platformPermissions.Count);
        Assert.Empty(platformPermissions.Intersect(tenantPermissions, StringComparer.Ordinal));
        Assert.All(platformPermissions, permission =>
        {
            Assert.Contains(permission, Permissions.GetAllPermissions());
            Assert.False(Permissions.IsTenantPermission(permission));
        });
        Assert.True(Permissions.IsTenantPermission(Permissions.ViewCompanyGeographicScope));
        Assert.True(Permissions.IsTenantPermission(Permissions.ManageCompanyGeographicScope));
    }

    [Fact]
    public void OwnershipMigration_IsIdempotentAndRemovesTenantGeographyClaims()
    {
        var migration = new MoveGeographyCatalogToPlatformAdministration();
        var builder = new MigrationBuilder("Microsoft.EntityFrameworkCore.SqlServer");
        typeof(MoveGeographyCatalogToPlatformAdministration)
            .GetMethod("Up", BindingFlags.Instance | BindingFlags.NonPublic)!
            .Invoke(migration, [builder]);

        var sql = Assert.Single(builder.Operations.OfType<SqlOperation>()).Sql;
        Assert.Contains("[role].[NormalizedName] = N'SUPER_ADMIN'", sql, StringComparison.Ordinal);
        Assert.Contains("NOT EXISTS", sql, StringComparison.Ordinal);
        Assert.Contains("DELETE [claim]", sql, StringComparison.Ordinal);
        Assert.Contains("AND NOT (", sql, StringComparison.Ordinal);
        Assert.Contains("/super-admin/geography/countries", sql, StringComparison.Ordinal);
        Assert.Contains("/super-admin/geography/states", sql, StringComparison.Ordinal);
        Assert.Contains("/super-admin/geography/districts", sql, StringComparison.Ordinal);

        foreach (var permission in Permissions.GetPlatformGeographyPermissions())
            Assert.Contains($"N'{permission}'", sql, StringComparison.Ordinal);
    }

    [Fact]
    public void OwnershipMigration_DownDoesNotGuessPreviousTenantAssignments()
    {
        var migration = new MoveGeographyCatalogToPlatformAdministration();
        var builder = new MigrationBuilder("Microsoft.EntityFrameworkCore.SqlServer");
        typeof(MoveGeographyCatalogToPlatformAdministration)
            .GetMethod("Down", BindingFlags.Instance | BindingFlags.NonPublic)!
            .Invoke(migration, [builder]);

        Assert.Empty(builder.Operations);
    }
}
