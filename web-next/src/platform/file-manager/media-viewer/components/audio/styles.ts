import { keyframes } from "@mui/material";

// Animations
export const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

export const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const wave = keyframes`
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
`;

export const glow = keyframes`
  /* currentColor is the slider's palette primary, so the glow follows the theme. */
  0%, 100% { box-shadow: 0 0 5px color-mix(in srgb, currentColor 30%, transparent); }
  50% { box-shadow: 0 0 20px color-mix(in srgb, currentColor 80%, transparent); }
`;

export const slideIn = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;
