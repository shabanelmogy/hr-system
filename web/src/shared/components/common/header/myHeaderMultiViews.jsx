/* eslint-disable react/prop-types */
// CategoryHeader.jsx
import { Box, Button, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { GridView, ViewList, ViewHeadline, Add } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import Header from "./myHeader";

const MyHeaderMultiViews = ({
  viewLayout,
  handleViewLayoutChange,
  handleAddNew,
  isMd,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
      <Header title={t("categories")} subTitle={t("categoriesSubTitle")} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          mr: isMd ? 1 : 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNew}
          sx={{
            bgcolor:
              theme.palette.mode === "dark" ? "primary.dark" : "primary.main",
            color:
              theme.palette.mode === "dark" ? "primary.contrastText" : "white",
            "&:hover": {
              bgcolor:
                theme.palette.mode === "dark" ? "primary.main" : "primary.dark",
            },
            boxShadow: 1,
          }}
        >
          {t("addNew")}
        </Button>

        <ToggleButtonGroup
          value={viewLayout}
          exclusive
          onChange={handleViewLayoutChange}
          aria-label="view layout"
          size="small"
        >
          <ToggleButton value="grid" aria-label="grid view">
            <GridView />
          </ToggleButton>
          <ToggleButton value="list" aria-label="detailed list view">
            <ViewList />
          </ToggleButton>
          <ToggleButton value="smallList" aria-label="compact list view">
            <ViewHeadline />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </>
  );
};

export default MyHeaderMultiViews;
