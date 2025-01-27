import express from "express";
import { createServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import cors from "cors";
import articleRoutes from "./routes/article.js";
import dotenv from "dotenv";
import notificationRoutes from "./routes/notificationRoutes.js";

// Initialize express app
const app = express();
dotenv.config();

// Create server and socket instance
const server = createServer(app);
export const io = new Server(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
	},
	pingTimeout: 60000,
	pingInterval: 25000,
	transports: ["websocket", "polling"],
	reconnection: true,
	reconnectionAttempts: 5,
	reconnectionDelay: 1000,
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
	try {
		console.log("MongoDB URL:", process.env.MONGODB_URL); // Debug log

		if (!process.env.MONGODB_URL) {
			throw new Error("MONGODB_URL is not defined");
		}

		const conn = await mongoose.connect(process.env.MONGODB_URL);

		console.log("MongoDB Connected to:", conn.connection.host);
		return conn;
	} catch (error) {
		console.error("MongoDB connection error:", error);
		throw error;
	}
};

// Connect based on environment
if (process.env.NODE_ENV === "production") {
	// For production (Vercel)
	app.use(async (req, res, next) => {
		try {
			if (mongoose.connection.readyState !== 1) {
				await connectDB();
			}
			next();
		} catch (error) {
			console.error("Production connection error:", error);
			res
				.status(500)
				.json({ error: "Database connection failed", details: error.message });
		}
	});
} else {
	// For development
	connectDB()
		.then(() => console.log("Initial MongoDB connection successful"))
		.catch((err) => console.error("Initial MongoDB connection failed:", err));
}

// Routes
app.use("/api", articleRoutes);
app.use('/', notificationRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
	console.log("New client connected");
	socket.emit("test", { message: "Connected successfully" });

	socket.on("disconnect", () => {
		console.log("Client disconnected");
	});
});

// Basic health check route
app.get("/", (req, res) => {
	res.json({ status: "API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error("Error:", err);
	res
		.status(500)
		.json({ error: "Internal server error", details: err.message });
});

// For local development
if (process.env.NODE_ENV !== "production") {
	const PORT = process.env.PORT || 3000;
	server.listen(PORT, "0.0.0.0", () =>
		console.log(`Server running on port ${PORT}`)
	);
}

// Export for serverless
export default async (req, res) => {
	if (req.method === "GET" && req.url === "/socket.io/") {
		await new Promise((resolve) => {
			server.listen(0, () => {
				server.on("upgrade", (request, socket, head) => {
					io.engine.handleUpgrade(request, socket, head);
				});
				resolve();
			});
		});
	}

	return app(req, res);
};
