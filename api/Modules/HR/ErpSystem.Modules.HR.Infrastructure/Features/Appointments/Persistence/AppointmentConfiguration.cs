using ErpSystem.Modules.HR.Domain.Appointments.Entities;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Appointments.Persistence;

public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        builder.Property(x => x.Start).IsRequired();

        builder.Property(x => x.End).IsRequired();

        builder.Property(x => x.IsAllDay).IsRequired();

        builder.Property(x => x.Text).IsRequired().HasMaxLength(200);
    }
}
