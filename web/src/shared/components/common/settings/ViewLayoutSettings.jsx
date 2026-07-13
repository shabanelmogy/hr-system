import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Chip,
  Grid,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Settings,
  Download,
  Upload,
  Delete,
  Refresh,
  GridView,
  ViewList,
  ViewHeadline,
  Info,
} from "@mui/icons-material";
import { useViewLayoutContext } from "../../contexts/ViewLayoutContext";
import { useTranslation } from "react-i18next";

const ViewLayoutSettings = () => {
  const { t } = useTranslation();
  const {
    globalPreferences,
    layoutStats,
    breakpoints,
    clearAllLayouts,
    exportPreferences,
    importPreferences,
    getAllLayouts,
    updatePreferences,
  } = useViewLayoutContext();

  // Local state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [message, setMessage] = useState(null);

  // Handle preference changes
  const handlePreferenceChange = (key, value) => {
    updatePreferences({ [key]: value });
    setMessage({
      type: "success",
      text: t("settings.preferenceUpdated"),
    });
  };

  // Handle export
  const handleExport = () => {
    try {
      const data = exportPreferences();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `view-layout-preferences-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({
        type: "success",
        text: t("settings.preferencesExported"),
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: t("settings.exportError"),
      });
    }
  };

  // Handle import
  const handleImport = () => {
    try {
      const count = importPreferences(importData);
      setImportDialogOpen(false);
      setImportData("");
      setMessage({
        type: "success",
        text: t("settings.preferencesImported", { count }),
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: t("settings.importError"),
      });
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    try {
      const count = clearAllLayouts();
      setClearConfirmOpen(false);
      setMessage({
        type: "success",
        text: t("settings.preferencesCleared", { count }),
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: t("settings.clearError"),
      });
    }
  };

  // Get layout icon
  const getLayoutIcon = (layout) => {
    switch (layout) {
      case "grid": return <GridView />;
      case "list": return <ViewList />;
      case "smallList": return <ViewHeadline />;
      default: return <Settings />;
    }
  };

  // Get current breakpoint info
  const getCurrentBreakpoint = () => {
    if (breakpoints.isSm) return "Small (Mobile)";
    if (breakpoints.isMd) return "Medium (Tablet)";
    if (breakpoints.isLg) return "Large (Desktop)";
    return "Extra Large";
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      {/* Message Alert */}
      {message && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage(null)}
          sx={{ mb: 2 }}
        >
          {message.text}
        </Alert>
      )}

      {/* Global Preferences */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<Settings />}
          title={t("settings.globalPreferences")}
          subheader={t("settings.globalPreferencesSubtitle")}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={globalPreferences.autoSave}
                    onChange={(e) => handlePreferenceChange("autoSave", e.target.checked)}
                  />
                }
                label={t("settings.autoSave")}
              />
              <Typography variant="caption" display="block" color="text.secondary">
                {t("settings.autoSaveDescription")}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={globalPreferences.useResponsiveDefaults}
                    onChange={(e) => handlePreferenceChange("useResponsiveDefaults", e.target.checked)}
                  />
                }
                label={t("settings.responsiveDefaults")}
              />
              <Typography variant="caption" display="block" color="text.secondary">
                {t("settings.responsiveDefaultsDescription")}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={globalPreferences.debugMode}
                    onChange={(e) => handlePreferenceChange("debugMode", e.target.checked)}
                  />
                }
                label={t("settings.debugMode")}
              />
              <Typography variant="caption" display="block" color="text.secondary">
                {t("settings.debugModeDescription")}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" gutterBottom>
                {t("settings.autoSaveDelay")}: {globalPreferences.autoSaveDelay}ms
              </Typography>
              <TextField
                type="number"
                size="small"
                value={globalPreferences.autoSaveDelay}
                onChange={(e) => handlePreferenceChange("autoSaveDelay", parseInt(e.target.value) || 300)}
                inputProps={{ min: 0, max: 5000, step: 100 }}
                fullWidth
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Current Environment Info */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<Info />}
          title={t("settings.currentEnvironment")}
          subheader={t("settings.currentEnvironmentSubtitle")}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" gutterBottom>
                {t("settings.currentBreakpoint")}
              </Typography>
              <Chip label={getCurrentBreakpoint()} color="primary" />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" gutterBottom>
                {t("settings.totalSavedLayouts")}
              </Typography>
              <Chip label={layoutStats?.total || 0} color="secondary" />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Typography variant="subtitle2" gutterBottom>
                {t("settings.pagesWithLayouts")}
              </Typography>
              <Chip label={layoutStats?.pages?.length || 0} color="info" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Layout Statistics */}
      {layoutStats && layoutStats.total > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title={t("settings.layoutStatistics")}
            subheader={t("settings.layoutStatisticsSubtitle")}
          />
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              {t("settings.layoutDistribution")}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
              {Object.entries(layoutStats.byLayout || {}).map(([layout, count]) => (
                <Chip
                  key={layout}
                  icon={getLayoutIcon(layout)}
                  label={`${layout}: ${count}`}
                  variant="outlined"
                />
              ))}
            </Box>
            
            <Typography variant="subtitle2" gutterBottom>
              {t("settings.pagesWithSavedLayouts")}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {(layoutStats.pages || []).map((page) => (
                <Chip key={page} label={page} size="small" />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Data Management */}
      <Card>
        <CardHeader
          title={t("settings.dataManagement")}
          subheader={t("settings.dataManagementSubtitle")}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleExport}
                fullWidth
                disabled={!layoutStats || layoutStats.total === 0}
              >
                {t("settings.export")}
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => setImportDialogOpen(true)}
                fullWidth
              >
                {t("settings.import")}
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => window.location.reload()}
                fullWidth
              >
                {t("settings.refresh")}
              </Button>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setClearConfirmOpen(true)}
                fullWidth
                disabled={!layoutStats || layoutStats.total === 0}
              >
                {t("settings.clearAll")}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("settings.importPreferences")}</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={10}
            fullWidth
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder={t("settings.pasteJsonData")}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleImport} variant="contained" disabled={!importData.trim()}>
            {t("settings.import")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear Confirmation Dialog */}
      <Dialog open={clearConfirmOpen} onClose={() => setClearConfirmOpen(false)}>
        <DialogTitle>{t("settings.confirmClear")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("settings.confirmClearMessage", { count: layoutStats?.total || 0 })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearConfirmOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleClearAll} color="error" variant="contained">
            {t("settings.clearAll")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewLayoutSettings;