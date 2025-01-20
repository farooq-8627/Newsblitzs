import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import { BACKEND_URL } from '../config/config';
import ArticleCard from '../components/ArticleCard';
import { useTheme } from '@/context/ThemeContext';
interface SearchResult {
  id: string;
  imageLink: string;
  heading: string;
  text: string;
  uploadedAt: string;
}
export default function Search() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchArticles = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const url = `${BACKEND_URL}/api/articles/search?q=${encodeURIComponent(query)}`;
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Search failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const transformedResults = data.map((item: any) => ({
          id: item._id,
          imageLink: item.imageLink,
          heading: item.heading,
          text: item.text,
          updatedAt: item.uploadedAt,
        }));
        setResults(transformedResults);
      } catch (error) {
        console.error('Search error details:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchArticles(text);
  };

  const handleCardPress = (id: string) => {
    router.push({
      pathname: '/',
      params: { initialArticleId: id },
    });
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <ArticleCard
      id={item.id}
      imageLink={item.imageLink}
      heading={item.heading}
      text={item.text}
      handleCardPress={() => handleCardPress(item.id)}
      showDescription={true}
    />
  );

  return (
    <View className="flex-1" style={{ backgroundColor: theme.bgColor }}>
      <Stack.Screen
        options={{
          title: 'Search Articles',
          headerStyle: { backgroundColor: theme.bgColor },
          headerTintColor: theme.headingColor,
        }}
      />

      <View className="mx-4 my-2 flex-row items-center rounded-lg bg-gray-100 px-3 py-2">
        <Ionicons name="search" size={20} color={theme.iconColor} />
        <TextInput
          className="ml-2 flex-1 text-base"
          placeholder="Search articles..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" className="mt-4" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 70 }}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text className="text-center" style={{ color: theme.timeTextColor }}>
              {searchQuery ? 'No results found' : 'Start typing to search'}
            </Text>
          }
        />
      )}
    </View>
  );
}
