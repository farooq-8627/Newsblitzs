import express from 'express';
import { sendPushNotification } from '../controllers/notificationController.js';

const router = express.Router();

router.post('/send-notification', sendPushNotification);

export default router;