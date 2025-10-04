// src/controllers/bookController.js
import Book from "../models/Book.js";
import { logError } from "../util/logging.js";

// Create a new book
export const createBook = async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json({
      success: true,
      book: newBook,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to create book, please try again later.",
    });
  }
};

// Get all books
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json({
      success: true,
      result: books,
    });
  } catch (error) {
    logError(error);
    res.status(500).json({
      success: false,
      msg: "Unable to retrieve books, please try again later.",
    });
  }
};
