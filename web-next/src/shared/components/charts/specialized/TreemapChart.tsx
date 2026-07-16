import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import type { TreemapNode } from 'recharts';
import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getChartTheme } from '../core/chartTheme';
import { COLOR_PALETTES, formatNumber, resolveChartColors, type ChartColors } from '../core/chartUtils';
import ChartContainer from '../core/ChartContainer';
import type { ChartContainerProps } from '../core/ChartContainer';
import type { ChartFormatter, ChartInteractionHandler, ChartTooltipProps } from '../core/types';
import { getChartValue } from '../core/types';
import { useChartMotion } from '../core/useChartMotion';

export interface TreemapDataItem {
  children?: readonly TreemapDataItem[];
  [key: string]: unknown;
}

export type TreemapChartProps = Omit<ChartContainerProps, 'children'> & {
  data?: TreemapDataItem[];
  colors?: ChartColors;
  showTooltip?: boolean;
  dataKey?: string;
  nameKey?: string;
  formatValue?: ChartFormatter;
  formatLabel?: ChartFormatter;
  onRectClick?: ChartInteractionHandler;
  strokeWidth?: number;
};

const TreemapChart = ({
  data = [],
  title,
  subtitle,
  height = 400,
  colors = COLOR_PALETTES.primary,
  showTooltip = true,
  loading = false,
  error,
  gradient = false,
  dataKey = 'size',
  nameKey = 'name',
  formatValue = formatNumber,
  formatLabel = (label) => String(label ?? ''),
  onRectClick,
  strokeWidth = 2,
  ...props
}: TreemapChartProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const chartTheme = getChartTheme(theme);
  const colorPalette = resolveChartColors(colors, theme.palette.mode);
  const isAnimationActive = useChartMotion();

  const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const tooltipData = payload[0].payload;
    if (!tooltipData || typeof tooltipData !== 'object') return null;
    const category = getChartValue(tooltipData, 'category');
    return (
      <div style={chartTheme.tooltip.contentStyle}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{formatLabel(getChartValue(tooltipData, nameKey))}</p>
        <p style={{ margin: '4px 0', color: payload[0].color }}>
          {t('chartCommon.size')}: {formatValue(getChartValue(tooltipData, dataKey))}
        </p>
        {category != null && (
          <p style={{ margin: '4px 0', color: payload[0].color }}>
            {t('chartCommon.category')}: {String(category)}
          </p>
        )}
      </div>
    );
  };

  const CustomizedContent = ({ depth, x, y, width, height: nodeHeight, index, ...node }: TreemapNode) => {
    const nodeName = String(getChartValue(node, nameKey) ?? node.name ?? '');
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={nodeHeight}
          style={{
            fill: depth < 2 ? colorPalette[index % colorPalette.length] : 'none',
            stroke: theme.palette.background.paper,
            strokeWidth: strokeWidth,
            strokeOpacity: 1,
          }}
          onClick={onRectClick ? () => onRectClick(node, index) : undefined}
          role={onRectClick ? 'button' : undefined}
          tabIndex={onRectClick ? 0 : undefined}
          aria-label={nodeName}
          onKeyDown={onRectClick ? (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onRectClick(node, index);
            }
          } : undefined}
        />
        {depth === 1 ? (
          <text
            x={x + width / 2}
            y={y + nodeHeight / 2 + 7}
            textAnchor="middle"
            fill={theme.palette.text.primary}
            fontSize={Math.min(width / 8, nodeHeight / 8, 14)}
            fontFamily={theme.typography.fontFamily}
          >
            {nodeName}
          </text>
        ) : null}
        {depth === 1 ? (
          <text
            x={x + 4}
            y={y + 18}
            fill={theme.palette.text.secondary}
            fontSize={12}
            fillOpacity={0.9}
            fontFamily={theme.typography.fontFamily}
          >
            {index + 1}
          </text>
        ) : null}
      </g>
    );
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data}
        dataKey={dataKey}
        aspectRatio={4 / 3}
        stroke={theme.palette.background.paper}
        fill={colorPalette[0]}
        content={CustomizedContent}
        isAnimationActive={isAnimationActive}
      >
        {showTooltip && <Tooltip content={CustomTooltip} />}
      </Treemap>
    </ResponsiveContainer>
  );

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      height={height}
      loading={loading}
      error={error}
      dataCount={data.length}
      gradient={gradient}
      {...props}
    >
      {chartContent}
    </ChartContainer>
  );
};

export default TreemapChart;
