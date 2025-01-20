export const lightTheme = {
  // Background Colors
  bgColor: '#FFFFFF',
  menuBgColor: '#FFFFFF',
  menuSlideColor: 'rgba(0, 0, 0, 0.5)',

  // Text Colors
  textColor: '#1F2937',
  headingColor: '#111827',
  timeTextColor: '#6B7280',

  // UI Element Colors
  iconColor: '#4B5563',
  borderColor: 'E5E7EB',

  // Status Colors
  successColor: '#00C851',
  errorColor: '#ff4444',

  // Interactive Elements
  buttonPrimaryBg: '#3B82F6',
  buttonPrimaryText: '#FFFFFF',

  // Card and Container
  cardBgColor: '#FFFFFF',
  cardBorderColor: '#E5E7EB',
  cardShadowColor: 'rgba(0, 0, 0, 0.1)',
};

export const darkTheme = {
  // Background Colors
  bgColor: '#1F2937',
  menuBgColor: '#111827',
  menuSlideColor: 'rgba(0, 0, 0, 0.7)',

  // Text Colors
  textColor: '#F3F4F6',
  headingColor: '#FFFFFF',
  timeTextColor: '#9CA3AF',

  // UI Element Colors
  iconColor: '#D1D5DB',
  borderColor: '374151',

  // Status Colors
  successColor: '#00C851',
  errorColor: '#ff4444',

  // Interactive Elements
  buttonPrimaryBg: '#3B82F6',
  buttonPrimaryText: '#FFFFFF',

  // Card and Container
  cardBgColor: '#374151',
  cardBorderColor: '#4B5563',
  cardShadowColor: 'rgba(0, 0, 0, 0.3)',
};

export type Theme = typeof lightTheme;

// Helper function to get the current theme
export const getTheme = (isDark: boolean): Theme => {
  return isDark ? darkTheme : lightTheme;
};
