import React, { useCallback, useContext, useState } from 'react';
import { View, Text, FlatList, RefreshControl, Switch } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { BookmarksContext } from '@/context/BookmarksContext';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import ArticleCard from '@/components/ArticleCard';
import { useTheme } from '@/context/ThemeContext';
import Ionicons from '@expo/vector-icons/build/Ionicons';

const ThemeToggle = () => {
  const { theme, currentTheme, setTheme } = useTheme();
  const [isEnabled, setIsEnabled] = useState(currentTheme === 'dark');

  const toggleSwitch = useCallback(() => {
    setIsEnabled((previousState) => !previousState);
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [currentTheme, setTheme]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
      <Ionicons
        name="sunny-outline"
        size={20}
        color={currentTheme === 'light' ? theme.buttonColor : theme.timeTextColor}
        style={{ marginRight: 8 }}
      />
      <Switch
        trackColor={{ false: theme.switchTrackColor, true: theme.buttonColor }}
        thumbColor={isEnabled ? theme.switchThumbColor : theme.switchThumbColor}
        ios_backgroundColor={theme.switchIosBackground}
        onValueChange={toggleSwitch}
        value={isEnabled}
        style={{ transform: [{ scale: 0.9 }] }} // Slightly smaller switch
      />
      <Ionicons
        name="moon-outline"
        size={20}
        color={currentTheme === 'dark' ? theme.buttonColor : theme.timeTextColor}
        style={{ marginLeft: 8 }}
      />
    </View>
  );
};

interface BookmarkItem {
  id: string;
  imageUri: string;
  heading: string;
  text: string;
  updatedAt: string;
}

export default function Bookmarks() {
  const { bookmarks, refreshBookmarks } = useContext(BookmarksContext);
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // If you have a refresh function in your context, call it here
      await refreshBookmarks?.();
      Toast.show({
        type: 'success',
        text1: 'Bookmarks refreshed',
        visibilityTime: 2000,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to refresh bookmarks',
        text2: 'Please try again',
        position: 'top',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 40,
        bottomOffset: 40,
        onShow: () => {},
        onHide: () => {},
        onPress: () => {},
      });
    } finally {
      setRefreshing(false);
    }
  }, [refreshBookmarks]);

  // Navigation handler to navigate to the article detail page
  const handleCardPress = (id: string) => {
    router.push(`/article/${id}`);
  };

  const renderBookmark = ({ item }: { item: BookmarkItem }) => (
    <ArticleCard
      id={item.id}
      imageLink={item.imageUri}
      heading={item.heading}
      text={item.text}
      handleCardPress={() => handleCardPress(item.id)}
    />
  );

  const screenOptions = {
    title: 'Bookmarks',
    headerStyle: { backgroundColor: theme.bgColor },
    headerTintColor: theme.headingColor,
    headerRight: () => <ThemeToggle />,
  };

  if (bookmarks.length === 0) {
    return (
      <View
        className="flex-1 items-center justify-center px-4"
        style={{ backgroundColor: theme.bgColor }}>
        <Stack.Screen options={screenOptions} />
        <Text className="text-xl" style={{ color: theme.textColor }}>
          No bookmarks yet.
        </Text>
      </View>
    );
  }

  return (
    <View className="px-4" style={{ flex: 1, backgroundColor: theme.bgColor }}>
      <Stack.Screen options={screenOptions} />
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        renderItem={renderBookmark}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: 70 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0000ff"
            title="Pull to refresh..."
            titleColor="#0000ff"
          />
        }
      />
    </View>
  );
}
