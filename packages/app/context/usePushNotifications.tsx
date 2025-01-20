import { useState, useRef, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export interface PushNotificationState {
  notification?: Notifications.Notification;
  expoPushToken?: Notifications.ExpoPushToken;
}

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 500, 250],
          lightColor: '#FF231F7C',
        });
      }
      return token;
    } else {
      console.log('Push notifications are not supported on this platform');
    }
  }

  useEffect(() => {
    let isMounted = true;

    const setupNotifications = async () => {
      try {
        console.log('Setting up push notifications...');
        const token = await registerForPushNotificationsAsync();
        
        if (isMounted && token) {
          console.log('Expo Push Token:', token.data);
          setExpoPushToken(token);
          
          // Send token to backend
          try {
            const response = await fetch('http://192.168.247.8:8081/api/register-push-token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: token.data }),
            });
            
            if (!response.ok) {
              throw new Error('Failed to register push token');
            }
            
            console.log('Push token registered with backend');
          } catch (error) {
            console.error('Error registering push token:', error);
          }

          // Set up notification channel
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            bypassDnd: true,
          });
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();

    // Handle received notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('\n=== Notification Received ===');
    console.log('Title:', notification.request.content.title);
    console.log('Body:', notification.request.content.body);
    console.log('Data:', notification.request.content.data);
        console.log('Notification received in foreground:', notification);
        setNotification(notification);
      }
    );

    // Handle notification responses
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        console.log('Notification response received:', response);
      }
    );

    return () => {
      isMounted = false;
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return { expoPushToken, notification };
};
