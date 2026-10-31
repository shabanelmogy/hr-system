import { inject,Injectable } from '@angular/core';import type { CanActivateFn } from '@angular/router';import { map,timer } from 'rxjs';
@Injectable()export class CriteriaPreviewGate{allowed=true;waitMs=0;}
export const criteriaPreviewGuard:CanActivateFn=()=>{const gate=inject(CriteriaPreviewGate);return gate.waitMs?timer(gate.waitMs).pipe(map(()=>gate.allowed)):gate.allowed;};
