import { ModuleOverviewPage } from "@/platform/modules";

interface ModuleRouteProps {
  params: Promise<{ moduleCode: string }>;
}

export default async function ModuleRoute({ params }: ModuleRouteProps) {
  const { moduleCode } = await params;
  return <ModuleOverviewPage moduleCode={moduleCode} />;
}
