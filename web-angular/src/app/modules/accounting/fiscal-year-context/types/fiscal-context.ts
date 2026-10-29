import * as z from 'zod/mini';
const date=z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/),z.refine(value=>{const parsed=new Date(value+'T00:00:00Z');return !value.startsWith('0000')&&Number.isFinite(parsed.valueOf())&&parsed.toISOString().slice(0,10)===value;}));
const year=z.object({id:z.int().check(z.positive()),code:z.string(),nameAr:z.string(),nameEn:z.string(),startDate:date,endDate:date,status:z.int().check(z.minimum(1),z.maximum(5)),isCurrent:z.boolean()});
const context=z.object({companyCurrentFiscalYear:z.nullable(year),selectedFiscalYear:z.nullable(year),hasUserOverride:z.boolean(),availableFiscalYears:z.array(year)});
export type FiscalContext=z.infer<typeof context>;
export function parseFiscalContext(value:unknown):FiscalContext{
  const result=context.parse(value),items=result.availableFiscalYears;
  if(new Set(items.map(y=>y.id)).size!==items.length||items.some(y=>y.startDate>y.endDate)||items.filter(y=>y.isCurrent).length>1)throw Error('Invalid fiscal context identity/calendar.');
  const current=items.find(y=>y.isCurrent)??null,selected=result.selectedFiscalYear;
  const member=(item:typeof selected)=>!item||items.some(y=>JSON.stringify(y)===JSON.stringify(item));
  if(!member(selected)||!member(result.companyCurrentFiscalYear)||current?.id!==result.companyCurrentFiscalYear?.id||result.hasUserOverride!==Boolean(selected&&selected.id!==current?.id)||!result.hasUserOverride&&selected?.id!==current?.id)throw Error('Inconsistent fiscal context projection.');
  return result;
}
