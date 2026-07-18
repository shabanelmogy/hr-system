import { useQuery } from "@tanstack/react-query";
import { getHealthCheckReport } from "../services/healthCheckService";

const healthCheckKeys = {
  report: ["advancedTools", "healthCheck"] as const,
};

export default function useHealthCheckQuery() {
  return useQuery({
    queryKey: healthCheckKeys.report,
    queryFn: getHealthCheckReport,
    retry: false,
    staleTime: 10_000,
  });
}
