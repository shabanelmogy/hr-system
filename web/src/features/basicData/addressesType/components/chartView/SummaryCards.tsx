import { MetricCard } from '@/shared/components/charts';
import { Assessment, Language, Schedule, TextFields } from '@mui/icons-material';
import { Grid } from '@mui/material';
import React from 'react';
import { SummaryCardsProps } from './AddressTypeChart.types';

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalAddressTypes,
  completeAddressTypes,
  recentAddressTypes,
  averageNameLength,
  t
}) => {
  const cards = [
    {
      title: t("addressTypes.dashboard.totalAddressTypes") || "Total Address Types",
      value: totalAddressTypes,
      icon: Assessment,
      color: 'primary' as const,
    },
    {
      title: t("addressTypes.dashboard.completeProfiles") || "Complete Profiles",
      value: completeAddressTypes,
      icon: Language,
      color: 'success' as const,
    },
    {
      title: t("addressTypes.dashboard.recentlyAdded") || "Recently Added",
      value: recentAddressTypes,
      icon: Schedule,
      color: 'info' as const,
    },
    {
      title: t("addressTypes.dashboard.avgNameLength") || "Avg Name Length",
      value: averageNameLength,
      icon: TextFields,
      color: 'secondary' as const,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cards.map((card, index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <MetricCard
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            gradient={true}
            size="medium"
            elevation={2}
            formatValue={(value) => 
              card.title.includes("Length") ? `${value.toFixed(1)} chars` : value.toString()
            }
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryCards;