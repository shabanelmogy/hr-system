"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { apiRoutes } from "@/config";
import { apiService, HandleApiError } from "@/shared/services";
import Validation from "./utils/validation";

// Import components
import PasswordChangeForm from "./components/PasswordChangeForm";
import SecurityHeader from "./components/SecurityHeader";
import StyledCard, { StyledDivider } from "./components/StyledCard";

const ChangePassword = ({ showSuccess = null, showError = null }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const validationScheme = Validation(t);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(validationScheme),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const handleChangePassword = async (data: { currentPassword?: string; newPassword?: string }) => {
    setIsSubmitting(true);
    try {
      await apiService.put(apiRoutes.auth.changePassword, data);

      // Use the showSuccess function passed from parent
      if (showSuccess) {
        showSuccess(t("auth.profileUpdated"), t("messages.success"));
      }

      reset();
      await apiService.logout();
      return true;
    } catch (error) {
      HandleApiError(error, (updatedState: any) => {
        // Use the showError function passed from parent
        if (showError) {
          showError(updatedState.messages, (error as any)?.title);
        }
      });
      return false;
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 800);
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
