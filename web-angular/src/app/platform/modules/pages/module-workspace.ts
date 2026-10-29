import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModuleCatalogState } from '../state/module-catalog-state';

@Component({ imports: [RouterOutlet], template: '<router-outlet />' })
export class ModuleWorkspace { constructor(){inject(ModuleCatalogState).refreshIfStale();} }
