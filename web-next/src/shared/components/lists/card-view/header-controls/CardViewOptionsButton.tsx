import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { Button, Menu } from "@mui/material";
import type { ReactNode } from "react";
import { useId, useState } from "react";

export interface CardViewOptionsButtonProps {
  label: string;
  children: (closeMenu: () => void) => ReactNode;
}

export const CardViewOptionsButton = ({ label, children }: CardViewOptionsButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const buttonId = useId();
  const menuId = `${buttonId}-menu`;
  const isOpen = Boolean(anchorEl);
  const closeMenu = () => setAnchorEl(null);

  return (
    <>
      <Button
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen ? "true" : undefined}
        aria-haspopup="menu"
        aria-label={label}
        fullWidth
        onClick={(event) => setAnchorEl(event.currentTarget)}
        size="small"
        startIcon={<TuneOutlinedIcon fontSize="small" />}
        sx={{ height: 40, minHeight: 40, whiteSpace: "nowrap" }}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        id={menuId}
        onClose={closeMenu}
        open={isOpen}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {children(closeMenu)}
      </Menu>
    </>
  );
};
