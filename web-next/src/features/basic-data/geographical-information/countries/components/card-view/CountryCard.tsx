import {
  BadgePercentage,
  CreatedDateRow,
  EntityCard,
  HighlightBadge,
  QualityMeter,
} from "@/shared/components/cards";
import { useTheme } from "@mui/material";
import { format } from "date-fns";
import CountryCardChips from "./CountryCardChips";
import CountryDetails from "./CountryDetails";
import CountryCardFooter from "./CountryCardFooter";
import CountryStatesSection from "./CountryStatesSection";
import { getQualityScore, getQualityLevel } from "./CountryCardUtils";
import type { CountryCardProps } from "./CountryCard.types";

const CountryCard = ({
  country,
  index,
  isHovered,
  isHighlighted,
  highlightLabel,
  onEdit,
  onDelete,
  onView,
  onHover,
}: Omit<CountryCardProps, "t">) => {
  const theme = useTheme();

  const qualityScore = getQualityScore(country);
  const qualityInfo = getQualityLevel(qualityScore, theme);

  const endBadge = (
    <BadgePercentage
      value={qualityScore}
      highlighted={isHighlighted}
      color={qualityInfo.color}
    />
  );

  const startBadge =
    isHighlighted && highlightLabel ? (
      <HighlightBadge label={highlightLabel} />
    ) : undefined;

  const chips = <CountryCardChips country={country} />;

  const content = (
    <>
      <CountryDetails
        phoneCode={country.phoneCode}
        currencyCode={country.currencyCode}
      />

      <CountryStatesSection country={country} />

      <QualityMeter score={qualityScore} title="Data Quality" />

      <CreatedDateRow
        date={country.createdOn ? new Date(country.createdOn) : null}
        formatter={(d) => format(d, "MMM dd, yyyy")}
      />
    </>
  );

  const footer = (
    <CountryCardFooter
      country={country}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );

  return (
    <EntityCard
      index={index}
      highlighted={isHighlighted}
      isHovered={isHovered}
      onMouseEnter={() => onHover(country.id)}
      onMouseLeave={() => onHover(null)}
      height={420}
      endBadge={endBadge}
      startBadge={startBadge}
      title={country.nameEn || "N/A"}
      subtitle={country.nameAr || undefined}
      chips={chips}
      content={content}
      footer={footer}
    />
  );
};

export default CountryCard;
