using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Modules.Accounting.Infrastructure.Messaging;

internal sealed class InboxMessageConfiguration : IEntityTypeConfiguration<InboxMessage>
{
    public void Configure(EntityTypeBuilder<InboxMessage> builder)
    {
        builder.ToTable("InboxMessages");
        builder.HasKey(message => new { message.ConsumerName, message.EventId });

        builder.Property(message => message.ConsumerName)
            .HasMaxLength(256)
            .IsRequired();
        builder.Property(message => message.EventName)
            .HasMaxLength(256)
            .IsRequired();
        builder.Property(message => message.EventVersion)
            .IsRequired();
        builder.Property(message => message.CorrelationId)
            .HasMaxLength(256);
        builder.Property(message => message.CausationId)
            .HasMaxLength(256);
        builder.Property(message => message.Status)
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();
        builder.Property(message => message.LastError)
            .HasMaxLength(4000);
        builder.Property(message => message.RowVersion)
            .IsRowVersion();

        builder.HasIndex(message => new { message.Status, message.LastAttemptOnUtc });
    }
}
