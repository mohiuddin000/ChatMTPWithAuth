// server/server.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Boot log
console.log("BOOT: env summary:", {
    PORT,
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URL_set: !!process.env.MONGODB_URL,
});

// Basic middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS: allow your client (local + deployed). Add more origins if needed.
const allowedOrigins = [
    "http://localhost:5173", // Vite default dev
    "http://localhost:3000",
    process.env.CLIENT_URL || "", // optional env var for client
    "https://chatmtpwithauth.onrender.com", // your deployed client (if any)
].filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
);

// Health check
app.get("/health", (req, res) => res.json({ ok: true, time: Date.now() }));

// Mount routers
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Generic 404
app.use((req, res) =>
    res.status(404).json({ success: false, message: "Not Found" })
);

// Start server + connect DB
const startServer = async () => {
    try {
        // Connect to DB
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });

        // Graceful shutdown
        process.on("SIGTERM", () => {
            console.log("SIGTERM received, closing server...");
            server.close(() => {
                console.log("Server closed");
                process.exit(0);
            });
        });

        process.on("unhandledRejection", (reason) => {
            console.error("UnhandledRejection:", reason);
        });
        process.on("uncaughtException", (err) => {
            console.error("UncaughtException:", err);
            process.exit(1);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
};

startServer();
