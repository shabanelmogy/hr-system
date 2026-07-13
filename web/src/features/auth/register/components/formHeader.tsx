/* eslint-disable react/prop-types */
import HowToRegIcon from "@mui/icons-material/HowToReg";
import {
  alpha,
  Avatar,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion"; // Optional: for animation effects
import { headerStyles } from "../../../../constants/styles";

interface FormHeaderProps {
  children: React.ReactNode;
  t: (key: string) => string;
}

export default function FormHeader({ children, t }: FormHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        background:
          "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%)",
        color: "#ffffff",
        textAlign: "center",
        borderRadius: { xs: "0px", sm: "16px 16px 0 0" },
        boxShadow: `0 4px 20px ${alpha("#000", 0.15)}`,
        position: "relative",
        overflow: "hidden",
        ...headerStyles.gradientBg,
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Avatar
          component={motion.div}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={{
            mx: "auto",
            mb: 1,
            background: `linear-gradient(135deg, ${theme.palette.secondary.main
              }, ${alpha(theme.palette.primary.main, 0.9)})`,
            color: "white",
            width: { xs: 64, md: 72 },
            height: { xs: 64, md: 72 },
            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
            display: { xs: "none", sm: "flex" }, // Show on sm and up
            border: `3px solid ${alpha("#fff", 0.2)}`,
          }}
        >
          <HowToRegIcon
            fontSize="large"
            sx={{
              fontSize: { xs: 36, md: 40 },
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
            }}
          />
        </Avatar>

        <Typography
          variant={isMobile ? "h4" : "h5"}
          fontWeight="bold"
          gutterBottom
          component={motion.div}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          sx={{
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
            letterSpacing: "0.5px",
          }}
        >
          {t("auth.createAccount") || "Create Your Account"}
        </Typography>

        {/* Stepper */}
        <Box
          component={motion.div}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          sx={{
            mt: 1,
            px: { xs: 0, sm: 2 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
