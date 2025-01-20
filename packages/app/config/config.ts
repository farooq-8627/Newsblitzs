import { Platform } from 'react-native';

export const BACKEND_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://192.168.247.8:3000' // Local development URL for Android
    : 'http://localhost:3000' // Local development URL for iOS
  : 'https://newsblitzs-backend.vercel.app'; // Production URL on Render
