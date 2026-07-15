// Chart utility functions and constants

import type { PaletteMode } from '@mui/material';

// Enhanced color palettes optimized for dark and light modes
export const COLOR_PALETTES = {
  primary: {
    light: ['#1976d2', '#42a5f5', '#90caf9', '#e3f2fd', '#0d47a1', '#1565c0', '#1e88e5', '#64b5f6'],
    dark: ['#64b5f6', '#1e88e5', '#1565c0', '#0d47a1', '#e3f2fd', '#90caf9', '#42a5f5', '#1976d2']
  },
  secondary: {
    light: ['#9c27b0', '#ba68c8', '#ce93d8', '#f3e5f5', '#4a148c', '#6a1b9a', '#8e24aa', '#ab47bc'],
    dark: ['#ab47bc', '#8e24aa', '#6a1b9a', '#4a148c', '#f3e5f5', '#ce93d8', '#ba68c8', '#9c27b0']
  },
  success: {
    light: ['#2e7d32', '#4caf50', '#81c784', '#c8e6c9', '#1b5e20', '#388e3c', '#66bb6a', '#a5d6a7'],
    dark: ['#a5d6a7', '#66bb6a', '#388e3c', '#1b5e20', '#c8e6c9', '#81c784', '#4caf50', '#2e7d32']
  },
  warning: {
    light: ['#ed6c02', '#ff9800', '#ffb74d', '#ffe0b2', '#e65100', '#f57c00', '#ff8f00', '#ffab00'],
    dark: ['#ffab00', '#ff8f00', '#f57c00', '#e65100', '#ffe0b2', '#ffb74d', '#ff9800', '#ed6c02']
  },
  error: {
    light: ['#d32f2f', '#f44336', '#e57373', '#ffcdd2', '#b71c1c', '#c62828', '#e53935', '#ef5350'],
    dark: ['#ef5350', '#e53935', '#c62828', '#b71c1c', '#ffcdd2', '#e57373', '#f44336', '#d32f2f']
  },
  info: {
    light: ['#0288d1', '#03a9f4', '#4fc3f7', '#b3e5fc', '#01579b', '#0277bd', '#0288d1', '#039be5'],
    dark: ['#039be5', '#0288d1', '#0277bd', '#01579b', '#b3e5fc', '#4fc3f7', '#03a9f4', '#0288d1']
  },
  neutral: {
    light: ['#424242', '#616161', '#757575', '#9e9e9e', '#212121', '#424242', '#616161', '#757575'],
    dark: ['#757575', '#616161', '#424242', '#212121', '#9e9e9e', '#757575', '#616161', '#424242']
  },
  rainbow: {
    light: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'],
    dark: ['#f7dc6f', '#98d8c8', '#dda0dd', '#ffeaa7', '#96ceb4', '#45b7d1', '#4ecdc4', '#ff6b6b']
  }
};

// Backward compatibility - return appropriate palette based on theme mode
export type ChartPaletteName = keyof typeof COLOR_PALETTES;
export type ChartColors = string[] | { light: string[]; dark: string[] } | string;

const isChartPaletteName = (value: string): value is ChartPaletteName => value in COLOR_PALETTES;

export const getColorPalette = (paletteName: string, mode: PaletteMode = 'light'): string[] => {
  if (!isChartPaletteName(paletteName)) return COLOR_PALETTES.primary[mode];
  const palette = COLOR_PALETTES[paletteName];
  return palette[mode];
};

// Chart dimensions
export const CHART_DIMENSIONS = {
  small: { width: '100%', height: 200 },
  medium: { width: '100%', height: 300 },
  large: { width: '100%', height: 400 },
  xlarge: { width: '100%', height: 500 }
};

// Animation configurations
export const ANIMATION_CONFIG = {
  duration: 800,
  easing: 'ease-out',
  delay: 0
};

// Format number with locale
const toFiniteNumber = (value: unknown): number => {
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

export const formatNumber = (
  value: unknown,
  locale = 'en-US',
  options: Intl.NumberFormatOptions = {},
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  }).format(toFiniteNumber(value));
};

// Format percentage
export const formatPercentage = (value: unknown, decimals = 1): string => {
  return `${toFiniteNumber(value).toFixed(decimals)}%`;
};

// Format currency
export const formatCurrency = (value: unknown, currency = 'USD', locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(toFiniteNumber(value));
};

// Generate gradient colors
export const generateGradient = (color: string, steps = 5): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < steps; i++) {
    const opacity = 1 - (i * 0.2);
    colors.push(`${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`);
  }
  return colors;
};

// Get responsive font size
export const getResponsiveFontSize = (
  size: number,
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md',
): number => {
  const sizes = {
    xs: size * 0.75,
    sm: size * 0.85,
    md: size,
    lg: size * 1.1,
    xl: size * 1.2
  };
  return sizes[breakpoint] || size;
};

// Calculate chart margins
export const calculateMargins = (hasLegend: boolean, hasTitle: boolean, hasLabels: boolean) => {
  return {
    top: hasTitle ? 40 : 20,
    right: hasLegend ? 100 : 20,
    bottom: hasLabels ? 60 : 40,
    left: hasLabels ? 60 : 40
  };
};

// Data transformation utilities
type ChartRecord = Record<string, unknown>;

export const transformDataForChart = (
  data: readonly ChartRecord[] | null | undefined,
  xKey: string,
  yKey: string,
  groupKey: string | null = null,
): ChartRecord[] => {
  if (!data || !Array.isArray(data)) return [];
  
  if (groupKey) {
    // Group data by groupKey
    const grouped = data.reduce<Record<string, ChartRecord[]>>((acc, item) => {
      const group = String(item[groupKey] ?? '');
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});
    
    return Object.entries(grouped).map(([key, items]) => ({
      [xKey]: key,
      [yKey]: items.reduce((sum, item) => sum + toFiniteNumber(item[yKey]), 0),
      items: items
    }));
  }
  
  return data.map(item => ({
    [xKey]: item[xKey],
    [yKey]: item[yKey],
    ...item
  }));
};

// Sort data for charts
export const sortChartData = <T extends ChartRecord>(
  data: readonly T[],
  key: string,
  direction: 'asc' | 'desc' = 'desc',
): T[] => {
  return [...data].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    const result = String(aVal ?? '').localeCompare(String(bVal ?? ''), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
    return direction === 'asc' ? result : -result;
  });
};

// Filter top N items
export const getTopItems = <T extends ChartRecord>(data: readonly T[], key: string, count = 10): T[] => {
  return sortChartData(data, key, 'desc').slice(0, count);
};

// Calculate statistics
export const calculateStats = (data: readonly ChartRecord[], key: string) => {
  if (!data || data.length === 0) return null;
  
  const values = data.map(item => item[key]).filter((value): value is number => typeof value === 'number');
  if (values.length === 0) return null;
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  return { sum, avg, min, max, count: values.length };
};

// Generate mock data for testing
export const generateMockData = (count = 10): ChartRecord[] => {
  const categories = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'];
  const data: ChartRecord[] = [];
  
  for (let i = 0; i < count; i++) {
    data.push({
      name: categories[i % categories.length] + ` ${Math.floor(i / categories.length) + 1}`,
      value: Math.floor(Math.random() * 100) + 10,
      category: categories[i % categories.length],
      date: new Date(2024, 0, i + 1).toISOString().split('T')[0]
    });
  }
  
  return data;
};

export const resolveChartColors = (
  colors: ChartColors,
  mode: PaletteMode,
): string[] => {
  if (Array.isArray(colors)) return colors;
  if (typeof colors === 'string') return getColorPalette(colors, mode);
  return colors[mode];
};
