import express from "express";
import { createBook, getAllBooks } from "../controllers/bookController.js";
import axios from "axios";
import fs from "fs";

const bookRouter = express.Router();

// Import dotenv to read environment variables
import dotenv from "dotenv";
dotenv.config();

bookRouter.post("/create", createBook);
bookRouter.get("/", getAllBooks);

const logToFile = (message) => {
  if (process.env.NODE_ENV !== "production") {
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFileSync("debug.log", logMessage);
  }
};

bookRouter.get("/search", async (req, res) => {
  const { query } = req.query;

  logToFile(`Search Query parameter: ${query}`);

  if (!query) {
    logToFile("Error: Query parameter is missing.");
    return res
      .status(400)
      .json({ success: false, error: "Query parameter is required." });
  }

  // Format search query for Google Books API
  let searchQuery = query
    .toLowerCase()
    .split(" ")
    .map((term) => {
      if (term.startsWith("author:")) return `inauthor:${term.slice(7)}`;
      if (term.startsWith("category:")) return `subject:${term.slice(9)}`;
      return term;
    })
    .join(" ");

  logToFile(`Formatted Search Query: ${searchQuery}`);

  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}`,
    );

    logToFile(`API Response: ${JSON.stringify(response.data)}`);

    if (response.data && response.data.items) {
      res.json({ success: true, data: response.data.items });
    } else {
      res.status(404).json({ success: false, error: "No books found." });
    }
  } catch (error) {
    logToFile(
      `Error fetching data from Google Books API: ${error.response?.data || error.message}`,
    );
    res.status(500).json({
      success: false,
      error: "Failed to fetch data from Google Books API.",
      details: error.response?.data || error.message,
    });
  }
});

export default bookRouter;
