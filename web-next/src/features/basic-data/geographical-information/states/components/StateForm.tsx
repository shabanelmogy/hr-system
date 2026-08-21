import { MyForm, MySelect, MyTextField } from "@/shared/components/forms";
import { useCountryLookup } from "@/features/basic-data/geographical-information/countries";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button } from "@mui/material";
import { useEffect } from "react";
import { type Resolver, type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { StateFormData, StateFormProps } from "../types/State";
import { getStateValidationSchema } from "../utils/validation";

const emptyState: StateFormData = { nameAr: "", nameEn: "", code: "", countryId: 0 };

const StateForm = ({
  open, dialogType, selectedState, onClose, onSubmit, loading, detailError, onRetryDetails,
}: StateFormProps) => {
  const { t } = useTranslation();
  const isViewMode = dialogType === "view";
  const schema = getStateValidationSchema(t);
  const { data: countries = [], isLoading: countriesLoading } = useCountryLookup({ enabled: open });
  const { handleSubmit, reset, control, setError, formState: { errors, isDirty } } = useForm<StateFormData>({
    resolver: zodResolver(schema) as Resolver<StateFormData>, mode: "onChange", defaultValues: emptyState,
  });
  useEffect(() => {
    if (!open) return;
    if (dialogType === "add") { reset(emptyState); return; }
    if (selectedState) reset({ nameAr: selectedState.nameAr, nameEn: selectedState.nameEn, code: selectedState.code, countryId: selectedState.countryId });
  }, [dialogType, open, reset, selectedState]);
  const errorMessages = Object.fromEntries(Object.entries(errors).flatMap(([key, error]) => error?.message ? [[key, String(error.message)]] : []));
  const countryOptions = countries.map((country) => ({ id: country.id, displayName: `${country.nameEn} (${country.nameAr})` }));
  const submit: SubmitHandler<StateFormData> = async (data) => {
    if (detailError) return;
    try { await onSubmit(data); }
    catch (error) { applyApiFieldErrors(error, setError, { Country: "countryId", "State.Duplicated": ["nameAr", "nameEn", "code"] }); }
  };
  return <MyForm
    maxHeight="80vh" open={open} onClose={onClose}
    title={isViewMode ? t("states.view") : dialogType === "edit" ? t("states.edit") : t("states.add")}
    subtitle={isViewMode ? t("states.viewSubtitle") : dialogType === "edit" ? t("states.editSubtitle") : t("states.addSubtitle")}
    submitButtonText={isViewMode ? undefined : dialogType === "edit" ? t("actions.update") : t("actions.create")}
    onSubmit={isViewMode ? undefined : handleSubmit(submit)} isSubmitting={loading} isDirty={isDirty} hideFooter={isViewMode || Boolean(detailError)}
    recordId={selectedState?.id} focusFieldName="nameAr" autoFocusFirst overlayActionType={dialogType === "add" ? "create" : "update"}
    overlayMessage={dialogType === "add" ? t("states.creatingState") : t("states.updatingState")} errors={errorMessages}
  >
    {detailError ? <Alert severity="error" action={onRetryDetails ? <Button color="inherit" size="small" onClick={onRetryDetails}>{t("common.retry")}</Button> : undefined}>{detailError}</Alert> : null}
    <Box sx={{ mt: 2 }}><MyTextField fieldName="nameAr" labelKey={t("general.nameAr")} loading={loading} errors={errors} control={control} placeholder={t("states.nameArPlaceholder")} maxLength={100} showCounter={!isViewMode} readOnly={isViewMode} /></Box>
    <MyTextField fieldName="nameEn" labelKey={t("general.nameEn")} loading={loading} errors={errors} control={control} placeholder={t("states.nameEnPlaceholder")} maxLength={100} showCounter={!isViewMode} readOnly={isViewMode} />
    <MyTextField fieldName="code" labelKey={t("states.code")} loading={loading} errors={errors} control={control} placeholder={t("states.codePlaceholder")} maxLength={10} showCounter={!isViewMode} readOnly={isViewMode} />
    <MySelect name="countryId" label={t("general.country")} control={control} dataSource={countryOptions} valueMember="id" displayMember="displayName" loading={loading} errors={errors} placeholder={t("states.selectCountry")} isViewMode={isViewMode} disabled={loading || countriesLoading} showClearButton={!isViewMode} actualFieldName="countryId" />
  </MyForm>;
};

export default StateForm;
