import express from "express";
import axios from "axios";
import { createBook, getAllBooks } from "../controllers/bookController.js";
import { buildGoogleBooksQuery } from "../util/buildGoogleBooksQuery.js";
import { logError } from "../util/logging.js";

const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";

const bookRouter = express.Router();

bookRouter.post("/create", createBook);
bookRouter.get("/", getAllBooks);

bookRouter.get("/search", async (req, res) => {
  const searchQuery = buildGoogleBooksQuery(req.query.query);

  // Also rejects whitespace-only input and repeated ?query= params (arrays)
  if (!searchQuery) {
    return res
      .status(400)
      .json({ success: false, error: "Query parameter is required." });
  }

  try {
    // Passing `params` lets axios URL-encode the query, so characters
    // like &, # and + reach Google correctly.
    const response = await axios.get(GOOGLE_BOOKS_URL, {
      params: { q: searchQuery, key: process.env.API_KEY },
      timeout: 12000,
    });

    const items = response.data?.items;
    if (!items || items.length === 0) {
      return res.status(404).json({ success: false, error: "No books found." });
    }

    res.json({ success: true, data: items });
  } catch (error) {
    // Log only the status and message: error.config contains the API key
    logError(
      `Google Books search failed (status ${error.response?.status ?? "none"}): ${error.message}`,
    );

    const isRateLimited = error.response?.status === 429;
    res.status(isRateLimited ? 429 : 502).json({
      success: false,
      error: isRateLimited
        ? "Too many searches right now. Please try again in a minute."
        : "Failed to fetch data from Google Books API.",
    });
  }
});

export default bookRouter;
