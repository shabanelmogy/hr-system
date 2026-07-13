import { CardView } from "@/shared/components/card-view";
import { Stack, useTheme } from "@mui/material";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { AppChip } from "@/shared/components/common";
import {
  BadgePercentage,
  CreatedDateRow,
  HighlightBadge,
  InfoIconText,
  QualityMeter,
} from "@/shared/components/card-view/card-body/UnifiedCardParts";
import { QrCode2, LocationCity } from "@mui/icons-material";
import DistrictCardFooter from "./DistrictCardFooter";
import { getQualityScore, getQualityLevel } from "./DistrictCardUtils";
import type { DistrictCardProps } from "./DistrictCard.types";

const DistrictCard = ({
  district,
  index,
  isHovered,
  isHighlighted,
  highlightLabel,
  onEdit,
  onDelete,
  onView,
  onHover,
}: DistrictCardProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const qualityScore = getQualityScore(district);
  const qualityInfo = getQualityLevel(qualityScore, theme);

  const topRightBadge = (
    <BadgePercentage value={qualityScore} highlighted={isHighlighted} color={qualityInfo.color} />
  );

  const leftBadge =
    isHighlighted && highlightLabel ? <HighlightBadge label={highlightLabel} /> : undefined;

  const chips = (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}>
      {district.code && (
        <AppChip label={district.code} colorKey="primary" variant="soft" monospace bold />
      )}
      <AppChip
        label={`ID: ${district.id}`}
        colorKey="secondary"
        variant="outlined"
        monospace
        sx={{ fontSize: "0.7rem" }}
      />
    </Stack>
  );

  const content = (
    <>
      <div style={{ marginBottom: 8 }}>
        <InfoIconText
          icon={<QrCode2 sx={{ fontSize: 16, color: "text.secondary" }} />}
          primary={`${t("states.stateCode") || "Code"}: ${district.code || "N/A"}`}
          mb={1}
        />
        <InfoIconText
          icon={<LocationCity sx={{ fontSize: 16, color: "text.secondary" }} />}
          primary={`${t("states.countryName") || "State"}: ${district.state?.nameEn || "N/A"}`}
          mb={1}
        />
      </div>

      <QualityMeter score={qualityScore} title={t("general.dataQuality") || "Data Quality"} />

      <CreatedDateRow
        date={district.createdOn ? new Date(district.createdOn) : null}
        formatter={(d) => format(d, "MMM dd, yyyy")}
      />
    </>
  );

  const footer = (
    <DistrictCardFooter district={district} onView={onView} onEdit={onEdit} onDelete={onDelete} />
  );

  return (
    <CardView
      index={index}
      highlighted={isHighlighted}
      isHovered={isHovered}
      onMouseEnter={() => onHover(district.id)}
      onMouseLeave={() => onHover(null)}
      height={420}
      topRightBadge={topRightBadge}
      leftBadge={leftBadge}
      title={district.nameEn || "N/A"}
      subtitle={district.nameAr || undefined}
      chips={chips}
      content={content}
      footer={footer}
    />
  );
};

export default DistrictCard;
