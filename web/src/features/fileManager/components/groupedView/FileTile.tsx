import React from "react";
import { Card, CardContent, Typography, IconButton, Box } from "@mui/material";
import { Description as DescriptionIcon, Delete as DeleteIcon, Visibility as PreviewIcon } from "@mui/icons-material";

export interface FileTileProps {
  name: string;
  onOpen?: () => void;
  onDelete?: () => void;
  onPreview?: () => string | null;
  subtitle?: string;
}

const FileTile: React.FC<FileTileProps> = ({ name, subtitle, onOpen, onDelete, onPreview }) => {
  const handlePreviewClick = () => {
    if (onPreview) {
      onPreview();
    }
  };

  return (
    <Card sx={{ minHeight: 60, position: "relative" }}>
      <CardContent 
        onClick={onOpen}
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 2, 
          minHeight: 60,
          p: 1.5,
          cursor: "pointer",
          "&:hover": { bgcolor: "action.hover" }
        }}
      >
        <DescriptionIcon color="action" sx={{ fontSize: 20 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" noWrap>{name}</Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {subtitle}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {onPreview && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handlePreviewClick();
              }}
              sx={{ 
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "primary.light", color: "primary.contrastText" }
              }}
            >
              <PreviewIcon fontSize="small" />
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{ 
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "error.light", color: "error.contrastText" }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FileTile;