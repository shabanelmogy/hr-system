/* eslint-disable react/prop-types */
import { Box, Tooltip, IconButton } from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const MyItemActionButtons = ({
  item,
  setSelectedItem,
  setSelectedRowId,
  setDialogType,
  justifyContent = "center",
  actionButtonSize = "normal",
  direction = "horizontal", // New prop with default "horizontal"
  onView, // New prop for view action
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        justifyContent: justifyContent,
        flexDirection: direction === "vertical" ? "column" : "row", // Apply flexDirection based on direction prop
      }}
    >
      {onView && item?.type === 'txt' && (
        <Tooltip title={t("view")} arrow>
          <IconButton
            size={actionButtonSize}
            color="info"
            onClick={(e) => {
              e.stopPropagation();
              onView(item);
            }}
          >
            <Visibility fontSize={actionButtonSize} />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title={t("edit")} arrow>
        <IconButton
          size={actionButtonSize}
          color="primary"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the Paper's onClick
            setSelectedItem(item);
            setSelectedRowId(item.id);
            setDialogType("edit");
          }}
        >
          <Edit fontSize={actionButtonSize} />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("delete")} arrow>
        <IconButton
          size={actionButtonSize}
          color="error"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the Paper's onClick
            setSelectedItem(item);
            setSelectedRowId(item.id);
            setDialogType("delete");
          }}
        >
          <Delete fontSize={actionButtonSize} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default MyItemActionButtons;

/* 
Example For Use
===============
  <ItemActionButtons
    item={category}
    setSelectedItem={setSelectedCategory}
    setSelectedRowId={setSelectedRowId}
    setDialogType={setDialogType}
    justifyContent="flex-end"
    actionButtonSize="small"
    direction="horizontal" // or "vertical"
  />
*/
