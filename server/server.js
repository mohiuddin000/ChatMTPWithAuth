// server.js
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

// Helpful boot log for Render
console.log("BOOT: env summary:", {
    PORT: PORT,
    MONGODB_URL_SET: !!process.env.MONGODB_URL,
    NODE_ENV: process.env.NODE_ENV,
});

// Security
app.use(helmet());

// If behind a proxy (Render), enable trust proxy for correct secure cookie handling
if (process.env.TRUST_PROXY === "1") {
    app.set("trust proxy", 1);
}

// Body & cookies
app.use(express.json());
app.use(cookieParser());

// Allowed origins: comma-separated env var ALLOWED_ORIGINS
// Example: "https://my-client.onrender.com,http://localhost:5173"
const allowedOriginsEnv =
    process.env.ALLOWED_ORIGINS || "http://localhost:5173";
const allowedOrigins = allowedOriginsEnv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile/native apps or curl/postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error("CORS: Not allowed by CORS"), false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "X-Requested-With",
    ],
};

app.use(cors(corsOptions));

// Health check
app.get("/_health", (req, res) => res.status(200).json({ ok: true }));

// API routes
app.get("/", (req, res) => res.send("API working"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Central error handler
app.use((err, req, res, next) => {
    console.error("ERROR:", err?.message || err);
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || "Internal server error" });
});

// Start only after DB is connected
async function startServer() {
    try {
        await connectDB(); // ensure connectDB throws on failure
        const server = app.listen(PORT, () => {
            console.log(
                `Server is running on port ${PORT} (env=${
                    process.env.NODE_ENV || "dev"
                })`
            );
        });

        // Graceful shutdown
        function graceful() {
            console.log("Shutting down gracefully...");
            server.close(() => {
                console.log("Server closed.");
                process.exit(0);
            });
            // force exit if not closed in 10s
            setTimeout(() => {
                console.error("Forcing exit.");
                process.exit(1);
            }, 10000);
        }

        process.on("SIGTERM", graceful);
        process.on("SIGINT", graceful);

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
}

startServer();
