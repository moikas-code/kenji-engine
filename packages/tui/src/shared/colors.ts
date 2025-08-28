// ANSI color constants and utilities for terminal styling

export const colors = {
  // Reset
  reset: '\x1b[0m',
  
  // Styles
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Utility functions for colored text
export const colorText = {
  success: (text: string) => `${colors.green}${text}${colors.reset}`,
  error: (text: string) => `${colors.red}${text}${colors.reset}`,
  warning: (text: string) => `${colors.yellow}${text}${colors.reset}`,
  info: (text: string) => `${colors.cyan}${text}${colors.reset}`,
  muted: (text: string) => `${colors.gray}${text}${colors.reset}`,
  bold: (text: string) => `${colors.bright}${text}${colors.reset}`,
  dim: (text: string) => `${colors.dim}${text}${colors.reset}`
};

// Kenji Engine branded colors
export const brandColors = {
  primary: colors.white,
  secondary: colors.black,
  accent: colors.magenta,
  muted: colors.gray,
  logo: `${colors.magenta}${colors.bright}`
};

// Extended purple shades for better theming
export const purpleShades = {
  light: '\x1b[38;5;183m',    // Light purple
  medium: '\x1b[38;5;141m',   // Medium purple  
  dark: '\x1b[38;5;99m',      // Dark purple
  bright: '\x1b[38;5;213m'    // Bright purple
};

// Theme-specific color utilities
export const themeColors = {
  background: colors.black,
  foreground: colors.white,
  accent: purpleShades.medium,
  accentBright: purpleShades.bright,
  accentDark: purpleShades.dark,
  muted: colors.gray,
  success: purpleShades.light,
  warning: colors.yellow,
  error: colors.red,
  
  // Hex values for components that need them
  hex: {
    background: '#000000',
    foreground: '#FFFFFF', 
    accent: '#8B5CF6',
    accentBright: '#A855F7',
    accentDark: '#7C3AED',
    muted: '#6B7280',
    success: '#C4B5FD',
    selectedBg: '#1F1B24',
    hoverBg: '#2D1B3D'
  }
};

export default colors;