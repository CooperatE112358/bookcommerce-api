// -------------------------------------------
// Environment & Async Setup
// -------------------------------------------
require("dotenv").config();
require("express-async-errors");

// -------------------------------------------
// Core Imports
// -------------------------------------------
const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");

// -------------------------------------------
// App Initialization
// -------------------------------------------
const app = express();
const port = process.env.PORT || 5000;

// -------------------------------------------
// Database (Prisma)
// -------------------------------------------
const prisma = require("./utils/prisma");

// -------------------------------------------
// Swagger (API Docs)
// -------------------------------------------
const { swaggerDocs } = require("./swagger");

// -------------------------------------------
// Routers
// -------------------------------------------
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/orderRoutes");
const booksRoute = require("./routes/booksRoute");
const healthRoute = require("./routes/healthRoute");

// -------------------------------------------
// Middleware
// -------------------------------------------
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

// -------------------------------------------
// Security Setup
// -------------------------------------------
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 分鐘
    max: 60, // 每個 IP 最多 60 次請求
  })
);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(fileUpload());

// -------------------------------------------
// API Routes
// -------------------------------------------
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/books", booksRoute);
app.use("/api/v1/health", healthRoute);

// -------------------------------------------
// Swagger Docs
// -------------------------------------------
swaggerDocs(app);

// -------------------------------------------
// Global Middleware
// -------------------------------------------
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// -------------------------------------------
// Server Bootstrap
// -------------------------------------------
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL via Prisma");

    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Swagger docs: http://localhost:${port}/api-docs`);
    });

    setupGracefulShutdown(server);
  } catch (error) {
    console.error("Failed to connect to DB:", error);
    process.exit(1);
  }
};

// -------------------------------------------
// Graceful Shutdown
// -------------------------------------------
const setupGracefulShutdown = (server) => {
  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    await prisma.$disconnect();
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

// -------------------------------------------
// Start Server
// -------------------------------------------
startServer();
