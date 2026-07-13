import React from 'react';
import { Box, Chip, alpha } from '@mui/material';
import { getColorPalette } from '../../../../../shared/components/charts/chartUtils';

interface LegendItem {
  name: string;
  value: number;
}

interface ChartLegendProps {
  data: LegendItem[];
  colors?: string[];
  showValues?: boolean;
}

const ChartLegend: React.FC<ChartLegendProps> = ({
  data,
  colors,
  showValues = true,
}) => {
  const safeData = Array.isArray(data)
    ? data.filter((i) => i && typeof i.name === 'string' && typeof i.value === 'number')
    : [];

  if (safeData.length === 0) {
    return null;
  }

  const defaultColors = getColorPalette('rainbow', 'light');

  const getSafeColor = (idx: number): string => {
    const palette = Array.isArray(colors) && colors.length > 0 ? colors : defaultColors;
    const col = palette[idx % palette.length];
    return typeof col === 'string' ? col : '#90caf9';
  };

  const applyAlpha = (color: string, value: number) => {
    try {
      return alpha(color, value);
    } catch {
      return color;
    }
  };

  return (
    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
      {safeData.map((item, index) => {
        const chipColor = getSafeColor(index);
        return (
          <Chip
            key={item.name}
            label={showValues ? `${item.name} (${item.value})` : item.name}
            size="small"
            sx={{
              backgroundColor: applyAlpha(chipColor, 0.1),
              color: chipColor,
              border: `1px solid ${applyAlpha(chipColor, 0.3)}`,
            }}
          />
        );
      })}
    </Box>
  );
};

export default ChartLegend;