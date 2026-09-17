import { Suspense } from "react";
import { ModuleOverviewPage } from "@/platform/modules";
import { RouteLoading } from "@/shared/components/feedback/routes";

interface ModuleRouteProps {
  params: Promise<{ moduleCode: string }>;
}

export default function ModuleRoute({ params }: ModuleRouteProps) {
  return (
    <Suspense fallback={<RouteLoading />}>
      <ModuleRouteContent params={params} />
    </Suspense>
  );
}

async function ModuleRouteContent({ params }: ModuleRouteProps) {
  const { moduleCode } = await params;
  return <ModuleOverviewPage moduleCode={moduleCode} />;
}
