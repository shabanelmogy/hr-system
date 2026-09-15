import React from "react";
import { Card, CardActionArea, CardContent, Box, Typography, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface GroupFolderCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  color?: string;
  onOpen?: () => void;
}

const GroupFolderCard: React.FC<GroupFolderCardProps> = ({ title, count, icon, color = "primary.main", onOpen }) => {
  const { t } = useTranslation();
  return (
    <Card sx={{ height: 120 }}>
      <CardActionArea onClick={onOpen} sx={{ height: "100%" }}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 2, bgcolor: color, color: "white" }}>
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" noWrap>{title}</Typography>
            <Chip label={t("common.itemCount", { count })} size="small" sx={{ mt: 1 }} />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default GroupFolderCard;
