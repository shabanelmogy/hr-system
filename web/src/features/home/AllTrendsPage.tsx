import { Box, Button } from "@mui/material";
import Section from "./components/Section";
import TrendsRow from "./rows/02TrendsRow";
import { useNavigate } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useEffect } from "react";

const AllTrendsPage = () => {
  const navigate = useNavigate();
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
            onClick={() => navigate(-1)}
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

export default AllTrendsPage;
