// components/DistrictForm.tsx
import { MyForm, MyTextField, MySelectForm } from "@/shared/components/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Casino } from "@mui/icons-material";
import { Box, TextField, Button } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { District } from "../types/District";
import { useStates } from "../../states/hooks/useStateQueries";
import { getDistrictValidationSchema } from "../utils/validation";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";

interface DistrictFormData {
  nameAr: string;
  nameEn: string;
  code: string;
  stateId: number;
}

interface DistrictFormProps {
  open: boolean;
  dialogType: "add" | "edit" | "view";
  selectedDistrict?: District | null;
  onClose: () => void;
  onSubmit: (data: DistrictFormData) => void | Promise<void>;
  loading: boolean;
}



const DistrictForm = ({
  open,
  dialogType,
  selectedDistrict,
  onClose,
  onSubmit,
  loading,
}: DistrictFormProps) => {
  const { t } = useTranslation();
  const isViewMode: boolean = dialogType === "view";
  const isEditMode: boolean = dialogType === "edit";
  const isAddMode: boolean = dialogType === "add";

  const schema = getDistrictValidationSchema(t);

  // Load states for dropdown
  const { data: states = [] } = useStates();

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm<DistrictFormData>({
    resolver: zodResolver(schema) as any,
    mode: "onChange",
    defaultValues: {
      nameAr: "",
      nameEn: "",
      code: "",
      stateId: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (dialogType === "add") {
        reset({ nameAr: "", nameEn: "", code: "", stateId: 0 });
      } else if ((isEditMode || isViewMode) && selectedDistrict) {
        const stateId = selectedDistrict.stateId || selectedDistrict.state?.id || 0;
        reset({
          nameAr: selectedDistrict.nameAr || "",
          nameEn: selectedDistrict.nameEn || "",
          code: selectedDistrict.code || "",
          stateId: Number(stateId),
        });
      }
    }
  }, [open, dialogType, selectedDistrict, reset, isEditMode, isViewMode]);

  const getOverlayActionType = (): string => {
    if (isAddMode) return "create";
    if (isEditMode) return "update";
    return "save";
  };

  const getOverlayMessage = (): string => {
    if (isAddMode) return t("districts.creatingDistrict") || "Creating district...";
    if (isEditMode) return t("districts.updatingDistrict") || "Updating district...";
    return t("districts.savingDistrict") || "Saving district...";
  };

  const getErrorMessages = (): Record<string, string> => {
    const errorMessages: Record<string, string> = {};
    Object.keys(errors).forEach((key) => {
      if (errors[key as keyof DistrictFormData]?.message) {
        errorMessages[key] = errors[key as keyof DistrictFormData]?.message as string;
      }
    });
    return errorMessages;
  };

  const handleErrorFound = (fieldName: string, fieldElement: HTMLElement): void => {
    console.log(`Validation error in field: ${fieldName}`, fieldElement);
  };

  // Prepare states data for MySelectForm
  const statesData = states.map((state) => ({
    id: Number(state.id),
    nameEn: state.nameEn,
    nameAr: state.nameAr,
    displayName: `${state.nameEn} (${state.nameAr})`,
  }));

  // Mock data for districts: use state code + random number
  const generateMockData = (): void => {
    if (!states || states.length === 0) return;

    const randomIndex = Math.floor(Math.random() * states.length);
    const base = states[randomIndex];

    const mock = {
      nameEn: `${base.nameEn} District`,
      nameAr: `${base.nameAr} حي`,
      code: `${(base.code || base.nameEn.slice(0, 3)).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      stateId: Number(base.id),
    };

    const mockOptions = { shouldDirty: true, shouldValidate: true };
    setValue("nameEn", mock.nameEn, mockOptions);
    setValue("nameAr", mock.nameAr, mockOptions);
    setValue("code", mock.code, mockOptions);
    setValue("stateId", mock.stateId, mockOptions);
  };

  return (
    <MyForm
      maxHeight="65vh"
      open={open}
      onClose={onClose}
      title={
        isViewMode ? t("districts.view") : isEditMode ? t("districts.edit") : t("districts.add")
      }
      subtitle={
        isViewMode
          ? t("districts.viewSubtitle") || "View district details"
          : isEditMode
          ? t("districts.editSubtitle") || "Modify district information"
          : t("districts.addSubtitle") || "Add a new district to the system"
      }
      submitButtonText={isViewMode ? null : isEditMode ? t("actions.update") : t("actions.create")}
      onSubmit={
        isViewMode
          ? undefined
          : (handleSubmit(async (data) => {
              try {
                await onSubmit(data);
              } catch (error) {
                applyApiFieldErrors(error, setError, {
                  State: "stateId",
                  "District.Duplicated": ["nameAr", "nameEn", "code"],
                });
              }
            }) as any)
      }
      isSubmitting={loading}
      isDirty={isDirty}
      hideFooter={isViewMode}
      recordId={selectedDistrict?.id}
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
            {t("districts.generateMockData") || "🎲 Mock Data"}
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
          value={selectedDistrict?.id || ""}
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
          placeholder={t("districts.nameArPlaceholder") || "الاسم بالعربية"}
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
        placeholder={t("districts.nameEnPlaceholder") || "English name"}
        maxLength={100}
        showCounter={!isViewMode}
        readOnly={isViewMode}
        data-field-name="nameEn"
      />

      {/* Required: Code */}
      <MyTextField
        fieldName="code"
        labelKey={t("districts.code") || "Code"}
        loading={loading}
        errors={errors}
        control={control}
        placeholder="DST-001"
        showCounter={!isViewMode}
        maxLength={10}
        readOnly={isViewMode}
        data-field-name="code"
      />

      {/* Required: State */}
      <MySelectForm
        name="stateId"
        label={t("general.state") || "State"}
        control={control}
        dataSource={statesData}
        valueMember="id"
        displayMember="displayName"
        loading={loading}
        errors={errors}
        placeholder={t("districts.selectState") || "Select a state"}
        isViewMode={isViewMode}
        disabled={loading}
        showClearButton={!isViewMode}
        actualFieldName="stateId"
        colorMember={undefined}
        loadingText={undefined}
        noOptionsText={undefined}
      />

    </MyForm>
  );
};

export default DistrictForm;
