import React from "react";
import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import {
  LocationCity,
  Public,
  Code,
  CheckCircle,
  TrendingUp,
} from "@mui/icons-material";

interface SummaryCardsProps {
  totalDistricts: number;
  totalStates: number;
  totalCodes: number;
  activeDistricts: number;
  avgPerState: number;
  t: (key: string) => string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalDistricts,
  totalStates,
  totalCodes,
  activeDistricts,
  avgPerState,
  t,
}) => {
  const cards = [
    {
      title: t("districts.dashboard.totalDistricts"),
      value: totalDistricts,
      icon: <LocationCity />,
      color: "#1976d2",
      bgColor: "#e3f2fd",
    },
    {
      title: t("districts.dashboard.totalStates"),
      value: totalStates,
      icon: <Public />,
      color: "#388e3c",
      bgColor: "#e8f5e8",
    },
    {
      title: t("districts.dashboard.withCodes"),
      value: totalCodes,
      icon: <Code />,
      color: "#f57c00",
      bgColor: "#fff3e0",
    },
    {
      title: t("districts.dashboard.activeDistricts"),
      value: activeDistricts,
      icon: <CheckCircle />,
      color: "#7b1fa2",
      bgColor: "#f3e5f5",
    },
    {
      title: t("districts.dashboard.avgDistrictsPerState"),
      value: avgPerState,
      icon: <TrendingUp />,
      color: "#d32f2f",
      bgColor: "#ffebee",
    },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        {cards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={index}>
            <Card
              sx={{
                height: "100%",
                background: `linear-gradient(135deg, ${card.bgColor} 0%, ${card.color}15 100%)`,
                border: `1px solid ${card.color}30`,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 25px ${card.color}25`,
                  border: `1px solid ${card.color}50`,
                },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Box
                    sx={{
                      color: card.color,
                      mr: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: card.color,
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  >
                    {card.title}
                  </Typography>
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: card.color,
                    fontWeight: "bold",
                    lineHeight: 1,
                  }}
                >
                  {card.value.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SummaryCards;
