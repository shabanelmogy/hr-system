"use client";

import { Box, Button } from "@mui/material";
import Section from "@/shared/components/layout/Section";
import KpiRow from "../rows/kpi-row";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";

const KpisPage = () => {
  const router = useRouter();
  return (
    <Box>
      <Section
        title="All KPIs"
        subtitle="Key performance indicators overview"
        actions={
          <Button
            size="small"
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
          >
            Back
          </Button>
        }
      >
        <KpiRow showAll />
      </Section>
    </Box>
  );
};

export default KpisPage;
