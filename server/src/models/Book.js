import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  id: { type: Number, required: true }, // Assuming id is required
  title: { type: String, required: true }, // Title of the book
  body: { type: String, required: true }, // Text content of the book
  user_id: { type: Number, required: true }, // ID of the user who added the book
  category: { type: String, required: true }, // Category of the book
  author: { type: String, required: true }, // Author of the book
  length: { type: Number, required: true }, // Length of the book
  publisher: { type: String, required: true }, // Publisher of the book
  publish_date: { type: Date, required: true }, // Date the book was published
  link: { type: String, required: true }, // Link related to the book
});

// Create the Book model
const Book = mongoose.model("Book", bookSchema);

export default Book;
