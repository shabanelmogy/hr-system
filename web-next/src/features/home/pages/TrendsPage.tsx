"use client";

import { Box, Button } from "@mui/material";
import Section from "@/shared/components/layout/Section";
import TrendsRow from "../rows/trends-row";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useEffect } from "react";

const TrendsPage = () => {
  const router = useRouter();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <Box>
      <Section
        title="All People Trends"
        subtitle="Extended trends and distribution insights"
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
        <TrendsRow showAll />
      </Section>
    </Box>
  );
};

export default TrendsPage;
