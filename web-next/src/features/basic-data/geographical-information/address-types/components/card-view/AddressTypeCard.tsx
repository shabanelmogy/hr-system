import {
  BadgePercentage,
  CreatedDateRow,
  EntityCard,
  HighlightBadge,
  QualityMeter,
} from "@/shared/components/cards";
import { useTheme } from "@mui/material";
import { format } from "date-fns";
import AddressTypeCardChips from "./AddressTypeCardChips";
import AddressTypeCardFooter from "./AddressTypeCardFooter";
import { getQualityScore, getQualityLevel } from "./AddressTypeCardUtils";
import type { AddressTypeCardProps } from "./AddressTypeCard.types";

const AddressTypeCard = ({
  addressType,
  index,
  isHovered,
  isHighlighted,
  highlightLabel,
  onEdit,
  onDelete,
  onView,
  onHover,
}: AddressTypeCardProps) => {
  const theme = useTheme();

  const qualityScore = getQualityScore(addressType);
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

  const chips = <AddressTypeCardChips addressType={addressType} />;

  const content = (
    <>
      <QualityMeter score={qualityScore} title="Data Quality" />

      <CreatedDateRow
        date={addressType.createdOn ? new Date(addressType.createdOn) : null}
        formatter={(d) => format(d, "MMM dd, yyyy")}
      />
    </>
  );

  const footer = (
    <AddressTypeCardFooter
      addressType={addressType}
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
      onMouseEnter={() => onHover(addressType.id)}
      onMouseLeave={() => onHover(null)}
      height={320}
      endBadge={endBadge}
      startBadge={startBadge}
      title={addressType.nameEn || "N/A"}
      subtitle={addressType.nameAr || undefined}
      chips={chips}
      content={content}
      footer={footer}
    />
  );
};

export default AddressTypeCard;
