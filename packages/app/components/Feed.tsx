import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Text, Image, View, Dimensions, Platform, ShareOptions, Alert } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import BottomBar from './Bottombar';
import Timestamp from './Timestamp';
import { Article } from '@/context/BookmarksContext';
import { useArticleAnimatedStyle } from './AnimatedStyle';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';
import WebView from 'react-native-webview';
import { useTheme } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');
interface FeedProps {
  article: Article;
  isBookmarked: boolean;
  onBookmarkPress: () => void;
  onSharePress: () => void;
  scrollY: SharedValue<number>;
  index: number;
  showBookmarksLink?: boolean;
}

export interface FeedHandle {
  handleShare: () => Promise<void>;
}

const isYouTubeUrl = (url: string) => {
  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return youtubeRegex.test(url);
};

const getYouTubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const Feed = forwardRef<FeedHandle, FeedProps>(
  (
    {
      article,
      isBookmarked,
      onBookmarkPress,
      onSharePress,
      index,
      scrollY,
      showBookmarksLink = true,
    },
    ref
  ) => {
    const viewRef = useRef<View>(null);
    const { theme } = useTheme();   

    const animatedStyle = useArticleAnimatedStyle({
      index,
      height,
      scrollY,
    });

    // Expose the handleShare method to parent components via ref
    useImperativeHandle(
      ref,
      () => ({
        handleShare: async () => {
          console.log(`handleShare invoked for article id: ${article.id}`);
          if (!viewRef.current) {
            console.log(`viewRef.current is null for article id: ${article.id}`);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Article is not available for sharing.',
            });
            throw new Error('View ref is null');
          }

          try {
            // Capture the screenshot of the article's view (only image and text)
            const uri = await captureRef(viewRef.current, {
              format: 'png',
              quality: 1,
            });

            if (!uri) {
              throw new Error('Failed to capture screenshot.');
            }

            // Define the message with a link to the article
            const articleLink = `https://yourappdomain.com/article/${article.id}`;
            const message = `Check out this article: "${article.heading}"\n\nRead more here: ${articleLink}`;
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
              Toast.show({
                type: 'error',
                text1: 'Sharing Unavailable',
                text2: 'Sharing is not available on this device.',
              });
              return;
            }

            // Share the image with the message
            await Sharing.shareAsync(uri, {
              dialogTitle: 'Share Article',
              mimeType: 'image/png',
              UTI: 'image/png',
            });
            console.log(`Article shared successfully for id: ${article.id}`);
            Toast.show({
              type: 'success',
              text1: 'Article shared successfully!',
            });
          } catch (error) {
            console.error(`Error sharing article: ${error}`);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'An error occurred while trying to share the article.',
            });
          }
        },
      }),
      [article]
    );

    return (
      <Animated.View
        ref={viewRef}
        key={article.id}
        style={[{ width, height, backgroundColor: `${theme.bgColor}` }, animatedStyle]}>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 5 }}>
            {isYouTubeUrl(article.imageUri) ? (
              <WebView
                source={{ uri: getYouTubeEmbedUrl(article.imageUri) || '' }}
                style={{ flex: 1 }}
                allowsFullscreenVideo
              />
            ) : (
              <Image
                source={{ uri: article.imageUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            )}
          </View>

          <View style={{ flex: 5, padding: 16 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: 'bold',
                marginBottom: 8,
                color: `${theme.headingColor}`,
              }}>
              {article.heading}
            </Text>
            <Text style={{ fontSize: 17, color: `${theme.textColor}` }}>{article.text}</Text>
          </View>
        </View>

        <Timestamp updatedAt={article.updatedAt} />

        <BottomBar
          isBookmarked={isBookmarked}
          onBookmarkPress={onBookmarkPress}
          onSharePress={onSharePress}
          showBookmarksLink={showBookmarksLink}
        />
      </Animated.View>
    );
  }
);

export default React.memo(Feed);
