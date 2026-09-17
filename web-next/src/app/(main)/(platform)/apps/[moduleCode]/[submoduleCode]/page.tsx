import { Suspense } from "react";
import { SubmoduleEntryPage } from "@/platform/modules";
import { RouteLoading } from "@/shared/components/feedback/routes";

interface ModuleSubmoduleRouteProps {
  params: Promise<{ moduleCode: string; submoduleCode: string }>;
}

export default function ModuleSubmoduleRoute({ params }: ModuleSubmoduleRouteProps) {
  return (
    <Suspense fallback={<RouteLoading />}>
      <ModuleSubmoduleRouteContent params={params} />
    </Suspense>
  );
}

async function ModuleSubmoduleRouteContent({ params }: ModuleSubmoduleRouteProps) {
  const { moduleCode, submoduleCode } = await params;
  return (
    <SubmoduleEntryPage
      moduleCode={moduleCode}
      submoduleCode={submoduleCode}
    />
  );
}
