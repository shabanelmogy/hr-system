import PageUnavailable from "@/shared/components/feedback/PageUnavailable";

type UnavailableRouteProps = {
  searchParams: Promise<{
    reason?: string;
    returnTo?: string;
  }>;
};

export default async function UnavailableRoute({
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
