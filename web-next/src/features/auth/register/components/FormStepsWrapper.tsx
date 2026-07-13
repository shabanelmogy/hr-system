import { Paper, useTheme, alpha } from "@mui/material";

interface FormStepsWrapperProps {
  formRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

// eslint-disable-next-line react/prop-types
const FormStepsWrapper = ({ formRef, children }: FormStepsWrapperProps) => {
  // Theme and responsive design
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={isDarkMode ? 4 : 1}
      ref={formRef}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper,
        boxShadow: isDarkMode ? theme.shadows[8] : theme.shadows[2],
        border: isDarkMode
          ? `1px solid ${alpha(theme.palette.divider, 0.05)}`
          : `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        maxWidth: 600,
        mx: "auto",
        mt: 7,
      }}
    >
      {children}
    </Paper>
  );
};

export default FormStepsWrapper;