import { MyForm, MySelect, MyTextField } from "@/shared/components/forms";
import { useStateLookup } from "@/features/basic-data/geographical-information/states";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button } from "@mui/material";
import { useEffect } from "react";
import { type Resolver, type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { DistrictFormData, DistrictFormProps } from "../types/District";
import { getDistrictValidationSchema } from "../utils/validation";

const emptyDistrict: DistrictFormData = { nameAr: "", nameEn: "", code: "", stateId: 0 };

const DistrictForm = ({
  open, dialogType, selectedDistrict, onClose, onSubmit, loading, detailError, onRetryDetails,
}: DistrictFormProps) => {
  const { t } = useTranslation();
  const isViewMode = dialogType === "view";
  const schema = getDistrictValidationSchema(t);
  const { data: states = [], isLoading: statesLoading } = useStateLookup(undefined, { enabled: open });
  const { handleSubmit, reset, control, setError, formState: { errors, isDirty } } = useForm<DistrictFormData>({
    resolver: zodResolver(schema) as Resolver<DistrictFormData>, mode: "onChange", defaultValues: emptyDistrict,
  });
  useEffect(() => {
    if (!open) return;
    if (dialogType === "add") { reset(emptyDistrict); return; }
    if (selectedDistrict) reset({ nameAr: selectedDistrict.nameAr, nameEn: selectedDistrict.nameEn, code: selectedDistrict.code, stateId: selectedDistrict.stateId });
  }, [dialogType, open, reset, selectedDistrict]);
  const errorMessages = Object.fromEntries(Object.entries(errors).flatMap(([key, error]) => error?.message ? [[key, String(error.message)]] : []));
  const stateOptions = states.map((state) => ({ id: state.id, displayName: `${state.nameEn} (${state.nameAr})` }));
  const submit: SubmitHandler<DistrictFormData> = async (data) => {
    if (detailError) return;
    try { await onSubmit(data); }
    catch (error) { applyApiFieldErrors(error, setError, { State: "stateId", "District.Duplicated": ["nameAr", "nameEn", "code"] }); }
  };
  return <MyForm
    maxHeight="80vh" open={open} onClose={onClose}
    title={isViewMode ? t("districts.view") : dialogType === "edit" ? t("districts.edit") : t("districts.add")}
    subtitle={isViewMode ? t("districts.viewSubtitle") : dialogType === "edit" ? t("districts.editSubtitle") : t("districts.addSubtitle")}
    submitButtonText={isViewMode ? undefined : dialogType === "edit" ? t("actions.update") : t("actions.create")}
    onSubmit={isViewMode ? undefined : handleSubmit(submit)} isSubmitting={loading} isDirty={isDirty} hideFooter={isViewMode || Boolean(detailError)}
    recordId={selectedDistrict?.id} focusFieldName="nameAr" autoFocusFirst overlayActionType={dialogType === "add" ? "create" : "update"}
    overlayMessage={dialogType === "add" ? t("districts.creatingDistrict") : t("districts.updatingDistrict")} errors={errorMessages}
  >
    {detailError ? <Alert severity="error" action={onRetryDetails ? <Button color="inherit" size="small" onClick={onRetryDetails}>{t("common.retry")}</Button> : undefined}>{detailError}</Alert> : null}
    <Box sx={{ mt: 2 }}><MyTextField fieldName="nameAr" labelKey={t("general.nameAr")} loading={loading} errors={errors} control={control} placeholder={t("districts.nameArPlaceholder")} maxLength={100} showCounter={!isViewMode} readOnly={isViewMode} /></Box>
    <MyTextField fieldName="nameEn" labelKey={t("general.nameEn")} loading={loading} errors={errors} control={control} placeholder={t("districts.nameEnPlaceholder")} maxLength={100} showCounter={!isViewMode} readOnly={isViewMode} />
    <MyTextField fieldName="code" labelKey={t("districts.code")} loading={loading} errors={errors} control={control} placeholder={t("districts.codePlaceholder")} maxLength={10} showCounter={!isViewMode} readOnly={isViewMode} />
    <MySelect name="stateId" label={t("general.state")} control={control} dataSource={stateOptions} valueMember="id" displayMember="displayName" loading={loading} errors={errors} placeholder={t("districts.selectState")} isViewMode={isViewMode} disabled={loading || statesLoading} showClearButton={!isViewMode} actualFieldName="stateId" />
  </MyForm>;
};

export default DistrictForm;
