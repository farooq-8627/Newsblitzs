import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import Toast, { BaseToast, ErrorToast, ToastProps } from 'react-native-toast-message';
import { useTheme } from '@/context/ThemeContext';
import { MotiView } from 'moti';

export default function RootLayoutContent() {
  const { theme } = useTheme();

  const toastConfig = {
    success: (props: ToastProps) => (
      <MotiView
        from={{ translateY: -100, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        exit={{ translateY: -100, opacity: 0 }}
        transition={{ type: 'timing', duration: 200 }}>
        <BaseToast
          {...props}
          style={{
            borderLeftColor: '#00C851',
            backgroundColor: 'white',
            height: 60,
          }}
          contentContainerStyle={{ paddingHorizontal: 15 }}
          text1Style={{
            fontSize: 15,
            fontWeight: '500',
          }}
          text2Style={{
            fontSize: 13,
          }}
        />
      </MotiView>
    ),
    error: (props: ToastProps) => (
      <MotiView
        from={{ translateY: -100, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        exit={{ translateY: -100, opacity: 0 }}
        transition={{ type: 'timing', duration: 200 }}>
        <ErrorToast
          {...props}
          style={{
            borderLeftColor: '#ff4444',
            backgroundColor: 'white',
            height: 60,
          }}
          text1Style={{
            fontSize: 15,
            fontWeight: '500',
          }}
          text2Style={{
            fontSize: 13,
          }}
        />
      </MotiView>
    ),
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgColor }}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.bgColor,
          },
          headerTintColor: theme.headingColor,
          headerBackVisible: true,
          gestureEnabled: true,
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="bookmarks" />
        <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
      </Stack>
      <Toast config={toastConfig} position="top" visibilityTime={2000} topOffset={40} />
    </View>
  );
}
