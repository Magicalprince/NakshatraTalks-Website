/**
 * Design Tokens - Exact match with NakshatraTalksMobile
 * Source: mobile app's tailwind.config.js and constants.ts
 */

export const colors = {
  // Primary colors
  primary: {
    DEFAULT: '#2930A6',
    light: '#3B42B8',
    dark: '#1E2485',
  },
  secondary: {
    DEFAULT: '#FFCF0D',
    light: '#FFD93D',
    dark: '#E6BA00',
  },
  accent: '#FFCF0D',

  // Text colors
  text: {
    primary: '#000000',
    secondary: '#595959',
    muted: '#6D5B5B',
    dark: '#333333',
    nearBlack: '#1A1A1A',
    white: '#FFFFFF',
  },

  // Background colors
  background: {
    white: '#FFFFFF',
    offWhite: '#F5F5F5',
    light: '#F8F9FA',
    card: '#E1E1E1',
    chat: '#ECE5DD',
    gray: '#D9D9D9',
  },

  // Status colors
  status: {
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#007AFF',
    online: '#2930A6',
    offline: '#6D5B5B',
  },

  // Message bubble colors
  message: {
    user: '#0084FF',
    astrologer: '#FEF3C7',
    readTick: '#34B7F1',
    border: 'rgba(0, 0, 0, 0.05)',
  },

  // Transaction colors
  transaction: {
    credit: '#22C55E',
    debit: '#EF4444',
    refund: '#F59E0B',
  },

  // Gray scale
  gray: {
    light: '#666666',
    medium: '#595959',
    dark: '#371B34',
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
} as const;

export const typography = {
  fontFamily: {
    primary: '"Lexend", sans-serif',
    secondary: '"Nunito", sans-serif',
    display: '"Poppins", sans-serif',
  },

  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
    extraBold: 800,
  },

  fontSize: {
    xs: '10px',
    sm: '12px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '22px',
    '3xl': '26px',
    '4xl': '30px',
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.625,
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  base: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '28px',
  '3xl': '32px',
  '4xl': '40px',
  '5xl': '48px',
} as const;

export const borderRadius = {
  none: '0',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '28px',
  '4xl': '30px',
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  card: '0 2px 8px rgba(0, 0, 0, 0.1)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.15)',
  modal: '0 4px 24px rgba(0, 0, 0, 0.2)',
  button: '0 2px 4px rgba(0, 0, 0, 0.1)',
  message: '0 1px 1px rgba(0, 0, 0, 0.1)',
  glowPrimary: '0 0 20px rgba(41, 48, 166, 0.3)',
  glowSecondary: '0 0 20px rgba(255, 207, 13, 0.3)',
} as const;

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  spring: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// Component-specific styles (matching mobile app)
export const componentStyles = {
  // Card styles
  card: {
    borderRadius: borderRadius.lg,
    shadow: shadows.card,
    padding: spacing.base,
    background: colors.background.white,
  },

  // Button sizes
  button: {
    sm: {
      height: '32px',
      padding: '0 12px',
      fontSize: typography.fontSize.sm,
    },
    md: {
      height: '44px',
      padding: '0 16px',
      fontSize: typography.fontSize.base,
    },
    lg: {
      height: '52px',
      padding: '0 24px',
      fontSize: typography.fontSize.md,
    },
  },

  // Input styles
  input: {
    height: '48px',
    borderRadius: borderRadius.md,
    padding: '0 16px',
    fontSize: typography.fontSize.base,
    borderColor: colors.gray[300],
  },

  // Avatar sizes
  avatar: {
    sm: '32px',
    md: '48px',
    lg: '64px',
    xl: '80px',
    '2xl': '93px', // Specific size from mobile BrowseChat
  },

  // Header height
  header: {
    height: '60px',
    mobileHeight: '56px',
  },

  // Bottom nav
  bottomNav: {
    height: '80px',
  },

  // Message bubble
  messageBubble: {
    maxWidth: '80%',
    borderRadius: '20px',
    padding: '8px 12px',
  },
} as const;

const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  componentStyles,
};

export default designTokens;
