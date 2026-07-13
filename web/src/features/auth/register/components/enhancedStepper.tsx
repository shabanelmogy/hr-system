import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Box,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";

interface CustomConnectorProps {
  completed?: boolean;
  active?: boolean;
}

interface StepIconContainerProps {
  active?: boolean;
  completed?: boolean;
}

// Custom StepConnector with simplified styling
const CustomConnector = styled(StepConnector)<CustomConnectorProps>(
  ({ theme, completed, active }) => ({
    "& .MuiStepConnector-line": {
      height: 3,
      border: 0,
      backgroundColor: completed
        ? theme.palette.success.main
        : active
        ? theme.palette.primary.main
        : theme.palette.grey[300],
      borderRadius: 4,
      transition: theme.transitions.create("background-color", {
        duration: 300,
      }),
    },
  })
);

// Improved icon container with better color choices
const StepIconContainer = styled(Box)<StepIconContainerProps>(({ theme, active, completed }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: "50%",
  backgroundColor: active
    ? "transparent"
    : completed
    ? theme.palette.success.light
    : theme.palette.grey[200],
  backgroundImage: active
    ? `linear-gradient(135deg, 
         ${theme.palette.primary.main}, 
         ${theme.palette.primary.dark})`
    : "none",
  transform: active ? "scale(1.08)" : "scale(1)",
  transition: theme.transitions.create(
    [
      "background-color",
      "color",
      "box-shadow",
      "transform",
      "background-image",
    ],
    { duration: 200 }
  ),
}));

// Custom CheckCircleIcon with improved styling
const CompletedCheckIcon = styled(CheckCircleIcon)(({ theme }) => ({
  fontSize: "1.25rem",
  color: theme.palette.success.main,
  filter: `drop-shadow(0 2px 3px ${alpha(
    theme.palette.success.main,
    0.3
  )})`,
  transition: theme.transitions.create("all", { duration: 200 }),
}));

interface CustomStepIconProps {
  active?: boolean;
  completed?: boolean;
  step: {
    icon: React.ReactElement;
    label: string;
    id?: string;
  };
}

interface EnhancedStepperProps {
  activeStep?: number;
  isTablet?: boolean;
  formSteps: Array<{
    icon: React.ReactElement;
    label: string;
    id?: string;
  }>;
}

// Custom Step Icon Component (modern approach)
const CustomStepIcon = ({ active, completed, step }: CustomStepIconProps) => {
  const theme = useTheme();

  return (
    <StepIconContainer active={active || false} completed={completed || false}>
      {completed ? (
        <CompletedCheckIcon />
      ) : (
        React.cloneElement(step.icon as React.ReactElement<any>, {
          sx: {
            fontSize: "1.25rem",
            color: active
              ? "#fff"
              : theme.palette.grey[500],
          },
        })
      )}
    </StepIconContainer>
  );
};

/**
 * Enhanced Stepper with improved icon colors for inactive and completed states
 */
export const EnhancedStepper = ({
  activeStep = 0,
  isTablet = false,
  formSteps = [],
}: EnhancedStepperProps) => {
  const theme = useTheme();

  return (
    <Stepper
      alternativeLabel={isTablet}
      activeStep={activeStep}
      sx={{
        width: "100%",
        mb: -3,
        "& .MuiStepLabel-label": { mt: 1 },
        padding: isTablet ? 1 : 2,
      }}
      connector={<CustomConnector />}
    >
      {formSteps.map((step, index) => {
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;

        return (
          <Step key={step.id || index} completed={isCompleted}>
            <StepLabel
              StepIconComponent={(props) => (
                <CustomStepIcon {...props} step={step} />
              )}
            >
              <Typography
                variant="body2"
                sx={{
                  color: isActive
                    ? theme.palette.common.white
                    : isCompleted
                    ? theme.palette.success.main
                    : theme.palette.grey[500],
                  fontWeight: isActive ? 600 : isCompleted ? 500 : 400,
                  transition: "all 0.2s ease",
                }}
              >
                {step.label}
              </Typography>
            </StepLabel>
          </Step>
        );
      })}
    </Stepper>
  );
};