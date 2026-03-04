// ─── Olympic Dashboard Design System ─────────────────────────────────────────

export const COLORS = {
  // Background layers
  bg0: '#030712',          // deepest background
  bg1: '#0a0f1e',          // page background
  bg2: '#0f1629',          // card background
  bg3: '#151e35',          // elevated card
  bg4: '#1c2640',          // hover/active state

  // Border
  border: '#1e2d4a',
  borderLight: '#2a3d5e',

  // Olympic rings palette
  gold: '#FFD700',
  goldLight: '#FFE566',
  silver: '#C0C0C0',
  bronze: '#CD7F32',

  // Primary accent
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryGlow: 'rgba(59,130,246,0.15)',

  // Secondary accent
  teal: '#14B8A6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',

  // Chart series (8 colors)
  series: [
    '#3B82F6', // blue
    '#FFD700', // gold
    '#14B8A6', // teal
    '#EC4899', // pink
    '#F97316', // orange
    '#8B5CF6', // purple
    '#10B981', // green
    '#F43F5E', // red
    '#06B6D4', // cyan
    '#A855F7', // violet
    '#FBBF24', // amber
    '#34D399', // emerald
  ],

  medalColors: {
    Gold: '#FFD700',
    Silver: '#C0C0C0',
    Bronze: '#CD7F32',
    'No Medal': '#334155',
  },
} as const;

export const TYPOGRAPHY = {
  displayFont: '"Bebas Neue", "Impact", sans-serif',
  headingFont: '"Barlow", "DM Sans", sans-serif',
  bodyFont: '"Inter", "DM Sans", system-ui, sans-serif',
  monoFont: '"JetBrains Mono", "Fira Code", monospace',
} as const;

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;

export const TRANSITIONS = {
  fast: '150ms ease',
  base: '250ms ease',
  slow: '400ms ease',
} as const;

export const HIGHCHARTS_THEME: Highcharts.Options = {
  colors: [...COLORS.series],
  chart: {
    backgroundColor: 'transparent',
    style: { fontFamily: TYPOGRAPHY.bodyFont },
    animation: { duration: 800 },
  },
  title: { style: { color: COLORS.textPrimary, fontFamily: TYPOGRAPHY.headingFont, fontSize: '16px' } },
  subtitle: { style: { color: COLORS.textSecondary } },
  xAxis: {
    gridLineColor: COLORS.border,
    lineColor: COLORS.border,
    tickColor: COLORS.border,
    labels: { style: { color: COLORS.textSecondary } },
    title: { style: { color: COLORS.textSecondary } },
  },
  yAxis: {
    gridLineColor: COLORS.border,
    labels: { style: { color: COLORS.textSecondary } },
    title: { style: { color: COLORS.textSecondary } },
  },
  legend: {
    itemStyle: { color: COLORS.textSecondary, fontWeight: '400' },
    itemHoverStyle: { color: COLORS.textPrimary },
  },
  tooltip: {
    backgroundColor: COLORS.bg3,
    borderColor: COLORS.borderLight,
    borderRadius: 8,
    style: { color: COLORS.textPrimary },
    shadow: true,
  },
  plotOptions: {
    series: {
      animation: { duration: 800 },
    },
  },
  credits: { enabled: false },
  accessibility: { enabled: false },
} as const;
