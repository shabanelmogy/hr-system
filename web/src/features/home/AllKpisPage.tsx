import { Box, Button } from "@mui/material";
import Section from "./components/Section";
import KpiRow from "./rows/01KpiRow";
import { useNavigate } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";

const AllKpisPage = () => {
  const navigate = useNavigate();
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
            onClick={() => navigate(-1)}
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

export default AllKpisPage;
