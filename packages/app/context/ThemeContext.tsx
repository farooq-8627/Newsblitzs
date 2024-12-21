import React, { createContext, useContext, useState } from 'react';

interface ThemeColors {
  background: string;
  text: string;
  primary: string;
  secondary: string;
}

interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
}

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const defaultTheme: Theme = {
  id: 'light',
  name: 'Light',
  colors: {
    background: '#FFFFFF',
    text: '#1A1A1A',
    primary: '#007AFF',
    secondary: '#5856D6',
  },
};

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: defaultTheme,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme: setCurrentTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext); 