
import { logInfo, logError } from "../util/logging.js";
import axios from "axios";
import User from "../models/User.js";

// Fetch books based on the user's favorite authors
export const getBooksByFavoriteAuthors = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user in MongoDB
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const favoriteAuthors = user.favoriteAuthors || [];

    // Return an empty array if there are no favorite authors
    if (favoriteAuthors.length === 0) {
      return res.status(200).json([]);
    }

    logInfo("User's favorite authors:", favoriteAuthors);

    // Get Google Books API key from Render environment
    const googleBooksApiKey = process.env.API_KEY;

    if (!googleBooksApiKey) {
      logError("Google Books API key is missing.");

      return res.status(500).json({
        error: "Google Books API key is not configured.",
      });
    }

    const books = [];

    // Fetch books for each favorite author
    for (const author of favoriteAuthors) {
      try {
        logInfo("Fetching books for author:", author);

        const response = await axios.get(
          "https://www.googleapis.com/books/v1/volumes",
          {
            params: {
              q: `inauthor:"${author}"`,
              maxResults: 6,
              key: googleBooksApiKey,
            },
            timeout: 10000,
          }
        );

        const authorBooks = response.data?.items || [];

        if (Array.isArray(authorBooks)) {
          books.push(...authorBooks);
        }
      } catch (error) {
        // Show the real Google API error without exposing the API key
        console.error("Google Books request failed:", {
          author,
          status: error.response?.status,
          message:
            error.response?.data?.error?.message ||
            error.message,
        });
      }
    }

    // Return an empty array if no books were found
    if (books.length === 0) {
      return res.status(200).json([]);
    }

    // Remove duplicate books
    const uniqueBooks = Array.from(
      new Map(books.map((book) => [book.id, book])).values()
    );

    // Shuffle the books
    const shuffledBooks = [...uniqueBooks].sort(
      () => Math.random() - 0.5
    );

    // Return up to 6 books
    const randomBooks = shuffledBooks.slice(0, 6);

    return res.status(200).json(randomBooks);
  } catch (error) {
    logError(
      "Error in getBooksByFavoriteAuthors:",
      error.message
    );

    return res.status(500).json({
      error: "Error fetching books by favorite authors.",
    });
  }
};
