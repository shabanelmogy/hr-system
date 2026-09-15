using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Employees.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Modules.HR.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class InterviewParticipantConfiguration : IEntityTypeConfiguration<InterviewParticipant>
{
    public void Configure(EntityTypeBuilder<InterviewParticipant> builder)
    {
        builder.ToTable("InterviewParticipants");
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => new { x.InterviewId, x.EmployeeId }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.InterviewId });

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.EmployeeId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}
