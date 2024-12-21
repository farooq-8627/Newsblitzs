import express, { json } from "express";
import { createServer } from "http";
import { connect } from "mongoose";
import { Server } from "socket.io";
import cors from "cors";
import articleRoutes from "./routes/article.js";
import dotenv from "dotenv";
dotenv.config();
const app = express();
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
app.use(json());
app.use("/api", articleRoutes);

const connectDB = async () => {
	try {
		const conn = await connect(process.env.mongodb_url);
		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		process.exit(1);
	}
};
connectDB();
// Socket.IO Connection
io.on("connection", (socket) => {
	console.log("New client connected");

	// Debug event to test connection
	socket.emit("test", { message: "Connected successfully" });

	socket.on("disconnect", () => {
		console.log("Client disconnected");
	});
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () =>
	console.log(`Server running on port ${PORT}`)
);
