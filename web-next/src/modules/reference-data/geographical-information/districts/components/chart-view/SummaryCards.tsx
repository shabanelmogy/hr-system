import { MetricCard } from "@/shared/components/cards";
import { Apartment, LocationOn, Public, Visibility } from "@mui/icons-material";
import { Grid } from "@mui/material";
import { useTranslation } from "react-i18next";

interface SummaryCardsProps {
  totalMatchingDistricts: number;
  visibleDistricts: number;
  visibleStates: number;
  visibleAddresses: number;
}

const SummaryCards = ({
  totalMatchingDistricts,
  visibleDistricts,
  visibleStates,
  visibleAddresses,
}: SummaryCardsProps) => {
  const { t } = useTranslation();
  const cards = [
    {
      title: t("districts.dashboard.totalMatching"),
      value: totalMatchingDistricts,
      icon: LocationOn,
      color: "primary" as const,
    },
    {
      title: t("districts.dashboard.visibleDistricts"),
      value: visibleDistricts,
      icon: Visibility,
      color: "info" as const,
    },
    {
      title: t("districts.dashboard.statesOnPage"),
      value: visibleStates,
      icon: Public,
      color: "secondary" as const,
    },
    {
      title: t("districts.dashboard.addressesOnPage"),
      value: visibleAddresses,
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
