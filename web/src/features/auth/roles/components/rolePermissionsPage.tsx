// RolePermissionsPage.jsx - Enhanced with dynamic permissions
import { appPermissions } from "@/constants";
import { MyContentsWrapper } from "@/layouts/components";
import { useNotifications } from "@/shared/hooks";
import {
  ArrowBack,
  Check,
  Clear,
  FilterList,
  Home,
  SaveAlt,
  Search,
  Security,
  ViewModule,
} from "@mui/icons-material";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useRoleStore from "../store/useRoleStore";

// Get modules dynamically from Permissions class
const MODULES = appPermissions.getAllModules();

// Define permission types exactly as in Blazor
const PERMISSION_TYPES = ["View", "Create", "Edit", "Delete"];

// Permission type colors for visual enhancement - theme-aware
const getPermissionColors = (theme: any) => ({
  View: theme.palette.success.main,
  Create: theme.palette.info.main,
  Edit: theme.palette.warning.main,
  Delete: theme.palette.error.main,
});

const RolePermissionsPage = () => {
  const { id: roleId } = useParams();
  const navigate = useNavigate();
  const { showError, showSuccess, SnackbarComponent } = useNotifications();
  const theme = useTheme();
  const PERMISSION_COLORS = getPermissionColors(theme);

  // State variables matching Blazor exactly
  const [roleViewModel, setRoleViewModel] = useState(null);
  const [selectedModule, setSelectedModule] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Enhanced UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  const { getRoleWithClaims, updateRoleClaims } = useRoleStore();

  // LoadRoleClaims - exact match to Blazor method
  const loadRoleClaims = async () => {
    try {
      console.log(roleId)
      const result = await getRoleWithClaims(roleId);
      if (result != null) {
        setRoleViewModel(result);
      }
      setIsLoading(false);
    } catch (error) {
      showError((error as Error)?.message || "Failed to load role claims");
      setIsLoading(false);
    }
  };

  // SelectAll - exact match to Blazor method
  const selectAll = (suffix: string, isSelected: boolean) => {
    if (!roleViewModel?.roleClaims) return;

    const claims = roleViewModel.roleClaims.filter((c: any) =>
      c.displayValue.toLowerCase().endsWith(`:${suffix.toLowerCase()}`)
    );

    // Set the state of the IsSelected property for each claim
    claims.forEach((claim: any) => {
      claim.isSelected = isSelected;
    });

    // Update state
    setRoleViewModel({ ...roleViewModel });
  };

  // AreAllSelected - exact match to Blazor method
  const areAllSelected = (type: string) => {
    if (!roleViewModel?.roleClaims) return false;

    const relevantClaims = roleViewModel.roleClaims.filter((c: any) =>
      c.displayValue.toLowerCase().endsWith(`:${type.toLowerCase()}`)
    );

    return (
      relevantClaims.length > 0 && relevantClaims.every((c: any) => c.isSelected)
    );
  };

  // UpdateRole - exact match to Blazor method with loading state
  const updateRole = async () => {
    setIsSaving(true);
    try {
      await updateRoleClaims(roleViewModel);
      navigate("/roles");
      showSuccess("Role permissions updated successfully");
    } catch (error) {
      showError((error as Error)?.message || "Failed to update role permissions");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle individual checkbox change
  const handleClaimChange = (claimIndex: number) => {
    const updatedViewModel = { ...roleViewModel };
    updatedViewModel.roleClaims[claimIndex].isSelected =
      !updatedViewModel.roleClaims[claimIndex].isSelected;
    setRoleViewModel(updatedViewModel);
  };

  // Enhanced filtering and pagination logic
  const filteredModules = useMemo(() => {
    let modules = MODULES.filter(
      (module) =>
        !selectedModule || module.toLowerCase() === selectedModule.toLowerCase()
    );

    if (searchTerm) {
      modules = modules.filter((module) =>
        module.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showOnlySelected && roleViewModel?.roleClaims) {
      modules = modules.filter((module) =>
        PERMISSION_TYPES.some((type) => {
          const claim = roleViewModel.roleClaims.find(
            (c: any) =>
              c.displayValue.toLowerCase().startsWith(module.toLowerCase()) &&
              c.displayValue.toLowerCase().endsWith(`:${type.toLowerCase()}`)
          );
          return claim?.isSelected;
        })
      );
    }

    return modules;
  }, [selectedModule, searchTerm, showOnlySelected, roleViewModel]);

  const paginatedModules = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredModules.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredModules, page, rowsPerPage]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!roleViewModel?.roleClaims) return { total: 0, selected: 0 };

    const total = roleViewModel.roleClaims.length;
    const selected = roleViewModel.roleClaims.filter(
      (c: any) => c.isSelected
    ).length;

    return {
      total,
      selected,
      percentage: total > 0 ? (selected / total) * 100 : 0,
    };
  }, [roleViewModel]);

  // Load data on component mount - exact match to Blazor lifecycle
  useEffect(() => {
    if (roleId) {
      loadRoleClaims();
    }
  }, [roleId]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [selectedModule, searchTerm, showOnlySelected]);

  // Show loader exactly like Blazor
  if (isLoading) {
    return (
      <MyContentsWrapper>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
          gap={2}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading role permissions...
          </Typography>
        </Box>
      </MyContentsWrapper>
    );
  }

  if (!roleViewModel) {
    return (
      <MyContentsWrapper>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <Alert severity="warning" sx={{ maxWidth: 400 }}>
            <Typography>Role not found</Typography>
          </Alert>
        </Box>
      </MyContentsWrapper>
    );
  }

  return (
    <MyContentsWrapper>
      <Fade in timeout={600}>
        <Box>
          {/* Minimized Header with theme-aware gradient background */}
          <Paper
            elevation={3}
            sx={{
              p: 2,
              mb: 3,
              background:
                theme.palette.mode === "dark"
                  ? `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.8
                  )} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: theme.palette.primary.contrastText,
              borderRadius: 2,
            }}
          >
            <Grid container alignItems="center" spacing={2}>
              <Grid>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                    width: 40,
                    height: 40,
                    color: theme.palette.primary.contrastText,
                  }}
                >
                  <Security />
                </Avatar>
              </Grid>
              <Grid>
                <Typography variant="h5" fontWeight="bold">
                  {roleViewModel.name}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {statistics.selected}/{statistics.total} permissions (
                  {statistics.percentage.toFixed(1)}%)
                </Typography>
              </Grid>
              <Grid>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={statistics.percentage}
                    sx={{
                      width: 100,
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.common.white, 0.2),
                      "& .MuiLinearProgress-bar": {
                        bgcolor: alpha(theme.palette.common.white, 0.8),
                      },
                    }}
                  />
                  <Tooltip title="Go to Dashboard">
                    <IconButton
                      onClick={() => navigate("/")}
                      sx={{
                        color: theme.palette.primary.contrastText,
                        bgcolor: alpha(theme.palette.common.white, 0.1),
                        "&:hover": {
                          bgcolor: alpha(theme.palette.common.white, 0.2),
                          transform: "scale(1.05)",
                        },
                        transition: "all 0.2s ease",
                      }}
                      size="small"
                    >
                      <Home />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 3,
              bgcolor: theme.palette.background.paper,
            }}
          >
            {/* Enhanced Filters Section */}
            <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="action" />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Filter by Module</InputLabel>
                    <Select
                      value={selectedModule}
                      label="Filter by Module"
                      onChange={(e) => setSelectedModule(e.target.value)}
                      startAdornment={
                        <ViewModule sx={{ mr: 1, color: "action.active" }} />
                      }
                    >
                      <MenuItem value="">
                        <em>All Modules</em>
                      </MenuItem>
                      {MODULES.map((module) => (
                        <MenuItem key={module} value={module}>
                          {module}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showOnlySelected}
                        onChange={(e) => setShowOnlySelected(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Show only selected"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 2 }}>
                  <Chip
                    icon={<FilterList />}
                    label={`${filteredModules.length} modules`}
                    color="primary"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Form starts here */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateRole();
              }}
            >
              <input type="hidden" value={roleId} />

              {/* Enhanced Table */}
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? alpha(theme.palette.background.paper, 0.8)
                              : "grey.50",
                          fontWeight: "bold",
                          minWidth: 150,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <ViewModule color="primary" />
                          Module
                        </Box>
                      </TableCell>

                      {/* Enhanced header checkboxes */}
                      {PERMISSION_TYPES.map((type) => (
                        <TableCell
                          key={type}
                          align="center"
                          sx={{
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? alpha(theme.palette.background.paper, 0.8)
                                : "grey.50",
                            minWidth: 120,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Chip
                              size="small"
                              label={type}
                              sx={{
                                bgcolor: PERMISSION_COLORS[type as keyof typeof PERMISSION_COLORS],
                                color: theme.palette.getContrastText(
                                  PERMISSION_COLORS[type as keyof typeof PERMISSION_COLORS]
                                ),
                                fontWeight: "bold",
                              }}
                            />
                            <Tooltip
                              title={
                                areAllSelected(type)
                                  ? "Unselect All"
                                  : "Select All"
                              }
                            >
                              <IconButton
                                size="small"
                                onClick={() =>
                                  selectAll(type, !areAllSelected(type))
                                }
                                sx={{
                                  color: areAllSelected(type)
                                    ? theme.palette.error.main
                                    : theme.palette.success.main,
                                  "&:hover": {
                                    bgcolor: areAllSelected(type)
                                      ? alpha(theme.palette.error.main, 0.1)
                                      : alpha(theme.palette.success.main, 0.1),
                                  },
                                }}
                              >
                                {areAllSelected(type) ? <Clear /> : <Check />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedModules.map((module) => (
                      <TableRow
                        key={module}
                        hover
                        sx={{
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                fontSize: "0.875rem",
                              }}
                            >
                              {module.substring(0, 2).toUpperCase()}
                            </Avatar>
                            <Typography variant="body1" fontWeight="medium">
                              {module}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Enhanced permission checkboxes */}
                        {PERMISSION_TYPES.map((type) => {
                          const claim = roleViewModel.roleClaims.find(
                            (c: any) =>
                              c.displayValue
                                .toLowerCase()
                                .startsWith(module.toLowerCase()) &&
                              c.displayValue
                                .toLowerCase()
                                .endsWith(`:${type.toLowerCase()}`)
                          );

                          const claimIndex = roleViewModel.roleClaims.findIndex(
                            (c: any) =>
                              c.displayValue
                                .toLowerCase()
                                .startsWith(module.toLowerCase()) &&
                              c.displayValue
                                .toLowerCase()
                                .endsWith(`:${type.toLowerCase()}`)
                          );

                          return (
                            <TableCell key={`${module}-${type}`} align="center">
                              {claim && (
                                <Tooltip
                                  title={`${type} permission for ${module}`}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <input
                                      type="hidden"
                                      value={claim.displayValue}
                                    />
                                    <Checkbox
                                      checked={claim.isSelected || false}
                                      onChange={() =>
                                        handleClaimChange(claimIndex)
                                      }
                                      sx={{
                                        color: PERMISSION_COLORS[type as keyof typeof PERMISSION_COLORS],
                                        "&.Mui-checked": {
                                          color: PERMISSION_COLORS[type as keyof typeof PERMISSION_COLORS],
                                        },
                                        transform: "scale(1.1)",
                                      }}
                                    />
                                  </Box>
                                </Tooltip>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Enhanced Pagination */}
              <TablePagination
                component="div"
                count={filteredModules.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                  borderTop: 1,
                  borderColor: "divider",
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.background.paper, 0.8)
                      : "grey.50",
                }}
              />

              <Divider />

              {/* Enhanced Action buttons */}
              <Box
                sx={{
                  p: 3,
                  display: "flex",
                  gap: 2,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {statistics.selected} of {statistics.total} permissions
                  selected
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/roles")}
                    disabled={isSaving}
                  >
                    Back To Roles
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={
                      isSaving ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SaveAlt />
                      )
                    }
                    disabled={isSaving}
                    sx={{
                      minWidth: 120,
                      boxShadow: 2,
                      "&:hover": {
                        boxShadow: 4,
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </Box>
            </form>
          </Card>
        </Box>
      </Fade>
      {SnackbarComponent}
    </MyContentsWrapper>
  );
};

export default RolePermissionsPage;
