import { MoreVert } from "@mui/icons-material";
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import type { Chip as MuiChip } from "@mui/material";
import {
  useId,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import BackButton from "@/shared/components/navigation/BackButton";
import HeaderActions from "./HeaderActions";
import { partitionMobileViewOptions } from "./mobileViewOptions";
import type {
  HeaderActions as HeaderActionsConfig,
  HeaderExportOption,
  ViewOption,
  ViewType,
} from "./types";
import ViewToggle from "./ViewToggle";

type MobileHeaderLayoutProps = {
  title: ReactNode;
  titleIcon?: ReactNode;
  showBackButton: boolean;
  onBack?: () => void;
  actions: HeaderActionsConfig;
  onAdd?: () => void;
  onRefresh: () => void;
  onFilter?: () => void;
  exportOptions: HeaderExportOption[];
  viewType: ViewType;
  viewOptions: ViewOption[];
  isXs: boolean;
  dataCount: number;
  totalLabel: string;
  additionalChips: ComponentProps<typeof MuiChip>[];
  onViewChange: (
    event: MouseEvent<HTMLElement> | null,
    value: ViewType | null,
  ) => void;
};

export default function MobileHeaderLayout(props: MobileHeaderLayoutProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const menuButtonId = useId();
  const menuId = useId();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const { visible: visibleOptions, overflow: overflowOptions } =
    partitionMobileViewOptions(
      props.viewOptions,
      props.viewType,
      props.isXs ? 2 : 3,
    );
  const selectedLabel =
    props.viewOptions.find((option) => option.value === props.viewType)?.label ??
    props.viewType;
  const titleOffset = props.showBackButton ? 6 : props.titleIcon ? 4 : 0;
  const isMenuOpen = Boolean(menuAnchor);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
          {props.showBackButton && props.onBack ? (
            <BackButton onClick={props.onBack} size="small" />
          ) : null}
          {props.titleIcon ? (
            <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {props.titleIcon}
            </Box>
          ) : null}
          <Typography
            component="h1"
            variant="h6"
            sx={{
              color: "text.primary",
              fontWeight: 600,
              fontSize: "1.1rem",
              minWidth: 0,
              overflowWrap: "anywhere",
            }}
          >
            {props.title}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
          <HeaderActions
            actions={props.actions}
            compact
            iconOnlyAdd={props.isXs}
            onAdd={props.onAdd}
            onRefresh={props.onRefresh}
            onFilter={props.onFilter}
            exportOptions={props.exportOptions}
          />
        </Box>
        <Box sx={{ display: "flex", flexShrink: 0 }}>
          <ViewToggle
            value={props.viewType}
            options={visibleOptions}
            compact
            onChange={props.onViewChange}
          />
          {overflowOptions.length > 0 ? (
            <Tooltip title={t("navigation.moreViews")}>
              <IconButton
                id={menuButtonId}
                size="small"
                aria-label={t("navigation.moreViews")}
                aria-controls={isMenuOpen ? menuId : undefined}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen ? "true" : undefined}
                onClick={(event) => setMenuAnchor(event.currentTarget)}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          mb: 2,
          marginInlineStart: titleOffset,
        }}
      >
        <Chip
          label={`${props.dataCount} ${props.totalLabel}`}
          size="small"
          color="primary"
          variant="outlined"
        />
        <Chip
          label={selectedLabel}
          size="small"
          color="secondary"
          sx={{
            backgroundColor: `${theme.palette.secondary.main}20`,
            color: theme.palette.secondary.main,
          }}
        />
        {props.additionalChips.map((chip, index) => (
          <Chip key={index} {...chip} />
        ))}
      </Box>
      <Menu
        id={menuId}
        anchorEl={menuAnchor}
        open={isMenuOpen}
        onClose={() => setMenuAnchor(null)}
        aria-labelledby={menuButtonId}
      >
        {overflowOptions.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === props.viewType}
            onClick={() => {
              props.onViewChange(null, option.value);
              setMenuAnchor(null);
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }} aria-hidden="true">
              {option.icon}
            </Box>
            <Box sx={{ marginInlineStart: 1 }}>{option.label}</Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
