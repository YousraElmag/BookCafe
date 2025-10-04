import { logInfo, logError } from "../util/logging.js";
import axios from "axios";
import User from "../models/User.js";

// Fetch books based on the user's favorite authors
export const getBooksByFavoriteAuthors = async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch the user from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const favoriteAuthors = user.favoriteAuthors; // Get the user's favorite authors

    if (favoriteAuthors.length === 0) {
      return res.status(200).json({ message: "No favorite authors found." });
    }

    logInfo("User's favorite authors:", favoriteAuthors);

    // Get Google Books API key from environment variables
    const books = [];

    // Loop through the favorite authors and fetch books for each
    for (const author of favoriteAuthors) {
      try {
        logInfo("Fetching books for author:", author);

        const response = await axios.get(
          "https://www.googleapis.com/books/v1/volumes",
          {
            params: {
              q: `inauthor:${author}`,
              maxResults: 6,
            },
          },
        );

        if (response.data.items) {
          books.push(...response.data.items); // Add the books to the array
        }
      } catch (error) {
        logError(`Error fetching books for author ${author}:`, error.message);
      }
    }

    // Check if books were found
    if (books.length === 0) {
      return res
        .status(200)
        .json({ message: "No books found for the favorite authors." });
    }

    // Shuffle the books array
    const shuffledBooks = books.sort(() => 0.5 - Math.random());

    // Select the first 5 random books
    const randomBooks = shuffledBooks.slice(0, 6);

    // Return the random books fetched from the API
    res.status(200).json(randomBooks);
  } catch (error) {
    logError("Error in getBooksByFavoriteAuthors:", error.message);
    res
      .status(500)
      .json({ error: "Error fetching books by favorite authors." });
  }
};
