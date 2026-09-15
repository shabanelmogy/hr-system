import {
  AppChip,
  BadgePercentage,
  CreatedDateRow,
  EntityCard,
  QualityMeter,
} from "@/shared/components/cards";
import { LocationOn } from "@mui/icons-material";
import { Stack, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { useTranslation } from "react-i18next";
import type { AddressTypeCardProps } from "./AddressTypeCard.types";
import AddressTypeCardFooter from "./AddressTypeCardFooter";
import { getQualityLevel, getQualityScore } from "./AddressTypeCardUtils";

export default function AddressTypeCard({ addressType, index, isHovered, onHover, onEdit, onDelete, onRestore, onView, permissions, selected, onSelectedChange }: AddressTypeCardProps) {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const qualityScore = getQualityScore(addressType);
  const qualityInfo = getQualityLevel(qualityScore, theme);
  const isRTL = theme.direction === "rtl";
  const hasAr = !!addressType.nameAr;
  const hasEn = !!addressType.nameEn;
  const primaryTitle = isRTL
    ? (addressType.nameAr || addressType.nameEn || "N/A")
    : (addressType.nameEn || addressType.nameAr || "N/A");
  const secondaryTitle = hasAr && hasEn
    ? (isRTL ? addressType.nameEn : addressType.nameAr)
    : undefined;
  const endBadge = <BadgePercentage value={qualityScore} color={qualityInfo.color} />;
  const chips = <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}><AppChip label={`${t("general.id")}: ${addressType.id}`} colorKey="secondary" variant="outlined" monospace sx={{ fontSize: "0.7rem" }} />{addressType.isDeleted && <AppChip label={t("addressTypes.status.archived")} colorKey="error" variant="soft" bold />}</Stack>;
  const content = <><Box sx={{ mb: 2 }}><Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 2 }}><LocationOn sx={{ fontSize: 16, color: "text.secondary" }} /><Typography variant="body2" sx={{ fontWeight: 500 }}>{t("addressTypes.addresses")}</Typography><AppChip label={String(addressType.addressesCount)} colorKey={addressType.addressesCount > 0 ? "success" : "secondary"} variant="outlined" /></Stack></Box><QualityMeter score={qualityScore} title={t("addressTypes.dashboard.dataQuality")} /><CreatedDateRow date={addressType.createdOn ? new Date(addressType.createdOn) : null} formatter={(date) => new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "medium" }).format(date)} /></>;
  const footer = <AddressTypeCardFooter addressType={addressType} onView={onView} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} permissions={permissions} t={t} />;
  return <EntityCard
    index={index}
    isHovered={isHovered}
    onMouseEnter={() => onHover(addressType.id)}
    onMouseLeave={() => onHover(null)}
    height={420}
    endBadge={endBadge}
    title={primaryTitle}
    subtitle={secondaryTitle}
    chips={chips}
    content={content}
    footer={footer}
    selected={selected}
    selectionLabel={t("addressTypes.cardSelectionAriaLabel", { name: primaryTitle })}
    onSelectedChange={onSelectedChange}
  />;
}
