
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./db/connectDB.js";

import userRouter from "./routes/user.js";
import bookRouter from "./routes/books.js";
import recommendationRouter from "./routes/recommendation.js";
import bookDetailRouter from "./routes/bookDetail.js";
import imageRoutes from "./routes/imageRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// Routes
app.use("/api/user", userRouter);
app.use("/api/books", bookRouter);
app.use("/api/recommendedBooks", recommendationRouter);
app.use("/api/book", bookDetailRouter);
app.use("/api/profile", imageRoutes);

// MongoDB connection
connectDB();

export default app;
