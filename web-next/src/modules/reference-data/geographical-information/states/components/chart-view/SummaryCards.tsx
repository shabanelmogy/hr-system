import { MetricCard } from "@/shared/components/cards";
import { Apartment, LocationOn, Public, Visibility } from "@mui/icons-material";
import { Grid } from "@mui/material";
import { useTranslation } from "react-i18next";

interface SummaryCardsProps {
  totalMatchingStates: number;
  visibleStates: number;
  visibleCountries: number;
  visibleDistricts: number;
}

const SummaryCards = ({
  totalMatchingStates,
  visibleStates,
  visibleCountries,
  visibleDistricts,
}: SummaryCardsProps) => {
  const { t } = useTranslation();
  const cards = [
    {
      title: t("states.dashboard.totalMatching"),
      value: totalMatchingStates,
      icon: LocationOn,
      color: "primary" as const,
    },
    {
      title: t("states.dashboard.visibleStates"),
      value: visibleStates,
      icon: Visibility,
      color: "info" as const,
    },
    {
      title: t("states.dashboard.countriesOnPage"),
      value: visibleCountries,
      icon: Public,
      color: "secondary" as const,
    },
    {
      title: t("states.dashboard.districtsOnPage"),
      value: visibleDistricts,
      icon: Apartment,
      color: "success" as const,
    },
  ];

  return (
    <Grid container spacing={0.75} sx={{ mb: 0.75 }}>
      {cards.map((card) => (
        <Grid
          size={{ xs: 12, sm: 6, md: 3 }}
          sx={{ display: "flex", minWidth: 0, "& > *": { width: "100%" } }}
          key={card.title}
        >
          <MetricCard
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            gradient
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
