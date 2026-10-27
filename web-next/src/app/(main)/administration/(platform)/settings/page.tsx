import { PlatformSettingsPage } from "@/platform/settings";
import { Suspense } from "react";
import { RouteLoading } from "@/shared/components/feedback/routes/RouteLoading";

type Props = { searchParams: Promise<{ tab?: string }> };

export default function Page({ searchParams }: Props) {
  return <Suspense fallback={<RouteLoading />}><SettingsContent searchParams={searchParams} /></Suspense>;
}

async function SettingsContent({ searchParams }: Props) {
  const { tab } = await searchParams;
  return <PlatformSettingsPage requestedTab={tab} />;
}
