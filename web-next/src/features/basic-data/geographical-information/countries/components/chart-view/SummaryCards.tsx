import { MetricCard } from '@/shared/components/cards';
import { Assessment, LocationOn, Public, Visibility } from "@mui/icons-material";
import { Grid } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

interface SummaryCardsProps {
  totalMatchingCountries: number;
  visibleCountries: number;
  visibleCurrencies: number;
  visibleStates: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalMatchingCountries,
  visibleCountries,
  visibleCurrencies,
  visibleStates,
}) => {
  const { t } = useTranslation();
  const cards = [
    {
      title: t("countries.dashboard.totalMatching"),
      value: totalMatchingCountries,
      icon: Public,
      color: "primary" as const,
    },
    {
      title: t("countries.dashboard.visibleCountries"),
      value: visibleCountries,
      icon: Visibility,
      color: "info" as const,
    },
    {
      title: t("countries.dashboard.statesOnPage"),
      value: visibleStates,
      icon: LocationOn,
      color: "secondary" as const,
    },
    {
      title: t("countries.dashboard.currenciesOnPage"),
      value: visibleCurrencies,
      icon: Assessment,
      color: "success" as const,
    },
  ];

  return (
    <Grid container spacing={0.75} sx={{ mb: 0.75 }}>
      {cards.map((card, index) => (
        <Grid
          size={{ xs: 12, sm: 6, md: 3 }}
          sx={{ display: "flex", minWidth: 0, "& > *": { width: "100%" } }}
          key={index}
        >
          <MetricCard
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            gradient={true}
            size="small"
            compact
            elevation={2}
            formatValue={(value) => String(value)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default SummaryCards;
