import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModuleCatalogState } from '../state/module-catalog-state';

@Component({ imports: [RouterOutlet], providers: [ModuleCatalogState], template: '<router-outlet />' })
export class ModuleWorkspace {}
