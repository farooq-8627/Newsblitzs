import React, { useCallback, useContext, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { BookmarksContext } from '@/context/BookmarksContext';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import ArticleCard from '@/components/ArticleCard';

interface BookmarkItem {
  id: string;
  imageUri: string;
  heading: string;
  text: string;
  updatedAt: string;
}

export default function Bookmarks() {
  const { bookmarks, refreshBookmarks } = useContext(BookmarksContext);
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

  if (bookmarks.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Stack.Screen options={{ title: 'Bookmarks' }} />
        <Text className="text-xl text-gray-500">No bookmarks yet.</Text>
      </View>
    );
  }

  return (
    <View className="bg-white px-4" style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Bookmarks' }} />
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
