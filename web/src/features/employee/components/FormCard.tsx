/* eslint-disable react/prop-types */
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  alpha,
} from '@mui/material';

interface FormCardProps {
  title: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error';
  children: React.ReactNode;
  sx?: any;
}

const FormCard: React.FC<FormCardProps> = ({
  title,
  icon,
  color = 'primary',
  children,
  sx = {}
}) => {
  const theme = useTheme();

  const getColorScheme = () => {
    switch (color) {
      case 'secondary':
        return {
          main: theme.palette.secondary.main,
          light: theme.palette.secondary.light,
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)}, ${alpha(theme.palette.secondary.light, 0.05)})`,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
          iconBg: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
          shadow: `0 4px 16px ${alpha(theme.palette.secondary.main, 0.1)}`
        };
      case 'success':
        return {
          main: theme.palette.success.main,
          light: theme.palette.success.light,
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)}, ${alpha(theme.palette.success.light, 0.05)})`,
          border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
          iconBg: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.light, 0.1)})`,
          shadow: `0 4px 16px ${alpha(theme.palette.success.main, 0.1)}`
        };
      case 'warning':
        return {
          main: theme.palette.warning.main,
          light: theme.palette.warning.light,
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)}, ${alpha(theme.palette.warning.light, 0.05)})`,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
          iconBg: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.light, 0.1)})`,
          shadow: `0 4px 16px ${alpha(theme.palette.warning.main, 0.1)}`
        };
      case 'info':
        return {
          main: theme.palette.info.main,
          light: theme.palette.info.light,
          background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)}, ${alpha(theme.palette.info.light, 0.05)})`,
          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
          iconBg: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.light, 0.1)})`,
          shadow: `0 4px 16px ${alpha(theme.palette.info.main, 0.1)}`
        };
      case 'error':
        return {
          main: theme.palette.error.main,
          light: theme.palette.error.light,
          background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)}, ${alpha(theme.palette.error.light, 0.05)})`,
          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
          iconBg: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)}, ${alpha(theme.palette.error.light, 0.1)})`,
          shadow: `0 4px 16px ${alpha(theme.palette.error.main, 0.1)}`
        };
      default: // primary
        return {
          main: theme.palette.primary.main,
          light: theme.palette.primary.light,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.light, 0.05)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          iconBg: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.light, 0.1)})`,
          shadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`
        };
    }
  };

  const colorScheme = getColorScheme();

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${colorScheme.background} 100%)`,
        border: colorScheme.border,
        borderRadius: 4,
        boxShadow: colorScheme.shadow,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: `0 8px 24px ${alpha(colorScheme.main, 0.15)}`,
          transform: 'translateY(-2px)'
        },
        ...sx
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            fontWeight: 700,
            color: colorScheme.main
          }}
        >
          {icon && (
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background: colorScheme.iconBg,
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {React.cloneElement(icon as React.ReactElement, {
                sx: { color: colorScheme.main, ...((icon as React.ReactElement).props?.sx || {}) }
              })}
            </Box>
          )}
          {title}
        </Typography>

        {children}
      </CardContent>
    </Card>
  );
};

export default FormCard;