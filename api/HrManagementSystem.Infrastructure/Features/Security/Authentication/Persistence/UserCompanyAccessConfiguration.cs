using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Persistence;

public sealed class UserCompanyAccessConfiguration : IEntityTypeConfiguration<UserCompanyAccess>
{
    public void Configure(EntityTypeBuilder<UserCompanyAccess> builder)
    {
        builder.ToTable("UserCompanyAccesses");
        builder.HasKey(access => new { access.UserId, access.CompanyId });

        builder.HasOne(access => access.User)
            .WithMany(user => user.CompanyAccesses)
            .HasForeignKey(access => access.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(access => access.Company)
            .WithMany()
            .HasForeignKey(access => new { access.TenantId, access.CompanyId })
            .HasPrincipalKey(company => new { company.TenantId, company.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}
