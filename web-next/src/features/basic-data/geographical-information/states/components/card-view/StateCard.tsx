import { CardView } from "@/shared/components/cards/view";
import { Stack, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import AppChip from "@/shared/components/cards/AppChip";
import {
  BadgePercentage,
  CreatedDateRow,
  QualityMeter,
  HighlightBadge,
} from "@/shared/components/cards/view/card-body/UnifiedCardParts";
import StateCodeRow from "./StateCodeRow";
import CountryPill from "./CountryPill";
import StateCardFooter from "./StateCardFooter";
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
  onView,
  onHover,
}: StateCardProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const qualityScore = getQualityScore(state);
  const qualityInfo = getQualityLevel(qualityScore, theme);
  const isRTL = theme.direction === "rtl";
  const hasAr = !!state.nameAr;
  const hasEn = !!state.nameEn;
  const primaryTitle = isRTL ? (state.nameAr || state.nameEn || "N/A") : (state.nameEn || state.nameAr || "N/A");
  const secondaryTitle = hasAr && hasEn ? (isRTL ? state.nameEn : state.nameAr) : undefined;

  const topRightBadge = (
    <BadgePercentage
      value={qualityScore}
      highlighted={isHighlighted}
      color={qualityInfo.color}
    />
  );

  const leftBadge =
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
        label={`ID: ${state.id}`}
        colorKey="secondary"
        variant="outlined"
        monospace
        sx={{ fontSize: "0.7rem" }}
      />
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

      <QualityMeter score={qualityScore} />

      <CreatedDateRow
        date={state.createdOn ? new Date(state.createdOn) : null}
        formatter={(d) => format(d, "MMM dd, yyyy")}
      />
    </>
  );

  const footer = (
    <StateCardFooter
      state={state}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );

  return (
    <CardView
      index={index}
      highlighted={isHighlighted}
      isHovered={isHovered}
      onMouseEnter={() => onHover(state.id)}
      onMouseLeave={() => onHover(null)}
      height={370}
      topRightBadge={topRightBadge}
      leftBadge={leftBadge}
      title={primaryTitle}
      subtitle={secondaryTitle}
      chips={chips}
      content={content}
      footer={footer}
    />
  );
};

export default StateCard;
