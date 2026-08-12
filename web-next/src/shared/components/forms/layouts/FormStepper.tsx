import { useId, type ReactNode } from "react";
import {
  Box,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export interface FormStep {
  id: string;
  label: ReactNode;
  content: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  completed?: boolean;
  hasError?: boolean;
  errorLabel?: ReactNode;
  optionalLabel?: ReactNode;
}

export interface FormStepperProps {
  label: string;
  steps: readonly FormStep[];
  activeStep: number;
  onStepChange?: (step: number) => void;
  keepMounted?: boolean;
  sx?: SxProps<Theme>;
  panelSx?: SxProps<Theme>;
}

export function FormStepper({
  label,
  steps,
  activeStep,
  onStepChange,
  keepMounted = true,
  sx,
  panelSx,
}: FormStepperProps) {
  const id = useId();
  const normalizedStep = Math.min(Math.max(activeStep, 0), Math.max(steps.length - 1, 0));

  return (
    <Box sx={[{ width: "100%" }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      <Box sx={{ overflowX: "auto", pb: 0.5 }}>
        <Stepper
          aria-label={label}
          activeStep={normalizedStep}
          nonLinear={Boolean(onStepChange)}
          sx={{ minWidth: Math.max(steps.length * 150, 320), px: 0.5 }}
        >
          {steps.map((step, index) => {
            const completed = step.completed ?? index < normalizedStep;
            const stepLabel = (
              <StepLabel
                error={step.hasError}
                icon={step.icon}
                optional={step.optionalLabel}
              >
                {step.label}
                {step.hasError && step.errorLabel ? (
                  <Typography component="span" variant="caption" sx={{ display: "block" }}>
                    {step.errorLabel}
                  </Typography>
                ) : null}
              </StepLabel>
            );
            return (
              <Step completed={completed} disabled={step.disabled} key={step.id}>
                {onStepChange ? (
                  <StepButton
                    aria-controls={`${id}-${index}-panel`}
                    icon={step.icon}
                    onClick={() => onStepChange(index)}
                    optional={step.optionalLabel}
                    sx={step.hasError ? { color: "error.main" } : undefined}
                  >
                    {step.label}
                    {step.hasError && step.errorLabel ? (
                      <Typography component="span" variant="caption" sx={{ display: "block" }}>
                        {step.errorLabel}
                      </Typography>
                    ) : null}
                  </StepButton>
                ) : stepLabel}
              </Step>
            );
          })}
        </Stepper>
      </Box>

      {steps[normalizedStep]?.description ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {steps[normalizedStep].description}
        </Typography>
      ) : null}

      {steps.map((step, index) => {
        const selected = index === normalizedStep;
        if (!selected && !keepMounted) return null;
        return (
          <Box
            aria-hidden={!selected}
            hidden={!selected}
            id={`${id}-${index}-panel`}
            key={`${step.id}-panel`}
            role="tabpanel"
            sx={[{ pt: 2.5 }, ...(Array.isArray(panelSx) ? panelSx : panelSx ? [panelSx] : [])]}
          >
            {step.content}
          </Box>
        );
      })}
    </Box>
  );
}
