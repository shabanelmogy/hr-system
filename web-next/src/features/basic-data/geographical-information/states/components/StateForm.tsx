import { MyForm, MySelectForm, MyTextField } from "@/shared/components/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { Casino } from "@mui/icons-material";
import { Box, Button, TextField } from "@mui/material";
import { useEffect, useRef } from "react";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useCountries } from "../../countries/hooks/useCountryQueries";
import { CreateStateRequest, State } from "../types/State";
import { states } from "../utils/fakeData";
import { getStateValidationSchema } from "../utils/validation";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";

type StateFormData = CreateStateRequest;

interface StateFormProps {
  open: boolean;
  dialogType: "add" | "edit" | "view";
  selectedState?: State | null;
  onClose: () => void;
  onSubmit: (data: StateFormData) => void | Promise<void>;
  loading: boolean;
}

const StateForm = ({
  open,
  dialogType,
  selectedState,
  onClose,
  onSubmit,
  loading,
}: StateFormProps) => {
  const { t } = useTranslation();
  const isViewMode: boolean = dialogType === "view";
  const isEditMode: boolean = dialogType === "edit";
  const isAddMode: boolean = dialogType === "add";

  const schema = getStateValidationSchema(t);

  // Get countries for dropdown
  const { data: countries = [] } = useCountries();

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm<StateFormData>({
    resolver: zodResolver(schema) as Resolver<StateFormData>,
    mode: "onChange",
    defaultValues: {
      nameAr: "",
      nameEn: "",
      code: "",
      countryId: 0,
    },
  });

  // Reset form when dialog opens or selected state changes
  useEffect(() => {
    if (open) {
      if (dialogType === "add") {
        // Reset to empty form for add mode
        reset({
          nameAr: "",
          nameEn: "",
          code: "",
          countryId: 0,
        });
      } else if ((isEditMode || isViewMode) && selectedState) {
        // Extract countryId from either direct property or nested country object
        const countryId = selectedState.countryId || selectedState.country?.id || 0;

        // Reset form with selected state data
        reset({
          nameAr: selectedState.nameAr || "",
          nameEn: selectedState.nameEn || "",
          code: selectedState.code || "",
          countryId: Number(countryId),
        });
      }
    }
  }, [open, dialogType, selectedState, reset, isEditMode, isViewMode]);

  // Get appropriate action type for overlay
  const getOverlayActionType = (): string => {
    if (isAddMode) return "create";
    if (isEditMode) return "update";
    return "save";
  };

  // Get appropriate overlay message
  const getOverlayMessage = (): string => {
    if (isAddMode)
      return t("states.creatingState") || "Creating state...";
    if (isEditMode)
      return t("states.updatingState") || "Updating state...";
    return t("states.savingState") || "Saving state...";
  };

  // Convert react-hook-form errors to simple error object for MyForm
  const getErrorMessages = (): Record<string, string> => {
    const errorMessages: Record<string, string> = {};
    Object.keys(errors).forEach((key) => {
      if (errors[key as keyof StateFormData]?.message) {
        errorMessages[key] = errors[key as keyof StateFormData]?.message as string;
      }
    });
    return errorMessages;
  };

  // Handle error found callback
  const handleErrorFound = (fieldName: string, fieldElement: HTMLElement): void => {
    console.log(`Validation error in field: ${fieldName}`, fieldElement);
  };

  // Prepare countries data for MySelectForm
  const countriesData = countries.map((country) => ({
    id: Number(country.id), // Ensure ID is a number to match countryId type
    nameEn: country.nameEn,
    nameAr: country.nameAr,
    displayName: `${country.nameEn} (${country.nameAr})`,
  }));

  // Generate mock data using Faker.js and existing fakeData
  const usedIndexes = useRef(new Set<number>());

  const generateMockData = (): void => {
    if (usedIndexes.current.size === states.length) {
      usedIndexes.current.clear();
    }

    let index: number;
    do {
      index = Math.floor(Math.random() * states.length);
    } while (usedIndexes.current.has(index));
    usedIndexes.current.add(index);

    const state = states[index];

    const mockData = {
      nameEn: state.en,
      nameAr: state.ar,
      code: state.code,
      countryId: 0,
    };

    if (countriesData.length > 0) {
      const randomCountryIndex = Math.floor(Math.random() * countriesData.length);
      mockData.countryId = countriesData[randomCountryIndex].id;
    }

    const mockOptions = { shouldDirty: true, shouldValidate: true };
    setValue("nameEn", mockData.nameEn, mockOptions);
    setValue("nameAr", mockData.nameAr, mockOptions);
    setValue("code", mockData.code, mockOptions);
    setValue("countryId", mockData.countryId, mockOptions);
  };

  const onSubmitHandler: SubmitHandler<StateFormData> = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      applyApiFieldErrors(error, setError, {
        Country: "countryId",
        "State.Duplicated": ["nameAr", "nameEn", "code"],
      });
    }
  };

  return (
    <MyForm
      maxHeight="80vh"
      open={open}
      onClose={onClose}
      title={
        isViewMode
          ? t("states.view")
          : isEditMode
            ? t("states.edit")
            : t("states.add")
      }
      subtitle={
        isViewMode
          ? t("states.viewSubtitle") || "View state details"
          : isEditMode
            ? t("states.editSubtitle") || "Modify state information"
            : t("states.addSubtitle") || "Add a new state to the system"
      }
      submitButtonText={
        isViewMode
          ? undefined
          : isEditMode
            ? t("actions.update")
            : t("actions.create")
      }
      onSubmit={isViewMode ? undefined : handleSubmit(onSubmitHandler)}
      isSubmitting={loading}
      isDirty={isDirty}
      hideFooter={isViewMode}
      recordId={selectedState?.id}
      focusFieldName="nameAr"
      autoFocusFirst={true}
      // Overlay customization
      overlayActionType={getOverlayActionType()}
      overlayMessage={getOverlayMessage()}
      // Error handling props
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
            {t("states.generateMockData") || "🎲 Mock Data"}
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
          value={selectedState?.id || ""}
          sx={{ display: "none" }}
        />
      )}

      {/* Required: Arabic Name */}
      <Box sx={{ mt: 2 }}>
        <MyTextField
          fieldName="nameAr"
          labelKey={t("general.nameAr")}
          loading={loading}
          errors={errors}
          control={control}
          placeholder={t("states.nameArPlaceholder")}
          maxLength={100}
          showCounter={!isViewMode}
          readOnly={isViewMode}
          data-field-name="nameAr"
        />
      </Box>

      {/* Required: English Name */}
      <MyTextField
        fieldName="nameEn"
        labelKey={t("general.nameEn")}
        loading={loading}
        errors={errors}
        control={control}
        placeholder={t("states.nameEnPlaceholder")}
        maxLength={100}
        showCounter={!isViewMode}
        readOnly={isViewMode}
        data-field-name="nameEn"
      />

      {/* Required: Code */}
      <MyTextField
        fieldName="code"
        labelKey={t("states.code")}
        loading={loading}
        errors={errors}
        control={control}
        placeholder="CA, NY, TX"
        showCounter={!isViewMode}
        maxLength={10}
        readOnly={isViewMode}
        data-field-name="code"
      />

      {/* Required: Country */}
      <MySelectForm
        name="countryId"
        label={t("general.country")}
        control={control}
        dataSource={countriesData}
        valueMember="id"
        displayMember="displayName"
        loading={loading}
        errors={errors}
        placeholder={t("states.selectCountry")}
        isViewMode={isViewMode}
        disabled={loading}
        showClearButton={!isViewMode}
        actualFieldName="countryId"
        colorMember={undefined}
        loadingText={undefined}
        noOptionsText={undefined} />

      {/* Generate Mock Data Button moved to footerLeft */}
    </MyForm>
  );
};

export default StateForm;
