import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import connectDB from "./db/connectDB.js";


import "./controllers/passport.js";
import userRouter from "./routes/user.js";
import bookRouter from "./routes/books.js";
import recommendationRouter from "./routes/recommendation.js";
import bookDetailRouter from "./routes/bookDetail.js";
import imageRoutes from "./routes/imageRoutes.js";
// Load environment variables
dotenv.config();

const app = express();
// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
// Session setup with MongoStore

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/user", userRouter);
app.use("/api/books", bookRouter);


// Set up the routes for book recommendations
app.use("/api/recommendedBooks", recommendationRouter);
app.use("/api/book", bookDetailRouter);
app.use("/api/profile", imageRoutes);
// MongoDB connection
connectDB();

export default app;
