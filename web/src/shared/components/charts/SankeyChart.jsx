/* eslint-disable react/prop-types */
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import { useTheme } from '@mui/material';
import { getChartTheme } from './chartThemes';
import { COLOR_PALETTES, formatNumber } from './chartUtils';
import ChartContainer from './ChartContainer';

const SankeyChart = ({
  data = { nodes: [], links: [] },
  title,
  subtitle,
  height = 400,
  colors = COLOR_PALETTES.primary,
  showTooltip = true,
  loading = false,
  error = null,
  gradient = false,
  nodeWidth = 10,
  nodePadding = 60,
  formatValue = (value) => formatNumber(value),
  formatLabel = (label) => label,
  onNodeClick = null,
  onLinkClick = null,
  ...props
}) => {
  const theme = useTheme();
  const chartTheme = getChartTheme(theme);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    
    if (data.source !== undefined) {
      // This is a link
      return (
        <div style={chartTheme.tooltip.contentStyle}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Flow</p>
          <p style={{ margin: '4px 0' }}>
            From: {formatLabel(data.source.name)}
          </p>
          <p style={{ margin: '4px 0' }}>
            To: {formatLabel(data.target.name)}
          </p>
          <p style={{ margin: '4px 0', color: payload[0].color }}>
            Value: {formatValue(data.value)}
          </p>
        </div>
      );
    } else {
      // This is a node
      return (
        <div style={chartTheme.tooltip.contentStyle}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{formatLabel(data.name)}</p>
          <p style={{ margin: '4px 0', color: payload[0].color }}>
            Value: {formatValue(data.value)}
          </p>
        </div>
      );
    }
  };

  const handleNodeClick = (data, index) => {
    if (onNodeClick) {
      onNodeClick(data, index);
    }
  };

  const handleLinkClick = (data, index) => {
    if (onLinkClick) {
      onLinkClick(data, index);
    }
  };

  // Transform data for Sankey chart
  const sankeyData = {
    nodes: data.nodes.map((node, index) => ({
      ...node,
      color: colors[index % colors.length]
    })),
    links: data.links.map((link, index) => ({
      ...link,
      color: colors[index % colors.length] + '80' // Add transparency
    }))
  };

  const chartContent = (
    <ResponsiveContainer width="100%" height="100%">
      <Sankey
        data={sankeyData}
        nodeWidth={nodeWidth}
        nodePadding={nodePadding}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        node={{
          fill: theme.palette.primary.main,
          stroke: theme.palette.background.paper,
          strokeWidth: 2,
          onClick: handleNodeClick
        }}
        link={{
          stroke: theme.palette.primary.light,
          strokeOpacity: 0.6,
          onClick: handleLinkClick
        }}
      >
        {showTooltip && <Tooltip content={<CustomTooltip />} />}
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