import express from "express";
import { createServer } from "http";
import { connect } from "mongoose";
import { Server } from "socket.io";
import cors from "cors";
import articleRoutes from "./routes/article.js";
import dotenv from "dotenv";

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
app.use("/api", articleRoutes);

// MongoDB connection
const connectDB = async () => {
	try {
		if (!process.env.MONGODB_URL) {
			throw new Error('MONGODB_URL is not defined');
		}
		const conn = await connect(process.env.MONGODB_URL);
		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		throw error;
	}
};

// Connect to MongoDB for each request
app.use(async (req, res, next) => {
	try {
		await connectDB();
		next();
	} catch (error) {
		res.status(500).json({ error: 'Database connection failed' });
	}
});

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
	console.error(err);
	res.status(500).json({ error: 'Internal server error' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
	const PORT = process.env.PORT || 3000;
	server.listen(PORT, "0.0.0.0", () =>
		console.log(`Server running on port ${PORT}`)
	);
}

// Export for serverless
export default async (req, res) => {
	if (req.method === 'GET' && req.url === '/socket.io/') {
		// Handle Socket.IO upgrade
		await new Promise((resolve) => {
			server.listen(0, () => {
				server.on('upgrade', (request, socket, head) => {
					io.engine.handleUpgrade(request, socket, head);
				});
				resolve();
			});
		});
	}
	
	return app(req, res);
};
