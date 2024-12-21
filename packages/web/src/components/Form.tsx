import React from "react";
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
	} = useForm<FormInputs>({
		mode: "onTouched",
		defaultValues: initialValues || {
			imageLink: "",
			heading: "",
			text: "",
		},
	});

	const [result, setResult] = React.useState<Result | null>(null);

	const onSubmit: SubmitHandler<FormInputs> = async (data) => {
		setResult(null);
		try {
			const payload = {
				imageLink: data.imageLink.trim(),
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
						<label
							htmlFor="imageLink"
							className="block text-gray-700 font-medium mb-2"
						>
							Image URL or YouTube URL
						</label>
						<input
							type="url"
							id="imageLink"
							{...register("imageLink", {
								required: "Image URL or YouTube URL is required.",
								pattern: {
									value:
										/^https?:\/\/.*\.(jpeg|jpg|gif|png|webp|svg)$|^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
									message: "Please enter a valid image URL or YouTube URL.",
								},
							})}
							className={`w-full px-3 py-2 border ${
								errors.imageLink ? "border-red-500" : "border-gray-300"
							} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
							placeholder="https://example.com/image.jpg or https://youtube.com/watch?v=..."
						/>
						{errors.imageLink && (
							<p className="mt-1 text-sm text-red-500">
								{errors.imageLink.message}
							</p>
						)}
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
