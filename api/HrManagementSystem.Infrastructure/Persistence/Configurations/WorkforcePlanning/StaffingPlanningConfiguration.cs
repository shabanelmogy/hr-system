using HrManagementSystem.Domain.WorkforcePlanning.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.WorkforcePlanning;

public sealed class EnvelopeAmendmentConfiguration : IEntityTypeConfiguration<EnvelopeAmendment>
{
    public void Configure(EntityTypeBuilder<EnvelopeAmendment> builder)
    {
        builder.ToTable("EnvelopeAmendments");
        builder.HasKey(amendment => amendment.Id);
        builder.HasAlternateKey(amendment => new { amendment.TenantId, amendment.CompanyId, amendment.Id });
        builder.Property(amendment => amendment.Justification).HasMaxLength(2000).IsRequired();
        builder.Property(amendment => amendment.AdditionalSalaryCost).HasColumnType("decimal(18,2)");
        builder.Property(amendment => amendment.Status).HasConversion<int>();
        builder.Property(amendment => amendment.DecisionReason).HasMaxLength(2000);
        builder.Property(amendment => amendment.RequestedById).HasMaxLength(450);
        builder.Property(amendment => amendment.SubmittedById).HasMaxLength(450);
        builder.Property(amendment => amendment.ApprovedById).HasMaxLength(450);
        builder.Property(amendment => amendment.RejectedById).HasMaxLength(450);
        builder.HasIndex(amendment => new { amendment.TenantId, amendment.CompanyId, amendment.Status });
        builder.HasOne<PositionEnvelope>()
            .WithMany()
            .HasForeignKey(amendment => new { amendment.TenantId, amendment.CompanyId, amendment.EnvelopeId })
            .HasPrincipalKey(envelope => new { envelope.TenantId, envelope.CompanyId, envelope.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class StaffingRequestConfiguration : IEntityTypeConfiguration<StaffingRequest>
{
    public void Configure(EntityTypeBuilder<StaffingRequest> builder)
    {
        builder.ToTable("StaffingRequests");
        builder.HasKey(request => request.Id);
        builder.HasAlternateKey(request => new { request.TenantId, request.CompanyId, request.Id });
        builder.Property(request => request.EstimatedAnnualSalaryPerSlot).HasColumnType("decimal(18,2)");
        builder.Property(request => request.EstimatedFiscalYearCostPerSlot).HasColumnType("decimal(18,2)");
        builder.Property(request => request.TotalReservedCost).HasColumnType("decimal(18,2)");
        builder.Property(request => request.Justification).HasMaxLength(2000).IsRequired();
        builder.Property(request => request.CurrencyCode).HasMaxLength(3).IsRequired();
        builder.Property(request => request.CalculationPolicyVersion).HasMaxLength(20).IsRequired();
        builder.Property(request => request.Status).HasConversion<int>();
        builder.Property(request => request.RequestType).HasConversion<int>();
        builder.Property(request => request.Priority).HasConversion<int>();
        builder.Property(request => request.CloseReason).HasConversion<int?>();
        builder.Property(request => request.DecisionReason).HasMaxLength(2000);
        builder.Property(request => request.SubmittedById).HasMaxLength(450);
        builder.Property(request => request.ApprovedById).HasMaxLength(450);
        builder.Property(request => request.RejectedById).HasMaxLength(450);
        builder.Ignore(request => request.RemainingAllocatable);
        builder.Ignore(request => request.RemainingToHire);
        builder.Ignore(request => request.ReleasableHeadcount);
        builder.Ignore(request => request.ReleasableCost);
        builder.HasIndex(request => new { request.TenantId, request.CompanyId, request.EnvelopeId });
        builder.HasIndex(request => new { request.TenantId, request.CompanyId, request.Status });
        builder.HasOne<PositionEnvelope>()
            .WithMany()
            .HasForeignKey(request => new { request.TenantId, request.CompanyId, request.EnvelopeId })
            .HasPrincipalKey(envelope => new { envelope.TenantId, envelope.CompanyId, envelope.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}
