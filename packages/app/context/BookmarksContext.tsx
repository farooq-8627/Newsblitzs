import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export interface Article {
  id: string;
  imageUri: string;
  heading: string;
  text: string;
  updatedAt: string;
}

interface BookmarksContextProps {
  bookmarks: Article[];
  toggleBookmark: (article: Article) => void;
  isBookmarked: (id: string) => boolean;
  refreshBookmarks: () => Promise<void>;
}

export const BookmarksContext = createContext<BookmarksContextProps>({
  bookmarks: [],
  toggleBookmark: () => {},
  isBookmarked: () => false,
  refreshBookmarks: () => Promise.resolve(),
});

export const BookmarksProvider = ({ children }: { children: ReactNode }) => {
  const [bookmarks, setBookmarks] = useState<Article[]>([]);

  useEffect(() => {
    // Load bookmarks from AsyncStorage on mount
    const loadBookmarks = async () => {
      try {
        const storedBookmarks = await AsyncStorage.getItem('@bookmarks');
        if (storedBookmarks) {
          setBookmarks(JSON.parse(storedBookmarks));
        }
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      }
    };

    loadBookmarks();
  }, []);

  const saveBookmarks = async (newBookmarks: Article[]) => {
    try {
      await AsyncStorage.setItem('@bookmarks', JSON.stringify(newBookmarks));
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  };

  const toggleBookmark = (article: Article) => {
    let updatedBookmarks: Article[];

    if (isBookmarked(article.id)) {
      // Remove bookmark
      updatedBookmarks = bookmarks.filter((item) => item.id !== article.id);
    } else {
      // Add bookmark
      updatedBookmarks = [article, ...bookmarks];
    }

    Toast.show({
      type: isBookmarked(article.id) ? 'error' : 'success',
      text1: isBookmarked(article.id) ? 'Bookmark Removed' : 'Bookmarked',
      text2: isBookmarked(article.id)
        ? 'Article has been removed from your bookmarks.'
        : 'Article has been added to your bookmarks.',
    });

    setBookmarks(updatedBookmarks);
    saveBookmarks(updatedBookmarks);

  };

  const isBookmarked = (id: string) => {
    return bookmarks.some((item) => item.id === id);
  };

  const refreshBookmarks = async () => {
    const newBookmarks = await AsyncStorage.getItem('@bookmarks');
    if (newBookmarks) {
      setBookmarks(JSON.parse(newBookmarks));
    }
  };

  return (
    <BookmarksContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked, refreshBookmarks }}>
      {children}
    </BookmarksContext.Provider>
  );
};
