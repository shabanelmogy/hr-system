import { HttpErrorResponse } from '@angular/common/http';

export type CommandOutcome='not-sent'|'rejected'|'uncertain';
/** A transport failure is not evidence that a dispatched command was rolled back. */
export class CommandFailure extends Error {
 constructor(readonly outcome:CommandOutcome,readonly status:number|null,readonly fieldErrors:Readonly<Record<string,string>>={},readonly codes:readonly string[]=[]){super('Command '+outcome);}
}
export function classifyCommandFailure(error:unknown,dispatched:boolean,fields:readonly string[]=[]):CommandFailure{
 if(error instanceof CommandFailure)return error;
 const status=error instanceof HttpErrorResponse?error.status:null;
 const outcome:CommandOutcome=!dispatched?'not-sent':status!==null&&status>=400&&status<500&&![408,499].includes(status)?'rejected':'uncertain';
 const fieldErrors:Record<string,string>={},codes:string[]=[];
 const body:unknown=error instanceof HttpErrorResponse?error.error:null;
 if(outcome==='rejected'&&typeof body==='object'&&body!==null&&'errors'in body&&typeof body.errors==='object'&&body.errors!==null){
  for(const[key,value]of Object.entries(body.errors)){
   if(/^[A-Za-z][A-Za-z0-9_.]{0,99}$/.test(key))codes.push(key);
   const field=fields.find(field=>field.toLowerCase()===key.toLowerCase());
   const message=Array.isArray(value)?value.find(item=>typeof item==='string'&&item.trim()&&item.length<=500):value;
   if(field&&typeof message==='string'&&message.trim()&&message.length<=500)fieldErrors[field]=message;
  }
 }
 return new CommandFailure(outcome,status,fieldErrors,codes);
}
