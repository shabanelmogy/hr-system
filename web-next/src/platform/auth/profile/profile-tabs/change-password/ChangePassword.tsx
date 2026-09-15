"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { HandleApiError } from "@/shared/services";
import { authService } from "../../../services/authService";
import Validation from "./utils/validation";

// Import components
import PasswordChangeForm from "./components/PasswordChangeForm";
import SecurityHeader from "./components/SecurityHeader";
import StyledCard, { StyledDivider } from "./components/StyledCard";
import type { PasswordChangeValues } from "./components/PasswordChangeForm";

interface ChangePasswordProps {
  showSuccess?: (message: string, title: string) => void;
  showError?: (message: string, title: string) => void;
}

const ChangePassword = ({ showSuccess, showError }: ChangePasswordProps) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const validationScheme = Validation(t);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<PasswordChangeValues>({
    mode: "onChange",
    resolver: zodResolver(validationScheme),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const handleChangePassword = async (data: PasswordChangeValues) => {
    setIsSubmitting(true);
    try {
      await authService.changePassword(data);

      // Use the showSuccess function passed from parent
      if (showSuccess) {
        showSuccess(t("auth.profileUpdated"), t("messages.success"));
      }

      reset();
      setIsEditing(false);
      await authService.logout();
      return true;
    } catch (error) {
      HandleApiError(error, (updatedState) => {
        // Use the showError function passed from parent
        if (showError) {
          showError(updatedState.messages.join("\n"), updatedState.title);
        }
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  return (
    <StyledCard>
      {/* Security Header with Icon and Buttons */}
      <SecurityHeader
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        setIsEditing={setIsEditing}
        handleCancel={handleCancel}
        handleSave={handleSubmit(handleChangePassword)}
        t={t}
      />

      <StyledDivider />

      <PasswordChangeForm
        isEditing={isEditing}
        handleSubmit={handleSubmit}
        handleChangePassword={handleChangePassword}
        control={control}
        errors={errors}
        t={t}
      />
    </StyledCard>
  );
};

export default ChangePassword;
