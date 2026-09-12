import { MetricCard } from "@/shared/components/cards";
import { Apartment, LocationOn, Visibility, Warehouse } from "@mui/icons-material";
import { Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { SummaryCardsProps } from "./AddressTypeChart.types";

const SummaryCards = ({
  totalMatchingAddressTypes,
  visibleAddressTypes,
  visibleWithAddresses,
  visibleWithoutAddresses,
}: SummaryCardsProps) => {
  const { t } = useTranslation();
  const cards = [
    {
      title: t("addressTypes.dashboard.totalMatching"),
      value: totalMatchingAddressTypes,
      icon: LocationOn,
      color: "primary" as const,
    },
    {
      title: t("addressTypes.dashboard.visibleAddressTypes"),
      value: visibleAddressTypes,
      icon: Visibility,
      color: "info" as const,
    },
    {
      title: t("addressTypes.dashboard.withAddressesOnPage"),
      value: visibleWithAddresses,
      icon: Apartment,
      color: "secondary" as const,
    },
    {
      title: t("addressTypes.dashboard.withoutAddressesOnPage"),
      value: visibleWithoutAddresses,
      icon: Warehouse,
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
