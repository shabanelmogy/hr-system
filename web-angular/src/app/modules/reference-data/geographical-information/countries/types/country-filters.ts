import { parseGridFilters,type GridColumnFilter,type GridFilters } from '../../../../../shared/data/public-api';
const textModes=['contains','notContains','equals','notEquals','startsWith','endsWith'] as const;
export const countryColumnFilterDefinitions:readonly GridColumnFilter[]=[
 {field:'id',type:'number',maxConstraints:4,numberMode:'integer',minimum:-2147483648,maximum:2147483647},
 ...['nameAr','nameEn','alpha2Code','alpha3Code','phoneCode','currencyCode'].map(field=>({field,type:'text' as const,maxLength:200,maxConstraints:4,modes:textModes})),
 {field:'statesCount',type:'number',maxConstraints:4,numberMode:'integer',minimum:-2147483648,maximum:2147483647},
 {field:'createdOn',type:'date',maxConstraints:4},{field:'updatedOn',type:'date',maxConstraints:4},
 {field:'isDeleted',type:'boolean',maxConstraints:4},
];
export function parseCountryFilters(value:unknown):GridFilters{
 const filters=parseGridFilters(value,countryColumnFilterDefinitions);
 if(filters.some(group=>(group.field==='id'||group.field==='statesCount')&&group.constraints.some(rule=>typeof rule.value!=='number'||!Number.isInteger(rule.value)||rule.value<-2147483648||rule.value>2147483647)))throw Error('Country numeric filters require int32 values');
 return filters;
}
export function countryFiltersValid(value:unknown):value is GridFilters{try{parseCountryFilters(value);return true;}catch{return false;}}
