import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { Article, BookmarksContext } from '@/context/BookmarksContext';
import React from 'react';
import Feed, { FeedHandle } from './Feed';
import { Alert, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface FeedItemsProps {
  articles: Article[];
  initialIndex?: number;
  showBookmarksLink?: boolean;
  refreshControl?: React.ReactElement;
}

export interface FeedItemsHandle {
  scrollToIndex: (index: number) => void;
  scrollToArticle: (articleId: string) => void;
}

const { height } = Dimensions.get('window');

const FeedItems = forwardRef<FeedItemsHandle, FeedItemsProps>(
  ({ articles, initialIndex = 0, showBookmarksLink = true, refreshControl }, ref) => {
    const scrollY = useSharedValue(0);
    const scrollViewRef = useRef<Animated.ScrollView>(null);
    const feedRefs = useRef<{ [key: string]: FeedHandle | null }>({});
    const { toggleBookmark, isBookmarked } = useContext(BookmarksContext);
    const { theme } = useTheme();

    const scrollToIndex = useCallback((index: number) => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: index * height,
          animated: true,
        });
      }
    }, []);

    const scrollToArticle = useCallback(
      (articleId: string) => {
        const index = articles.findIndex((article) => article.id === articleId);
        if (index !== -1) {
          scrollToIndex(index);
        }
      },
      [articles, scrollToIndex]
    );

    useImperativeHandle(
      ref,
      () => ({
        scrollToIndex,
        scrollToArticle,
      }),
      [scrollToIndex, scrollToArticle]
    );

    const scrollHandler = useAnimatedScrollHandler((event) => {
      scrollY.value = event.contentOffset.y;
    });

    const handleShare = async (id: string) => {
      const feedRef = feedRefs.current[id];
      if (feedRef && feedRef.handleShare) {
        await feedRef.handleShare();
      } else {
        console.error(`No Feed ref found for id: ${id}`);
        Alert.alert('Error', 'Unable to share the article at this time.');
      }
    };

    // Scroll to the initial index on mount
    useEffect(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: initialIndex * height,
          animated: false,
        });
      }
    }, [initialIndex]);

    useEffect(() => {
      return () => {
        // Cleanup refs on unmount
        Object.keys(feedRefs.current).forEach((key) => {
          feedRefs.current[key] = null;
        });
      };
    }, []);

    const renderItem = (item: (typeof articles)[0], index: number) => {
      const bookmarked = isBookmarked(item.id);

      return (
        <Feed
          ref={(ref) => {
            feedRefs.current[item.id] = ref;
          }}
          key={item.id}
          article={item}
          isBookmarked={bookmarked}
          onBookmarkPress={() => toggleBookmark(item)}
          onSharePress={() => handleShare(item.id)}
          scrollY={scrollY}
          index={index}
          showBookmarksLink={showBookmarksLink}
        />
      );
    };

    return (
      <Animated.ScrollView
        ref={scrollViewRef}
        pagingEnabled
        onScroll={scrollHandler}
        scrollEventThrottle={1}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: theme.bgColor }}
        refreshControl={refreshControl}>
        {articles.map((item, index) => renderItem(item, index))}
      </Animated.ScrollView>
    );
  }
);

export default React.memo(FeedItems);
