import { z } from "zod";
const language = z.enum(["en","ar"]);
export const companySettingsSchema = z.object({
  tenantId:z.string().min(1), companyId:z.number().int().positive(), defaultLanguage:language, revision:z.number().int().nonnegative(),
  languages:z.array(language), sources:z.array(z.object({ id:z.string(), client:z.enum(["web","mobile"]), namespace:z.string() })),
  catalogVersions:z.record(z.string(),z.string()),
});
export const companyTextsSchema = z.object({
  revision:z.number().int().nonnegative(), catalogVersion:z.string(), totalCount:z.number().int().nonnegative(), page:z.number().int().positive(), pageSize:z.number().int().positive(),
  items:z.array(z.object({ key:z.string(),baseValue:z.string(),targetValue:z.string(),shippedValue:z.string(),isCustomized:z.boolean() })),
});
export const companyRuntimeSchema = z.object({
  tenantId:z.string().min(1),companyId:z.number().int().positive(),defaultLanguage:language,revision:z.number().int().nonnegative(),catalogVersion:z.string(),
  overrides:z.array(z.object({namespace:z.string(),language,key:z.string(),value:z.string()})),
});
const placeholders = (value:string) => (value.match(/\{\{[^{}]+\}\}|\{\d+(?:[^{}]*)\}|<\/?\d+>/g) ?? []).sort();
export const textFormSchema = (message:string,shippedValue?:string) => z.object({
  value:z.string().max(4000,message).refine(value=>value.trim().length>0,message)
    .refine(value=>shippedValue===undefined || JSON.stringify(placeholders(value))===JSON.stringify(placeholders(shippedValue)),message),
});
export const defaultFormSchema = z.object({ language });

export const systemSettingsSchema = companySettingsSchema.omit({tenantId:true, companyId:true, defaultLanguage:true}).strict();
export const systemRuntimeSchema = companyRuntimeSchema.omit({tenantId:true, companyId:true, defaultLanguage:true}).strict();
