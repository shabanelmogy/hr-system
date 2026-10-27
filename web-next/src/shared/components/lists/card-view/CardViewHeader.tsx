import { Paper, alpha, useTheme } from "@mui/material";
import CardViewToolbar from "./CardViewToolbar";
import type { CardViewToolbarProps } from "./CardViewToolbar";
import { TitleSection } from "./header-controls/TitleSection";

export type CardViewHeaderProps = CardViewToolbarProps & {
  title: string;
  subtitle?: string;
  mainChipLabel: string;
  page: number;
  showTitleSection?: boolean;
  compact?: boolean;
};

const CardViewHeader = ({
  title,
  subtitle,
  mainChipLabel,
  page,
  showTitleSection = true,
  compact = false,
  ...toolbarProps
}: CardViewHeaderProps) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        p: compact ? 1.5 : 3,
        mb: compact ? 1.5 : 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.primary.dark}08 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        borderRadius: compact ? 2 : 3,
      }}
    >
      {showTitleSection && (
        <TitleSection title={title} subtitle={subtitle} mainChipLabel={mainChipLabel} page={page} />
      )}
      <CardViewToolbar
        {...toolbarProps}
        singleRow={compact}
      />
    </Paper>
  );
};

export default CardViewHeader;
