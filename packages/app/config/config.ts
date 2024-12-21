import { Platform } from 'react-native';

export const BACKEND_URL = __DEV__
  ? Platform.OS === 'android'
    ? 'http://192.168.94.8:3000' // Adjust port number to match your backend
    : 'http://localhost:3000' // Adjust port number to match your backend
  : 'http://192.0.0.2:3000';
