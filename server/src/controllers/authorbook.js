
import axios from "axios";
import User from "../models/User.js";
import { logError, logInfo } from "../util/logging.js";

export const getBooksByFavoriteAuthors = async (req, res) => {
  try {
    const userId = req.params.id;

    // Get user from MongoDB
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Get saved favorite authors
    const favoriteAuthors = [
      ...new Set(
        (user.favoriteAuthors || [])
          .filter((author) => typeof author === "string")
          .map((author) => author.trim())
          .filter(Boolean)
      ),
    ];

    if (favoriteAuthors.length === 0) {
      return res.status(200).json([]);
    }

    const googleBooksApiKey = process.env.API_KEY;

    if (!googleBooksApiKey) {
      return res.status(500).json({
        error: "Google Books API key is not configured.",
      });
    }

    logInfo("Fetching books for favorite authors");

    // Fetch books for all authors
    const results = await Promise.allSettled(
      favoriteAuthors.map(async (author) => {
        const response = await axios.get(
          "https://www.googleapis.com/books/v1/volumes",
          {
            params: {
              q: `inauthor:"${author}"`,
              maxResults: 6,
              printType: "books",
              key: googleBooksApiKey,
            },
            timeout: 15000,
          }
        );

        const books = response.data?.items || [];

        return books.filter(
  (book) => book?.id && book?.volumeInfo
);
      })
    );

    const books = [];
    let failedRequests = 0;

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        books.push(...result.value);
      } else {
        failedRequests++;

        const error = result.reason;

        logError(
          `Failed to fetch books for author: ${favoriteAuthors[index]}`,
          error.response?.status,
          error.response?.data?.error?.message || error.message
        );
      }
    });

    // Return an error if every Google request failed
    if (failedRequests === favoriteAuthors.length) {
      return res.status(502).json({
        error: "Failed to fetch books from Google Books API.",
      });
    }

    // Remove duplicate books
    const uniqueBooks = Array.from(
      new Map(books.map((book) => [book.id, book])).values()
    );

    // Randomize and return up to 12 books
    const shuffledBooks = [...uniqueBooks].sort(
      () => Math.random() - 0.5
    );

    return res.status(200).json(shuffledBooks.slice(0, 12));
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
