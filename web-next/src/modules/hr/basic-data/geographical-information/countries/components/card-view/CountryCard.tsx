import {
  BadgePercentage,
  CreatedDateRow,
  EntityCard,
  HighlightBadge,
  QualityMeter,
} from "@/shared/components/cards";
import { useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
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
  onRestore,
  onView,
  onHover,
  permissions,
  selected,
  onSelectedChange,
}: Omit<CountryCardProps, "t">) => {
  const theme = useTheme();
  const { i18n, t } = useTranslation();

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

      <CountryStatesSection statesCount={country.statesCount} />

      <QualityMeter score={qualityScore} title={t("countries.dashboard.dataQuality")} />

      <CreatedDateRow
        date={country.createdOn ? new Date(country.createdOn) : null}
        formatter={(date) => new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "medium" }).format(date)}
      />
    </>
  );

  const footer = (
    <CountryCardFooter
      country={country}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onRestore={onRestore}
      permissions={permissions}
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
      title={theme.direction === "rtl" ? country.nameAr : country.nameEn}
      subtitle={theme.direction === "rtl" ? country.nameEn : country.nameAr}
      chips={chips}
      content={content}
      footer={footer}
      selected={selected}
      selectionLabel={t("countries.cardSelectionAriaLabel", {
        name: theme.direction === "rtl" ? country.nameAr : country.nameEn,
      })}
      onSelectedChange={onSelectedChange}
    />
  );
};

export default CountryCard;
