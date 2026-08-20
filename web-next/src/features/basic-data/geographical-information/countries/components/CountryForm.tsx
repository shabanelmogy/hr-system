// components/CountryForm.tsx
import { MyForm, MyTextField } from "@/shared/components/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import CasinoOutlinedIcon from "@mui/icons-material/CasinoOutlined";
import { Alert, Box, Button } from "@mui/material";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { getCountryValidationSchema } from "../utils/validation";
import { CountryFormData, CountryFormProps } from "../types/Country";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import { getNextCountryMockData } from "../utils/countryMockData";

const CountryForm = ({
  open,
  dialogType,
  selectedCountry,
  onClose,
  onSubmit,
  loading,
  detailError,
  onRetryDetails,
}: Omit<CountryFormProps, "t">) => {
  const { t } = useTranslation();

  const isViewMode: boolean = dialogType === "view";
  const isEditMode: boolean = dialogType === "edit";
  const isAddMode: boolean = dialogType === "add";
  const usedMockIndexes = useRef(new Set<number>());

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
      return t("countries.creatingCountry");
    if (isEditMode)
      return t("countries.updatingCountry");
    return t("countries.savingCountry");
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

  const generateMockData = () => {
    const sample = getNextCountryMockData(usedMockIndexes.current);
    const options = { shouldDirty: true, shouldValidate: true };

    setValue("nameAr", sample.nameAr, options);
    setValue("nameEn", sample.nameEn, options);
    setValue("alpha2Code", sample.alpha2Code, options);
    setValue("alpha3Code", sample.alpha3Code, options);
    setValue("phoneCode", sample.phoneCode, options);
    setValue("currencyCode", sample.currencyCode, options);
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
          ? t("countries.viewSubtitle")
          : isEditMode
            ? t("countries.editSubtitle")
            : t("countries.addSubtitle")
      }
      submitButtonText={
        isViewMode
          ? undefined
          : isEditMode
            ? t("actions.update")
            : t("actions.create")
      }
      onSubmit={
        isViewMode || detailError
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
      hideFooter={isViewMode || Boolean(detailError)}
      recordId={selectedCountry?.id}
      focusFieldName="nameAr"
      autoFocusFirst={true}
      overlayActionType={getOverlayActionType()}
      overlayMessage={getOverlayMessage()}
      errors={getErrorMessages()}
      footerLeft={
        process.env.NODE_ENV !== "production" && isAddMode ? (
          <Button
            type="button"
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={<CasinoOutlinedIcon />}
            onClick={generateMockData}
            disabled={loading}
          >
            {t("countries.generateMockData")}
          </Button>
        ) : null
      }
    >
      {detailError ? (
        <Alert
          severity="error"
          action={onRetryDetails ? (
            <Button color="inherit" size="small" onClick={onRetryDetails}>
              {t("common.retry")}
            </Button>
          ) : undefined}
          sx={{ mt: 2 }}
        >
          {detailError}
        </Alert>
      ) : null}

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
