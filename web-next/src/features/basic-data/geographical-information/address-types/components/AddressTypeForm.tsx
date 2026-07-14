import { MyForm, MyTextField } from "@/shared/components/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, TextField } from "@mui/material";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { getAddressTypeValidationSchema } from "../utils/validation";
import {
  CreateAddressTypeRequest,
  AddressTypeFormProps,
} from "../types/AddressType";
import { Casino } from "@mui/icons-material";
import { addressTypes } from "../utils/fakeData";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";

const AddressTypeForm = ({
  open,
  dialogType,
  selectedItem,
  onClose,
  onSubmit,
  loading,
}: AddressTypeFormProps) => {
  const { t } = useTranslation();

  const isViewMode: boolean = dialogType === "view";
  const isEditMode: boolean = dialogType === "edit";
  const isAddMode: boolean = dialogType === "add";

  const schema = getAddressTypeValidationSchema(t);

  const {
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors, isDirty },
  } = useForm<CreateAddressTypeRequest>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { nameAr: "", nameEn: "" },
  });

  useEffect(() => {
    if (open && (isAddMode || selectedItem)) {
      reset({
        nameAr: isEditMode || isViewMode ? selectedItem?.nameAr || "" : "",
        nameEn: isEditMode || isViewMode ? selectedItem?.nameEn || "" : "",
      });
    }
  }, [
    open,
    dialogType,
    selectedItem,
    reset,
    isEditMode,
    isViewMode,
    isAddMode,
  ]);

  const usedIndexes = useRef(new Set<number>());

  const generateMockData = (): void => {
    if (usedIndexes.current.size === addressTypes.length) {
      usedIndexes.current.clear(); // Reset if all data has been used
    }

    let index: number;
    do {
      index = Math.floor(Math.random() * addressTypes.length);
    } while (usedIndexes.current.has(index));
    usedIndexes.current.add(index);

    const addressType = addressTypes[index];

    const mockData = {
      nameEn: addressType.nameEn,
      nameAr: addressType.nameAr,
    };

    const mockOptions = { shouldDirty: true, shouldValidate: true };
    setValue("nameEn", mockData.nameEn, mockOptions);
    setValue("nameAr", mockData.nameAr, mockOptions);
  };

  const getOverlayActionType = (): string => {
    if (isAddMode) return "create";
    if (isEditMode) return "update";
    return "save";
  };

  const getOverlayMessage = (): string => {
    if (isAddMode)
      return t("addressTypes.creating") || "Creating address type...";
    if (isEditMode)
      return t("addressTypes.updating") || "Updating address type...";
    return t("addressTypes.saving") || "Saving address type...";
  };

  const getErrorMessages = (): Record<string, string> => {
    const errorMessages: Record<string, string> = {};
    Object.keys(errors).forEach((key) => {
      if (errors[key as keyof CreateAddressTypeRequest]?.message) {
        errorMessages[key] = errors[key as keyof CreateAddressTypeRequest]
          ?.message as string;
      }
    });
    return errorMessages;
  };

  const handleErrorFound = (fieldName: string, fieldElement: HTMLElement): void => {
    console.log(`Validation error in field: ${fieldName}`, fieldElement);
  };

  return (
    <MyForm
      maxHeight="58vh"
      open={open}
      onClose={onClose}
      title={
        isViewMode
          ? t("addressTypes.view")
          : isEditMode
          ? t("addressTypes.edit")
          : t("addressTypes.add")
      }
      subtitle={
        isViewMode
          ? t("addressTypes.viewSubtitle") || "View address type details"
          : isEditMode
          ? t("addressTypes.editSubtitle") || "Modify address type information"
          : t("addressTypes.addSubtitle") ||
            "Add a new address type to the system"
      }
      submitButtonText={
        isViewMode
          ? null
          : isEditMode
          ? t("actions.update")
          : t("actions.create")
      }
      onSubmit={
        isViewMode
          ? undefined
          : handleSubmit(async (data) => {
              try {
                await onSubmit(data);
              } catch (error) {
                applyApiFieldErrors(error, setError, {
                  "AddressType.Duplicated": ["nameAr", "nameEn"],
                });
              }
            })
      }
      isSubmitting={loading}
      isDirty={isDirty}
      hideFooter={isViewMode}
      recordId={selectedItem?.id}
      focusFieldName="nameAr"
      autoFocusFirst={true}
      overlayActionType={getOverlayActionType()}
      overlayMessage={getOverlayMessage()}
      errors={getErrorMessages()}
      onErrorFound={handleErrorFound}
      footerLeft={
        (isAddMode || isEditMode) ? (
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<Casino />}
            onClick={generateMockData}
            disabled={loading}
            size="small"
            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 500 }}
          >
            {t("addressTypes.generateMockData") || "🎲 Mock Data"}
          </Button>
        ) : null
      }
    >
      {(isEditMode || isViewMode) && (
        <TextField
          margin="dense"
          label="Id"
          fullWidth
          disabled
          autoComplete="off"
          value={selectedItem?.id || ""}
          sx={{ display: "none" }}
        />
      )}

      <Box sx={{ mt: 2 }}>
        <MyTextField
          fieldName="nameAr"
          labelKey={t("general.nameAr")}
          loading={loading}
          errors={errors}
          control={control}
          placeholder={t("addressTypes.nameArPlaceholder")}
          maxLength={100}
          showCounter={!isViewMode}
          readOnly={isViewMode}
          data-field-name="nameAr"
        />
      </Box>

      <MyTextField
        fieldName="nameEn"
        labelKey={t("general.nameEn")}
        loading={loading}
        errors={errors}
        control={control}
        placeholder={t("addressTypes.nameEnPlaceholder")}
        maxLength={100}
        showCounter={!isViewMode}
        readOnly={isViewMode}
        data-field-name="nameEn"
      />

    </MyForm>
  );
};

export default AddressTypeForm;
