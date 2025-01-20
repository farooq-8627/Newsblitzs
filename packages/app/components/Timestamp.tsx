import React from 'react';
import { View, Text } from 'react-native';
import { formatTimeAgo } from './FormatTime';
import { useTheme } from '@/context/ThemeContext';

interface TimestampProps {
  updatedAt: string;
}

const Timestamp: React.FC<TimestampProps> = ({ updatedAt }) => {
  const { theme } = useTheme();
  return (
    <View className="px-4 py-2">
      <Text className="text-xs" style={{ color: `${theme.timeTextColor}` }}>
        {formatTimeAgo(updatedAt)}
      </Text>
    </View>
  );
};

export default Timestamp; 