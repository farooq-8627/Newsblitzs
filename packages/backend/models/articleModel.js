import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
	imageLink: String,
	heading: String,
	text: String,
	likes: { type: Number, default: 0 },
	uploadedAt: { type: Date, default: Date.now },
});

const Article = mongoose.model("Article", articleSchema);

export default Article;
