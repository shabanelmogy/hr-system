import {
  AppChip,
  BadgePercentage,
  CreatedDateRow,
  EntityCard,
  HighlightBadge,
  QualityMeter,
} from "@/shared/components/cards";
import { Stack, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { useTranslation } from "react-i18next";
import StateCodeRow from "./StateCodeRow";
import CountryPill from "./CountryPill";
import StateCardFooter from "./StateCardFooter";
import StateDistrictsSection from "./StateDistrictsSection";
import type { StateCardProps } from "./StateCard.types";
import { getQualityScore, getQualityLevel } from "./StateCardUtils";


const StateCard = ({
  state,
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
}: StateCardProps) => {
  const { i18n, t } = useTranslation();
  const theme = useTheme();

  const qualityScore = getQualityScore(state);
  const qualityInfo = getQualityLevel(qualityScore, theme);
  const isRTL = theme.direction === "rtl";
  const hasAr = !!state.nameAr;
  const hasEn = !!state.nameEn;
  const primaryTitle = isRTL ? (state.nameAr || state.nameEn || "N/A") : (state.nameEn || state.nameAr || "N/A");
  const secondaryTitle = hasAr && hasEn ? (isRTL ? state.nameEn : state.nameAr) : undefined;

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

  const chips = (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}>
      {state.code && (
        <AppChip
          label={state.code}
          colorKey="primary"
          variant="soft"
          monospace
          bold
        />
      )}
      <AppChip
        label={`${t("general.id")}: ${state.id}`}
        colorKey="secondary"
        variant="outlined"
        monospace
        sx={{ fontSize: "0.7rem" }}
      />
      {state.isDeleted && (
        <AppChip label={t("states.status.archived")} colorKey="error" variant="soft" bold />
      )}
    </Stack>
  );

  const content = (
    <>
      <Box sx={{ mb: 2 }}>
        {state.country && (
          <CountryPill
            id={state.countryId}
            nameEn={state.country.nameEn}
            nameAr={state.country.nameAr}
          />
        )}

        <StateCodeRow label={t("states.code")} code={state.code} />
      </Box>

      <StateDistrictsSection districtsCount={state.districtsCount} />

      <QualityMeter score={qualityScore} title={t("states.dashboard.dataQuality")} />

      <CreatedDateRow
        date={state.createdOn ? new Date(state.createdOn) : null}
        formatter={(date) => new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "medium" }).format(date)}
      />
    </>
  );

  const footer = (
    <StateCardFooter
      state={state}
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
      onMouseEnter={() => onHover(state.id)}
      onMouseLeave={() => onHover(null)}
      height={420}
      endBadge={endBadge}
      startBadge={startBadge}
      title={primaryTitle}
      subtitle={secondaryTitle}
      chips={chips}
      content={content}
      footer={footer}
      selected={selected}
      selectionLabel={t("states.cardSelectionAriaLabel", { name: primaryTitle })}
      onSelectedChange={onSelectedChange}
    />
  );
};

export default StateCard;
