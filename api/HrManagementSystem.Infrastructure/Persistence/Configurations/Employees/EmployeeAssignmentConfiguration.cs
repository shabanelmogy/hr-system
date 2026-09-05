using HrManagementSystem.Domain.Employees.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Employees;

public sealed class EmployeeAssignmentConfiguration : IEntityTypeConfiguration<EmployeeAssignment>
{
    public void Configure(EntityTypeBuilder<EmployeeAssignment> builder)
    {
        builder.ToTable("EmployeeAssignments");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });

        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.EmployeeId });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.PositionId });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.BranchId });
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.DepartmentId });
    }
}
