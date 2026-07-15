// components/CountryForm.tsx
import MyForm from "@/shared/components/common/form/MyForm";
import MyTextField from "@/shared/components/common/form-controls/MyTextField";
import { faker } from '@faker-js/faker';
import { zodResolver } from "@hookform/resolvers/zod";
import { Casino } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { countries } from "../utils/fakeData";
import { getCountryValidationSchema } from "../utils/validation";
import { CountryFormData, CountryFormProps } from "../types/Country";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";

const CountryForm = ({
  open,
  dialogType,
  selectedCountry,
  onClose,
  onSubmit,
  loading,
}: Omit<CountryFormProps, "t">) => {
  const { t } = useTranslation();

  // Persists across renders so mock data generation doesn't repeat entries within a session
  const usedIndexes = useRef<Set<number>>(new Set());

  const isViewMode: boolean = dialogType === "view";
  const isEditMode: boolean = dialogType === "edit";
  const isAddMode: boolean = dialogType === "add";

  // Memoised so the schema object is not recreated on every render
  const schema = useMemo(() => getCountryValidationSchema(t), [t]);

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      nameAr: "",
      nameEn: "",
      alpha2Code: "",
      alpha3Code: "",
      phoneCode: "",
      currencyCode: "",
    },
  });

  // Reset form when dialog opens or selected country changes
  useEffect(() => {
    if (open && (dialogType === "add" || selectedCountry)) {
      reset({
        nameAr: isEditMode || isViewMode ? selectedCountry?.nameAr || "" : "",
        nameEn: isEditMode || isViewMode ? selectedCountry?.nameEn || "" : "",
        alpha2Code:
          isEditMode || isViewMode ? selectedCountry?.alpha2Code || "" : "",
        alpha3Code:
          isEditMode || isViewMode ? selectedCountry?.alpha3Code || "" : "",
        phoneCode:
          isEditMode || isViewMode ? selectedCountry?.phoneCode || "" : "",
        currencyCode:
          isEditMode || isViewMode ? selectedCountry?.currencyCode || "" : "",
      });
    }
  }, [open, dialogType, selectedCountry, reset, isEditMode, isViewMode]);

  // Get appropriate action type for overlay
  const getOverlayActionType = (): string => {
    if (isAddMode) return "create";
    if (isEditMode) return "update";
    return "save";
  };

  // Get appropriate overlay message
  const getOverlayMessage = (): string => {
    if (isAddMode)
      return t("countries.creatingCountry") || "Creating country...";
    if (isEditMode)
      return t("countries.updatingCountry") || "Updating country...";
    return t("countries.savingCountry") || "Saving country...";
  };

  // Convert react-hook-form errors to simple error object for MyForm
  const getErrorMessages = (): Record<string, string> => {
    const errorMessages: Record<string, string> = {};
    Object.keys(errors).forEach((key) => {
      if (errors[key as keyof CountryFormData]?.message) {
        errorMessages[key] = errors[key as keyof CountryFormData]?.message as string;
      }
    });
    return errorMessages;
  };

  // Generate mock data using Faker.js
  const generateMockData = (): void => {
    const used = usedIndexes.current;
    if (used.size === countries.length) {
      used.clear(); // reset when all entries have been used
    }

    let index: number;
    do {
      index = Math.floor(Math.random() * countries.length);
    } while (used.has(index));
    used.add(index);

    const country = countries[index];

    const mockData = {
      nameEn: country.en,
      nameAr: country.ar,
      alpha2Code: faker.location.countryCode("alpha-2"),
      alpha3Code: faker.location.countryCode("alpha-3"),
      phoneCode: faker.string.numeric({ length: { min: 1, max: 4 } }),
      currencyCode: faker.finance.currencyCode(),
    };

    const mockOptions = { shouldDirty: true, shouldValidate: true };
    setValue("nameEn", mockData.nameEn, mockOptions);
    setValue("nameAr", mockData.nameAr, mockOptions);
    setValue("alpha2Code", mockData.alpha2Code, mockOptions);
    setValue("alpha3Code", mockData.alpha3Code, mockOptions);
    setValue("phoneCode", mockData.phoneCode, mockOptions);
    setValue("currencyCode", mockData.currencyCode, mockOptions);
  };


  return (
    <MyForm
      open={open}
      onClose={onClose}
      title={
        isViewMode
          ? t("countries.view")
          : isEditMode
            ? t("countries.edit")
            : t("countries.add")
      }
      subtitle={
        isViewMode
          ? t("countries.viewSubtitle") || "View country details"
          : isEditMode
            ? t("countries.editSubtitle") || "Modify country information"
            : t("countries.addSubtitle") || "Add a new country to the system"
      }
      submitButtonText={
        isViewMode
          ? undefined
          : isEditMode
            ? t("actions.update")
            : t("actions.create")
      }
      onSubmit={
        isViewMode
          ? undefined
          : handleSubmit(async (data) => {
              try {
                await onSubmit(data as CountryFormData);
              } catch (error) {
                applyApiFieldErrors(error, setError, {
                  "Country.Duplicated": ["nameAr", "nameEn", "alpha2Code", "alpha3Code"],
                });
              }
            })
      }
      isSubmitting={loading}
      isDirty={isDirty}
      hideFooter={isViewMode}
      recordId={selectedCountry?.id}
      focusFieldName="nameAr"
      autoFocusFirst={true}
      overlayActionType={getOverlayActionType()}
      overlayMessage={getOverlayMessage()}
      errors={getErrorMessages()}
      footerLeft={
        (isAddMode || isEditMode) ? (
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<Casino />}
            onClick={generateMockData}
            disabled={loading}
            size="small"
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            {t("countries.generateMockData") || "🎲 Mock Data"}
          </Button>
        ) : null
      }
    >
      {/* Required: Arabic Name */}
      <Box sx={{ mt: 2 }}>
        <MyTextField
          fieldName="nameAr"
          labelKey={t("general.nameAr")}
          loading={loading}
          errors={errors}
          control={control}
          placeholder={t("countries.nameArPlaceholder")}
          maxLength={100}
          showCounter={!isViewMode}
          readOnly={isViewMode}
        />
      </Box>

      {/* Required: English Name */}
      <MyTextField
        fieldName="nameEn"
        labelKey={t("general.nameEn")}
        loading={loading}
        errors={errors}
        control={control}
        placeholder={t("countries.nameEnPlaceholder")}
        maxLength={100}
        showCounter={!isViewMode}
        readOnly={isViewMode}
      />

      {/* Optional: Alpha2 Code */}
      <MyTextField
        fieldName="alpha2Code"
        labelKey={t("countries.alpha2Code")}
        loading={loading}
        errors={errors}
        control={control}
        placeholder="EG, US, SA"
        showCounter={!isViewMode}
        maxLength={2}
        readOnly={isViewMode}
      />

      {/* Optional: Alpha3 Code */}
      <MyTextField
        fieldName="alpha3Code"
        labelKey={t("countries.alpha3Code")}
        loading={loading}
        errors={errors}
        control={control}
        placeholder="EGY, USA, SAU"
        showCounter={!isViewMode}
        maxLength={3}
        readOnly={isViewMode}
      />

      {/* Optional: Phone Code */}
      <MyTextField
        fieldName="phoneCode"
        labelKey={t("countries.phoneCode")}
        loading={loading}
        errors={errors}
        control={control}
        placeholder="20, 1, 966"
        showCounter={!isViewMode}
        maxLength={10}
        readOnly={isViewMode}
      />

      {/* Optional: Currency Code */}
      <MyTextField
        fieldName="currencyCode"
        labelKey={t("countries.currencyCode")}
        loading={loading}
        errors={errors}
        control={control}
        placeholder="EGP, USD, SAR"
        showCounter={!isViewMode}
        maxLength={3}
        readOnly={isViewMode}
      />

    </MyForm>
  );
};

export default CountryForm;
