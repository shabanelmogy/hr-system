using HrManagementSystem.Features.Appointments.Entities;

namespace HrManagementSystem.Features.Appointments.Persistence;

public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        builder.Property(x => x.Start).IsRequired();

        builder.Property(x => x.End).IsRequired();

        builder.Property(x => x.Text).IsRequired().HasMaxLength(400);
    }
}
