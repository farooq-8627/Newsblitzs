import React from 'react';
import { View, Text } from 'react-native';
import { formatTimeAgo } from './FormatTime';

interface TimestampProps {
  updatedAt: string;
}

const Timestamp: React.FC<TimestampProps> = ({ updatedAt }) => {
  return (
    <View className="px-4 py-2">
      <Text className="text-xs text-gray-500">
        {formatTimeAgo(updatedAt)}
      </Text>
    </View>
  );
};

export default Timestamp; 