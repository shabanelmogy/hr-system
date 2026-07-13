import { MetricCard } from '@/shared/components/charts';
import { Assessment, DonutLarge, LocationOn, Public } from '@mui/icons-material';
import { Grid } from '@mui/material';
import React from 'react';

interface SummaryCardsProps {
  totalStates: number;
  totalCountries: number;
  avgStatesPerCountry: number;
  completionRate: number;
  t: (key: string) => string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalStates,
  totalCountries,
  avgStatesPerCountry,
  completionRate,
  t
}) => {
  const cards = [
    {
      title: t("states.dashboard.totalStates") || "Total States",
      value: totalStates,
      icon: LocationOn,
      color: 'primary' as const,
    },
    {
      title: t("states.dashboard.uniqueCountries") || "Countries",
      value: totalCountries,
      icon: Public,
      color: 'secondary' as const,
    },
    {
      title: t("states.dashboard.avgStatesPerCountry") || "Avg/Country",
      value: avgStatesPerCountry,
      icon: Assessment,
      color: 'success' as const,
    },
    {
      title: t("states.dashboard.dataQuality") || "Data Quality",
      value: `${completionRate}%`,
      icon: DonutLarge,
      color: 'warning' as const,
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
            formatValue={(value) => value.toString()}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryCards;