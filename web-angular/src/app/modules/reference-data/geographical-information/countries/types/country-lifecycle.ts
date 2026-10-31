import { parseCountryId } from './country';

export type CountryLifecycleAction='archive'|'restore'|'bulk';
export function parseCountryBatch(input:readonly number[]):readonly number[]{
 if(!Array.isArray(input)||input.length<1||input.length>100)throw Error('Invalid Country batch');
 const ids=input.map(parseCountryId);
 if(new Set(ids).size!==ids.length)throw Error('Duplicate Country IDs');
 return ids;
}
export function parseArchivedCount(value:unknown,maximum:number):number{
 if(typeof value!=='object'||value===null||!('archivedCount'in value)||typeof value.archivedCount!=='number'||!Number.isInteger(value.archivedCount)||value.archivedCount<0||value.archivedCount>maximum)throw Error('Invalid archive response');
 return value.archivedCount;
}
/** Only known public domain codes become user messages; server details stay private. */
export function countryLifecycleError(codes:readonly string[],action:CountryLifecycleAction):string{
 const messages:Readonly<Record<string,string>>={
  'Country.CountryInUseByState':'countries.inUseByState',
  'Country.CountryInUseByAddress':'countries.inUseByAddress',
  'Country.CountryInUseByCompany':'countries.inUseByCompany',
  'Country.CountryNotFound':'countries.notFound',
 };
 return codes.map(code=>messages[code]).find(Boolean)??(action==='restore'?'countries.restoreError':action==='bulk'?'countries.bulkArchiveError':'countries.deleteError');
}
