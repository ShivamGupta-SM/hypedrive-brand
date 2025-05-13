export const colors = {
  primary: '#F97315',
  secondary: '#FBBF24',
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB', // Very light background
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717', // Dark background
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  green: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  rose: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FCA5A1',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  yellow: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308',
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
  },
  purple: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  red: {
    50: '#FEE2E2',
    100: '#FCA5A5',
    200: '#F87171',
    300: '#EF4444',
    400: '#DC2626',
    500: '#B91C1C',
    600: '#991B1B',
    700: '#7F1D1D',
    800: '#6B1F1F',
    900: '#4B1F1F',
  },
  text: {
    black: '#000000',
    primary: '#1A1A1A',
    secondary: '#666666',
    muted: '#999999',
  },
  border: {
    light: 'rgba(0,0,0,0.05)',
    medium: 'rgba(0,0,0,0.1)',
    dark: 'rgba(0,0,0,0.2)',
  },
} as const;

export const spacing = {
  xs: 4,
  ss: 6,
  sm: 8,
  xm: 12,
  md: 16,
  mg: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

type FontWeight =
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | 'normal'
  | 'bold'
  | 'medium'
  | 'semibold';

export const typography: { sizes: Record<string, number>; weights: Record<string, FontWeight> } = {
  sizes: {
    xxs: 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 26,
  xxxl: 32,
  full: 9999,
} as const;

// types

// Color system types
type ColorObject = typeof colors;
type ColorWithShades = keyof {
  [K in keyof ColorObject as ColorObject[K] extends Record<ColorShades, string> ? K : never]: ColorObject[K]
};

export type Colors = ColorObject;
export type ColorName = ColorWithShades;
export type ColorShades = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

// Spacing system types
export type SpacingKeys = keyof typeof spacing;
export type Spacing = typeof spacing[SpacingKeys];

// Typography system types
export type FontSizes = keyof typeof typography.sizes;
export type FontWeights = keyof typeof typography.weights;

// Border radius system types
export type RadiusKeys = keyof typeof borderRadius;
export type Radius = typeof borderRadius[RadiusKeys];

// Variant types for components
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';
export type GradientVariant = 'light' | 'default' | 'dark';

// Helper type for style variants
export type VariantProps<T> = {
  [K in keyof T]: T[K] extends Record<string, any>
    ? keyof T[K]
    : T[K] extends (...args: any[]) => any
    ? Parameters<T[K]>[0]
    : never;
};

// Type guards and utilities
export const isColorKey = (key: string): key is ColorName => {
  return key in colors && !['text', 'border', 'primary', 'secondary', 'black', 'white'].includes(key);
};

export const isShade = (shade: number | string): shade is ColorShades => {
  return [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].includes(Number(shade));
};

// Type-safe color string getter
export function getColor<T extends ColorWithShades>(
  name: T,
  shade: ColorShades
): string {
  if (!colors[name] || !(shade in colors[name])) {
    throw new Error(`Invalid color ${name} or shade ${shade}`);
  }
  return (colors[name] as Record<ColorShades, string>)[shade];
}

export function getGradient<T extends ColorWithShades>(
  color: T,
  variant: GradientVariant = 'default'
): [string, string, string] {
  const shades = {
    light: [300, 400, 500],
    default: [400, 500, 600],
    dark: [500, 600, 700],
  } as const;

  const [start, middle, end] = shades[variant];
  const colorObj = colors[color] as Record<ColorShades, string>;
  
  return [
    colorObj[start],
    colorObj[middle],
    colorObj[end],
  ];
}

// Helper function to check if a color has shades
export function hasShades(color: keyof Colors): color is ColorWithShades {
  return (
    color in colors &&
    typeof colors[color] === 'object' &&
    !['text', 'border', 'primary', 'secondary', 'black', 'white'].includes(color)
  );
}

// Theme interface for potential dark mode support
export interface Theme {
  colors: Colors;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
}

// CSS-like scale factors for responsive design
export type Scale = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

// Common component prop types
export interface BaseComponentProps {
  className?: string;
  testID?: string;
  scale?: Scale;
}

// Responsive breakpoint types
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;
