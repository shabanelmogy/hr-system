/* eslint-disable react/prop-types */
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, useTheme } from "@mui/material";

interface FormBodyProps {
  activeStep: number;
  handleBack: () => void;
  handleNext: () => void;
  handleSubmit: (callback: (data: any) => void) => (e?: React.FormEvent) => void;
  onSubmit: (data: any) => void;
  renderStepContent: () => React.ReactNode;
  isValid: boolean;
  t: (key: string) => string;
  usernameVerified: boolean;
  emailVerified: boolean;
}

export default function FormBody({
  activeStep,
  handleBack,
  handleNext,
  handleSubmit,
  onSubmit,
  renderStepContent,
  isValid,
  t,
  usernameVerified,
  emailVerified,
}: FormBodyProps) {
  const theme = useTheme();

  // Determine if next button should be disabled based on current step
  const isNextDisabled =
    (activeStep === 0 && (!isValid || !usernameVerified)) ||
    (activeStep === 1 && (!isValid || !emailVerified));

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      autoComplete="off"
      sx={{
        p: { xs: 2.5, sm: 3 },
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* Current step content */}
      {renderStepContent()}

      {/* Navigation buttons - Only show on steps 0 and 1 */}
      {activeStep < 2 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 1,
            pt: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{
              visibility: activeStep === 0 ? "hidden" : "visible",
              borderRadius: 10,
              py: 0.75,
              px: 1.5,
            }}
            disabled={activeStep === 0}
          >
            {t("actions.back") || "Back"}
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            endIcon={<ArrowForwardIcon />}
            disabled={isNextDisabled}
            sx={{
              borderRadius: 10,
              py: 0.75,
              px: 2.5,
              fontWeight: 600,
              boxShadow: theme.shadows[3],
              "&:hover": {
                boxShadow: theme.shadows[5],
              },
            }}
          >
            {t("actions.next") || "Next"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
