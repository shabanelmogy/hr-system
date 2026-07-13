export const gradientIconStyle = {
  color: "#fff",
  background: "linear-gradient(45deg, #2575fc, #6a11cb)",
  "&:hover": {
    background: "linear-gradient(45deg, #1e5ed6, #5a0cb0)",
  },
} as const;

export const authHeaderStyles = {
  gradientBackground: {
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(135deg, rgba(37, 117, 252, 0.9), rgba(106, 17, 203, 0.85))",
      zIndex: 1,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      top: "-50%",
      right: "-50%",
      width: "200%",
      height: "200%",
      background:
        "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%)",
      transform: "rotate(-45deg)",
      zIndex: 2,
    },
  },
} as const;
