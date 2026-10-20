
import axios from "axios";
import User from "../models/User.js";

export const getBooksByFavoriteAuthors = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

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

    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Google Books API key is missing.",
      });
    }

    const books = [];
    const failures = [];
    let successfulRequests = 0;

    // Search authors one by one
    for (const author of favoriteAuthors) {
      if (books.length >= 12) break;

      try {
        const response = await axios.get(
          "https://www.googleapis.com/books/v1/volumes",
          {
            params: {
              q: `inauthor:"${author}"`,
              maxResults: 6,
              key: apiKey,
            },
            timeout: 12000,
          }
        );

        successfulRequests++;

        const authorBooks = response.data?.items || [];

        books.push(
          ...authorBooks.filter(
            (book) => book?.id && book?.volumeInfo
          )
        );
      } catch (error) {
        failures.push({
          author,
          status: error.response?.status || null,
          message:
            error.response?.data?.error?.message ||
            error.message,
        });

        console.error(
          `Google Books failed for ${author}:`,
          error.response?.status,
          error.message
        );
      }
    }

    const uniqueBooks = [
      ...new Map(
        books.map((book) => [book.id, book])
      ).values(),
    ];

    if (successfulRequests === 0 && failures.length > 0) {
      return res.status(502).json({
        error: "All Google Books requests failed.",
      });
    }

    return res.status(200).json(
      uniqueBooks.slice(0, 12)
    );
  } catch (error) {
    console.error(
      "Favorite authors error:",
      error.message
    );

    return res.status(500).json({
      error: "Failed to fetch favorite author books.",
    });
  }
};
