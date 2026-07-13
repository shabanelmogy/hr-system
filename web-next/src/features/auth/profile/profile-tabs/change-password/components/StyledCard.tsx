import { Card, CardContent, Divider, alpha, useTheme } from "@mui/material";

interface StyledCardProps {
  children: React.ReactNode;
}

const StyledCard = ({ children }: StyledCardProps) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        mt: 2,
        p: 0,
        borderRadius: 4,
        background:
          theme.palette.mode === "dark" ? "rgba(30, 30, 30, 0.9)" : "#ffffff",
        backdropFilter: "blur(10px)",
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`
            : `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
        overflow: "visible",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow:
            theme.palette.mode === "dark"
              ? `0 12px 40px ${alpha(theme.palette.common.black, 0.3)}`
              : `0 12px 40px ${alpha(theme.palette.common.black, 0.12)}`,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>{children}</CardContent>
    </Card>
  );
};

export const StyledDivider = () => {
  const theme = useTheme();

  return (
    <Divider
      sx={{
        mb: 3,
        background: `linear-gradient(90deg, ${alpha(
          theme.palette.primary.main,
          0.1
        )}, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(
          theme.palette.primary.main,
          0.1
        )})`,
        height: "2px",
        borderRadius: "2px",
      }}
    />
  );
};

export default StyledCard;
