"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import {
  completeClientNavigation,
  reportWebVital,
} from "@/lib/observability/clientTelemetry";

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

const handleWebVital: ReportWebVitalsCallback = (metric) => {
  reportWebVital(metric);
};

export function ClientObservability() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useReportWebVitals(handleWebVital);

  useEffect(() => {
    completeClientNavigation();
  }, [pathname, searchParams]);

  return null;
}
