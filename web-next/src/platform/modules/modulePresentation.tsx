import AppsRoundedIcon from "@mui/icons-material/AppsRounded";

import type {
  LauncherTone,
  ModuleLauncherModule,
} from "@/shared/components/layout/module-launcher";
import type { ErpModule, ModuleSubmodule } from "./types";
import { getFrontendModuleDefinition } from "./registry";

export function toLauncherModules(modules: readonly ErpModule[]): ModuleLauncherModule[] {
  return modules.map(toLauncherModule);
}

export function toLauncherModule(module: ErpModule): ModuleLauncherModule {
  const presentation = getFrontendModuleDefinition(module.code);

  return {
    code: module.code,
    name: module.name,
    icon: presentation?.icon ?? <AppsRoundedIcon />,
    tone: presentation?.tone ?? ("primary" as LauncherTone),
    accentColor: presentation?.accentColor,
    submodules: module.submodules.map((submodule) => toLauncherSubmodule(module.code, submodule)),
  };
}

function toLauncherSubmodule(moduleCode: string, submodule: ModuleSubmodule) {
  const presentation = getFrontendModuleDefinition(moduleCode)?.submodules.find(
    (candidate) => candidate.code.toLowerCase() === submodule.code.toLowerCase(),
  );
  return {
    code: submodule.code,
    name: submodule.name,
    entryPath: submodule.entryPath,
    icon: presentation?.icon ?? <AppsRoundedIcon />,
    tone: presentation?.tone ?? ("primary" as LauncherTone),
  };
}
