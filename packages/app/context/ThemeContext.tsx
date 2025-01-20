import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const themes = {
  light: {
    // Light theme colors
    bgColor: '#FFFFFF',
    menuBgColor: '#FFFFFF',
    menuSlideColor: 'rgba(0, 0, 0, 0.5)',
    textColor: '#1F2937',
    headingColor: '#111827',
    timeTextColor: '#6B7280',
    iconColor: '#000000',
    borderColor: '#000000',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#E5E7EB',
    switchTrackColor: '#767577',
    switchThumbColor: '#f4f3f4',
    switchIosBackground: '#3e3e3e',
    buttonColor: '#3B82F6',
    accentColor: '#2563EB',
  },
  dark: {
    bgColor: '#1A1B2E', // Dark background
    menuBgColor: '#151626',
    menuSlideColor: 'rgba(0, 0, 0, 0.7)',
    textColor: 'rgba(255, 255, 255, 0.9)', // Secondary text
    headingColor: '#FFFFFF', // Primary text
    timeTextColor: '#A8A8A8',
    iconColor: '#2A9DF4', // Blue accent
    borderColor: '#34495E', // Dim blue for dividers
    cardBgColor: '#1E1F35',
    cardBorderColor: '#2A9DF4',
    accentColor: '#E1B12C', // Gold accent for highlights
    buttonColor: '#3498DB', // Bright blue for buttons
    switchTrackColor: '#3498DB',
    switchThumbColor: '#2A9DF4',
    switchIosBackground: '#3e3e3e',
  },
};

type ThemeType = keyof typeof themes;

interface ThemeContextType {
  theme: typeof themes.light;
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: themes.light,
  currentTheme: 'light',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('light');
  const systemColorScheme = useColorScheme();

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setCurrentTheme(savedTheme);
      } else {
        const defaultTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
        setCurrentTheme(defaultTheme);
        await AsyncStorage.setItem('@theme', defaultTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem('@theme', newTheme);
      setCurrentTheme(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const value = {
    theme: themes[currentTheme],
    currentTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
