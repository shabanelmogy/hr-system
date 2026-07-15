import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import type { SankeyLinkProps, SankeyNodeProps } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from './chartThemes';
import { COLOR_PALETTES, formatNumber, resolveChartColors, type ChartColors } from './chartUtils';
import ChartContainer from './ChartContainer';
import type { ChartContainerProps } from './ChartContainer';
import type { ChartFormatter, ChartInteractionHandler, ChartTooltipProps } from './types';
import { getChartValue } from './types';

interface SankeyInput {
  nodes: Record<string, unknown>[];
  links: Array<{ source: number; target: number; value: number; [key: string]: unknown }>;
}

export type SankeyChartProps = Omit<ChartContainerProps, 'children'> & {
  data?: SankeyInput;
  colors?: ChartColors;
  showTooltip?: boolean;
  nodeWidth?: number;
  nodePadding?: number;
  formatValue?: ChartFormatter;
  formatLabel?: ChartFormatter;
  onNodeClick?: ChartInteractionHandler;
  onLinkClick?: ChartInteractionHandler;
};

const SankeyChart = ({
  data = { nodes: [], links: [] },
  title,
  subtitle,
  height = 400,
  colors = COLOR_PALETTES.primary as ChartColors,
  showTooltip = true,
  loading = false,
  error,
  gradient = false,
  nodeWidth = 10,
  nodePadding = 60,
  formatValue = formatNumber,
  formatLabel = (label) => String(label ?? ''),
  onNodeClick,
  onLinkClick,
  ...props
}: SankeyChartProps) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);
  const colorPalette = resolveChartColors(colors, theme.palette.mode);

  const CustomTooltip = ({ active, payload }: ChartTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    const tooltipData = payload[0].payload;
    if (!tooltipData || typeof tooltipData !== 'object') return null;
    
    const source = getChartValue(tooltipData, 'source');
    const target = getChartValue(tooltipData, 'target');
    if (source && typeof source === 'object' && target && typeof target === 'object') {
      // This is a link
      return (
        <div style={chartTheme.tooltip.contentStyle}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Flow</p>
          <p style={{ margin: '4px 0' }}>
            From: {formatLabel(getChartValue(source, 'name'))}
          </p>
          <p style={{ margin: '4px 0' }}>
            To: {formatLabel(getChartValue(target, 'name'))}
          </p>
          <p style={{ margin: '4px 0', color: payload[0].color }}>
            Value: {formatValue(getChartValue(tooltipData, 'value'))}
          </p>
        </div>
      );
    } else {
      // This is a node
      return (
        <div style={chartTheme.tooltip.contentStyle}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{formatLabel(getChartValue(tooltipData, 'name'))}</p>
          <p style={{ margin: '4px 0', color: payload[0].color }}>
            Value: {formatValue(getChartValue(tooltipData, 'value'))}
          </p>
        </div>
      );
    }
  };

  const SankeyNode = ({ payload, index, x, y, width, height: nodeHeight }: SankeyNodeProps) => (
    <rect
      x={x}
      y={y}
      width={width}
      height={nodeHeight}
      fill={String(getChartValue(payload, 'color') ?? theme.palette.primary.main)}
      stroke={theme.palette.background.paper}
      strokeWidth={2}
      onClick={() => onNodeClick?.(payload, index)}
      style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
    />
  );

  const SankeyLink = (linkProps: SankeyLinkProps) => {
    const { payload, index, sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth } = linkProps;
    const path = `M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`;
    return (
      <path
        d={path}
        fill="none"
        stroke={String(getChartValue(payload, 'color') ?? theme.palette.primary.light)}
        strokeWidth={linkWidth}
        strokeOpacity={0.6}
        onClick={() => onLinkClick?.(payload, index)}
        style={{ cursor: onLinkClick ? 'pointer' : 'default' }}
      />
    );
  };

  // Transform data for Sankey chart
  const sankeyData = {
    nodes: data.nodes.map((node, index) => ({
      ...node,
      color: colorPalette[index % colorPalette.length]
    })),
    links: data.links.map((link, index) => ({
      ...link,
      color: colorPalette[index % colorPalette.length] + '80' // Add transparency
    }))
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <Sankey
        data={sankeyData}
        nodeWidth={nodeWidth}
        nodePadding={nodePadding}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        node={SankeyNode}
        link={SankeyLink}
      >
        {showTooltip && <Tooltip content={CustomTooltip} />}
      </Sankey>
    </ResponsiveContainer>
  );

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      height={height}
      loading={loading}
      error={error}
      gradient={gradient}
      {...props}
    >
      {chartContent}
    </ChartContainer>
  );
};

export default SankeyChart;
