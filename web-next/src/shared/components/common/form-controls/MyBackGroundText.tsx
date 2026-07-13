import { Typography } from "@mui/material";

export default function MyBackGroundText({ text, direction }) {
  return (
    <Typography
      variant="h4"
      sx={{
        position: "absolute",
        top: "10%",
        left: direction === "rtl" ? "auto" : "5%",
        right: direction === "rtl" ? "5%" : "auto",
        zIndex: 0,
        opacity: 0.1,
        fontWeight: "bold",
        userSelect: "none",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        letterSpacing: "0.2em",
      }}
    >
      {text}
    </Typography>
  );
}
