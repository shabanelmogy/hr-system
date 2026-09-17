import { SubmoduleEntryPage } from "@/platform/modules";

interface ModuleSubmoduleRouteProps {
  params: Promise<{ moduleCode: string; submoduleCode: string }>;
}

export default async function ModuleSubmoduleRoute({ params }: ModuleSubmoduleRouteProps) {
  const { moduleCode, submoduleCode } = await params;
  return (
    <SubmoduleEntryPage
      moduleCode={moduleCode}
      submoduleCode={submoduleCode}
    />
  );
}
