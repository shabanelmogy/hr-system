import React from "react";
import { IconButton } from "@mui/material";
import { Repeat as RepeatIcon } from "@mui/icons-material";

export interface RepeatToggleProps {
  isRepeat: boolean;
  onToggle: () => void;
  rotateAnim?: string;
}

const RepeatToggle: React.FC<RepeatToggleProps> = ({ isRepeat, onToggle, rotateAnim }) => {
  return (
    <IconButton
      onClick={onToggle}
      size="medium"
      color={isRepeat ? "primary" : "default"}
      sx={{ animation: isRepeat ? rotateAnim : "none", transition: "all 0.3s ease" }}
    >
      <RepeatIcon />
    </IconButton>
  );
};

export default RepeatToggle;
