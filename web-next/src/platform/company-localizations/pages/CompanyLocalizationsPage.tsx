"use client";
import dynamic from "next/dynamic";
import TranslateIcon from "@mui/icons-material/Translate";
import { useMemo, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Grid, Stack } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { FeedbackState } from "@/shared/components/feedback/states";
import { MyDataGrid } from "@/shared/components/data-grid";
import { MySelect } from "@/shared/components/forms";
import { ConfirmationDialog } from "@/shared/components/dialogs";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { useSession } from "@/lib/auth/SessionContext";
import { permissions } from "@/lib/auth/permissions";
import { useServerListState } from "@/shared/hooks/useServerListState";
import { resolveAvailableCompanyUiSource, useCompanyLocalization } from "../hooks/useCompanyLocalization";
import type { CompanySettings, CompanyTextRow, Language, TextQuery, TextStatus } from "../types/companyLocalization";

const TextDialog=dynamic(()=>import("../components/CompanyLocalizationDialogs").then(value=>value.TextDialog),{ssr:false});
const DefaultLanguageDialog=dynamic(()=>import("../components/CompanyLocalizationDialogs").then(value=>value.DefaultLanguageDialog),{ssr:false});
type Filters={source:string;baseLanguage:Language;targetLanguage:Language;status:TextStatus};
type TextTarget={row:CompanyTextRow;revision:number;source:string;language:Language};

