import type { Theme } from '@mui/material/styles';

export const getChartTheme = (muiTheme: Theme) => {
  return {
    grid: {
      stroke: muiTheme.palette.divider,
      strokeDasharray: '3 3',
      strokeOpacity: 0.4
    },

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

    legend: {
      wrapperStyle: {
        fontSize: 12,
        color: muiTheme.palette.text.secondary,
        fontFamily: muiTheme.typography.fontFamily
      }
    },

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
