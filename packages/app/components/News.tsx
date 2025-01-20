import { useEffect, useRef, useState, useCallback } from 'react';
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import FeedItems, { FeedItemsHandle } from './FeedItems';
import { BACKEND_URL } from '../config/config';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, sendLocalNotification } from '@/utils/notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SocketManager from '@/utils/socket';
import { ExpoPushToken } from 'expo-notifications';
import { useTheme } from '@/context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePushNotifications } from '@/context/usePushNotifications';

interface BackendArticle {
  _id: string;
  imageLink: string;
  heading: string;
  text: string;
  uploadedAt: string;
}

interface Article {
  id: string;
  imageUri: string;
  heading: string;
  text: string;
  updatedAt: string;
}

export default function NewsFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { initialArticleId } = useLocalSearchParams<{ initialArticleId: string }>();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const router = useRouter();
  const feedRef = useRef<FeedItemsHandle>(null);
  const { theme } = useTheme();
  const { expoPushToken, notification } = usePushNotifications();

  const data = JSON.stringify(notification, undefined, 2);

  useEffect(() => {
    fetchArticles().then(() => {
      // After articles are loaded, scroll to initial article if provided
      if (initialArticleId && feedRef.current) {
        const index = articles.findIndex((article) => article.id === initialArticleId);
        if (index !== -1) {
          feedRef.current.scrollToIndex(index);
        }
      }
    });
  }, [initialArticleId]);

  const fetchArticles = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/articles`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: BackendArticle[] = await response.json();

      const transformedArticles = data.map(
        (article: BackendArticle): Article => ({
          id: article._id,
          imageUri: article.imageLink,
          heading: article.heading,
          text: article.text,
          updatedAt: article.uploadedAt,
        })
      );

      setArticles(transformedArticles);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load articles');
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchArticles();
      Toast.show({
        type: 'success',
        text1: 'Articles refreshed',
        visibilityTime: 2000,
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to refresh',
        text2: 'Please try again',
        visibilityTime: 3000,
      });
    } finally {
      setRefreshing(false);
    }
  }, []);
 
  const sendNotification = async (article: BackendArticle) => {
    const truncatedText = article.text.length > 100 
      ? `${article.text.substring(0, 100)}...` 
      : article.text;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'New Article Added',
        subtitle: article.heading,
        body: truncatedText,
        data: {
          articleId: article._id,
          imageUrl: article.imageLink,
        },
        attachments: [
          {
            identifier: 'article-image',
            url: article.imageLink,
            type: 'image',
          },
        ],
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
      },
      trigger: null,
    });
  };
  
  const handleNewArticle = useCallback((newArticle: BackendArticle) => {
    console.log('Received new article:', newArticle);
    const transformedArticle: Article = {
      id: newArticle._id,
      imageUri: newArticle.imageLink,
      heading: newArticle.heading,
      text: newArticle.text,
      updatedAt: newArticle.uploadedAt,
    };
    setArticles((prevArticles) => [transformedArticle, ...prevArticles]);
    sendNotification(newArticle);
  }, []);

  const handleArticleUpdate = useCallback((updatedArticle: BackendArticle) => {
    console.log('Handling article update:', updatedArticle);
    setArticles((prevArticles) => {
      const filteredArticles = prevArticles.filter(
        (article) => article.id !== updatedArticle._id
      );
      const transformedArticle: Article = {
        id: updatedArticle._id,
        imageUri: updatedArticle.imageLink,
        heading: updatedArticle.heading,
        text: updatedArticle.text,
        updatedAt: updatedArticle.uploadedAt,
      };

      // Send local notification for update
      const truncatedText = updatedArticle.text.length > 100 
        ? `${updatedArticle.text.substring(0, 100)}...` 
        : updatedArticle.text;

      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Article Updated',
          subtitle: updatedArticle.heading,
          body: truncatedText,
          data: {
            articleId: updatedArticle._id,
            imageUrl: updatedArticle.imageLink,
            type: 'update'
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      return [transformedArticle, ...filteredArticles];
    });
  }, []);

  const handleArticleDelete = useCallback((deletedId: string) => {
    setArticles((prevArticles) => prevArticles.filter((article) => article.id !== deletedId));
  }, []);


  useEffect(() => {
    const socket = SocketManager.getSocket();

    // Socket event listeners
    socket.on('newArticle', handleNewArticle);
    socket.on('articleUpdated', handleArticleUpdate);
    socket.on('articleDeleted', handleArticleDelete);

    // Initial fetch
    fetchArticles();

    return () => {
      socket.off('newArticle', handleNewArticle);
      socket.off('articleUpdated', handleArticleUpdate);
      socket.off('articleDeleted', handleArticleDelete);
    };
  }, [handleNewArticle, handleArticleUpdate, handleArticleDelete, articles]); // Socket-related dependencies

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification clicked:', response);
      const articleId = response.notification.request.content.data?.articleId;
      if (articleId) {
        console.log('Navigating to article:', articleId);
        const articleIndex = articles.findIndex(article => article.id === articleId);
        if (articleIndex !== -1) {
          console.log('Article found in current list, scrolling to index:', articleIndex);
          feedRef.current?.scrollToIndex(articleIndex);
        } else {
          console.log('Article not found in current list, navigating to article page');
          router.push(`/article/${articleId}`);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [articles, router]);

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.bgColor }}>
        <ActivityIndicator size="large" color={theme.iconColor} />
        <Text className="mt-2" style={{ color: theme.textColor }}>
          Loading articles...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="flex-1 items-center justify-center p-4"
        style={{ backgroundColor: theme.bgColor }}>
        <Text style={{ color: theme.textColor }} className="mb-4 text-center text-lg">
          {error}
        </Text>
        <TouchableOpacity
          onPress={onRefresh}
          className="flex-row items-center rounded-full bg-blue-500 px-6 py-3"
          style={{ backgroundColor: theme.iconColor }}>
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FeedItems
        ref={feedRef}
        articles={articles}
        initialIndex={articles.findIndex((article) => article.id === initialArticleId)}
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
