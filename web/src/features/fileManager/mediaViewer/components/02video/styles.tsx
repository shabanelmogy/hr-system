import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export const VideoContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  position: 'relative',
  backgroundColor: '#000',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover .controls-overlay': {
    opacity: 1,
  },
}));

export const VideoElement = styled('video')(() => ({
  width: '100%',
  height: 'auto',
  maxHeight: '80vh',
  display: 'block',
  backgroundColor: '#000',
  cursor: 'pointer',
}));

export const ControlsOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)',
  padding: theme.spacing(2),
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 10,
  backdropFilter: 'blur(4px)',
}));

export const TimeDisplay = styled(Typography)(() => ({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: '#fff',
  minWidth: '35px',
  textAlign: 'center',
  fontVariantNumeric: 'tabular-nums',
}));
