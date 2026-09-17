import { Suspense } from "react";
import { PageUnavailable, RouteLoading } from "@/shared/components/feedback/routes";

type UnavailableRouteProps = {
  searchParams: Promise<{
    reason?: string;
    returnTo?: string;
  }>;
};

export default function UnavailableRoute({
  searchParams,
}: UnavailableRouteProps) {
  return (
    <Suspense fallback={<RouteLoading />}>
      <UnavailableRouteContent searchParams={searchParams} />
    </Suspense>
  );
}

async function UnavailableRouteContent({
  searchParams,
}: UnavailableRouteProps) {
  const params = await searchParams;

  return (
    <PageUnavailable
      reason={params.reason === "service" ? "service" : "access"}
      returnTo={params.returnTo}
    />
  );
}
