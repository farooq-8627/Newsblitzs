import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import MenuModal from './MenuModal';
import { useTheme } from '@/context/ThemeContext';

interface BottomBarProps {
  isBookmarked: boolean;
  onBookmarkPress: () => void;
  onSharePress: () => void;
  showBookmarksLink?: boolean;
}

const BottomBar: React.FC<BottomBarProps> = ({
  isBookmarked,
  onBookmarkPress,
  onSharePress,
  showBookmarksLink = true,
}) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { theme } = useTheme();
  return (
    <View
      className="w-full flex-row items-center justify-between border-t bg-[#${bgColor}] px-4 py-4"
      style={{ borderColor: theme.borderColor }}>
      <View className="flex-row">
        <TouchableOpacity onPress={onBookmarkPress} className="mx-2">
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={30}
            color={`${theme.iconColor}`}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSharePress} className="mx-2">
          <Ionicons name="share-social-outline" size={30} color={`${theme.iconColor}`} />
        </TouchableOpacity>
      </View>

      <View className="flex-row">
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={() => setIsMenuVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color={`${theme.iconColor}`} />
        </TouchableOpacity>
      </View>

      <MenuModal
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        showBookmarksLink={showBookmarksLink}
      />
    </View>
  );
};

export default BottomBar;
