import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  alpha,
  Box,
  Button,
  Collapse,
  TextField,
  Typography,
  type Theme,
} from "@mui/material";
import { useEffect, useState } from "react";
import MyButton from "@/shared/components/forms/buttons/MyButton";
import {
  clearBackendOverride,
  getStoredBackendOverride,
  saveBackendOverride,
} from "@/lib/api/backendOverride";
import { publicApiUrl } from "@/config/publicEnv";
import { useTranslation } from "react-i18next";

const ServerUrlField = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [activeOverride, setActiveOverride] = useState<string | null>(null);

  useEffect(() => {
    setActiveOverride(getStoredBackendOverride());
  }, []);

  const activeTarget = activeOverride ?? publicApiUrl ?? t("auth.serverUrlDefault");

  const handleSave = () => {
    const saved = saveBackendOverride(draft);
    if (!saved) {
      setStatus({ kind: "error", text: t("auth.serverUrlInvalid") });
      return;
    }
    setActiveOverride(saved);
    setStatus({ kind: "success", text: t("auth.serverUrlSaved") });
    setDraft("");
  };

  const handleReset = () => {
    clearBackendOverride();
    setActiveOverride(null);
    setStatus({ kind: "success", text: t("auth.serverUrlResetDone") });
    setDraft("");
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      <Button
        fullWidth
        size="small"
        color="inherit"
        onClick={() => setExpanded((current) => !current)}
        startIcon={<DnsOutlinedIcon sx={{ fontSize: 18 }} />}
        endIcon={
          <ExpandMoreIcon
            sx={{
              fontSize: 18,
              transition: "transform 0.25s ease",
              transform: expanded ? "rotate(180deg)" : "none",
            }}
          />
        }
        sx={{
          textTransform: "none",
          justifyContent: "space-between",
          px: 1.5,
          py: 0.6,
          borderRadius: 2,
          fontSize: 12.5,
          fontWeight: 600,
          color: "text.secondary",
          bgcolor: isDarkMode ? alpha("#fff", 0.03) : alpha("#000", 0.02),
          "&:hover": {
            bgcolor: isDarkMode ? alpha("#fff", 0.06) : alpha("#000", 0.04),
          },
        }}
        aria-expanded={expanded}
      >
        <Box
          component="span"
          sx={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "inherit",
          }}
        >
          {t("auth.serverSettings")}: {activeTarget}
        </Box>
      </Button>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box
          sx={(theme: Theme) => ({
            mt: 1,
            p: 1.5,
            borderRadius: 2,
            border: "1px dashed",
            borderColor: theme.palette.divider,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          })}
        >
          <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
            {t("auth.serverUrlHint")}
          </Typography>
          <TextField
            size="small"
            fullWidth
            label={t("auth.serverUrl")}
            placeholder="https://localhost:7037"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            error={status?.kind === "error"}
            helperText={status?.kind === "error" ? status.text : undefined}
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            {activeOverride && (
              <Button size="small" color="inherit" onClick={handleReset}>
                {t("auth.serverUrlReset")}
              </Button>
            )}
            <MyButton
              size="small"
              onClick={handleSave}
              disabled={!draft.trim()}
            >
              {t("auth.serverUrlSave")}
            </MyButton>
          </Box>
          {status?.kind === "success" && (
            <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600 }}>
              {status.text}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ServerUrlField;
