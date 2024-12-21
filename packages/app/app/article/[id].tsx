import React, { useContext, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BookmarksContext } from '@/context/BookmarksContext';
import FeedItems, { FeedItemsHandle } from '@/components/FeedItems';

export default function ArticleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bookmarks } = useContext(BookmarksContext);
  const router = useRouter();
  const currentIndex = bookmarks.findIndex((item) => item.id === id);
  const feedItemsRef = useRef<FeedItemsHandle>(null);

  if (currentIndex === -1 && bookmarks.length > 0) {
    const newIndex = Math.max(0, currentIndex);
    if (newIndex < bookmarks.length) {
      const newArticle = newIndex + 1;
      if (feedItemsRef.current) {
        feedItemsRef.current.scrollToIndex(newArticle);
      }
    } else if (newIndex - 1 >= 0) {
      const newArticle = newIndex - 1;
      if (feedItemsRef.current) {
        feedItemsRef.current.scrollToIndex(newArticle);
      }
    }
  }

  useEffect(() => {
    if (bookmarks.length === 0) {
      router.replace('/bookmarks');
    }
  }, [bookmarks.length, router]);

  return <FeedItems articles={bookmarks} initialIndex={currentIndex} showBookmarksLink={false} />;
}
