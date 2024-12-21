import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

const themes = [
  {
    id: 'light',
    name: 'Light',
    colors: {
      background: '#FFFFFF',
      text: '#1A1A1A',
      primary: '#007AFF',
      secondary: '#5856D6',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      background: '#1A1A1A',
      text: '#FFFFFF',
      primary: '#0A84FF',
      secondary: '#5E5CE6',
    },
  },
  {
    id: 'sepia',
    name: 'Sepia',
    colors: {
      background: '#F4ECD8',
      text: '#5C4B37',
      primary: '#8B7355',
      secondary: '#A67F59',
    },
  },
  {
    id: 'nature',
    name: 'Nature',
    colors: {
      background: '#F5F7F4',
      text: '#2C4A3E',
      primary: '#4A7862',
      secondary: '#729B79',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      background: '#F0F5F9',
      text: '#1E2832',
      primary: '#406E8E',
      secondary: '#2C88D9',
    },
  },
];

export default function ThemeSettings() {
  const { currentTheme, setTheme } = useTheme();

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Theme Settings' }} />
      
      <ScrollView className="flex-1 p-4">
        <Text className="mb-4 text-lg font-semibold">Choose Your Theme</Text>
        
        {themes.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            className={`mb-4 rounded-lg p-4 ${
              currentTheme.id === theme.id ? 'border-2 border-blue-500' : 'border border-gray-200'
            }`}
            style={{ backgroundColor: theme.colors.background }}
            onPress={() => setTheme(theme)}
          >
            <Text
              style={{ color: theme.colors.text }}
              className="mb-2 text-lg font-medium"
            >
              {theme.name}
            </Text>
            <View className="flex-row space-x-2">
              {Object.entries(theme.colors).map(([key, color]) => (
                <View
                  key={key}
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
} 