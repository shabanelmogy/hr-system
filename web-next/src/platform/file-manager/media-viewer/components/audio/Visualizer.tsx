import React from "react";
import { Box } from "@mui/material";

export interface VisualizerProps {
  isPlaying: boolean;
  audioData: number[];
  rotateAnim?: string;
  waveAnim?: (i: number) => string;
}

const Visualizer: React.FC<VisualizerProps> = ({
  isPlaying,
  audioData,
  rotateAnim,
  waveAnim,
}) => {
  return (
    <Box
      sx={{
        flex: 1,
        background: "linear-gradient(135deg, #1976d220 0%, #9c27b020 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "linear-gradient(45deg, #333 0%, #666 50%, #333 100%)",
          animation: isPlaying ? rotateAnim : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.3,
          "&::before": {
            content: '""',
            position: "absolute",
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "#000",
            zIndex: 1,
          },
        }}
      />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          height: 120,
          zIndex: 3,
          position: "relative",
        }}
      >
        {audioData.map((value, i) => (
          <Box
            key={i}
            sx={{
              width: 3,
              height: isPlaying ? `${value * 80}px` : "4px",
              backgroundColor: `hsl(${200 + i * 5}, 70%, 60%)`,
              borderRadius: 2,
              animation: isPlaying ? waveAnim?.(i) : "none",
              transition: "all 0.2s ease",
              opacity: isPlaying ? 0.8 : 0.3,
              boxShadow: isPlaying
                ? `0 0 10px hsl(${200 + i * 5}, 70%, 60%)`
                : "none",
            }}
          />
        ))}
      </Box>

      {isPlaying &&
        [...Array(6)].map((_, i) => (
          <Box
            key={`particle-${i}`}
            sx={{
              position: "absolute",
              width: 4,
              height: 4,
              borderRadius: "50%",
              backgroundColor: "primary.main",
              opacity: 0.6,
              animation: waveAnim?.(i) || "none",
              left: `${20 + i * 12}%`,
              top: `${30 + Math.sin(i) * 20}%`,
            }}
          />
        ))}
    </Box>
  );
};

export default Visualizer;
