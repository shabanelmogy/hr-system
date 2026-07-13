import { MetricCard } from '@/shared/components/charts';
import { Assessment, LocationOn, Public, TrendingUp } from '@mui/icons-material';
import { Grid } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SummaryCardsProps {
  totalCountries: number;
  totalRegions: number;
  totalCurrencies: number;
  totalStates: number;
  avgPerRegion: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalCountries,
  totalRegions,
  totalCurrencies,
  totalStates,
}) => {
  const { t } = useTranslation();
  const cards = [
    {
      title: t("countries.dashboard.totalCountries") || "Total Countries",
      value: totalCountries,
      icon: Public,
      color: 'primary' as const,
    },
    {
      title: t("countries.dashboard.totalStates") || "Total States",
      value: totalStates,
      icon: LocationOn,
      color: 'info' as const,
    },
    {
      title: t("countries.dashboard.regions") || "Regions",
      value: totalRegions,
      icon: TrendingUp,
      color: 'secondary' as const,
    },
    {
      title: t("countries.dashboard.currencies") || "Currencies",
      value: totalCurrencies,
      icon: Assessment,
      color: 'success' as const,
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