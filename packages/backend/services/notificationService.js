import axios from 'axios';

export async function sendNotification(token, title, body, data) {
  try {
    const message = {
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'default',
    };

    const response = await axios.post('https://exp.host/--/api/v2/push/send', 
      message,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Successfully sent notification:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}