/* eslint-disable no-unused-vars */
import express from "express";
import {
  registerUser,
  loginUser,
  getall,
  updateUserPreferences,
  UserPreferences,
  updateUserBooks,
  getUserFavoriteBooks,
  removeFavoriteBook,
} from "../controllers/user.js";
// Change to import for consistency
import { saveUserFavoriteAuthor } from "../controllers/author.js";
import { getBooksByFavoriteAuthors } from "../controllers/authorbook.js";
import Book from "../models/Book.js";
import { registerUser as registerUserController } from "../controllers/user.js";

const userRouter = express.Router();

// User routes
userRouter.post(
  "/register",
  (req, res, next) => {
    next();
  },
  registerUser,
);
userRouter.post("/login", loginUser);
userRouter.get("/getall", getall);
userRouter.put("/:id", updateUserPreferences);
userRouter.get("/:id/preferences", UserPreferences);
userRouter.put("/:id/favoriteAuthors", saveUserFavoriteAuthor);
userRouter.get(
  "/:id/favoriteAuthors",
 
  getBooksByFavoriteAuthors,
);
userRouter.post("/:id/favoriteBook", updateUserBooks);
userRouter.get("/:userId/favoriteBooks",  getUserFavoriteBooks);
userRouter.delete(
  "/:userId/favoriteBook/:bookId",
 
  removeFavoriteBook,
);
userRouter.post("/categories",(req, res) => {
  const userId = req.user.id;
  const preferences = req.body.preferences;

  // Validate preferences (optional)
  if (!Array.isArray(preferences)) {
    return res.status(400).send({ message: "Preferences must be an array." });
  }

  res.status(200).send({ message: "Categories saved successfully!" });
});

export default userRouter;
