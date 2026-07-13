/* eslint-disable react/prop-types */
// components/CardGridListView.jsx
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Pagination,
} from "@mui/material";

const MySmallListView = ({
  items = [],
  page = 1,
  rowsPerPage = 10,
  loading = false,
  getTitle,
  getSubtitle,
  getChips = () => [],
  getId = (item) => item?.id,
  renderActions = () => null,
  highlightLogic = () => false,
  theme,
  t = (x) => x,
  getGridItemProps = () => ({ xs: 12, sm: 6, md: 4 }),
  onPageChange = () => {},
  onRowsPerPageChange = () => {},
  rowsPerPageOptions = [5, 10, 25],
  refMap = {},
  colorLogic = (index) =>
    index % 3 === 0
      ? "primary.main"
      : index % 3 === 1
      ? "primary.light"
      : "primary.dark",
}) => {
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / rowsPerPage);

  return (
    <Box sx={{ width: "100%" }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : paginatedItems.length > 0 ? (
        <>
          <Grid container spacing={2}>
            {paginatedItems.map((item, index) => {
              const id = getId(item);
              const isHighlighted = highlightLogic(item, index);
              const gridItemProps = getGridItemProps(item, index);

              return (
                <Grid item key={id} {...gridItemProps}>
                  <Paper
                    elevation={isHighlighted ? 6 : 2}
                    ref={(el) => (refMap.current[id] = el)}
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      overflow: "hidden",
                      transition:
                        "transform 0.15s, box-shadow 0.15s, border 0.3s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 3,
                      },
                      transform: isHighlighted ? "translateY(-4px)" : "none",
                      display: "flex",
                      flexDirection: "column",
                      border: isHighlighted
                        ? `2px solid ${theme.palette.primary.main}`
                        : "none",
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: isHighlighted
                          ? "primary.main"
                          : colorLogic(index),
                        color: "white",
                        py: 1.5,
                        px: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="medium">
                        {getTitle(item)}
                      </Typography>
                      <Chip
                        label={`ID: ${id}`}
                        size="small"
                        sx={{
                          bgcolor: "background.paper",
                          color: "text.primary",
                          fontWeight: "bold",
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        flexGrow: 1,
                        bgcolor: isHighlighted
                          ? theme.palette.mode === "dark"
                            ? "primary.dark"
                            : "primary.light"
                          : "inherit",
                        opacity: isHighlighted
                          ? theme.palette.mode === "dark"
                            ? 0.9
                            : 0.2
                          : 1,
                      }}
                    >
                      {getSubtitle && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {getSubtitle(item)}
                        </Typography>
                      )}

                      {getChips && (
                        <>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 1, mb: 0.5 }}
                          >
                            {t("tags")}:
                          </Typography>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {getChips(item).map((label, i) => (
                              <Chip
                                key={i}
                                label={label}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.75rem" }}
                              />
                            ))}
                          </Box>
                        </>
                      )}
                    </Box>

                    <Divider />

                    <Box
                      sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}
                    >
                      {renderActions(item)}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
              mb: 2,
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 0 },
            }}
          >
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel id="rows-per-page-label">
                {t("rowsPerPage")}
              </InputLabel>
              <Select
                labelId="rows-per-page-label"
                id="rows-per-page-select"
                value={rowsPerPage}
                label={t("rowsPerPage")}
                onChange={onRowsPerPageChange}
              >
                {rowsPerPageOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Pagination
              count={totalPages}
              page={page}
              onChange={onPageChange}
              color="primary"
              showFirstButton
              showLastButton
              size="small"
            />

            <Box sx={{ typography: "body2" }}>
              {t("showing")} {startIndex + 1}-{Math.min(endIndex, items.length)}{" "}
              {t("of")} {items.length}
            </Box>
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: "center", py: 3 }}>{t("noData")}</Box>
      )}
    </Box>
  );
};

export default MySmallListView;
