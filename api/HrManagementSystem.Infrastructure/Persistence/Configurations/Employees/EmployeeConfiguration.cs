using HrManagementSystem.Domain.Employees.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Employees;

public sealed class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.ToTable("Employees");
        builder.HasKey(x => x.Id);
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });

        builder.Property(x => x.EmployeeNumber).HasMaxLength(50).IsRequired();
        builder.Property(x => x.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.MiddleName).HasMaxLength(100);
        builder.Property(x => x.LastName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.UserId).HasMaxLength(128);
        builder.Property(x => x.StatusReason).HasMaxLength(500);

        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.EmployeeNumber }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.UserId }).IsUnique().HasFilter("[UserId] IS NOT NULL");
        builder.HasIndex(x => new { x.TenantId, x.CandidateId }).HasFilter("[CandidateId] IS NOT NULL");

        builder.HasMany(x => x.Assignments)
            .WithOne()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.EmployeeId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Contracts)
            .WithOne()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.EmployeeId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .OnDelete(DeleteBehavior.Cascade);
    }
}
