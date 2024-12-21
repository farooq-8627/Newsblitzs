import React from 'react';
import { Modal, TouchableOpacity, Text, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface MenuModalProps {
  isVisible: boolean;
  onClose: () => void;
  showBookmarksLink?: boolean;
}

export default function MenuModal({
  isVisible,
  onClose,
  showBookmarksLink = true,
}: MenuModalProps) {
  const router = useRouter();
  const translateY = useSharedValue(1000);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(1000, {
        damping: 20,
        stiffness: 90,
      });
    }
  }, [isVisible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const menuItems = [
    {
      icon: 'bookmark',
      title: 'Bookmarks',
      onPress: () => {
        onClose();
        router.push('/bookmarks');
      },
      show: showBookmarksLink,
    },
    {
      icon: 'search',
      title: 'Search Articles',
      onPress: () => {
        onClose();
        router.push('/search');
      },
      show: true,
    }
  ].filter((item) => item.show);

  return (
    <Modal transparent visible={isVisible} onRequestClose={onClose}>
      <Animated.View 
        style={[
          { 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end'
          },
          overlayStyle
        ]}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            {
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
            },
            modalStyle
          ]}
        >
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center py-4 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-200' : ''
              }`}
              onPress={item.onPress}>
              <Ionicons name={item.icon as any} size={24} className="text-gray-800" />
              <Text className="ml-4 text-base font-medium text-gray-800">{item.title}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
