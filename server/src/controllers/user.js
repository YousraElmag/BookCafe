
/* eslint-disable no-console */
import User from "../models/User.js";
import { logError } from "../util/logging.js";
import { hashPassword, comparePassword } from "../helpers/auth.js";
import jwt from "jsonwebtoken";

// Register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, preferences, confirmPassword } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        error: "Email is already taken",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      preferences,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "Registration successful. Welcome!",
      name: user.name,
      id: user._id,
      token,
    });
  } catch (error) {
    logError("Error in registerUser:", error);

    return res.status(500).json({
      error: "Server error. Please try again later.",
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "No user found with this email",
      });
    }

    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(401).json({
        error: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      name: user.name,
      token,
      id: user._id,
      profileImage: user.profileImage,
    });
  } catch (error) {
    logError("Error in loginUser:", error);

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

// Get all users
export const getall = async (req, res) => {
  try {
    const users = await User.find({});

    return res.status(200).json(users);
  } catch (error) {
    logError("Error in getall:", error);

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.params.id;
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({
        error: "Preferences are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    user.preferences = preferences;
    await user.save();

    return res.status(200).json({
      message: "Preferences updated successfully",
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);

    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

// Get user preferences
export const UserPreferences = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);

    return res.status(500).json({
      error: "Server error",
    });
  }
};

// Add book to favorites
export const updateUserBooks = async (req, res) => {
  try {
    const userId = req.params.id;
    const { bookId, bookDetails } = req.body;

    if (!bookId || typeof bookId !== "string") {
      return res.status(400).json({
        error: "Valid book ID is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (!user.favoriteBook.includes(bookId)) {
      user.favoriteBook.push(bookId);
    }

    // Save book details if provided
    if (bookDetails && bookDetails.id === bookId) {
      const details = {
        id: bookId,
        volumeInfo: {
          title:
            typeof bookDetails.volumeInfo?.title === "string"
              ? bookDetails.volumeInfo.title
              : "",
          authors: Array.isArray(bookDetails.volumeInfo?.authors)
            ? bookDetails.volumeInfo.authors.filter(
                (author) => typeof author === "string"
              )
            : [],
          imageLinks: {
            thumbnail:
              typeof bookDetails.volumeInfo?.imageLinks?.thumbnail === "string"
                ? bookDetails.volumeInfo.imageLinks.thumbnail
                : "",
          },
        },
      };

      const existingIndex = user.favoriteBookDetails.findIndex(
        (book) => book.id === bookId
      );

      if (existingIndex === -1) {
        user.favoriteBookDetails.push(details);
      } else {
        user.favoriteBookDetails[existingIndex] = details;
      }
    }

    await user.save();

    return res.status(200).json({
      message: "Book added to favorites successfully",
      favoriteBook: user.favoriteBook,
      favoriteBookDetails: user.favoriteBookDetails,
    });
  } catch (error) {
    console.error("Error updating favorite books:", error);

    return res.status(500).json({
      error: "Server error",
    });
  }
};

// Get favorite books
export const getUserFavoriteBooks = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "favoriteBook favoriteBookDetails"
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const favoriteIds = user.favoriteBook || [];
    const savedDetails = user.favoriteBookDetails || [];

    const books = favoriteIds.map((id) => {
      const savedBook = savedDetails.find(
        (book) => book.id === id
      );

      if (savedBook) {
        return savedBook.toObject();
      }

      // Preserve old favorites even if details are missing
      return {
        id,
        volumeInfo: {
          title: "Book details unavailable",
          authors: [],
          imageLinks: {
            thumbnail: "",
          },
        },
      };
    });

    return res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching favorite books:", error);

    return res.status(500).json({
      error: "Failed to fetch favorite books",
    });
  }
};

// Remove book from favorites
export const removeFavoriteBook = async (req, res) => {
  try {
    const { userId, bookId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    user.favoriteBook = user.favoriteBook.filter(
      (id) => id !== bookId
    );

    user.favoriteBookDetails = user.favoriteBookDetails.filter(
      (book) => book.id !== bookId
    );

    await user.save();

    return res.status(200).json({
      message: "Favorite book removed successfully",
    });
  } catch (error) {
    console.error("Error removing favorite book:", error);

    return res.status(500).json({
      error: "Server error",
    });
  }
};
