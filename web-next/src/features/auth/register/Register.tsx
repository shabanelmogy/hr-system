"use client";

/* eslint-disable react/prop-types */
import { zodResolver } from "@hookform/resolvers/zod";
import { alpha, Box, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

// Services and Constants
import { apiRoutes } from "@/config";
import { useSnackbar } from "@/shared/hooks";
import { apiService, HandleApiError } from "@/shared/services";
import { createImageFileValidationSchema } from "@/shared/validation/fileValidation";
import { appRoutes } from "@/config/routes";
import {
  getRegistrationValidationSchema,
} from "./constants/validation";
import type { RegistrationFormData } from "./types";

// Components
import { EnhancedStepper } from "./components/EnhancedStepper";
import FormHeader from "./components/FormHeader";
import PersonalDetailsStep from "./components/PersonalDetailsStep";
import ProfilePictureStep from "./components/ProfilePictureStep";
import SecurityStep from "./components/SecurityStep";

// Hooks
import FormBody from "./components/FormBody";
import FormFooter from "./components/FormFooter";
import FormStepsWrapper from "./components/FormStepsWrapper";
import { useFormSteps } from "./hooks/FormSteps";

/**
 * Ultimate Registration Component with enhanced UX and design
 */
const Register = () => {
  // Navigation and translation
  const { t } = useTranslation();
  const router = useRouter();
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  // Theme and responsive design
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFileBase64, setSelectedFileBase64] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [registrationProgress, setRegistrationProgress] = useState(0);

  // Refs
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const userNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Validation schema
  const validationSchema = useMemo(() => getRegistrationValidationSchema(t), [t]);

  // Form setup with react-hook-form and Zod validation
  const {
    register,
    handleSubmit,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Formation of the step sequence
  const { steps: formSteps } = useFormSteps({
    t,
  });

  // Focus on first input when step changes
  useEffect(() => {
    const focusTimeoutId = setTimeout(() => {
      if (activeStep === 0 && firstNameRef.current) {
        firstNameRef.current.focus();
      } else if (activeStep === 1 && emailRef.current) {
        emailRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(focusTimeoutId);
  }, [activeStep]);

  // Add event listeners for drag and drop on the document level
  useEffect(() => {
    // Only add listeners when on profile picture step
    if (activeStep === 2) {
      const preventDefaults = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };

      // Prevent browser default behavior for drag events
      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        document.addEventListener(eventName, preventDefaults, false);
      });

      return () => {
        ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
          document.removeEventListener(eventName, preventDefaults, false);
        });
      };
    }
    
    return () => {};
  }, [activeStep]);

  // Update the completion status of steps
  useEffect(() => {
    const updateCompletedSteps = async (): Promise<void> => {
      const newCompleted = { ...completed };

      // Handle first step completion
      if (activeStep > 0) {
        newCompleted[0] = true;
      }

      // Handle second step completion
      if (activeStep > 1) {
        newCompleted[1] = true;
      }

      // Update state if there's a change
      if (JSON.stringify(newCompleted) !== JSON.stringify(completed)) {
        setCompleted(newCompleted);
      }
    };

    updateCompletedSteps();
  }, [activeStep, completed]);

  // Monitor password for strength calculation
  const watchPassword = watch("password");
  useEffect(() => {
    if (watchPassword) {
      // Calculate password strength
      let strength = 0;

      // Length check
      if (watchPassword.length >= 8) strength += 1;

      if (/[A-Z]/.test(watchPassword) && /[a-z]/.test(watchPassword))
        strength += 1;
      if (/[0-9]/.test(watchPassword)) strength += 0.5;
      if (/[^A-Za-z0-9]/.test(watchPassword)) strength += 0.5;

      // Update state with calculated strength (0-3)
      setPasswordStrength(Math.min(3, Math.floor(strength)));
    } else {
      setPasswordStrength(0);
    }
  }, [watchPassword]);

  // Navigation handlers
  const handleNext = async () => {
    const stepFields = [
      ["firstName", "lastName", "userName"],
      ["email", "password", "confirmPassword"],
    ] as const;
    const fields = stepFields[activeStep as 0 | 1];
    const stepResult = fields ? await trigger(fields) : true;

    if (stepResult) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // File handling functions
  const onFileChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
  ) => {
    setUploadError(null);

    // Get file from event
    const files = "dataTransfer" in event ? event.dataTransfer.files : event.target.files;
    const file = files?.[0];
    if (!file) return;

    const validation = createImageFileValidationSchema({
      required: t("validation.required"),
      tooLarge: t("validation.fileTooLarge") || "File too large (max 10MB)",
      invalidType:
        t("validation.invalidFileType") ||
        "Invalid file type. Please upload a JPEG, PNG, GIF or WebP image",
    }).safeParse({ file });

    if (!validation.success) {
      const messages = validation.error.issues.map((issue) => issue.message);
      setUploadError(messages[0]);
      showSnackbar(
        "error",
        messages,
        t("messages.error") || "Error"
      );
      return;
    }

    // Preview Image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);

    // Convert file to Base64
    const base64Reader = new FileReader();
    base64Reader.onload = () => {
      if (typeof base64Reader.result !== "string") return;
      const [, base64String] = base64Reader.result.split(",", 2);
      setSelectedFileBase64(base64String || null);
    };
    base64Reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
    setUploadError(null);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set dragActive to false if we're leaving the dropzone
    // and not entering a child element
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    onFileChange(e);
  };

  // Form submission
  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);

    // Simulate progress during submission
    const progressInterval = setInterval(() => {
      setRegistrationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);

    const requestData = {
      firstName: data.firstName,
      lastName: data.lastName,
      userName: data.userName,
      email: data.email,
      password: data.password,
      profilePicture: selectedFileBase64 || null,
    };

    try {
      await apiService.post(apiRoutes.auth.register, requestData);
      reset();

      // Set progress to 100% to indicate completion
      setRegistrationProgress(100);

      // Show success message
      showSnackbar(
        "success",
        [t("auth.registerSuccess") || "Registration successful!"],
        t("messages.success") || "Success"
      );

      // Keep the form locked while the success message is visible, then use
      // client-side navigation to the configured confirmation route.
      await new Promise((resolve) => setTimeout(resolve, 1200));
      router.replace(appRoutes.resendEmailConfirmation);
    } catch (error) {
      HandleApiError(error, (updatedState) => {
        showSnackbar("error", updatedState.messages, updatedState.title);
      });
      // Reset progress on error
      setRegistrationProgress(0);
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  // Render step content
  const renderStepContent = (): React.ReactNode => {
    switch (activeStep) {
      case 0:
        return (
          <PersonalDetailsStep
            register={register}
            errors={errors}
            firstNameRef={firstNameRef}
            lastNameRef={lastNameRef}
            userNameRef={userNameRef}
            t={t}
          />
        );

      case 1:
        return (
          <SecurityStep
            register={register}
            errors={errors}
            emailRef={emailRef}
            watchPassword={watchPassword}
            passwordStrength={passwordStrength}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            t={t}
          />
        );

      case 2:
        return (
          <ProfilePictureStep
            previewUrl={previewUrl}
            isDragActive={isDragActive}
            uploadError={uploadError}
            onFileChange={onFileChange}
            handleDragEnter={handleDragEnter}
            handleDragLeave={handleDragLeave}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            fileInputRef={fileInputRef}
            dropZoneRef={dropZoneRef}
            isLoading={isLoading}
            registrationProgress={registrationProgress}
            isMobile={isMobile}
            t={t}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <FormStepsWrapper formRef={formRef}>
        {/* Header */}
        <FormHeader
          t={t}
        >
          <EnhancedStepper
            activeStep={activeStep}
            isTablet={isTablet}
            formSteps={formSteps}
          />
        </FormHeader>

        {/* Form body */}
        <FormBody
          activeStep={activeStep}
          handleBack={handleBack}
          handleNext={handleNext}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          renderStepContent={renderStepContent}
          t={t}
        />

        {/* Footer */}
        <FormFooter
          t={t}
          appRoutes={appRoutes}
        />
      </FormStepsWrapper>
      {SnackbarComponent}
    </Box>
  );
};

export default Register;