export default function CompanyLocalizationsPage({system=false}:{system?:boolean}){
  const {t,i18n}=useTranslation();const {user}=useSession();const {hasPermission,isReadOnly}=usePermissions();
  const canView=hasPermission(system?permissions.ViewSystemUiTexts:permissions.ViewCompanyLocalizations);
  const canEdit=canView&&!isReadOnly&&hasPermission(system?permissions.EditSystemUiTexts:permissions.EditCompanyLocalizations);
  const canReset=canView&&!isReadOnly&&hasPermission(system?permissions.ResetSystemUiTexts:permissions.ResetCompanyLocalizations);
  const canDefault=!system&&canView&&!isReadOnly&&hasPermission(permissions.SetCompanyLocalizationDefault);
  const list=useServerListState<"key",Filters>({defaultColumn:"key",defaultFilters:{source:"",baseLanguage:"en",targetLanguage:"ar",status:"all"},defaultPageSize:25});
  const query:TextQuery={...list.state.filters,search:list.debouncedSearchValue,page:list.state.page+1,pageSize:list.state.pageSize};
  const api=useCompanyLocalization(query,canView&&(system||Boolean(user?.companyId)),system);
  const [editing,setEditing]=useState<TextTarget|null>(null);
  const [defaultTarget,setDefaultTarget]=useState<CompanySettings|null>(null);
  const [resetTarget,setResetTarget]=useState<TextTarget|null>(null);
  const [resetError,setResetError]=useState(false);
  const settings=api.settings.data;const texts=api.texts.data;
  const source=resolveAvailableCompanyUiSource(query.source,settings?.sources,"web");
  const company=i18n.language.startsWith("ar")?user?.companyNameAr:user?.companyNameEn;
  const languages=useMemo(()=>[{value:"en",label:t("companyLocalizations.english")},{value:"ar",label:t("companyLocalizations.arabic")}],[t]);
  const sources=useMemo(()=>(settings?.sources??[]).map(item=>({id:item.id,label:t(item.client==="web"?"companyLocalizations.web":"companyLocalizations.mobile")+" · "+item.namespace})),[settings?.sources,t]);
  const statuses=useMemo(()=>["all","missing","customized"].map(value=>({value,label:t("companyLocalizations."+value)})),[t]);
  const columns=useMemo<GridColDef<CompanyTextRow>[]>(()=>[
    {field:"key",headerName:t("companyLocalizations.key"),flex:1,minWidth:180,sortable:false},
    {field:"baseValue",headerName:t("companyLocalizations.baseValue"),flex:1,minWidth:220,sortable:false},
    {field:"targetValue",headerName:t(system?"systemUiTexts.targetValue":"companyLocalizations.targetValue"),flex:1,minWidth:220,sortable:false},
    {field:"isCustomized",headerName:t("companyLocalizations.status"),width:160,sortable:false,
      renderCell:({row})=><Chip size="small" color={row.isCustomized?"info":"default"} label={t(row.isCustomized?"companyLocalizations.customized":"companyLocalizations.missing")}/>},
    {field:"actions",headerName:t("actions.buttons"),width:180,sortable:false,filterable:false,renderCell:({row})=><Stack direction="row">
      <Button size="small" onClick={()=>{if(canEdit&&texts)setEditing({row,revision:texts.revision,source,language:query.targetLanguage});}} disabled={!canEdit}>{t("companyLocalizations.edit")}</Button>
      <Button size="small" onClick={()=>{if(canReset&&texts){setResetError(false);setResetTarget({row,revision:texts.revision,source,language:query.targetLanguage});}}} disabled={!canReset||!row.isCustomized}>{t("companyLocalizations.reset")}</Button>
    </Stack>},
  ],[canEdit,canReset,query.targetLanguage,source,t,texts,system]);
  if(!canView||!user||(!system&&!user.companyId))return <FeedbackState icon={<TranslateIcon/>} title={t(system?"systemUiTexts.loadFailed":"companyLocalizations.loadFailed")}/>;
  const reload=async()=>{await Promise.all([api.settings.refetch(),api.texts.refetch()]);};
  return <ContentWrapper fillAvailable sx={{minHeight:"min-content",flexShrink:0}}>
    <PageHeader title={t(system?"systemUiTexts.title":"companyLocalizations.title")} subTitle={system?t("systemUiTexts.scope"):t("companyLocalizations.scope",{company:company||user.companyId})}
      actions={system?undefined:<Button onClick={()=>{if(canDefault&&settings&&"defaultLanguage" in settings)setDefaultTarget(settings);}} disabled={!canDefault||!settings}>{t("companyLocalizations.setDefault")}</Button>}/>
    <Alert severity="info" sx={{mb:2}}>{t(system?"systemUiTexts.hint":"companyLocalizations.languageHint")}{settings&&"defaultLanguage" in settings?" · "+t(settings.defaultLanguage==="ar"?"companyLocalizations.arabic":"companyLocalizations.english"):""}</Alert>
    {api.settings.isError||api.texts.isError?<FeedbackState icon={<TranslateIcon/>} title={t(system?"systemUiTexts.loadFailed":"companyLocalizations.loadFailed")} role="alert" actions={<Button onClick={()=>void reload()}>{t("companyLocalizations.reload")}</Button>}/>
      :api.settings.isPending?<FeedbackState icon={<CircularProgress/>} title={t("general.loading")}/>
      :<Box sx={{minHeight:360,flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
        <MyDataGrid rows={texts?.items??[]} columns={columns} loading={api.texts.isFetching} getRowId={row=>row.key}
          pagination paginationMode="server" rowCount={texts?.totalCount??0} paginationModel={{page:list.state.page,pageSize:list.state.pageSize}}
          onPaginationModelChange={model=>{if(model.pageSize!==list.state.pageSize)list.setPageSize(model.pageSize);else list.setPage(model.page);}}
          pageSizeOptions={[10,25,50,100]} disableColumnFilter disableRowSelectionOnClick showToolbar
          showNavigationButtons={false} autoActivateFirstRow={false} autoSelectFirstRow={false}
          toolbarFilters={<>
<Grid size={{xs:12,sm:6,lg:3}}><MySelect all={false} selectedItem={source} handleSelectionChange={event=>list.setFilters({...list.state.filters,source:String(event.target.value??"")})}
        dataSource={sources}
        valueMember="id" displayMember="label" label={t("companyLocalizations.source")} showClearButton={false}/></Grid>
      <Grid size={{xs:12,sm:6,lg:3}}><MySelect all={false} selectedItem={query.baseLanguage} handleSelectionChange={event=>list.setFilters({...list.state.filters,baseLanguage:event.target.value==="ar"?"ar":"en"})}
        dataSource={languages} valueMember="value" displayMember="label" label={t("companyLocalizations.baseLanguage")} showClearButton={false}/></Grid>
      <Grid size={{xs:12,sm:6,lg:3}}><MySelect all={false} selectedItem={query.targetLanguage} handleSelectionChange={event=>list.setFilters({...list.state.filters,targetLanguage:event.target.value==="ar"?"ar":"en"})}
        dataSource={languages} valueMember="value" displayMember="label" label={t("companyLocalizations.targetLanguage")} showClearButton={false}/></Grid>
      <Grid size={{xs:12,sm:6,lg:3}}><MySelect all={false} selectedItem={query.status} handleSelectionChange={event=>list.setFilters({...list.state.filters,status:event.target.value==="missing"?"missing":event.target.value==="customized"?"customized":"all"})}
        dataSource={statuses}
        valueMember="value" displayMember="label" label={t("companyLocalizations.status")} showClearButton={false}/></Grid>
              </>}
          toolbarSearch={{value:list.state.searchValue,onChange:list.setSearchValue,onClear:()=>list.setSearchValue(""),placeholder:t("companyLocalizations.search")}}
          sx={{height:"100%",minHeight:240}}/>
      </Box>}
    {defaultTarget?<DefaultLanguageDialog key={user.tenantId+":"+user.companyId} settings={defaultTarget} canEdit={canDefault}
      onClose={()=>setDefaultTarget(null)} onSave={async(values,revision)=>{if(canDefault)await api.defaultMutation.mutateAsync({language:values.language,expectedRevision:revision});}}
      onReload={async()=>{const result=await api.settings.refetch();return result.data&&"defaultLanguage" in result.data?result.data:undefined;}}/>:null}
    {editing?<TextDialog key={editing.source+":"+editing.language+":"+editing.row.key} {...editing} mockDataEnabled={!system} canEdit={canEdit} onClose={()=>setEditing(null)}
      onSave={async(value,revision)=>{if(canEdit)await api.textMutation.mutateAsync({source:editing.source,language:editing.language,key:editing.row.key,value,expectedRevision:revision});}}
      onReload={async()=>{await reload();setEditing(null);}}/>:null}
    <ConfirmationDialog open={Boolean(resetTarget)} title={t(system?"systemUiTexts.resetTitle":"companyLocalizations.resetTitle")} description={t(system?"systemUiTexts.resetDescription":"companyLocalizations.resetDescription")}
      confirmLabel={t("companyLocalizations.reset")} cancelLabel={t("actions.cancel")} busy={api.resetMutation.isPending} onClose={()=>setResetTarget(null)}
      onConfirm={async()=>{if(!canReset||!resetTarget)return;try{
        await api.resetMutation.mutateAsync({source:resetTarget.source,language:resetTarget.language,key:resetTarget.row.key,expectedRevision:resetTarget.revision});setResetTarget(null);
      }catch{setResetError(true);}}}>
      {resetError?<Alert severity="error" action={<Button onClick={()=>{setResetTarget(null);void reload();}}>{t("companyLocalizations.reload")}</Button>}>{t("companyLocalizations.saveFailed")}</Alert>:null}
    </ConfirmationDialog>
  </ContentWrapper>;
}
