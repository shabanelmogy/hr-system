using HrManagementSystem.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class ApplicationStatusHistoryConfiguration : IEntityTypeConfiguration<ApplicationStatusHistory>
{
    public void Configure(EntityTypeBuilder<ApplicationStatusHistory> builder)
    {
        builder.ToTable("ApplicationStatusHistories");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Reason).HasMaxLength(1000);

        builder.HasIndex(x => x.EmploymentApplicationId);
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.EmploymentApplicationId });
    }
}
