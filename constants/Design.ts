export const colors = {
  primary: '#F37353',
  white: '#FFFFFF',
  black: '#000000',

  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    500: '#F97316',
  },

  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
  },

  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E',
    600: '#16A34A',
  },

  red: {
    500: '#EF4444',
  },

  purple: {
    500: '#A855F7',
  },

  yellow: {
    500: '#EAB308',
  },

  rose: {
    500: '#F43F5E',
  },

  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
    black: '#000000',
  },

  border: {
    light: '#E5E7EB',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  mg: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const typography = {
  sizes: {
    xs: 12,
    xm: 14,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
