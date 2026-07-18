import ClearIcon from "@mui/icons-material/Clear";
import { IconButton, type IconButtonProps } from "@mui/material";

interface ClearFieldButtonProps
  extends Omit<IconButtonProps, "aria-label" | "children"> {
  ariaLabel: string;
  iconSize?: "small" | "medium" | "large";
}

export default function ClearFieldButton({
  ariaLabel,
  iconSize = "medium",
  ...buttonProps
}: ClearFieldButtonProps) {
  return (
    <IconButton aria-label={ariaLabel} {...buttonProps}>
      <ClearIcon fontSize={iconSize} />
    </IconButton>
  );
}
