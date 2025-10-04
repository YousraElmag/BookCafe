import { logError, logInfo } from "../util/logging.js";

import axios from "axios";

// Fetch books based on user preferences
export const getBooksByPreference = async (req, res) => {
  const { preference, startIndex } = req.query; // Get query parameters from the request
  logInfo("Fetching books for preference:", preference);
  if (!preference) {
    return res.status(400).json({ error: "Preference is required" });
  }
  try {
    const googleBooksApiKey = process.env.API_KEY;

    const response = await axios.get(
      "https://www.googleapis.com/books/v1/volumes",
      {
        params: {
          q: preference,
          maxResults: 16,
          startIndex: startIndex,
          key: googleBooksApiKey, // Add API key here if required by Google API
        },
      },
    );

    if (!response.data || !response.data.items) {
      logError("Invalid response from Google Books API", response.data);
      return res
        .status(500)
        .json({ error: "Invalid response from Google Books API" });
    }
    res.json(response.data.items);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      logError("Rate limit exceeded on Google Books API", error.message);
      return res
        .status(429)
        .json({ error: "Rate limit exceeded. Please try again later." });
    }

    logError("Error fetching books from Google API:", error.message);
    res.status(500).json({ error: "Error fetching books" });
  }
};
