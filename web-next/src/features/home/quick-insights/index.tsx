import { SparklineChart } from "@/shared/components/charts";
import { GroupAdd, Schedule } from "@mui/icons-material";
import {
  alpha,
  Box,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
  Button,
  Divider,
} from "@mui/material";
import React from "react";
import {
  sparklineHiring,
  sparklineOvertime,
  sparklineSatisfaction,
  timeToHireDays,
  sparklineApplicants,
  sparklineOffersAcceptance,
  sparklineAbsence,
  sparklineHeadcount,
  sparklineTrainingCompletion,
  sparklineRemoteRatio,
  sparklineAttritionRisk,
  sparklinePtoUtilization,
  sparklineSickDays,
  sparklineOnboardingCompletion,
  sparklineInternalMobility,
  sparklineDiversityIndex,
  sparklineGenderBalance,
  sparklineNps,
  sparklineComplianceIncidents,
} from "./data";

const QuickInsights = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Quick Insights</Typography>
        <Button size="small" variant="outlined" onClick={() => setExpanded((e) => !e)}>
          {expanded ? "Show Less" : "Show All"}
        </Button>
      </Stack>
      <Grid container spacing={2}>
        {/* Group: Hiring */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="caption" sx={{
            color: "text.secondary"
          }}>Hiring</Typography>
          <Divider sx={{ my: 0.5 }} />
        </Grid>

        {/* Hires (last 7d) */}
        <Grid size={{ xs: 12, md: 3.4 }}>
          <Paper sx={{ p: 1.25, borderRadius: 3, backgroundColor: alpha(theme.palette.background.paper, 0.7), border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`, height: "100%" }}>
            <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
              <GroupAdd color="primary" />
              <Box>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Hires (7d)</Typography>
                <SparklineChart data={sparklineHiring} type="bar" width={100} height={40} color={theme.palette.primary.main} showValue valueKey="value" />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Time to Hire */}
        <Grid size={{ xs: 12, md: 2.6 }}>
          <Paper sx={{ p: 1.25, borderRadius: 3, backgroundColor: alpha(theme.palette.background.paper, 0.7), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`, height: "100%" }}>
            <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
              <Schedule color="success" />
              <Box>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Time-to-Hire</Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "success.main",
                    fontWeight: 800
                  }}>{timeToHireDays} days</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Employee Satisfaction */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 1.25, borderRadius: 3, backgroundColor: alpha(theme.palette.background.paper, 0.7), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`, height: "100%" }}>
            <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
              <Box>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Satisfaction (7d)</Typography>
                <SparklineChart data={sparklineSatisfaction} type="line" width={100} height={40} color={theme.palette.info.main} showValue valueKey="value" />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Overtime Hours */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 1.25, borderRadius: 3, backgroundColor: alpha(theme.palette.background.paper, 0.7), border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`, height: "100%" }}>
            <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
              <Box>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Overtime (7d)</Typography>
                <SparklineChart data={sparklineOvertime} type="bar" width={100} height={40} color={theme.palette.warning.main} showValue valueKey="value" />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Expanded groups only when Show All */}
        {expanded && (
          <>
            {/* Group: Pipeline & Offers */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>Pipeline & Offers</Typography>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Applicants (7d)</Typography>
                <SparklineChart data={sparklineApplicants} type="area" width={140} height={44} color={theme.palette.primary.main} showValue valueKey="value" />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Offer Acceptance %</Typography>
                <SparklineChart data={sparklineOffersAcceptance} type="line" width={140} height={44} color={theme.palette.success.main} showValue valueKey="value" />
              </Paper>
            </Grid>

            {/* Group: Workforce */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>Workforce</Typography>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Headcount</Typography>
                <SparklineChart data={sparklineHeadcount} type="line" width={140} height={44} color={theme.palette.info.main} showValue valueKey="value" />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Absence Rate %</Typography>
                <SparklineChart data={sparklineAbsence} type="bar" width={140} height={44} color={theme.palette.warning.main} showValue valueKey="value" />
              </Paper>
            </Grid>

            {/* Group: Development */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>Development</Typography>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Training Completion %</Typography>
                <SparklineChart data={sparklineTrainingCompletion} type="area" width={140} height={44} color={theme.palette.secondary.main} showValue valueKey="value" />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Remote Ratio %</Typography>
                <SparklineChart data={sparklineRemoteRatio} type="line" width={140} height={44} color={theme.palette.success.main} showValue valueKey="value" />
              </Paper>
            </Grid>

            {/* Group: Risk */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>Risk</Typography>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Attrition Risk</Typography>
                <SparklineChart data={sparklineAttritionRisk} type="line" width={140} height={44} color={theme.palette.error.main} showValue valueKey="value" />
              </Paper>
            </Grid>

            {/* Group: Time Off & Wellbeing */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>Time Off & Wellbeing</Typography>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>PTO Utilization %</Typography>
                <SparklineChart data={sparklinePtoUtilization} type="area" width={140} height={44} color={theme.palette.info.main} showValue valueKey="value" />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Sick Days (7d)</Typography>
                <SparklineChart data={sparklineSickDays} type="bar" width={140} height={44} color={theme.palette.warning.main} showValue valueKey="value" />
              </Paper>
            </Grid>

            {/* Group: Onboarding & Mobility */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>Onboarding & Mobility</Typography>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Onboarding Completion %</Typography>
                <SparklineChart data={sparklineOnboardingCompletion} type="line" width={140} height={44} color={theme.palette.success.main} showValue valueKey="value" />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Internal Mobility %</Typography>
                <SparklineChart data={sparklineInternalMobility} type="area" width={140} height={44} color={theme.palette.secondary.main} showValue valueKey="value" />
              </Paper>
            </Grid>

            {/* Group: Inclusion & Culture */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>Inclusion & Culture</Typography>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Diversity Index</Typography>
                <SparklineChart data={sparklineDiversityIndex} type="line" width={140} height={44} color={theme.palette.info.main} showValue valueKey="value" />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Gender Balance % (F)</Typography>
                <SparklineChart data={sparklineGenderBalance} type="area" width={140} height={44} color={theme.palette.primary.main} showValue valueKey="value" />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>eNPS</Typography>
                <SparklineChart data={sparklineNps} type="line" width={140} height={44} color={theme.palette.success.main} showValue valueKey="value" />
              </Paper>
            </Grid>

            {/* Group: Compliance */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>Compliance</Typography>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 1.25, borderRadius: 3, border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
                <Typography variant="caption" sx={{
                  color: "text.secondary"
                }}>Incidents (7d)</Typography>
                <SparklineChart data={sparklineComplianceIncidents} type="bar" width={140} height={44} color={theme.palette.error.main} showValue valueKey="value" />
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default QuickInsights;
