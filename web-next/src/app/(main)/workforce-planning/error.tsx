"use client";

import RouteError from "@/shared/components/feedback/routes/RouteError";

export default function WorkforcePlanningError({ error, reset }: { error: Error; reset: () => void }) {
  return <RouteError error={error} reset={reset} />;
}
