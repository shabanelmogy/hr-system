import { countryReadAllowed } from './country';
export type CountryWriteAction='Create'|'Edit'|'Archive'|'Restore';
export function countryWriteAllowed(actor:{readonly roles:readonly string[];readonly permissions:readonly string[];readonly tenantReadOnly:boolean}|null,action:CountryWriteAction):boolean{
 return countryReadAllowed(actor)&&!!actor&&!actor.tenantReadOnly&&actor.permissions.includes('Countries:'+action);
}
