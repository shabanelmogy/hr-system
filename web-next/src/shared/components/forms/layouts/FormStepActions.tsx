import {
  ArrowBackRounded as BackIcon,
  ArrowForwardRounded as ForwardIcon,
  CheckRounded as SubmitIcon,
} from "@mui/icons-material";
import { Box, Button, CircularProgress, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface FormStepActionsProps {
  activeStep: number;
  stepCount: number;
  onBack: () => void;
  onNext: () => void | Promise<void>;
  onSubmit: () => void | Promise<void>;
  backLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
  backDisabled?: boolean;
  nextDisabled?: boolean;
  submitting?: boolean;
}

export function FormStepActions({
  activeStep,
  stepCount,
  onBack,
  onNext,
  onSubmit,
  backLabel,
  nextLabel,
  submitLabel,
  backDisabled = false,
  nextDisabled = false,
  submitting = false,
}: FormStepActionsProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isFirst = activeStep <= 0;
  const isLast = activeStep >= Math.max(stepCount - 1, 0);
  const PreviousIcon = theme.direction === "rtl" ? ForwardIcon : BackIcon;
  const NextIcon = theme.direction === "rtl" ? BackIcon : ForwardIcon;

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, flexWrap: "wrap" }}>
      <Button
        disabled={isFirst || backDisabled || submitting}
        onClick={onBack}
        startIcon={<PreviousIcon />}
        variant="outlined"
      >
        {backLabel ?? t("actions.back")}
      </Button>
      <Button
        disabled={nextDisabled || submitting}
        onClick={() => void (isLast ? onSubmit() : onNext())}
        startIcon={
          submitting ? (
            <CircularProgress color="inherit" size={16} />
          ) : isLast ? (
            <SubmitIcon />
          ) : (
            <NextIcon />
          )
        }
        variant="contained"
      >
        {isLast ? submitLabel ?? t("actions.save") : nextLabel ?? t("actions.next")}
      </Button>
    </Box>
  );
}
