import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { io } from "socket.io-client";
interface Article {
	_id: string;
	imageLink: string;
	heading: string;
	text: string;
	uploadedAt: string;
}

const FetchArticles = () => {
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchArticles();

		const socket = io(import.meta.env.VITE_BACKEND_URL);

		socket.on("connect", () => {
			console.log("Connected to socket server");
		});

		socket.on("newArticle", (newArticle) => {
			console.log("Received new article:", newArticle);
			setArticles((prev) => [newArticle, ...prev]);
		});

		// Add articleUpdated listener
		socket.on("articleUpdated", (updatedArticle) => {
			console.log("Article updated:", updatedArticle);
			setArticles((prev) =>
				prev.map((article) =>
					article._id === updatedArticle._id ? updatedArticle : article
				)
			);
		});

		socket.on("articleDeleted", (deletedId) => {
			console.log("Article deleted:", deletedId);
			setArticles((prev) =>
				prev.filter((article) => article._id !== deletedId)
			);
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const fetchArticles = async () => {
		try {
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/api/articles`
			);
			setArticles(response.data);
			setLoading(false);
		} catch (err) {
			setError("Failed to fetch articles. Please try again later.");
			setLoading(false);
			console.error("Error fetching articles:", err);
		}
	};

	const isYouTubeUrl = (url: string) => {
		const youtubeRegex =
			/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
		return youtubeRegex.test(url);
	};

	const getYouTubeVideoId = (url: string) => {
		const match = url.match(
			/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
		);
		return match ? match[1] : null;
	};

	const MediaContent = ({ url }: { url: string }) => {
		if (isYouTubeUrl(url)) {
			const videoId = getYouTubeVideoId(url);
			return (
				<div className="relative w-full pt-[56.25%]">
					{" "}
					{/* 16:9 Aspect Ratio */}
					<iframe
						className="absolute top-0 left-0 w-full h-full"
						src={`https://www.youtube.com/embed/${videoId}`}
						title="YouTube video player"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					></iframe>
				</div>
			);
		}

		return (
			<div className="relative w-full pt-[56.25%]">
				<img
					src={url}
					alt="Article content"
					className="absolute top-0 left-0 w-full h-full object-cover"
					onError={(e) => {
						const target = e.target as HTMLImageElement;
						target.src =
							"https://via.placeholder.com/400x300?text=Image+Not+Found";
					}}
				/>
			</div>
		);
	};

	const deleteImageFromCloudinary = async (imageUrl: string) => {
		try {
			const urlParts = imageUrl.split("/");
			const publicIdWithExtension = urlParts[urlParts.length - 1];
			const publicId = publicIdWithExtension.split(".")[0];

			const data = new FormData();
			data.append("public_id", publicId);
			data.append(
				"upload_preset",
				import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
			);
			data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

			await axios.post(
				`https://api.cloudinary.com/v1_1/${
					import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
				}/image/destroy`,
				data
			);

			console.log("Image deleted successfully from Cloudinary");
		} catch (error) {
			console.error("Error deleting image from Cloudinary:", error);
		}
	};

	// Delete article
	const handleDelete = async (articleId: string) => {
		if (!window.confirm("Are you sure you want to delete this article?")) {
			return;
		}

		try {
			// Find the article to get its image URL
			const articleToDelete = articles.find(
				(article) => article._id === articleId
			);
			if (articleToDelete?.imageLink) {
				await deleteImageFromCloudinary(articleToDelete.imageLink);
			}

			// Delete the article from backend
			await axios.delete(
				`${import.meta.env.VITE_BACKEND_URL}/api/articles/${articleId}`
			);

			// Remove the deleted article from state
			setArticles(articles.filter((article) => article._id !== articleId));

			// Show success message
			alert("Article deleted successfully!");
		} catch (err) {
			console.error("Error deleting article:", err);
			alert("Failed to delete article. Please try again.");
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen w-screen bg-gray-100">
				<div className="text-xl text-gray-600">Loading articles...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen w-screen bg-gray-100">
				<div className="text-xl text-red-600">{error}</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100 py-8 px-4 w-screen">
			<div className="max-w-6xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800">Articles</h1>
					<Link
						to="/submit"
						className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 hover:text-white transition-colors duration-300"
					>
						Add New Article
					</Link>
				</div>

				{articles.length === 0 ? (
					<div className="text-xl text-gray-600 text-center w-screen">
						No articles found.
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{articles.map((article) => (
							<div
								key={article._id}
								className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
							>
								<MediaContent url={article.imageLink} />
								<div className="p-4">
									<h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">
										{article.heading}
									</h2>
									<p className="text-gray-600 mb-4 line-clamp-3">
										{article.text}
									</p>

									{/* Time and Date */}
									<div className="flex flex-col gap-2 mb-4">
										<span className="text-sm text-gray-500">
											Time: {new Date(article.uploadedAt).toLocaleTimeString()}
											{" -  "}
											{new Date(article.uploadedAt).toLocaleDateString()}
										</span>
									</div>

									{/* Action Buttons */}
									<div className="flex gap-2">
										<Link
											to={`/edit/${article._id}`}
											className="flex-1 px-4 py-2 bg-blue-500 text-white flex items-center justify-center rounded-md hover:bg-blue-600  transition-colors duration-300"
										>
											Edit <MdEdit className="ml-2 text-xl text-white" />
										</Link>
										<button
											onClick={() => handleDelete(article._id)}
											className="flex-1 px-4 py-2 bg-red-500 text-white flex items-center justify-center rounded-md hover:bg-red-600 transition-colors duration-300"
										>
											Delete <FaTrash className="ml-2" />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default FetchArticles;
