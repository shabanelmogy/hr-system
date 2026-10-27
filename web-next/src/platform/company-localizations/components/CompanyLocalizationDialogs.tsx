"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MyForm, MySelect, MyTextField } from "@/shared/components/forms";
import { applyApiFieldErrors } from "@/shared/utils/formErrors";
import { useUnsavedChanges } from "@/shared/contexts/UnsavedChangesContext";
import { defaultFormSchema, textFormSchema } from "../validation/companyLocalizationValidation";
import type { CompanySettings, CompanyTextRow, DefaultFormValues, TextFormValues, Language } from "../types/companyLocalization";

export function DefaultLanguageDialog({settings,onClose,onSave,onReload,canEdit}:{
  settings:CompanySettings;onClose:()=>void;onSave:(values:DefaultFormValues,revision:number)=>Promise<void>;
  onReload:()=>Promise<CompanySettings|undefined>;canEdit:boolean;
}){
  const {t}=useTranslation();const {requestDiscard}=useUnsavedChanges();
  const [revision,setRevision]=useState(settings.revision);const [failed,setFailed]=useState(false);
  const form=useForm<DefaultFormValues>({resolver:zodResolver(defaultFormSchema),defaultValues:{language:settings.defaultLanguage}});
  const submit=form.handleSubmit(async values=>{if(!canEdit)return;try{await onSave(values,revision);onClose();}catch{setFailed(true);}});
  return <MyForm open onClose={onClose} title={t("companyLocalizations.defaultLanguage")} onSubmit={submit}
    isSubmitting={form.formState.isSubmitting} isDirty={form.formState.isDirty} isViewMode={!canEdit} hideFooter={!canEdit}
    submitButtonText={t("actions.save")}>
    <Stack spacing={2}><Alert severity="info">{t("companyLocalizations.languageHint")}</Alert>
      {failed?<Alert severity="error" action={<Button onClick={async()=>{if(!await requestDiscard())return;const latest=await onReload();if(latest){setRevision(latest.revision);form.reset({language:latest.defaultLanguage});setFailed(false);}}}>{t("companyLocalizations.reload")}</Button>}>{t("companyLocalizations.saveFailed")}</Alert>:null}
      <MySelect control={form.control} name="language" label={t("companyLocalizations.defaultLanguage")} errors={form.formState.errors}
        dataSource={settings.languages.map(value=>({value,label:t(value==="ar"?"companyLocalizations.arabic":"companyLocalizations.english")}))}
        valueMember="value" displayMember="label" showClearButton={false}/>
    </Stack>
  </MyForm>;
}
export function TextDialog({row,source,revision,onClose,onSave,onReload,canEdit,mockDataEnabled=true}:{
  mockDataEnabled?:boolean;row:CompanyTextRow;source:string;language:Language;revision:number;onClose:()=>void;onSave:(value:string,revision:number)=>Promise<void>;
  onReload:()=>Promise<void>;canEdit:boolean;
}){
  const {t}=useTranslation();const {requestDiscard}=useUnsavedChanges();
  const [captured]=useState(revision);const [failed,setFailed]=useState(false);
  const form=useForm<TextFormValues>({resolver:zodResolver(textFormSchema(t("companyLocalizations.valueRequired"),row.shippedValue)),defaultValues:{value:row.targetValue}});
  const submit=form.handleSubmit(async values=>{if(!canEdit)return;try{await onSave(values.value,captured);onClose();}catch(error:unknown){
    applyApiFieldErrors(error,form.setError,{"value":"value","Value":"value","Request.Value":"value","request.value":"value"});setFailed(true);
  }});
  return <MyForm open onClose={onClose} title={t("companyLocalizations.edit")} subtitle={source+" · "+row.key} onSubmit={submit}
    isSubmitting={form.formState.isSubmitting} isDirty={form.formState.isDirty} isViewMode={!canEdit} hideFooter={!canEdit}
    errors={form.formState.errors.value?.message?{value:form.formState.errors.value.message}:{}}
    errorLabels={{value:t("companyLocalizations.value")}} focusFieldName={form.formState.errors.value?"value":null}
    submitButtonText={t("actions.save")} mockDataAction={mockDataEnabled?{onGenerate:()=>{if(canEdit)form.setValue("value",row.shippedValue+t("companyLocalizations.mockSuffix"),{shouldDirty:true});},disabled:!canEdit}:undefined}>
    <Stack spacing={2}>
      {failed?<Alert severity="error" action={<Button onClick={async()=>{if(await requestDiscard())await onReload();}}>{t("companyLocalizations.reload")}</Button>}>{t("companyLocalizations.saveFailed")}</Alert>:null}
      <Typography variant="body2">{t("companyLocalizations.baseValue")}: {row.baseValue}</Typography>
      <Typography variant="body2">{t("companyLocalizations.shippedValue")}: {row.shippedValue}</Typography>
      <MyTextField control={form.control} name="value" errors={form.formState.errors} label={t("companyLocalizations.value")} multiline rows={4}/>
    </Stack>
  </MyForm>;
}
