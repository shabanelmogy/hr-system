export interface ModuleSubmodule {
  code: string;
  name: string;
  requiredPermissions: string[];
  entryPath: string | null;
}

export interface ErpModule {
  code: string;
  name: string;
  submodules: ModuleSubmodule[];
  isDefault: boolean;
}
