import { Link } from 'expo-router';
import React, { useState } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LottieView from 'lottie-react-native';
import MenuModal from './MenuModal';

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
  return (
    <View className="w-full flex-row items-center justify-between border-t border-gray-300 bg-white px-4 py-4">
      <View className="flex-row">
        <TouchableOpacity onPress={onBookmarkPress} className="mx-2">
          <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSharePress} className="mx-2">
          <Ionicons name="share-social-outline" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      <View className="flex-row">
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={() => setIsMenuVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#666666" />
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
