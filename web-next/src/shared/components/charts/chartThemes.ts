// Chart theme configurations

export const getChartTheme = (muiTheme) => {
  const isDark = muiTheme.palette.mode === 'dark';

  return {
    // Grid styles
    grid: {
      stroke: muiTheme.palette.divider,
      strokeDasharray: '3 3',
      strokeOpacity: 0.4
    },

    // Axis styles
    axis: {
      tick: {
        fontSize: 12,
        fill: muiTheme.palette.text.secondary,
        fontFamily: muiTheme.typography.fontFamily
      },
      line: {
        stroke: muiTheme.palette.divider
      },
      label: {
        fontSize: 14,
        fill: muiTheme.palette.text.primary,
        fontWeight: 500
      }
    },

    // Tooltip styles
    tooltip: {
      contentStyle: {
        backgroundColor: muiTheme.palette.background.paper,
        border: `1px solid ${muiTheme.palette.divider}`,
        borderRadius: muiTheme.shape.borderRadius,
        boxShadow: muiTheme.shadows[4],
        color: muiTheme.palette.text.primary,
        fontSize: 12,
        fontFamily: muiTheme.typography.fontFamily
      },
      cursor: {
        fill: muiTheme.palette.action.hover
      }
    },

    // Legend styles
    legend: {
      wrapperStyle: {
        fontSize: 12,
        color: muiTheme.palette.text.secondary,
        fontFamily: muiTheme.typography.fontFamily
      }
    },

    // Colors based on theme
    colors: {
      primary: muiTheme.palette.primary.main,
      secondary: muiTheme.palette.secondary.main,
      success: muiTheme.palette.success.main,
      warning: muiTheme.palette.warning.main,
      error: muiTheme.palette.error.main,
      info: muiTheme.palette.info.main
    }
  };
};


// Chart-specific themes
export const CHART_THEMES = {
  default: {
    grid: true,
    legend: true,
    animation: true
  },

  minimal: {
    grid: false,
    axis: {
      axisLine: false,
      tickLine: false
    }
  },

  clean: {
    grid: false,
    border: false,
    minimal: true
  }
};