using HrManagementSystem.Domain.Employees.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Employees;

public sealed class EmployeeContractConfiguration : IEntityTypeConfiguration<EmployeeContract>
{
    public void Configure(EntityTypeBuilder<EmployeeContract> builder)
    {
        builder.ToTable("EmployeeContracts");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });

        builder.Property(x => x.ContractNumber).HasMaxLength(50).IsRequired();
        builder.Property(x => x.StatusReason).HasMaxLength(500);

        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.ContractNumber }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.EmployeeId });
    }
}
