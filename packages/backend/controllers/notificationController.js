import { sendNotification } from '../services/notificationService.js';

export const sendPushNotification = async (req, res) => {
  try {
    const { token, title, body, data } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Validate that it's an Expo push token
    if (!token.startsWith('ExponentPushToken[')) {
      return res.status(400).json({
        error: 'Invalid Expo push token format'
      });
    }

    const result = await sendNotification(token, title, body, data);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Push notification error:', error);
    res.status(500).json({ 
      error: 'Failed to send notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};