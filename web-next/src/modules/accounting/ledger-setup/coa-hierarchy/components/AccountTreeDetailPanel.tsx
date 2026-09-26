import ArchiveRoundedIcon from "@mui/icons-material/ArchiveRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import type { AccountDetail, AccountTreeItem } from "../types/coaHierarchy";

interface Props {
  node: AccountTreeItem;
  detail?: AccountDetail;
  loading: boolean;
  error?: string | null;
  canCreate: boolean;
  canEdit: boolean;
  canArchive: boolean;
  onRetry: () => void;
  onAddChild: (node: AccountTreeItem) => void;
  onEdit: (id: number) => void;
  onArchive: (id: number) => void;
}

export default function AccountTreeDetailPanel({
  node,
  detail,
  loading,
  error,
  canCreate,
  canEdit,
  canArchive,
  onRetry,
  onAddChild,
  onEdit,
  onArchive,
}: Props) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  if (loading && !detail) {
    return (
      <Box
        sx={{
          p: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error || !detail) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={onRetry}>
              {t("common.retry")}
            </Button>
          }
        >
          {error ?? t("ledgerSetup.accounts.messages.detailFailed")}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography
          variant="caption"
          sx={{ fontFamily: "monospace", color: "primary.main", fontWeight: 800 }}
        >
          {detail.code}
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800 }}>
          {isArabic ? detail.nameAr : detail.nameEn}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isArabic ? detail.nameEn : detail.nameAr}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        <Chip
          size="small"
          label={t(
            detail.allowPosting
              ? "ledgerSetup.accounts.detail.posting"
              : "ledgerSetup.accounts.detail.summary",
          )}
          color={detail.allowPosting ? "success" : "default"}
          variant="outlined"
        />
        <Chip
          size="small"
          label={t("ledgerSetup.accounts.detail.level", {
            level: detail.accountHierarchyLevelId,
          })}
          variant="outlined"
        />
      </Box>

      <Divider />

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t("ledgerSetup.fields.manualPostingPolicy")}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {t(
            `ledgerSetup.enums.manualPosting.${
              detail.manualPostingPolicy === 1
                ? "allowed"
                : detail.manualPostingPolicy === 2
                  ? "restricted"
                  : "blocked"
            }`,
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("ledgerSetup.fields.currencyPolicy")}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {t(
            `ledgerSetup.enums.currencyPolicy.${
              detail.currencyPolicy === 1
                ? "any"
                : detail.currencyPolicy === 2
                  ? "functionalOnly"
                  : "specificCurrency"
            }`,
          )}
        </Typography>
      </Box>

      {canCreate || canEdit || canArchive ? (
        <>
          <Divider />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {canCreate && !node.allowPosting ? (
              <Button
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => onAddChild(node)}
              >
                {t("ledgerSetup.accounts.actions.addChild")}
              </Button>
            ) : null}
            {canEdit ? <Button
              size="small"
              startIcon={<EditRoundedIcon />}
              onClick={() => onEdit(node.id)}
            >
              {t("actions.edit")}
            </Button> : null}
            {canArchive ? <Button
              size="small"
              color="warning"
              startIcon={<ArchiveRoundedIcon />}
              onClick={() => onArchive(node.id)}
            >
              {t("actions.archive")}
            </Button> : null}
          </Box>
        </>
      ) : null}
    </Box>
  );
}
