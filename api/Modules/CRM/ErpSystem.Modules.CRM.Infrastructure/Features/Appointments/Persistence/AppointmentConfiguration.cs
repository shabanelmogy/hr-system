namespace ErpSystem.Modules.CRM.Infrastructure.Features.Appointments.Persistence;

public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        builder.Property(x => x.TenantId).IsRequired().HasMaxLength(128);
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.CreatedById, x.Start });

        builder.Property(x => x.Start).IsRequired();

        builder.Property(x => x.End).IsRequired();

        builder.Property(x => x.IsAllDay).IsRequired();

        builder.Property(x => x.Text).IsRequired().HasMaxLength(200);
    }
}
