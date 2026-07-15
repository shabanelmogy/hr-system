using HrManagementSystem.Features.Platform.Notifications.Entities;

namespace HrManagementSystem.Features.Platform.Notifications.Persistence;

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");
        builder.HasKey(notification => notification.Id);

        builder.Property(notification => notification.RecipientUserId).HasMaxLength(450).IsRequired();
        builder.Property(notification => notification.ActorUserId).HasMaxLength(450);
        builder.Property(notification => notification.RequiredPermission).HasMaxLength(150).IsRequired();
        builder.Property(notification => notification.Category).HasMaxLength(100).IsRequired();
        builder.Property(notification => notification.EventType).HasMaxLength(150).IsRequired();
        builder.Property(notification => notification.TitleKey).HasMaxLength(150).IsRequired();
        builder.Property(notification => notification.MessageKey).HasMaxLength(150).IsRequired();
        builder.Property(notification => notification.ParametersJson).HasMaxLength(2000).IsRequired();
        builder.Property(notification => notification.EntityType).HasMaxLength(100);
        builder.Property(notification => notification.EntityId).HasMaxLength(100);
        builder.Property(notification => notification.ActionUrl).HasMaxLength(500);
        builder.Property(notification => notification.DeduplicationKey).HasMaxLength(250);
        builder.Property(notification => notification.Severity).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(notification => notification.RecipientUser)
            .WithMany()
            .HasForeignKey(notification => notification.RecipientUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(notification => notification.ActorUser)
            .WithMany()
            .HasForeignKey(notification => notification.ActorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(notification => new
        {
            notification.RecipientUserId,
            notification.CreatedOn,
            notification.Id
        });

        builder.HasIndex(notification => new { notification.RecipientUserId, notification.ReadOn })
            .HasFilter("[DismissedOn] IS NULL AND [ReadOn] IS NULL");

        builder.HasIndex(notification => new { notification.RecipientUserId, notification.DeduplicationKey })
            .IsUnique()
            .HasFilter("[DeduplicationKey] IS NOT NULL");
    }
}
