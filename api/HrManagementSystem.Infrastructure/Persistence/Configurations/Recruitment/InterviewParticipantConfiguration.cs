using HrManagementSystem.Domain.Recruitment.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Recruitment;

public sealed class InterviewParticipantConfiguration : IEntityTypeConfiguration<InterviewParticipant>
{
    public void Configure(EntityTypeBuilder<InterviewParticipant> builder)
    {
        builder.ToTable("InterviewParticipants");
        builder.HasKey(x => x.Id);

        builder.HasIndex(x => new { x.InterviewId, x.EmployeeId }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.InterviewId });
    }
}
