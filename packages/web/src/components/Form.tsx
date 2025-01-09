import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";

interface FormInputs {
	imageLink: string;
	heading: string;
	text: string;
}

interface Result {
	type: "error" | "success";
	message: string;
}

interface ArticleFormProps {
	mode: "submit" | "edit";
	initialValues?: FormInputs;
	articleId?: string;
	onSuccess?: () => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
	mode,
	initialValues,
	articleId,
	onSuccess,
}) => {
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
		reset,
		setValue,
	} = useForm<FormInputs>({
		mode: "onTouched",
		defaultValues: initialValues || {
			imageLink: "",
			heading: "",
			text: "",
		},
	});

	const [result, setResult] = React.useState<Result | null>(null);
	const [uploadStatus, setUploadStatus] = useState<string>("");
	const [isUploading, setIsUploading] = useState(false);

	const deleteImageFromCloudinary = async (imageUrl: string) => {
		try {
			// Extract the folder path and public ID from the URL
			// Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
			const matches = imageUrl.match(/\/v\d+\/(.+)$/);
			if (!matches || !matches[1]) {
				console.error("Could not extract public ID from URL");
				return;
			}

			const publicId = matches[1].replace(/\.[^/.]+$/, ""); // Remove file extension

			const data = new FormData();
			data.append("public_id", publicId);
			data.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);
			data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

			// Generate timestamp and signature
			const timestamp = Math.round(new Date().getTime() / 1000);
			data.append("timestamp", timestamp.toString());

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

	const onSubmit: SubmitHandler<FormInputs> = async (data) => {
		setResult(null);

		try {
			if (
				mode === "edit" &&
				initialValues?.imageLink &&
				initialValues.imageLink !== data.imageLink
			) {
				await deleteImageFromCloudinary(initialValues.imageLink);
			}

			const payload = {
				imageLink: data.imageLink,
				heading: data.heading.trim(),
				text: data.text.trim(),
				uploadedAt: new Date(),
			};

			let response;
			if (mode === "submit") {
				response = await axios.post(
					`${import.meta.env.VITE_BACKEND_URL}/api/articles`,
					payload
				);
			} else if (mode === "edit" && articleId) {
				response = await axios.put(
					`${import.meta.env.VITE_BACKEND_URL}/api/articles/${articleId}`,
					payload
				);
			} else {
				throw new Error("Invalid mode or missing article ID for edit.");
			}

			if (response.status === 200 || response.status === 201) {
				setResult({
					type: "success",
					message:
						mode === "submit"
							? "Article submitted successfully!"
							: "Article updated successfully!",
				});
				reset();
				if (onSuccess) onSuccess();
			}
		} catch (error: any) {
			console.error("Error submitting/editing article:", error);

			// Safely access error.response.data.message
			const errorMessage =
				error.response?.data?.message ||
				(mode === "submit"
					? "An error occurred while submitting the article. Please try again."
					: "An error occurred while updating the article. Please try again.");

			setResult({
				type: "error",
				message: errorMessage,
			});
		}
	};

	// Watch heading and text to display word counts
	const headingWordCount = watch("heading", "")
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;
	const textWordCount = watch("text", "")
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file size (e.g., 5MB limit)
		if (file.size > 5 * 1024 * 1024) {
			setUploadStatus("File too large. Maximum size is 5MB");
			return;
		}

		// Validate file type
		if (!file.type.startsWith("image/")) {
			setUploadStatus("Please upload an image file");
			return;
		}

		setIsUploading(true);
		setUploadStatus("Uploading...");

		try {
			if (
				!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
				!import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
			) {
				throw new Error("Cloudinary configuration is missing");
			}

			const data = new FormData();
			data.append("file", file);
			data.append(
				"upload_preset",
				import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
			);
			data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

			const response = await axios.post(
				`https://api.cloudinary.com/v1_1/${
					import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
				}/image/upload`,
				data
			);

			if (response.data && response.data.secure_url) {
				console.log("Upload successful:", response.data.secure_url);
				setValue("imageLink", response.data.secure_url);
				setUploadStatus("Upload successful!");
			} else {
				console.error("Upload response missing secure_url:", response.data);
				setUploadStatus("Upload failed: Invalid response");
			}
		} catch (error: any) {
			console.error("Upload error details:", {
				message: error.message,
				response: error.response?.data,
			});
			setUploadStatus(
				`Upload failed: ${
					error.response?.data?.error?.message || error.message
				}`
			);
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 w-screen">
			<div className="max-w-lg w-full p-6 bg-white rounded-lg shadow-xl">
				<h2 className="text-2xl font-semibold mb-4 text-center">
					{mode === "submit" ? "Submit a New Article" : "Edit Article"}
				</h2>
				{result && (
					<div
						className={`mb-4 p-3 rounded ${
							result.type === "success"
								? "bg-green-100 text-green-700"
								: "bg-red-100 text-red-700"
						}`}
					>
						{result.message}
					</div>
				)}
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					{/* Image Link Input */}
					<div className="mb-4">
						<label className="block text-gray-700 font-medium mb-2">
							Image Upload or URL
						</label>
						<div className="space-y-4">
							{/* Image Preview */}
							{watch("imageLink") && (
								<div className="relative w-full h-48 rounded-lg overflow-hidden">
									<img
										src={watch("imageLink")}
										alt="Preview"
										className="w-full h-full object-cover"
										onError={(e) => {
											const target = e.target as HTMLImageElement;
											target.src =
												"https://via.placeholder.com/400x300?text=Image+Not+Found";
										}}
									/>
								</div>
							)}

							<input
								type="file"
								accept="image/*"
								onChange={handleImageUpload}
								disabled={isUploading}
								className="w-full"
							/>
							{uploadStatus && (
								<p
									className={`text-sm ${
										uploadStatus.includes("successful")
											? "text-green-600"
											: "text-red-500"
									}`}
								>
									{uploadStatus}
								</p>
							)}
							<input
								type="url"
								{...register("imageLink")}
								className={`w-full px-3 py-2 border ${
									errors.imageLink ? "border-red-500" : "border-gray-300"
								} rounded-md`}
								placeholder="Image URL will appear here after upload, or enter URL manually"
							/>
						</div>
					</div>

					{/* Heading Input */}
					<div className="mb-4">
						<label
							htmlFor="heading"
							className="block text-gray-700 font-medium mb-2"
						>
							Heading:
						</label>
						<input
							type="text"
							id="heading"
							{...register("heading", {
								required: "Heading is required.",
								validate: {
									wordLimit: (value) =>
										value.trim().split(/\s+/).filter(Boolean).length <= 10 ||
										"Heading cannot exceed 10 words.",
								},
							})}
							className={`w-full px-3 py-2 border ${
								errors.heading ? "border-red-500" : "border-gray-300"
							} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
							placeholder="Enter the heading"
						/>
						<div className="flex justify-between mt-1">
							{errors.heading && (
								<p className="text-sm text-red-500">{errors.heading.message}</p>
							)}
							<p className="text-sm text-gray-500">
								{headingWordCount}/10 words
							</p>
						</div>
					</div>

					{/* Text Input */}
					<div className="mb-4">
						<label
							htmlFor="text"
							className="block text-gray-700 font-medium mb-2"
						>
							Text:
						</label>
						<textarea
							id="text"
							{...register("text", {
								required: "Text is required.",
								validate: {
									wordLimit: (value) =>
										value.trim().split(/\s+/).filter(Boolean).length <= 80 ||
										"Text cannot exceed 80 words.",
								},
							})}
							className={`w-full px-3 py-2 border ${
								errors.text ? "border-red-500" : "border-gray-300"
							} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
							placeholder="Enter the article text"
							rows={6}
						></textarea>
						<div className="flex justify-between mt-1">
							{errors.text && (
								<p className="text-sm text-red-500">{errors.text.message}</p>
							)}
							<p className="text-sm text-gray-500">{textWordCount}/80 words</p>
						</div>
					</div>

					{/* Submit Button */}
					<button
						type="submit"
						disabled={isSubmitting}
						className={`w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
							isSubmitting ? "opacity-50 cursor-not-allowed" : ""
						}`}
					>
						{isSubmitting
							? mode === "submit"
								? "Submitting..."
								: "Updating..."
							: mode === "submit"
							? "Submit Article"
							: "Update Article"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default ArticleForm;
