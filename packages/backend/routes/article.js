import express from "express";
import Article from "../models/articleModel.js";
import { io } from "../index.js";
import { sendNotification } from '../services/notificationService.js';

const router = express.Router();
let EXPO_PUSH_TOKEN = null;

const sendPushNotification = async (title, body, data) => {
	if (!EXPO_PUSH_TOKEN) {
		console.error('⚠️ No Expo Push Token available');
		return;
	}

	try {
		await sendNotification(EXPO_PUSH_TOKEN, title, body, data);
		console.log('Push notification sent successfully');
	} catch (error) {
		console.error('Error sending push notification:', error);
	}
};

// Search route (must be first)
router.get("/articles/search", async (req, res) => {
	try {
		const { q } = req.query;
		if (!q) {
			return res.status(400).json({ message: "Search query is required" });
		}

		const articles = await Article.find({
			$or: [
				{ heading: { $regex: q, $options: "i" } },
				{ text: { $regex: q, $options: "i" } },
			],
		});

		res.json(articles);
	} catch (error) {
		console.error("Search error:", error);
		res.status(500).json({ message: error.message });
	}
});

// POST /articles - Add a new article
router.post("/articles", async (req, res) => {
	try {
		console.log('\n=== Creating New Article ===');
		console.log('Environment Push Token:', EXPO_PUSH_TOKEN);
		
		const { imageLink, heading, text, uploadedAt } = req.body;
		const newArticle = new Article({ imageLink, heading, text, uploadedAt });
		const savedArticle = await newArticle.save();

		console.log('Article saved successfully:', savedArticle._id);

		// Emit socket event for new article
		io.emit('newArticle', savedArticle);

		// Send push notification
		if (EXPO_PUSH_TOKEN) {
			console.log('Attempting to send push notification...');
			await sendPushNotification(
				'New Article Added',
				heading,
				{ 
					articleId: savedArticle._id, 
					imageUrl: savedArticle.imageLink,
				}
			);
		} else {
			console.warn('⚠️ No Expo Push Token available in environment variables');
		}

		res.status(201).json(savedArticle);
	} catch (error) {
		console.error('Error creating article:', error);
		res.status(500).json({ message: error.message });
	}
});

// GET /articles - Get all articles
router.get("/articles", async (req, res) => {
	try {
		const articles = await Article.find().sort({ uploadedAt: -1 });
		res.status(200).json(articles);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// GET /articles/:id - Get single article
router.get("/articles/:id", async (req, res) => {
	try {
		const article = await Article.findById(req.params.id);
		res.status(200).json(article);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// PUT /articles/:id - Update an existing article
router.put("/articles/:id", async (req, res) => {
	try {
		console.log('\n=== Updating Article ===');
		console.log('Environment Push Token:', EXPO_PUSH_TOKEN);
		
		const { id } = req.params;
		const { imageLink, heading, text } = req.body;

		const updatedArticle = await Article.findByIdAndUpdate(
			id,
			{
				imageLink,
				heading,
				text,
				uploadedAt: new Date(),
			},
			{ new: true, runValidators: true }
		);

		if (!updatedArticle) {
			return res.status(404).json({ message: "Article not found" });
		}

		// Emit socket event for real-time update
		io.emit("articleUpdated", {
			_id: updatedArticle._id,
			imageLink: updatedArticle.imageLink,
			heading: updatedArticle.heading,
			text: updatedArticle.text,
			uploadedAt: updatedArticle.uploadedAt,
		});

		// Send push notification for update
		if (EXPO_PUSH_TOKEN) {
			console.log('Attempting to send update notification...');
			await sendPushNotification(
				'New Article Added',
				heading,
				{ 
					articleId: updatedArticle._id, 
					imageUrl: updatedArticle.imageLink 
				}
			);
		}

		res.status(200).json(updatedArticle);
	} catch (error) {
		console.error('Error updating article:', error);
		res.status(500).json({ message: error.message });
	}
});

// DELETE /articles/:id - Delete an existing article
router.delete("/articles/:id", async (req, res) => {
	try {
		const { id } = req.params;
		await Article.findByIdAndDelete(id);
		io.emit("articleDeleted", id);
		res.status(204).send();
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Add this new route
router.post('/register-push-token', (req, res) => {
	try {
		const { token } = req.body;
		if (!token) {
			console.log('Token is required');
			return res.status(400).json({ message: 'Token is required' });
		}
		
		EXPO_PUSH_TOKEN = token;
		console.log('Expo Push Token registered:', EXPO_PUSH_TOKEN);
		
		res.status(200).json({ message: 'Token registered successfully' });
	} catch (error) {
		console.error('Error registering token:', error);
		res.status(500).json({ message: error.message });
	}
});

export default router;
