/* eslint-disable react/prop-types */
import { Box, keyframes, Typography, useTheme } from "@mui/material";

// Define animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulse = keyframes`
  0% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
  100% { opacity: 0.4; transform: scale(1); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const LeftPanel = ({ t }: { t: any }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        flex: "0 0 40%",
        color: isDarkMode ? "white" : theme.palette.text.primary,
        p: { md: 3, lg: 4 },
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        backgroundImage: 'url("/assets/login-bg.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
        // Animated gradient overlay
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: isDarkMode
            ? "linear-gradient(135deg, rgba(30, 60, 114, 0.95) 0%, rgba(42, 82, 152, 0.9) 25%, rgba(56, 104, 190, 0.85) 50%, rgba(25, 118, 210, 0.9) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 249, 250, 0.88) 50%, rgba(241, 243, 245, 0.85) 100%)",
          zIndex: 1,
          animation: `${pulse} 10s ease-in-out infinite`,
        },
        // Decorative floating elements
        "&::after": {
          content: '""',
          position: "absolute",
          top: "10%",
          right: "5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: isDarkMode
            ? "radial-gradient(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(33, 150, 243, 0.05) 0%, transparent 70%)",
          zIndex: 2,
          animation: `${float} 15s ease-in-out infinite`,
        },
      }}
    >
      {/* Floating decorative shapes */}
      <Box
        sx={{
          position: "absolute",
          bottom: "20%",
          left: "-50px",
          width: "200px",
          height: "200px",
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          background: isDarkMode
            ? "linear-gradient(45deg, rgba(156, 39, 176, 0.1) 0%, rgba(103, 58, 183, 0.1) 100%)"
            : "linear-gradient(45deg, rgba(156, 39, 176, 0.03) 0%, rgba(103, 58, 183, 0.03) 100%)",
          zIndex: 2,
          animation: `${float} 20s ease-in-out infinite reverse`,
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          animation: `${slideIn} 0.8s ease-out`,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="700"
          sx={{
            mb: 1,
            fontSize: { md: "1.8rem", lg: "2.2rem" },
            background: isDarkMode
              ? "linear-gradient(135deg, #ffffff 0%, #e3f2fd 50%, #bbdefb 100%)"
              : "linear-gradient(135deg, #1976d2 0%, #2196f3 50%, #42a5f5 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% 200%",
            animation: `${shimmer} 3s linear infinite`,
            position: "relative",
            letterSpacing: "-0.02em",
            "&::after": {
              content: '""',
              position: "absolute",
              left: 0,
              bottom: -8,
              width: 60,
              height: 4,
              background: isDarkMode
                ? "linear-gradient(to right, rgba(255,255,255,0.8), rgba(255,255,255,0.2))"
                : "linear-gradient(to right, #2196f3, #64b5f6)",
              borderRadius: 2,
              boxShadow: "0 2px 15px rgba(33, 150, 243, 0.2)",
            },
          }}
        >
          {t("auth.welcomeBack")}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 2.5,
            opacity: 0.85,
            fontWeight: 300,
            fontSize: "0.95rem",
            color: isDarkMode
              ? "rgba(255,255,255,0.9)"
              : theme.palette.text.secondary,
            textShadow: isDarkMode ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
            maxWidth: "90%",
            lineHeight: 1.4,
            animation: `${slideIn} 1s ease-out 0.2s both`,
          }}
        >
          {t("auth.loginToAccessYourAccount")}
        </Typography>

        <FeatureList t={t} />
        <FooterContent t={t} />
      </Box>
    </Box>
  );
};

/**
 * FeatureList component with enhanced design
 */
const FeatureList = ({ t }: { t: any }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const features = [
    {
      icon: "🔒",
      gradient: isDarkMode
        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      title: t("auth.secureAccess"),
      desc: t("auth.secureAccessDesc") || "End-to-end encryption for your data",
    },
    {
      icon: "🔐",
      gradient: isDarkMode
        ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      title: t("auth.dataPrivacy"),
      desc: t("auth.dataPrivacyDesc") || "Your information is never shared",
    },
    {
      icon: "📊",
      gradient: isDarkMode
        ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      title: t("auth.analytics"),
      desc: t("auth.analyticsDesc") || "Real-time insights and tracking",
    },
  ];

  return (
    <Box sx={{ my: 3 }}>
      {features.map((feature, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            mb: 3,
            p: 2,
            borderRadius: 3,
            background: isDarkMode
              ? "rgba(255, 255, 255, 0.03)"
              : "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
              }`,
            transform: "translateX(0) scale(1)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            animation: `${slideIn} 0.8s ease-out ${0.3 + index * 0.1}s both`,
            "&:hover": {
              transform: "translateX(8px) scale(1.02)",
              background: isDarkMode
                ? "rgba(255, 255, 255, 0.06)"
                : "rgba(255, 255, 255, 0.9)",
              boxShadow: isDarkMode
                ? "0 8px 32px rgba(31, 38, 135, 0.2)"
                : "0 8px 32px rgba(31, 38, 135, 0.1)",
              "& .icon-box": {
                transform: "rotate(10deg) scale(1.1)",
              },
            },
          }}
        >
          <Box
            className="icon-box"
            sx={{
              borderRadius: "20%",
              width: 48,
              height: 48,
              background: feature.gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 2.5,
              fontSize: 22,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              transition: "transform 0.3s ease",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: -2,
                borderRadius: "20%",
                background: feature.gradient,
                opacity: 0.3,
                filter: "blur(10px)",
                zIndex: -1,
              },
            }}
          >
            {feature.icon}
          </Box>
          <Box flex={1}>
            <Typography
              variant="subtitle1"
              fontWeight="700"
              sx={{
                mb: 0.5,
                color: isDarkMode
                  ? "rgba(255,255,255,0.95)"
                  : theme.palette.text.primary,
                letterSpacing: "-0.01em",
              }}
            >
              {feature.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: isDarkMode ? 0.75 : 0.7,
                lineHeight: 1.6,
                color: isDarkMode
                  ? "rgba(255,255,255,0.8)"
                  : theme.palette.text.secondary,
              }}
            >
              {feature.desc}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

/**
 * Enhanced FooterContent component
 */
const FooterContent = ({ t }: { t: any }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  const socialIcons = [
    { icon: "🌐", label: "Website", color: "#2196f3" },
    { icon: "📧", label: "Email", color: "#f44336" },
    { icon: "📱", label: "Phone", color: "#4caf50" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: "auto",
        pt: 3,
        borderTop: `2px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
          }`,
        animation: `${slideIn} 1s ease-out 0.8s both`,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          opacity: 0.7,
          color: isDarkMode
            ? "rgba(255,255,255,0.8)"
            : theme.palette.text.secondary,
          fontWeight: 500,
          letterSpacing: "0.02em",
        }}
      >
        © {new Date().getFullYear()} {t("general.company") || "Company Name"}
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        {socialIcons.map((item, i) => (
          <Box
            key={i}
            component="span"
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              fontSize: 18,
              borderRadius: "50%",
              background: isDarkMode
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.04)",
              border: `2px solid ${isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)"
                }`,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-3px) scale(1.1)",
                background: `${item.color}20`,
                borderColor: item.color,
                boxShadow: `0 8px 20px ${item.color}30`,
                "& span": {
                  transform: "rotate(360deg)",
                },
              },
            }}
            aria-label={item.label}
          >
            <span
              style={{ transition: "transform 0.6s ease", display: "block" }}
            >
              {item.icon}
            </span>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default LeftPanel;