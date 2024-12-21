import express from "express";
import Article from "../models/articleModel.js";
import { io } from "../index.js";

const router = express.Router();

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
		const { imageLink, heading, text, uploadedAt } = req.body;
		const newArticle = new Article({ imageLink, heading, text, uploadedAt });
		const savedArticle = await newArticle.save();

		// Emit the new article event with the saved article data
		io.emit("newArticle", {
			_id: savedArticle._id,
			imageLink: savedArticle.imageLink,
			heading: savedArticle.heading,
			text: savedArticle.text,
			uploadedAt: savedArticle.uploadedAt,
		});

		res.status(201).json(savedArticle);
	} catch (error) {
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
		const { id } = req.params;
		const { imageLink, heading, text, uploadedAt } = req.body;

		console.log("PUT /articles/:id - Request received:", { id, heading });

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
			console.log("Article not found", id);
			return res.status(404).json({ message: "Article not found" });
		}
		const eventData = {
			_id: updatedArticle._id,
			imageLink: updatedArticle.imageLink,
			heading: updatedArticle.heading,
			text: updatedArticle.text,
			uploadedAt: updatedArticle.uploadedAt,
		};
		// Emit socket event for article update
		console.log("Emitting articleUpdated event:", eventData);
		io.emit("articleUpdated", eventData);

		// Debug: Log connected clients
		const connectedClients = Array.from(io.sockets.sockets).map(
			(socket) => socket[0]
		);
		console.log("Connected clients:", connectedClients);

		res.status(200).json(updatedArticle);
	} catch (error) {
		console.error("Update error:", error);
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

export default router;
