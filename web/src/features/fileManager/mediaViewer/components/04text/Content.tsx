import React from 'react';
import { Box, CircularProgress, TextField, Typography } from '@mui/material';

export interface TextContentProps {
  loading: boolean;
  error: string | null;
  content: string;
  searchTerm: string;
  fontSize: number;
  darkMode: boolean;
}

const TextContent: React.FC<TextContentProps> = ({ loading, error, content, searchTerm, fontSize, darkMode }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">Loading file...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body1" color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <TextField
      fullWidth
      multiline
      value={searchTerm && content ? content.replace(new RegExp(searchTerm, 'gi'), (m) => `🔍${m}🔍`) : content}
      slotProps={{ input: { readOnly: true } }}
      variant="outlined"
      sx={{
        height: '100%',
        '& .MuiOutlinedInput-root': {
          height: '100%',
          borderRadius: 0,
          fontFamily: 'monospace',
          fontSize: `${fontSize}px`,
          lineHeight: 1.6,
          bgcolor: darkMode ? '#1e1e1e' : 'background.paper',
          color: darkMode ? '#ffffff' : 'text.primary',
          alignItems: 'flex-start',
        },
        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
        '& .MuiOutlinedInput-input': { padding: 2, verticalAlign: 'top', whiteSpace: 'pre-wrap' },
        '& .MuiInputBase-inputMultiline': { verticalAlign: 'top !important', whiteSpace: 'pre-wrap' },
      }}
    />
  );
};

export default TextContent;
